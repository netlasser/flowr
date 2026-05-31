import db from '../db.js';

export const getAll = (userId) => {
  const rows = db.prepare('SELECT * FROM switches WHERE user_id = ?').all(userId);
  return rows.map((r) => ({
    id: r.id,
    fromZoneId: r.from_zone_id,
    toZoneId: r.to_zone_id,
    timestamp: r.timestamp,
    estimatedTimeLostSeconds: r.estimated_time_lost_seconds,
    userId: r.user_id,
  }));
};

export const create = (id, fromZoneId, toZoneId, estimatedTimeLostSeconds, userId) => {
  db.prepare(`
    INSERT INTO switches (id, from_zone_id, to_zone_id, timestamp, estimated_time_lost_seconds, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, fromZoneId, toZoneId, new Date().toISOString(), estimatedTimeLostSeconds, userId);

  return { id, fromZoneId, toZoneId, timestamp: new Date().toISOString(), estimatedTimeLostSeconds, userId };
};
