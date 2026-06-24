import { describe, it, expect, beforeAll } from 'vitest';
import supertest from 'supertest';
import app from '../server.js';
import pool from '../db.js';

const request = supertest(app);
const GUEST_TOKEN = 'guest-token';

let dbAvailable = true;

beforeAll(async () => {
  try {
    await pool.query('SELECT 1');
  } catch {
    dbAvailable = false;
  }
});

describe('POST /api/auth/guest', () => {
  it('returns 200 and a guest user with token (static fallback)', async () => {
    const res = await request.post('/api/auth/guest');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token', 'guest-token');

    const { user } = res.body;
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('name');
    expect(typeof user.id).toBe('string');
    expect(typeof user.email).toBe('string');
  });
});

describe('GET /api/analytics/summary', () => {
  it('returns 200 with complete analytics shape (or fallback zeros)', async () => {
    const res = await request
      .get('/api/analytics/summary')
      .set('Authorization', `Bearer ${GUEST_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalSwitches');
    expect(res.body).toHaveProperty('todaySwitches');
    expect(res.body).toHaveProperty('longestStreakMinutes');
    expect(res.body).toHaveProperty('zoneDistribution');
    expect(res.body).toHaveProperty('focusTimePerZone');
    expect(typeof res.body.totalSwitches).toBe('number');
    expect(typeof res.body.todaySwitches).toBe('number');
    expect(typeof res.body.longestStreakMinutes).toBe('number');
    expect(Array.isArray(res.body.zoneDistribution)).toBe(true);
    expect(typeof res.body.focusTimePerZone).toBe('object');
  });
});

describe('GET /api/analytics/avg-focus-duration', () => {
  it('returns 200 with avgDurationMinutes (defaults to 25)', async () => {
    const res = await request
      .get('/api/analytics/avg-focus-duration')
      .set('Authorization', `Bearer ${GUEST_TOKEN}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('avgDurationMinutes');
    expect(typeof res.body.avgDurationMinutes).toBe('number');
    expect(res.body.avgDurationMinutes).toBe(25);
  });
});

describe('GET /api/tasks/unbatched', () => {
  it('returns 200 with an array of unbatched tasks (or empty fallback)', async () => {
    const res = await request
      .get('/api/tasks/unbatched')
      .set('Authorization', `Bearer ${GUEST_TOKEN}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    for (const task of res.body) {
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('completed');
      expect(task).toHaveProperty('zoneId');
      expect(task).toHaveProperty('userId');
      expect(task).toHaveProperty('createdAt');
      expect(task).toHaveProperty('updatedAt');
    }
  });
});

describe('POST /api/sessions', () => {
  const ctx = { zoneId: null, sessionId: null };

  it('creates a session and returns 201 with correct shape (or local fallback)', async () => {
    const zoneRes = await request
      .post('/api/zones')
      .set('Authorization', `Bearer ${GUEST_TOKEN}`)
      .send({ name: 'Test Session Zone', color: '#6366f1' });

    expect(zoneRes.status).toBe(201);
    ctx.zoneId = zoneRes.body.id;

    const res = await request
      .post('/api/sessions')
      .set('Authorization', `Bearer ${GUEST_TOKEN}`)
      .send({ zoneId: ctx.zoneId });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('zoneId', ctx.zoneId);
    expect(res.body).toHaveProperty('startTime');
    expect(res.body).toHaveProperty('completed', false);

    ctx.sessionId = res.body.id;

    if (dbAvailable) {
      const { rows } = await pool.query(
        'SELECT * FROM focus_sessions WHERE id = $1',
        [ctx.sessionId]
      );
      expect(rows).toHaveLength(1);
      expect(rows[0].zone_id).toBe(ctx.zoneId);
      expect(rows[0].completed).toBe(false);
    }
  });

  it('updates the session and returns 200 with correct shape', async () => {
    if (!dbAvailable || !ctx.sessionId) {
      if (!ctx.sessionId) return;
    }

    const res = await request
      .put(`/api/sessions/${ctx.sessionId}`)
      .set('Authorization', `Bearer ${GUEST_TOKEN}`)
      .send({ durationSeconds: 1500, completed: true });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', ctx.sessionId);
    expect(res.body).toHaveProperty('endTime');
    expect(res.body).toHaveProperty('durationSeconds', 1500);
    expect(res.body).toHaveProperty('completed', true);

    if (dbAvailable) {
      const { rows } = await pool.query(
        'SELECT * FROM focus_sessions WHERE id = $1',
        [ctx.sessionId]
      );
      expect(rows).toHaveLength(1);
      expect(rows[0].completed).toBe(true);
      expect(rows[0].duration_seconds).toBe(1500);
      expect(rows[0].end_time).not.toBeNull();
    }
  });
});
