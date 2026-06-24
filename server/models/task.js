import db from '../db.js';

export const getAll = async (userId) => {
  const { rows } = await db.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    completed: r.completed,
    zoneId: r.zone_id,
    userId: r.user_id,
    dueDate: r.due_date,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
};

export const create = async (id, title, description, zoneId, userId, dueDate) => {
  const now = new Date().toISOString();
  await db.query(
    `INSERT INTO tasks (id, title, description, completed, zone_id, user_id, due_date, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, title, description, false, zoneId, userId, dueDate || null, now, now]
  );
  return { id, title, description, completed: false, zoneId, userId, dueDate: dueDate || null, createdAt: now, updatedAt: now };
};

export const toggle = async (id, userId) => {
  const { rows } = await db.query(
    'SELECT completed FROM tasks WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (rows.length === 0) return null;

  const task = rows[0];
  const nextVal = !task.completed;
  const now = new Date().toISOString();

  await db.query(
    'UPDATE tasks SET completed = $1, updated_at = $2 WHERE id = $3 AND user_id = $4',
    [nextVal, now, id, userId]
  );

  return { id, completed: nextVal, updatedAt: now };
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
    dueDate: r.due_date,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
};

export const move = async (id, targetZoneId, userId) => {
  const now = new Date().toISOString();
  await db.query(
    'UPDATE tasks SET zone_id = $1, updated_at = $2 WHERE id = $3 AND user_id = $4',
    [targetZoneId, now, id, userId]
  );
  return { id, zoneId: targetZoneId, updatedAt: now };
};

export const remove = async (id, userId) => {
  await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
  return { id };
};
