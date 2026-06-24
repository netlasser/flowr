import db from '../db.js';

export const getAll = async (userId) => {
  const { rows } = await db.query('SELECT * FROM focus_sessions WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    zoneId: r.zone_id,
    startTime: r.start_time,
    endTime: r.end_time,
    durationSeconds: r.duration_seconds,
    completed: r.completed,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
};

export const create = async (id, zoneId, userId) => {
  const now = new Date().toISOString();
  await db.query(
    `INSERT INTO focus_sessions (id, user_id, zone_id, start_time, completed, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, userId, zoneId, now, false, now, now]
  );
  return { id, userId, zoneId, startTime: now, completed: false, createdAt: now, updatedAt: now };
};

export const end = async (id, durationSeconds, completed) => {
  const now = new Date().toISOString();
  await db.query(
    `UPDATE focus_sessions
     SET end_time = $1, duration_seconds = $2, completed = $3, updated_at = $4
     WHERE id = $5`,
    [now, durationSeconds, completed, now, id]
  );
  return { id, endTime: now, durationSeconds, completed, updatedAt: now };
};
