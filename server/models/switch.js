import db from '../db.js';

export const getAll = async (userId) => {
  const { rows } = await db.query('SELECT * FROM switches WHERE user_id = $1', [userId]);
  return rows.map((r) => ({
    id: r.id,
    fromZoneId: r.from_zone_id,
    toZoneId: r.to_zone_id,
    timestamp: r.timestamp,
    estimatedTimeLostSeconds: r.estimated_time_lost_seconds,
    userId: r.user_id,
  }));
};

export const getToday = async (userId) => {
  const { rows } = await db.query(
    `SELECT * FROM switches
     WHERE user_id = $1 AND timestamp >= CURRENT_DATE AND timestamp < CURRENT_DATE + INTERVAL '1 day'`,
    [userId]
  );
  return rows.map((r) => ({
    id: r.id,
    fromZoneId: r.from_zone_id,
    toZoneId: r.to_zone_id,
    timestamp: r.timestamp,
    estimatedTimeLostSeconds: r.estimated_time_lost_seconds,
    userId: r.user_id,
  }));
};

export const create = async (id, fromZoneId, toZoneId, estimatedTimeLostSeconds, userId) => {
  await db.query(
    `INSERT INTO switches (id, from_zone_id, to_zone_id, timestamp, estimated_time_lost_seconds, user_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, fromZoneId, toZoneId, new Date().toISOString(), estimatedTimeLostSeconds, userId]
  );
  return { id, fromZoneId, toZoneId, timestamp: new Date().toISOString(), estimatedTimeLostSeconds, userId };
};
