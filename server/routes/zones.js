import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAll, create, update, remove } from '../models/zone.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const zones = await getAll(req.user.id);
    res.json(zones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch zones' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { name, description, color, icon } = req.body;

  if (!name || !color) {
    return res.status(400).json({ error: 'Name and color theme are required' });
  }

  try {
    const zoneId = req.body.id || `z-${Date.now()}`;
    const newZone = await create(zoneId, name, description, color, icon, req.user.id);
    res.status(201).json(newZone);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create zone' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { name, description, color, icon } = req.body;

  if (!name || !color) {
    return res.status(400).json({ error: 'Name and color are required' });
  }

  try {
    const updated = await update(req.params.id, name, description, color, icon, req.user.id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update zone' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await remove(req.params.id, req.user.id);
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete zone' });
  }
});

export default router;
