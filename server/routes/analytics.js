import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db.js';

const router = express.Router();

router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Run all aggregation queries in parallel
    const [switchesResult, todayResult, streakResult, zoneDistResult, sessionsResult] =
      await Promise.all([
        // Total switches count + total time lost
        db.query(
          `SELECT COUNT(*)::int AS total_switches,
                  COALESCE(SUM(estimated_time_lost_seconds), 0)::int AS total_seconds_lost
           FROM switches WHERE user_id = $1`,
          [userId]
        ),

        // Today's switches count
        db.query(
          `SELECT COUNT(*)::int AS today_switches
           FROM switches
           WHERE user_id = $1
             AND timestamp >= CURRENT_DATE
             AND timestamp < CURRENT_DATE + INTERVAL '1 day'`,
          [userId]
        ),

        // Longest focus streak (from focus_sessions)
        db.query(
          `SELECT COALESCE(MAX(duration_seconds), 0)::int AS longest_streak_seconds
           FROM focus_sessions
           WHERE user_id = $1 AND end_time IS NOT NULL`,
          [userId]
        ),

        // Task count per zone
        db.query(
          `SELECT z.name, z.color, COUNT(t.id)::int AS count
           FROM zones z
           LEFT JOIN tasks t ON t.zone_id = z.id AND t.user_id = $1
           WHERE z.user_id = $1
           GROUP BY z.id, z.name, z.color
           ORDER BY count DESC`,
          [userId]
        ),

        // Focus time per zone
        db.query(
          `SELECT zone_id,
                  COALESCE(SUM(duration_seconds), 0)::int AS total_seconds
           FROM focus_sessions
           WHERE user_id = $1 AND end_time IS NOT NULL
           GROUP BY zone_id`,
          [userId]
        ),
      ]);

    const totalSwitches = switchesResult.rows[0]?.total_switches || 0;
    const totalSecondsLost = switchesResult.rows[0]?.total_seconds_lost || 0;
    const todaySwitches = todayResult.rows[0]?.today_switches || 0;
    const longestStreakSeconds = streakResult.rows[0]?.longest_streak_seconds || 0;

    const zoneDistribution = zoneDistResult.rows.map((r) => ({
      label: r.name,
      color: r.color,
      count: r.count,
    }));

    const focusTimePerZone = {};
    for (const r of sessionsResult.rows) {
      focusTimePerZone[r.zone_id] = r.total_seconds;
    }

    res.json({
      totalSwitches,
      todaySwitches,
      totalSecondsLost,
      longestStreakMinutes: Math.round(longestStreakSeconds / 60),
      zoneDistribution,
      focusTimePerZone,
    });
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.status(500).json({ error: 'Failed to compute analytics' });
  }
});

export default router;
