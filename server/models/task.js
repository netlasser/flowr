import db from '../db.js';

export const getAll = async (userId) => {
  const { rows } = await db.query('SELECT * FROM tasks WHERE user_id = $1', [userId]);
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    completed: r.completed,
    zoneId: r.zone_id,
    userId: r.user_id,
    createdAt: r.created_at,
    completedAt: r.completed_at,
  }));
};

export const create = async (id, title, description, zoneId, userId) => {
  await db.query(
    `INSERT INTO tasks (id, title, description, completed, zone_id, user_id, created_at, completed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, title, description, false, zoneId, userId, new Date().toISOString(), null]
  );
  return { id, title, description, completed: false, zoneId, userId, createdAt: new Date().toISOString() };
};

export const toggle = async (id, userId) => {
  const { rows } = await db.query(
    'SELECT completed FROM tasks WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (rows.length === 0) return null;

  const task = rows[0];
  const nextVal = !task.completed;
  const completedAt = nextVal ? new Date().toISOString() : null;

  await db.query(
    'UPDATE tasks SET completed = $1, completed_at = $2 WHERE id = $3 AND user_id = $4',
    [nextVal, completedAt, id, userId]
  );

  return { id, completed: nextVal, completedAt };
};

export const findById = async (id, userId) => {
  const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    completed: r.completed,
    zoneId: r.zone_id,
    userId: r.user_id,
    createdAt: r.created_at,
    completedAt: r.completed_at,
  };
};

export const move = async (id, targetZoneId, userId) => {
  await db.query(
    'UPDATE tasks SET zone_id = $1 WHERE id = $2 AND user_id = $3',
    [targetZoneId, id, userId]
  );
  return { id, zoneId: targetZoneId };
};

export const remove = async (id, userId) => {
  await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
  return { id };
};
