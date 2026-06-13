import db from '../db.js';

export const getAll = async (userId) => {
  const { rows } = await db.query('SELECT * FROM zones WHERE user_id = $1', [userId]);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    color: r.color,
    icon: r.icon,
    createdAt: r.created_at,
    userId: r.user_id,
  }));
};

export const create = async (id, name, description, color, icon, userId) => {
  await db.query(
    `INSERT INTO zones (id, name, description, color, icon, created_at, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, name, description, color, icon || null, new Date().toISOString(), userId]
  );
  return { id, name, description, color, icon, userId };
};

export const update = async (id, name, description, color, icon, userId) => {
  await db.query(
    `UPDATE zones SET name = $1, description = $2, color = $3, icon = $4
     WHERE id = $5 AND user_id = $6`,
    [name, description, color, icon || null, id, userId]
  );
  return { id, name, description, color, icon, userId };
};

export const remove = async (id, userId) => {
  await db.query('DELETE FROM zones WHERE id = $1 AND user_id = $2', [id, userId]);
  return { id };
};
