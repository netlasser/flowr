import db from '../db.js';

export const getAllBadges = async () => {
  const { rows } = await db.query('SELECT * FROM badges ORDER BY requirement_value ASC');
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    icon: r.icon,
    requirementType: r.requirement_type,
    requirementValue: r.requirement_value,
    createdAt: r.created_at,
  }));
};

export const getUserBadges = async (userId) => {
  const { rows } = await db.query(
    `SELECT b.*, ub.earned_at, ub.id AS user_badge_id
     FROM user_badges ub
     JOIN badges b ON b.id = ub.badge_id
     WHERE ub.user_id = $1
     ORDER BY ub.earned_at DESC`,
    [userId]
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    icon: r.icon,
    requirementType: r.requirement_type,
    requirementValue: r.requirement_value,
    earnedAt: r.earned_at,
    userBadgeId: r.user_badge_id,
  }));
};

export const earnBadge = async (userId, badgeId) => {
  const now = new Date().toISOString();
  await db.query(
    `INSERT INTO user_badges (user_id, badge_id, earned_at, created_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, badge_id) DO NOTHING`,
    [userId, badgeId, now, now]
  );
  return { userId, badgeId, earnedAt: now };
};

export const checkAndAward = async (userId) => {
  const awards = [];

  const userBadgeTypes = await db.query(
    `SELECT b.requirement_type, b.requirement_value
     FROM user_badges ub
     JOIN badges b ON b.id = ub.badge_id
     WHERE ub.user_id = $1`,
    [userId]
  );
  const earnedTypes = new Set(userBadgeTypes.rows.map((r) => `${r.requirement_type}:${r.requirement_value}`));

  const allBadges = await db.query('SELECT * FROM badges');

  const [switchCount, streakResult, completedSessions] = await Promise.all([
    db.query('SELECT COUNT(*)::int AS count FROM switches WHERE user_id = $1', [userId]),
    db.query('SELECT COALESCE(MAX(duration_seconds), 0)::int AS max FROM focus_sessions WHERE user_id = $1 AND completed = true', [userId]),
    db.query('SELECT COUNT(*)::int AS count FROM focus_sessions WHERE user_id = $1 AND completed = true', [userId]),
  ]);

  const stats = {
    switches_count: switchCount.rows[0]?.count || 0,
    streak_duration: Math.round((streakResult.rows[0]?.max || 0) / 60),
    break_completions: completedSessions.rows[0]?.count || 0,
  };

  for (const badge of allBadges.rows) {
    const key = `${badge.requirement_type}:${badge.requirement_value}`;
    if (earnedTypes.has(key)) continue;

    const statValue = stats[badge.requirement_type] || 0;
    if (statValue >= badge.requirement_value) {
      await earnBadge(userId, badge.id);
      awards.push({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        earnedAt: new Date().toISOString(),
      });
    }
  }

  return awards;
};
