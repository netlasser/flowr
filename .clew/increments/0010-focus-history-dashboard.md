---
id: 10
status: backlog
tags:
- feature
- v1-1
created_at: 2026-06-16T10:57:26Z
updated_at: 2026-06-16T10:57:26Z
---
## Description

Weekly focus history with heatmap visualization, trend lines, and daily breakdown.

## Requirements & the "Why"

Users have no way to see their focus patterns over time. A dashboard with weekly heatmap, focus duration trends, and zone distribution helps identify productivity patterns and whiplash risk periods.

## Acceptance Criteria

- [ ] Weekly calendar heatmap (focus minutes per day)
- [ ] Trend line for average focus duration over 7/14/30 days
- [ ] Zone distribution pie or bar chart
- [ ] Filter by date range
- [ ] Data from backend focus_sessions table

## Tasks

- [ ] Backend: aggregate focus data by day/week
- [ ] Frontend: heatmap component
- [ ] Frontend: trend line chart (recharts or custom SVG)
- [ ] Frontend: zone distribution chart
- [ ] Date range picker
- [ ] Wire to /analytics tab or new sub-route
