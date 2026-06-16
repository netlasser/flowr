---
id: 3
status: done
tags:
- feature
- v1-0
created_at: 2026-06-16T10:56:46Z
updated_at: 2026-06-16T10:56:54Z
---
## Description

Detects rapid context switching (>=3 zone switches in 10 min) and proactively warns user with a toast offering a short break.

## What shipped

- **Zone switch history**: capped at 20 entries; timestamped per cross-zone drag
- **Whiplash detection**: useWhiplashAlert hook filters recent switches; fires info toast when threshold met
- **Toast action**: "Take a short break" button triggers 2-min quick break via bufferIsQuickBreak flag
- **Non-blocking**: toast auto-dismisses after 15s; whiplash alert resets when count drops below 3
- **Store actions**: addZoneSwitch, clearZoneSwitchHistory, setWhiplashAlertShown, zoneSwitchHistory
