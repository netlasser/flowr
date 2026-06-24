import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db.js';

const router = express.Router();

router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [switchesResult, todayResult, streakResult, zoneDistResult, sessionsResult] =
      await Promise.all([
        db.query(
          `SELECT COUNT(*)::int AS total_switches
           FROM switches WHERE user_id = $1`,
          [userId]
        ),

        db.query(
          `SELECT COUNT(*)::int AS today_switches
           FROM switches
           WHERE user_id = $1
             AND "timestamp" >= CURRENT_DATE
             AND "timestamp" < CURRENT_DATE + INTERVAL '1 day'`,
          [userId]
        ),

        db.query(
          `SELECT COALESCE(MAX(duration_seconds), 0)::int AS longest_streak_seconds
           FROM focus_sessions
           WHERE user_id = $1 AND end_time IS NOT NULL`,
          [userId]
        ),

        db.query(
          `SELECT z.name, z.color, COUNT(t.id)::int AS count
           FROM zones z
           LEFT JOIN tasks t ON t.zone_id = z.id AND t.user_id = $1
           WHERE z.user_id = $1
           GROUP BY z.id, z.name, z.color
           ORDER BY count DESC`,
          [userId]
        ),

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
      longestStreakMinutes: Math.round(longestStreakSeconds / 60),
      zoneDistribution,
      focusTimePerZone,
    });
  } catch (err) {
    console.warn('[DB Fallback] GET /analytics/summary — returning empty analytics:', err.message);
    res.json({
      totalSwitches: 0,
      todaySwitches: 0,
      longestStreakMinutes: 0,
      zoneDistribution: [],
      focusTimePerZone: {},
    });
  }
});

router.get('/avg-focus-duration', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows } = await db.query(
      `SELECT COALESCE(ROUND(AVG(duration_seconds) / 60.0), 25)::int AS avg_duration
       FROM focus_sessions
       WHERE user_id = $1 AND completed = true`,
      [userId]
    );

    res.json({ avgDurationMinutes: rows[0]?.avg_duration || 25 });
  } catch (err) {
    console.warn('[DB Fallback] GET /analytics/avg-focus-duration — returning default:', err.message);
    res.json({ avgDurationMinutes: 25 });
  }
});

router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [hourlyResult, switchPatternResult, zoneDurationResult] =
      await Promise.all([
        db.query(
          `SELECT EXTRACT(HOUR FROM start_time)::int AS hour,
                  COUNT(*)::int AS session_count
           FROM focus_sessions
           WHERE user_id = $1 AND end_time IS NOT NULL
             AND start_time >= NOW() - INTERVAL '7 days'
           GROUP BY hour
           ORDER BY session_count DESC
           LIMIT 2`,
          [userId]
        ),

        db.query(
          `SELECT s.from_zone_id, s.to_zone_id, COUNT(*)::int AS count
           FROM switches s
           WHERE s.user_id = $1
             AND s."timestamp" >= NOW() - INTERVAL '7 days'
             AND s.from_zone_id IS NOT NULL
           GROUP BY s.from_zone_id, s.to_zone_id
           ORDER BY count DESC
           LIMIT 3`,
          [userId]
        ),

        db.query(
          `SELECT zone_id, SUM(duration_seconds)::int AS total_seconds
           FROM focus_sessions
           WHERE user_id = $1 AND end_time IS NOT NULL
             AND start_time >= NOW() - INTERVAL '7 days'
           GROUP BY zone_id
           ORDER BY total_seconds DESC`,
          [userId]
        ),
      ]);

    const { rows: zones } = await db.query(
      'SELECT id, name FROM zones WHERE user_id = $1',
      [userId]
    );
    const zoneMap = Object.fromEntries(zones.map((z) => [z.id, z.name]));

    const recommendations = [];

    if (hourlyResult.rows.length > 0) {
      const peakHour = hourlyResult.rows[0].hour;
      const nextHour = (peakHour + 2) % 24;
      const peakLabel = peakHour >= 12
        ? `${peakHour === 12 ? 12 : peakHour - 12}:00 ${peakHour >= 12 ? 'PM' : 'AM'}`
        : `${peakHour}:00 AM`;
      const nextLabel = nextHour >= 12
        ? `${nextHour === 12 ? 12 : nextHour - 12}:00 ${nextHour >= 12 ? 'PM' : 'AM'}`
        : `${nextHour}:00 AM`;

      recommendations.push({
        id: 'peak-hours',
        type: 'timing',
        message: `You are most focused between ${peakLabel} and ${nextLabel}. Schedule your Deep Code zone there.`,
      });
    }

    if (switchPatternResult.rows.length > 0) {
      const topSwitch = switchPatternResult.rows[0];
      const fromName = zoneMap[topSwitch.from_zone_id] || 'Unknown';
      const toName = zoneMap[topSwitch.to_zone_id] || 'Unknown';

      recommendations.push({
        id: 'switch-pattern',
        type: 'switch',
        message: `You switched from ${fromName} to ${toName} ${topSwitch.count} times. Try a ${fromName} block right after lunch to reduce switching.`,
      });
    }

    if (zoneDurationResult.rows.length > 0) {
      const topZone = zoneDurationResult.rows[0];
      const zoneName = zoneMap[topZone.zone_id] || 'Unknown';

      recommendations.push({
        id: 'top-zone',
        type: 'focus',
        message: `Your longest focus sessions are in "${zoneName}". Consider starting your day there.`,
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        id: 'get-started',
        type: 'general',
        message: 'Complete a few focus sessions to get personalized recommendations.',
      });
    }

    res.json(recommendations);
  } catch (err) {
    console.warn('[DB Fallback] GET /analytics/recommendations — returning empty:', err.message);
    res.json([]);
  }
});

export default router;
