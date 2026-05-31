import db from '../db.js';

export const getAll = (userId) => {
  return db.prepare('SELECT * FROM zones WHERE user_id = ?').all(userId);
};

export const create = (id, name, description, color, userId) => {
  db.prepare(`
    INSERT INTO zones (id, name, description, color, created_at, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name, description, color, new Date().toISOString(), userId);
  
  return { id, name, description, color, userId };
};

export const update = (id, name, description, color, userId) => {
  db.prepare(`
    UPDATE zones
    SET name = ?, description = ?, color = ?
    WHERE id = ? AND user_id = ?
  `).run(name, description, color, id, userId);
  
  return { id, name, description, color, userId };
};

export const remove = (id, userId) => {
  // Tasks belonging to this zone will automatically cascades on delete in SQLite
  db.prepare('DELETE FROM zones WHERE id = ? AND user_id = ?').run(id, userId);
  return { id };
};
