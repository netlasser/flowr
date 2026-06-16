---
id: 7
status: done
tags:
- infra
- v1-0
created_at: 2026-06-16T10:56:46Z
updated_at: 2026-06-16T10:56:54Z
---
## Description

Sentry integration for frontend and backend error tracking.

## What shipped

- **Frontend**: @sentry/react integration in App entry; browser error captures
- **Backend**: @sentry/node middleware on Express routes; request error captures
- **Dependencies**: added sentry packages to package.json
