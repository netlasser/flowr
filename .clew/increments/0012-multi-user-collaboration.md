---
id: 12
status: backlog
tags:
- feature
- v1-2
created_at: 2026-06-16T10:58:01Z
updated_at: 2026-06-16T10:58:01Z
---
## Description

Shared zones and task assignment across multiple users.

## Requirements & the "Why"

FLOWR is single-user by design. Collaboration enables teams to share cognitive context zones, assign tasks, and view collective focus patterns — useful for pair programming, team sprints, and shared workspaces.

## Acceptance Criteria

- [ ] Zones can be shared with other users (view or edit permissions)
- [ ] Tasks can be assigned to users
- [ ] Real-time updates via Supabase Realtime or polling
- [ ] Collaboration indicator (avatars, presence)
- [ ] User search/invite flow

## Tasks

- [ ] Backend: zone sharing permissions model
- [ ] Backend: task assignment model
- [ ] Frontend: sharing UI (invite, permissions picker)
- [ ] Frontend: assignment selector on tasks
- [ ] Presence indicators
- [ ] Supabase Realtime subscriptions
