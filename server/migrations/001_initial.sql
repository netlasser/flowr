-- FLOWR PostgreSQL Schema (Supabase)
-- Run via: psql $DATABASE_URL -f server/migrations/001_initial.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ── Zones ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS zones (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT NOT NULL,
  icon        TEXT,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_zones_user_id ON zones(user_id);

-- ── Tasks ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  completed     BOOLEAN NOT NULL DEFAULT FALSE,
  zone_id       TEXT NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_zone_id ON tasks(zone_id);

-- ── Focus Sessions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS focus_sessions (
  id                   TEXT PRIMARY KEY,
  user_id              TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zone_id              TEXT NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  start_time           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time             TIMESTAMP WITH TIME ZONE,
  duration_seconds     INTEGER NOT NULL DEFAULT 0,
  tasks_completed_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_zone_id ON focus_sessions(zone_id);

-- ── Switches (context switch events) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS switches (
  id                        TEXT PRIMARY KEY,
  from_zone_id              TEXT,
  to_zone_id                TEXT NOT NULL,
  timestamp                 TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  estimated_time_lost_seconds INTEGER NOT NULL DEFAULT 900,
  user_id                   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_switches_user_id ON switches(user_id);
CREATE INDEX IF NOT EXISTS idx_switches_timestamp ON switches(timestamp);

-- ── Badges ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id          TEXT PRIMARY KEY,
  badge_type  TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, badge_type)
);

CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
