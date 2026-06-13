import db from '../db.js';

export const getAll = async (userId) => {
  const { rows } = await db.query('SELECT * FROM badges WHERE user_id = $1', [userId]);
  return rows.map((r) => ({
    id: r.id,
    badgeType: r.badge_type,
    name: r.name,
    description: r.description,
    icon: r.icon,
    unlockedAt: r.unlocked_at,
    userId: r.user_id,
  }));
};

export const unlock = async (id, badgeType, name, description, icon, userId) => {
  try {
    await db.query(
      `INSERT INTO badges (id, badge_type, name, description, icon, unlocked_at, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, badgeType, name, description, icon, new Date().toISOString(), userId]
    );
    return { id, badgeType, name, description, icon, unlockedAt: new Date().toISOString(), userId };
  } catch (e) {
    if (e.code === '23505') {
      const { rows } = await db.query(
        'SELECT * FROM badges WHERE user_id = $1 AND badge_type = $2',
        [userId, badgeType]
      );
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          badgeType: r.badge_type,
          name: r.name,
          description: r.description,
          icon: r.icon,
          unlockedAt: r.unlocked_at,
          userId: r.user_id,
        };
      }
    }
    throw e;
  }
};
