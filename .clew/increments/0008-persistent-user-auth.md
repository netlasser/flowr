---
id: 8
status: backlog
tags:
- feature
- v1-1
created_at: 2026-06-16T10:57:26Z
updated_at: 2026-06-16T10:57:26Z
---
## Description

Replace guest-only sessions with persistent email/password + Google OAuth authentication.

## Requirements & the "Why"

Guest tokens are volatile — users lose their zones, tasks, and history on token expiry. Persistent auth enables real user accounts, cross-device sync, and proper session management.

## Acceptance Criteria

- [ ] Email/password registration and login with Supabase Auth
- [ ] Google OAuth single sign-on
- [ ] Token refresh and secure storage
- [ ] Replace guest bootstrap with persistent auth flow
- [ ] Authenticated API requests with Bearer token
- [ ] Logout clears local state and redirects to login
- [ ] Protected routes redirect to login when unauthenticated

## Tasks

- [ ] Add Supabase Auth client configuration
- [ ] Create AuthContext with login/register/logout/session state
- [ ] Build login and registration pages
- [ ] Wire Google OAuth button
- [ ] Update api.ts to use auth token
- [ ] Replace guest session bootstrap with auth bootstrap
- [ ] Add route guards
- [ ] Update backend middleware to verify tokens
