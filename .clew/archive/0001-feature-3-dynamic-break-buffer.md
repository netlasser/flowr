---
id: 1
status: done
tags:
- feature
- v1.0
created_at: 2026-06-16T10:34:19Z
updated_at: 2026-06-16T10:48:54Z
---
# Feature 3: Dynamic break buffer

## Description

3-phase transition buffer (selecting → counting → rating) that enforces recovery breaks between context switches.

## What shipped

- **Phase 1: Selecting** — range slider (3-12 min) scaled to 15% of last focus duration; circular countdown preview
- **Phase 2: Counting** — rotating micro-recovery prompts (stretch, hydrate, eye-rest); SVG countdown ring; bypass warning with whiplash cost penalty
- **Phase 3: Rating** — 1-5 readiness scale; low-readiness offers +2 min micro-break; dynamic return-to-board text
- **Store logic** — `startBuffer` accepts break minutes; `extendBuffer` adds extra seconds; `tickBuffer` no longer auto-dismisses (hands off to rating phase); `skipBuffer` logs penalty
- **Quick break mode** — `bufferIsQuickBreak` flag skips selecting/rating phases; auto-dismisses on countdown=0
