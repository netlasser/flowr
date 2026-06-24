import db from '../db.js';

export const getAll = async (userId) => {
  const { rows } = await db.query('SELECT * FROM switches WHERE user_id = $1 ORDER BY "timestamp" DESC', [userId]);
  return rows.map((r) => ({
    id: r.id,
    fromZoneId: r.from_zone_id,
    toZoneId: r.to_zone_id,
    timestamp: r.timestamp,
    userId: r.user_id,
    createdAt: r.created_at,
  }));
};

export const getToday = async (userId) => {
  const { rows } = await db.query(
    `SELECT * FROM switches
     WHERE user_id = $1 AND "timestamp" >= CURRENT_DATE AND "timestamp" < CURRENT_DATE + INTERVAL '1 day'
     ORDER BY "timestamp" DESC`,
    [userId]
  );
  return rows.map((r) => ({
    id: r.id,
    fromZoneId: r.from_zone_id,
    toZoneId: r.to_zone_id,
    timestamp: r.timestamp,
    userId: r.user_id,
    createdAt: r.created_at,
  }));
};

export const create = async (id, fromZoneId, toZoneId, userId) => {
  const now = new Date().toISOString();
  await db.query(
    `INSERT INTO switches (id, from_zone_id, to_zone_id, "timestamp", user_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, fromZoneId || null, toZoneId, now, userId, now]
  );
  return { id, fromZoneId: fromZoneId || null, toZoneId, timestamp: now, userId, createdAt: now };
};
