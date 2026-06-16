import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db.js';

const router = express.Router();

// Stub: keyword-to-zone mapping — replace with real AI later
router.post('/suggest-zone', authenticateToken, async (req, res) => {
  try {
    const { description } = req.body;
    const userId = req.user.id;

    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'description is required' });
    }

    const lower = description.toLowerCase();

    // Fetch user's zones
    const { rows: zones } = await db.query(
      'SELECT id, name FROM zones WHERE user_id = $1',
      [userId]
    );

    if (zones.length === 0) {
      return res.json({ zoneId: null, zoneName: null });
    }

    // Static keyword mapping
    const keywordMap = [
      { keywords: ['email', 'slack', 'chat', 'call', 'sync', 'zoom', 'message', 'dm', 'ping', 'notify', 'meet', 'standup', 'comms', 'reply'], zoneMatch: ['comms', 'sync', 'communicat', 'mail'] },
      { keywords: ['code', 'bug', 'feature', 'refactor', 'compile', 'database', 'sql', 'api', 'build', 'deploy', 'fix', 'implement', 'debug', 'test', 'spec', 'lint', 'pull request', 'pr', 'commit'], zoneMatch: ['code', 'deep', 'dev', 'engineer', 'program'] },
      { keywords: ['jira', 'ticket', 'sheet', 'log', 'time', 'plan', 'doc', 'schedule', 'report', 'invoice', 'budget', 'meeting', 'agenda', 'note', 'track', 'admin', 'sprint'], zoneMatch: ['admin', 'plan', 'manag', 'organi'] },
      { keywords: ['design', 'figma', 'mockup', 'wireframe', 'sketch', 'ui', 'ux', 'prototype', 'palette', 'typography'], zoneMatch: ['design', 'creative', 'art'] },
      { keywords: ['research', 'learn', 'read', 'study', 'explore', 'investigate', 'analyze', 'literature'], zoneMatch: ['research', 'learn', 'deep'] },
    ];

    let bestScore = 0;
    let matchedZoneId = zones[0]?.id || null;

    for (const rule of keywordMap) {
      let score = 0;
      for (const kw of rule.keywords) {
        if (lower.includes(kw)) score += 2;
      }

      for (const zone of zones) {
        const zoneLower = zone.name.toLowerCase();
        for (const match of rule.zoneMatch) {
          if (zoneLower.includes(match)) {
            if (score > bestScore) {
              bestScore = score;
              matchedZoneId = zone.id;
            }
          }
        }
      }
    }

    const matchedZone = zones.find((z) => z.id === matchedZoneId);

    res.json({
      zoneId: matchedZone?.id || null,
      zoneName: matchedZone?.name || null,
    });
  } catch (err) {
    console.error('suggest-zone error:', err);
    res.status(500).json({ error: 'Failed to suggest zone' });
  }
});

export default router;
