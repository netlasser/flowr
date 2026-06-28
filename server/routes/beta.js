import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db.js';

const router = express.Router();

// Submit beta feedback
router.post('/feedback', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, message, context } = req.body;

    if (!['bug', 'feature', 'general'].includes(type)) {
      return res.status(400).json({ error: 'Invalid feedback type' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Feedback message is required' });
    }

    const { rows } = await db.query(
      `INSERT INTO beta_feedback (user_id, type, message, context)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, type, message, created_at`,
      [userId, type, message.trim(), context || null]
    );

    const feedback = rows[0];

    res.status(201).json({
      id: feedback.id,
      userId: feedback.user_id,
      type: feedback.type,
      message: feedback.message,
      createdAt: feedback.created_at
    });
  } catch (err) {
    console.error('[Error] POST /beta/feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get beta analytics (admin only - simple implementation)
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    // For now, just return basic stats; full admin auth can be added later
    const [feedbackResult, testerResult, sessionResult] = await Promise.all([
      db.query(`
        SELECT 
          COUNT(*)::int AS total,
          SUM(CASE WHEN type = 'bug' THEN 1 ELSE 0 END)::int AS bugs,
          SUM(CASE WHEN type = 'feature' THEN 1 ELSE 0 END)::int AS features,
          SUM(CASE WHEN type = 'general' THEN 1 ELSE 0 END)::int AS general
        FROM beta_feedback
      `),
      db.query(`
        SELECT COUNT(DISTINCT user_id)::int AS active_testers
        FROM focus_sessions
        WHERE start_time >= NOW() - INTERVAL '7 days'
      `),
      db.query(`
        SELECT
          COUNT(*)::int AS total_sessions,
          COALESCE(AVG(duration_seconds/60.0), 0)::numeric(5,2) AS avg_duration_minutes
        FROM focus_sessions
        WHERE completed = true
      `)
    ]);

    const feedbackStats = feedbackResult.rows[0];
    const activeTesters = testerResult.rows[0].active_testers || 0;
    const sessionStats = sessionResult.rows[0];

    res.json({
      totalFeedbackCount: feedbackStats.total,
      feedbackByType: {
        bug: feedbackStats.bugs,
        feature: feedbackStats.features,
        general: feedbackStats.general
      },
      activeTesters,
      sessionsCompleted: sessionStats.total_sessions,
      averageSessionDuration: parseFloat(sessionStats.avg_duration_minutes)
    });
  } catch (err) {
    console.error('[Error] GET /beta/analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
