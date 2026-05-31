import db from '../db.js';

export const getAll = (userId) => {
  const rows = db.prepare('SELECT * FROM badges WHERE user_id = ?').all(userId);
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

export const unlock = (id, badgeType, name, description, icon, userId) => {
  try {
    db.prepare(`
      INSERT INTO badges (id, badge_type, name, description, icon, unlocked_at, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, badgeType, name, description, icon, new Date().toISOString(), userId);
    
    return { id, badgeType, name, description, icon, unlockedAt: new Date().toISOString(), userId };
  } catch (e) {
    // If already exists due to UNIQUE constraint, select and return it
    const row = db.prepare('SELECT * FROM badges WHERE user_id = ? AND badge_type = ?').get(userId, badgeType);
    return row ? {
      id: row.id,
      badgeType: row.badge_type,
      name: row.name,
      description: row.description,
      icon: row.icon,
      unlockedAt: row.unlocked_at,
      userId: row.user_id,
    } : null;
  }
};
