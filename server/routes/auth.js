import express from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { findById, create } from '../models/user.js';

const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const projectId = SUPABASE_URL.replace(/https?:\/\//, '').split('.')[0];
const JWKS = createRemoteJWKSet(
  new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
);

// Legacy guest session (for prototyping)
router.post('/guest', async (req, res) => {
  try {
    let guest = await findById('guest-user');
    if (!guest) {
      await create('guest-user', 'flowr-focus@deepmind.com', 'Focus Builder', '');
      guest = await findById('guest-user');
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
    console.error(err);
    res.status(500).json({ error: 'Server guest session error' });
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

    // Upsert: create user if first time, otherwise fetch existing
    let user = await findById(supabaseUserId);
    if (!user) {
      await create(supabaseUserId, email, name, '');
      user = await findById(supabaseUserId);
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
