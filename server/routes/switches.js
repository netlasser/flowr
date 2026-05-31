import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAll, create } from '../models/switch.js';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  try {
    const switches = getAll(req.user.id);
    res.json(switches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch switches' });
  }
});

router.post('/', authenticateToken, (req, res) => {
  const { fromZoneId, toZoneId, estimatedTimeLostSeconds } = req.body;

  if (!toZoneId) {
    return res.status(400).json({ error: 'toZoneId is required' });
  }

  try {
    const switchId = `sw-${Date.now()}`;
    const newSwitch = create(
      switchId,
      fromZoneId || null,
      toZoneId,
      estimatedTimeLostSeconds || 900,
      req.user.id
    );
    res.status(201).json(newSwitch);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record switch event' });
  }
});

export default router;
