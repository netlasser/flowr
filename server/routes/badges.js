import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAll, unlock } from '../models/badge.js';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  try {
    const badges = getAll(req.user.id);
    res.json(badges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

router.post('/unlock', authenticateToken, (req, res) => {
  const { badgeType, name, description, icon } = req.body;

  if (!badgeType || !name || !description || !icon) {
    return res.status(400).json({ error: 'All badge fields are required' });
  }

  try {
    const badgeId = `bdg-${Date.now()}`;
    const newBadge = unlock(badgeId, badgeType, name, description, icon, req.user.id);
    if (!newBadge) {
      return res.status(400).json({ error: 'Badge already unlocked' });
    }
    res.status(201).json(newBadge);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to unlock badge' });
  }
});

export default router;
