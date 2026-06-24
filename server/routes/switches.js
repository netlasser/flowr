import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAll, getToday, create } from '../models/switch.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const switches = await getAll(req.user.id);
    res.json(switches);
  } catch (err) {
    console.warn('[DB Fallback] GET /switches — returning empty array:', err.message);
    res.json([]);
  }
});

router.get('/today', authenticateToken, async (req, res) => {
  try {
    const switches = await getToday(req.user.id);
    res.json(switches);
  } catch (err) {
    console.warn('[DB Fallback] GET /switches/today — returning empty array:', err.message);
    res.json([]);
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { fromZoneId, toZoneId } = req.body;

  if (!toZoneId) {
    return res.status(400).json({ error: 'toZoneId is required' });
  }

  try {
    const switchId = req.body.id || crypto.randomUUID();
    const newSwitch = await create(switchId, fromZoneId || null, toZoneId, req.user.id);
    res.status(201).json(newSwitch);
  } catch (err) {
    console.warn('[DB Fallback] POST /switches — returning local switch:', err.message);
    res.status(201).json({
      id: req.body.id || crypto.randomUUID(),
      fromZoneId: fromZoneId || null,
      toZoneId,
      userId: req.user.id,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
