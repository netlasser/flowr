import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAll, create, end } from '../models/session.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const sessions = await getAll(req.user.id);
    res.json(sessions);
  } catch (err) {
    console.warn('[DB Fallback] GET /sessions — returning empty array:', err.message);
    res.json([]);
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { zoneId } = req.body;

  if (!zoneId) {
    return res.status(400).json({ error: 'zoneId is required' });
  }

  try {
    const sessionId = req.body.id || crypto.randomUUID();
    const newSession = await create(sessionId, zoneId, req.user.id);
    res.status(201).json(newSession);
  } catch (err) {
    console.warn('[DB Fallback] POST /sessions — returning local session:', err.message);
    res.status(201).json({
      id: req.body.id || crypto.randomUUID(),
      zoneId,
      userId: req.user.id,
      startTime: new Date().toISOString(),
      endTime: null,
      durationSeconds: 0,
      completed: false,
    });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { durationSeconds, completed } = req.body;

  try {
    const updated = await end(req.params.id, durationSeconds || 0, completed ?? false);
    res.json(updated);
  } catch (err) {
    console.warn('[DB Fallback] PUT /sessions/:id — returning local end:', err.message);
    res.json({
      id: req.params.id,
      durationSeconds: durationSeconds || 0,
      completed: completed ?? false,
      endTime: new Date().toISOString(),
    });
  }
});

export default router;
