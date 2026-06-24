import db from '../db.js';

export const findById = async (id) => {
  const { rows } = await db.query(
    'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

export const findByEmail = async (email) => {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
};

export const create = async (id, email, name) => {
  const now = new Date().toISOString();
  await db.query(
    `INSERT INTO users (id, email, name, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, email, name, now, now]
  );
  return { id, email, name, createdAt: now, updatedAt: now };
};
