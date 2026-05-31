import db from '../db.js';

export const findById = (id) => {
  return db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(id);
};

export const findByEmail = (email) => {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
};

export const create = (id, email, name, passwordHash) => {
  db.prepare(`
    INSERT INTO users (id, email, name, password_hash, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, email, name, passwordHash, new Date().toISOString());
  
  return { id, email, name };
};
