import express from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { findById, create } from '../models/user.js';

const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const JWKS = createRemoteJWKSet(
  new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
);

function staticGuest() {
  return {
    id: 'guest-user',
    email: 'flowr-focus@deepmind.com',
    name: 'Focus Builder',
    createdAt: new Date().toISOString(),
  };
}

function queryWithTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('DB query timed out')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Legacy guest session (for prototyping) — DB-independent fallback
router.post('/guest', async (req, res) => {
  try {
    let guest = await queryWithTimeout(findById('guest-user'), 3000);
    if (!guest) {
      await queryWithTimeout(create('guest-user', 'flowr-focus@deepmind.com', 'Focus Builder', ''), 3000);
      guest = await queryWithTimeout(findById('guest-user'), 3000);
    }
    res.json({
      user: {
        id: guest.id,
        email: guest.email,
        name: guest.name,
        createdAt: guest.created_at,
      },
      token: 'guest-token',
    });
  } catch (err) {
    console.warn('Guest session DB unavailable, returning static user:', err.message);
    res.json({
      user: staticGuest(),
      token: 'guest-token',
    });
  }
});

// Exchange a Supabase JWT for a local session
router.post('/supabase', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${SUPABASE_URL}/auth/v1`,
    });

    const supabaseUserId = payload.sub;
    const email = payload.email || '';
    const name = payload.user_metadata?.name || email?.split('@')[0] || 'User';

    let user = await queryWithTimeout(findById(supabaseUserId), 5000);
    if (!user) {
      await queryWithTimeout(create(supabaseUserId, email, name, ''), 5000);
      user = await queryWithTimeout(findById(supabaseUserId), 5000);
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (err) {
    console.error('Supabase token exchange failed:', err);
    res.status(401).json({ error: 'Invalid Supabase token' });
  }
});

export default router;
