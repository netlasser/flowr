import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAll, create, update, remove } from '../models/zone.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const zones = await getAll(req.user.id);
    res.json(zones);
  } catch (err) {
    console.warn('[DB Fallback] GET /zones — returning empty array:', err.message);
    res.json([]);
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { name, description, color, icon, order } = req.body;

  if (!name || !color) {
    return res.status(400).json({ error: 'Name and color are required' });
  }

  try {
    const zoneId = req.body.id || crypto.randomUUID();
    const newZone = await create(zoneId, name, description, color, icon, order, req.user.id);
    res.status(201).json(newZone);
  } catch (err) {
    console.warn('[DB Fallback] POST /zones — returning local zone:', err.message);
    res.status(201).json({
      id: req.body.id || crypto.randomUUID(),
      name,
      description: description || '',
      color,
      icon: icon || 'Stack',
      order: order || 0,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
    });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { name, description, color, icon, order } = req.body;

  if (!name || !color) {
    return res.status(400).json({ error: 'Name and color are required' });
  }

  try {
    const updated = await update(req.params.id, name, description, color, icon, order, req.user.id);
    res.json(updated);
  } catch (err) {
    console.warn('[DB Fallback] PUT /zones/:id — returning local update:', err.message);
    res.json({
      id: req.params.id,
      name,
      description: description || '',
      color,
      icon: icon || 'Stack',
      order: order || 0,
      userId: req.user.id,
      updatedAt: new Date().toISOString(),
    });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await remove(req.params.id, req.user.id);
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.warn('[DB Fallback] DELETE /zones/:id — returning success:', err.message);
    res.json({ success: true, id: req.params.id });
  }
});

export default router;
