# FLOWR — Cognitive Context-Shield Platform

A focus-management web app that helps knowledge workers (especially developers) reduce cognitive whiplash from context switching. It gamifies focus, batch-processes tasks by cognitive zone, and enforces transition buffers.

## Core Concept

Every zone switch costs ~15 minutes of refocus time. FLOWR makes that cost visible and helps you batch similar work together.

## Architecture

- **Frontend:** Vite + React (TypeScript), Tailwind CSS v4, zustand (state management), react-router, `@dnd-kit` (drag-and-drop), Sentry (error tracking)
- **Backend:** Express.js (Node), PostgreSQL via `pg` driver, Sentry, JWT auth
- **Deployment:** Frontend on Vercel/Netlify, backend on Railway/Render, video assets on CloudFront

## App Structure

| Route | Page |
|---|---|
| `/` | Landing page (marketing + background video) |
| `/app` | Main app (ZoneBoard — task management) |
| `/app/analytics` | WhiplashAnalytics (cognitive loss dashboard) |
| `*` | NotFound (404, links back to `/app`) |

## Key Features

1. **ZoneBoard** — Drag-and-drop kanban-style task board where each column is a "cognitive zone" (e.g., Deep Code, Comms & Sync, Admin & Planning). Tasks can be created, edited, moved between zones, and reordered within zones.

2. **FlowGuardian** — A fullscreen focus timer. Enter a zone, set a pomodoro or count-up timer. Tracks switches avoided, celebrates completions, and earns the "Guardian General" badge (60+ min).

3. **TransitionBuffer** — A mandatory 5-minute micro-break between zone switches to let your brain context-shift. User rates readiness afterward (stored in localStorage). Prevents frantic tab-hopping. Earns "Restoration Champion" badge.

4. **Whiplash Analytics** — Dashboard showing context switches today, estimated time lost (×15 min each), longest focus streak, zone distribution (bar chart), switch patterns, and personalized insights (peak hours, top zones, switch patterns from backend recommendations).

5. **Badges** — 4 gamified achievements: Whiplash Witness (first switch), Context Juggler (5 in a day), Guardian General (60-min focus), Restoration Champion (complete a buffer).

6. **BatchingAssistant** — AI-powered zone suggestions. Type a task description → scored against learned keywords → suggests best zone.

7. **Whiplash Alert** — If you switch zones 3+ times in 10 minutes, a toast fires suggesting a short break. Triggers the TransitionBuffer.

## Color Palette

- `#0E0C0C` — Backgrounds
- `#FFB000` — Accent / gold highlights
- `#525151` — Muted/secondary text

## Tests

- 42 frontend (vitest) + 6 server (vitest) = 48 tests total
