---
id: 2
status: done
tags:
- feature
- v1-0
created_at: 2026-06-16T10:55:11Z
updated_at: 2026-06-16T10:56:54Z
---
## Description

Dynamic focus session timer that adapts preset duration based on average focus history and completion behavior.

## What shipped

- **Focus phases**: intention → active → celebration flow with count-up and pomodoro modes
- **Adaptive preset**: fetched from backend avg-focus-duration; capped 10-60 min; auto-adjusts ±5 min after 2 consecutive early ends or full completions
- **Session tracking**: activeSessionId creation on start; end sends completion flag to backend; setLastFocusDuration for break scaling
- **Celebration phase**: pomodoro completion triggers celebration before auto-starting transition break
- **Switches avoided**: counter incremented during focus mode
- **Store actions**: setFocusIntention, confirmFocus, extendFocus, dismissCelebration, adjustPreset, fetchAvgFocusDuration
