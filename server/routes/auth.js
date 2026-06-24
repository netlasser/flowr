import express from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { findById, create } from '../models/user.js';
import { queryWithTimeout } from '../db-guard.js';

const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const JWKS = createRemoteJWKSet(
  new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
);

const GUEST_UUID = '00000000-0000-0000-0000-000000000000';

function staticGuest() {
  return {
    id: GUEST_UUID,
    email: 'flowr-focus@deepmind.com',
    name: 'Focus Builder',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

router.post('/guest', async (req, res) => {
  try {
    let guest = await queryWithTimeout(findById(GUEST_UUID), 3000);
    if (!guest) {
      await queryWithTimeout(create(GUEST_UUID, 'flowr-focus@deepmind.com', 'Focus Builder'), 3000);
      guest = await queryWithTimeout(findById(GUEST_UUID), 3000);
    }
    res.json({
      user: {
        id: guest.id,
        email: guest.email,
        name: guest.name,
        createdAt: guest.created_at,
        updatedAt: guest.updated_at,
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
      await queryWithTimeout(create(supabaseUserId, email, name), 5000);
      user = await queryWithTimeout(findById(supabaseUserId), 5000);
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      token,
    });
  } catch (err) {
    console.error('Supabase token exchange failed:', err);
    res.status(401).json({ error: 'Invalid Supabase token' });
  }
});

export default router;
