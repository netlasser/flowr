import express from 'express';
import jwt from 'jsonwebtoken';
import { findById, create } from '../models/user.js';
import { queryWithTimeout } from '../db-guard.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'flowr-dev-secret-change-in-production';

router.post('/guest', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    let user = await queryWithTimeout(
      findById(email),
      5000,
    );

    if (!user) {
      await queryWithTimeout(
        create(email, email, name),
        5000,
      );
      user = await queryWithTimeout(
        findById(email),
        5000,
      );
    }

    if (!user) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

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
    console.error('Guest auth failed:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;
