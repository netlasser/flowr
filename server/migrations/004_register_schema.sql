-- FLOWR Schema Registration v4
-- Idempotent: safe to run against existing tables.
-- Registers the full schema in Supabase migration history.

BEGIN;

-- ── Users ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id         uuid PRIMARY KEY,
  email      text,
  name       text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Zones ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.zones (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  color       text,
  icon        text,
  "order"     integer,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_zones_user_id ON public.zones(user_id);

-- ── Tasks ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  zone_id     uuid REFERENCES public.zones(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  completed   boolean NOT NULL DEFAULT false,
  due_date    timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_zone_id ON public.tasks(zone_id);

-- ── Focus Sessions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  zone_id          uuid REFERENCES public.zones(id) ON DELETE CASCADE,
  start_time       timestamptz NOT NULL,
  end_time         timestamptz,
  duration_seconds integer,
  completed        boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_zone_id ON public.focus_sessions(zone_id);

-- ── Switches ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.switches (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  from_zone_id uuid REFERENCES public.zones(id) ON DELETE SET NULL,
  to_zone_id   uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  "timestamp"  timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_switches_user_id ON public.switches(user_id);
CREATE INDEX IF NOT EXISTS idx_switches_timestamp ON public.switches("timestamp");

-- ── Badges ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.badges (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  description       text,
  icon              text,
  requirement_type  text NOT NULL,
  requirement_value integer NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ── User Badges ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_badges (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id   uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at  timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_badges_user_badge ON public.user_badges(user_id, badge_id);

-- ── Seed data ────────────────────────────────────────────────────────────
INSERT INTO public.users (id, email, name)
VALUES ('00000000-0000-0000-0000-000000000000', 'flowr-focus@deepmind.com', 'Focus Builder')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value) VALUES
  ('Whiplash Witness',     'Record your first context switch',     'swap',             'switches_count',    1),
  ('Context Juggler',      'Record 5 context switches',            'arrows-left-right', 'switches_count',    5),
  ('Guardian General',     'Complete a 60-minute focus streak',    'shield-check',      'streak_duration',   60),
  ('Restoration Champion', 'Complete 3 focused break sessions',    'flower-lotus',      'break_completions', 3)
ON CONFLICT DO NOTHING;

-- ── Row-Level Security ───────────────────────────────────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS users_select ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY IF NOT EXISTS users_insert ON public.users FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY IF NOT EXISTS users_update ON public.users FOR UPDATE USING (id = auth.uid());

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS zones_select ON public.zones FOR SELECT USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS zones_insert ON public.zones FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS zones_update ON public.zones FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS zones_delete ON public.zones FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS tasks_select ON public.tasks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS tasks_insert ON public.tasks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS tasks_update ON public.tasks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS tasks_delete ON public.tasks FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS focus_sessions_select ON public.focus_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS focus_sessions_insert ON public.focus_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS focus_sessions_update ON public.focus_sessions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS focus_sessions_delete ON public.focus_sessions FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.switches ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS switches_select ON public.switches FOR SELECT USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS switches_insert ON public.switches FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS switches_update ON public.switches FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS switches_delete ON public.switches FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS badges_select ON public.badges FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS user_badges_select ON public.user_badges FOR SELECT USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS user_badges_insert ON public.user_badges FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS user_badges_update ON public.user_badges FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS user_badges_delete ON public.user_badges FOR DELETE USING (user_id = auth.uid());

COMMIT;
