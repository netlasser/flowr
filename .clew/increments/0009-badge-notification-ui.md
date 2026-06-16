---
id: 9
status: backlog
tags:
- feature
- v1-1
created_at: 2026-06-16T10:57:26Z
updated_at: 2026-06-16T10:57:26Z
---
## Description

Visual toast or banner when a badge is earned during a focus session.

## Requirements & the "Why"

Badges are earned silently — the store tracks them but users never see when they unlock one. A celebratory notification reinforces positive behavior (focus completion, switch avoidance, streak milestones).

## Acceptance Criteria

- [ ] Toast notification when badge is earned (distinct from regular toasts)
- [ ] Badge icon + name + description in the toast
- [ ] Auto-dismiss after 5 seconds
- [ ] Optional: badge animation or sparkle effect

## Tasks

- [ ] Store: emit event or return badge on earnBadge/unlockBadge
- [ ] Hook or component: listen for badge events and push toast
- [ ] Toast variant for badge notifications
