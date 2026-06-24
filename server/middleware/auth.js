import { createRemoteJWKSet, jwtVerify } from 'jose';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const JWKS = createRemoteJWKSet(
  new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
);

const GUEST_UUID = '00000000-0000-0000-0000-000000000000';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  if (token === 'guest-token') {
    req.user = { id: GUEST_UUID, email: 'flowr-focus@deepmind.com' };
    return next();
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${SUPABASE_URL}/auth/v1`,
    });
    req.user = {
      id: payload.sub,
      email: payload.email,
    };
    next();
  } catch (err) {
    console.error('Supabase JWT verification failed:', err);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
