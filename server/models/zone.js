import db from '../db.js';

export const getAll = async (userId) => {
  const { rows } = await db.query('SELECT * FROM zones WHERE user_id = $1 ORDER BY "order" ASC, created_at ASC', [userId]);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    color: r.color,
    icon: r.icon,
    order: r.order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    userId: r.user_id,
  }));
};

export const create = async (id, name, description, color, icon, order, userId) => {
  const now = new Date().toISOString();
  await db.query(
    `INSERT INTO zones (id, name, description, color, icon, "order", created_at, updated_at, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, name, description, color, icon || null, order ?? null, now, now, userId]
  );
  return { id, name, description, color, icon, order, userId, createdAt: now, updatedAt: now };
};

export const update = async (id, name, description, color, icon, order, userId) => {
  const now = new Date().toISOString();
  await db.query(
    `UPDATE zones SET name = $1, description = $2, color = $3, icon = $4, "order" = $5, updated_at = $6
     WHERE id = $7 AND user_id = $8`,
    [name, description, color, icon || null, order ?? null, now, id, userId]
  );
  return { id, name, description, color, icon, order, userId, updatedAt: now };
};

export const remove = async (id, userId) => {
  await db.query('DELETE FROM zones WHERE id = $1 AND user_id = $2', [id, userId]);
  return { id };
};
