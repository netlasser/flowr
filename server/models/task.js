import db from '../db.js';

export const getAll = (userId) => {
  const rows = db.prepare('SELECT * FROM tasks WHERE user_id = ?').all(userId);
  // Convert completed (0/1) to boolean (false/true)
  return rows.map((r) => ({
    ...r,
    completed: r.completed === 1,
    zoneId: r.zone_id,
    userId: r.user_id,
    createdAt: r.created_at,
    completedAt: r.completed_at,
  }));
};

export const create = (id, title, description, zoneId, userId) => {
  db.prepare(`
    INSERT INTO tasks (id, title, description, completed, zone_id, user_id, created_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, description, 0, zoneId, userId, new Date().toISOString(), null);
  
  return { id, title, description, completed: false, zoneId, userId, createdAt: new Date().toISOString() };
};

export const toggle = (id, userId) => {
  const task = db.prepare('SELECT completed FROM tasks WHERE id = ? AND user_id = ?').get(id, userId);
  if (!task) return null;

  const nextVal = task.completed === 1 ? 0 : 1;
  const completedAt = nextVal === 1 ? new Date().toISOString() : null;

  db.prepare(`
    UPDATE tasks
    SET completed = ?, completed_at = ?
    WHERE id = ? AND user_id = ?
  `).run(nextVal, completedAt, id, userId);

  return { id, completed: nextVal === 1, completedAt };
};

export const move = (id, targetZoneId, userId) => {
  db.prepare(`
    UPDATE tasks
    SET zone_id = ?
    WHERE id = ? AND user_id = ?
  `).run(targetZoneId, id, userId);

  return { id, zoneId: targetZoneId };
};

export const remove = (id, userId) => {
  db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(id, userId);
  return { id };
};
