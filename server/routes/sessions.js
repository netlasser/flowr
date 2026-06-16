import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAll, create, end } from '../models/session.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const sessions = await getAll(req.user.id);
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch focus sessions' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { zoneId } = req.body;

  if (!zoneId) {
    return res.status(400).json({ error: 'zoneId is required' });
  }

  try {
    const sessionId = req.body.id || `fs-${Date.now()}`;
    const newSession = await create(sessionId, zoneId, req.user.id);
    res.status(201).json(newSession);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create focus session' });
  }
});

router.patch('/:id/end', authenticateToken, async (req, res) => {
  const { durationSeconds, tasksCompletedCount, completed } = req.body;

  try {
    const updated = await end(req.params.id, durationSeconds || 0, tasksCompletedCount || 0, completed ?? false);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to end focus session' });
  }
});

export default router;
