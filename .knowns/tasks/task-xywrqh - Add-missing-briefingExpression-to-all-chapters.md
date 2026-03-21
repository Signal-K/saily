---
id: xywrqh
title: Add missing briefingExpression to all chapters
status: todo
priority: low
labels:
  - narrative
  - polish
createdAt: '2026-03-21T01:53:23.685Z'
updatedAt: '2026-03-21T01:53:28.218Z'
timeSpent: 0
---
# Add missing briefingExpression to all chapters

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Several chapters in lib/storylines.ts have no briefingExpression set, so the avatar defaults to 'neutral' for every briefing. Each chapter should have an intentional expression. Related: @doc/specs/characters-storylines
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All 20 chapters have an explicit briefingExpression (not relying on undefined → neutral fallback)
- [ ] #2 Expressions are consistent with each character's tone (warm vs serious)
- [ ] #3 Doc @doc/specs/characters-storylines updated if expression table is added
<!-- AC:END -->

