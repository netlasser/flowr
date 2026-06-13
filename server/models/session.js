import db from '../db.js';

export const getAll = async (userId) => {
  const { rows } = await db.query('SELECT * FROM focus_sessions WHERE user_id = $1', [userId]);
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    zoneId: r.zone_id,
    startTime: r.start_time,
    endTime: r.end_time,
    durationSeconds: r.duration_seconds,
    tasksCompletedCount: r.tasks_completed_count,
  }));
};

export const create = async (id, zoneId, userId) => {
  await db.query(
    `INSERT INTO focus_sessions (id, user_id, zone_id, start_time, duration_seconds, tasks_completed_count)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, userId, zoneId, new Date().toISOString(), 0, 0]
  );
  return { id, userId, zoneId, startTime: new Date().toISOString(), durationSeconds: 0, tasksCompletedCount: 0 };
};

export const end = async (id, durationSeconds, tasksCompletedCount) => {
  await db.query(
    `UPDATE focus_sessions
     SET end_time = $1, duration_seconds = $2, tasks_completed_count = $3
     WHERE id = $4`,
    [new Date().toISOString(), durationSeconds, tasksCompletedCount, id]
  );
  return { id, endTime: new Date().toISOString(), durationSeconds, tasksCompletedCount };
};
