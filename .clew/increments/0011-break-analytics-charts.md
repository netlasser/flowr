---
id: 11
status: backlog
tags:
- feature
- v1-1
created_at: 2026-06-16T10:57:26Z
updated_at: 2026-06-16T10:57:26Z
---
## Description

Analytics for transition break usage: readiness score trends, break completion rates, and micro-break adoption.

## Requirements & the "Why"

The Transition Buffer collects readiness ratings, bypass events, and micro-break usage — but none of this data is surfaced. Analytics help users see if breaks are actually improving their focus readiness and identify patterns (e.g., always rating low after certain zones).

## Acceptance Criteria

- [ ] Readiness score trend line over time
- [ ] Break completion vs bypass rate chart
- [ ] Micro-break adoption rate
- [ ] Correlation between readiness and subsequent focus duration

## Tasks

- [ ] Backend: aggregate break data endpoints
- [ ] Frontend: readiness trend chart
- [ ] Frontend: completion/bypass breakdown
- [ ] Frontend: micro-break usage stats
- [ ] Wire into analytics tab
