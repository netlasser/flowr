import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAllBadges, getUserBadges, checkAndAward } from '../models/badge.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const badges = await getAllBadges();
    res.json(badges);
  } catch (err) {
    console.warn('[DB Fallback] GET /badges — returning empty array:', err.message);
    res.json([]);
  }
});

router.get('/user', authenticateToken, async (req, res) => {
  try {
    const badges = await getUserBadges(req.user.id);
    res.json(badges);
  } catch (err) {
    console.warn('[DB Fallback] GET /badges/user — returning empty array:', err.message);
    res.json([]);
  }
});

router.post('/check', authenticateToken, async (req, res) => {
  try {
    const awards = await checkAndAward(req.user.id);
    res.json({ awards });
  } catch (err) {
    console.warn('[DB Fallback] POST /badges/check — returning empty awards:', err.message);
    res.json({ awards: [] });
  }
});

export default router;
