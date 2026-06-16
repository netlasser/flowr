---
id: 13
status: backlog
tags:
- feature
- v1-2
created_at: 2026-06-16T10:58:01Z
updated_at: 2026-06-16T10:58:01Z
---
## Description

Integrate FLOWR with Slack, Discord, and Zapier via webhooks.

## Requirements & the "Why"

External integrations let FLOWR push notifications (focus complete, whiplash alert, badge earned) into the tools teams already use. Zapier enables no-code automation (create task from email, log focus to calendar, etc.).

## Acceptance Criteria

- [ ] Slack webhook: post focus completion and whiplash alerts
- [ ] Discord webhook: same events
- [ ] Zapier integration: trigger on focus complete / badge earned
- [ ] User-configurable webhook URLs in settings
- [ ] Retry logic for failed deliveries

## Tasks

- [ ] Backend: webhook event system
- [ ] Backend: Slack message formatter
- [ ] Backend: Discord message formatter
- [ ] Backend: Zapier REST endpoint
- [ ] Frontend: webhook settings UI
- [ ] Queue and retry for failed deliveries
