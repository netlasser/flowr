import 'dotenv/config';
import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Router Imports
import authRouter from './routes/auth.js';
import zonesRouter from './routes/zones.js';
import tasksRouter from './routes/tasks.js';
import switchesRouter from './routes/switches.js';
import badgesRouter from './routes/badges.js';
import sessionsRouter from './routes/sessions.js';
import analyticsRouter from './routes/analytics.js';
import aiRouter from './routes/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
});

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

console.log('Initializing FLOWR Express Backend server...');

// API Endpoints
app.use('/api/auth', authRouter);
app.use('/api/zones', zonesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/switches', switchesRouter);
app.use('/api/badges', badgesRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);

// Simple Health Status Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve frontend build static files in production
const frontendDistPath = path.resolve(__dirname, '../dist');
app.use(express.static(frontendDistPath));

// Fallback index.html router for SPA React-Router (Express 5 compatible)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.resolve(frontendDistPath, 'index.html'));
});

// Sentry error handler (must come before the generic handler)
Sentry.setupExpressErrorHandler(app);

// Global Error Catch Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Exception:', err);
  res.status(500).json({ error: 'Internal server safety error triggered' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`    FLOWR Backend running at: http://localhost:${PORT}`);
  console.log(`===============================================`);
});
