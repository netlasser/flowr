---
id: 4
status: done
tags:
- feature
- v1-0
created_at: 2026-06-16T10:56:46Z
updated_at: 2026-06-16T10:56:54Z
---
## Description

Intelligent task-to-zone routing with keyword scoring, AI suggestion overlay, and UX improvements across the board.

## What shipped

- **Smart Batching Assistant**: keyword-scored zone routing with ping indicator and accept button
- **AI suggestion chip**: BatchingAssistant component overlays AI zone suggestion; accepts or corrects routing
- **Learned keyword map**: auto-routes after 3+ user corrections via correctSuggestionFeedback / learnFromFeedback
- **Zone tooltips**: info icon on column headers explaining cognitive context grouping
- **Example task placeholders**: zone-aware empty-state suggestions
- **Dismissible banner**: explanatory banner on board persisted to localStorage
- **Backend endpoints**: POST /ai/suggest-zone, GET /tasks/unbatched
