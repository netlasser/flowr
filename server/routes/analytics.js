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
    console.error('Avg focus duration error:', err);
    res.status(500).json({ error: 'Failed to compute average focus duration' });
  }
});

router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Run analysis queries in parallel
    const [hourlyResult, switchPatternResult, zoneDurationResult] =
      await Promise.all([
        // Peak focus hours (hour with most completed focus sessions)
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

        // Most common switch pattern (from_zone -> to_zone)
        db.query(
          `SELECT s.from_zone_id, s.to_zone_id, COUNT(*)::int AS count
           FROM switches s
           WHERE s.user_id = $1
             AND s.timestamp >= NOW() - INTERVAL '7 days'
             AND s.from_zone_id IS NOT NULL
           GROUP BY s.from_zone_id, s.to_zone_id
           ORDER BY count DESC
           LIMIT 3`,
          [userId]
        ),

        // Total focus time per zone
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

    // Fetch zone names
    const { rows: zones } = await db.query(
      'SELECT id, name FROM zones WHERE user_id = $1',
      [userId]
    );
    const zoneMap = Object.fromEntries(zones.map((z) => [z.id, z.name]));

    const recommendations = [];

    // Peak hours recommendation
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

    // Switch pattern recommendation
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

    // Most focused zone recommendation
    if (zoneDurationResult.rows.length > 0) {
      const topZone = zoneDurationResult.rows[0];
      const zoneName = zoneMap[topZone.zone_id] || 'Unknown';

      recommendations.push({
        id: 'top-zone',
        type: 'focus',
        message: `Your longest focus sessions are in "${zoneName}". Consider starting your day there.`,
      });
    }

    // General recommendation if none
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'get-started',
        type: 'general',
        message: 'Complete a few focus sessions to get personalized recommendations.',
      });
    }

    res.json(recommendations);
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Failed to compute recommendations' });
  }
});

export default router;
