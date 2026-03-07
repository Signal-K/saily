---
id: prmh9h
title: Wire unified mission flow
status: done
priority: high
labels:
  - flow
  - routing
  - narrative
  - integration
createdAt: '2026-03-07T09:41:11.529Z'
updatedAt: '2026-03-07T10:06:48.287Z'
timeSpent: 0
---
# Wire unified mission flow

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Connect all three minigames and narrative components into one cohesive daily mission flow. Entry point is /games/today. The page steps through: briefing → game 1 → beat → game 2 → beat → game 3 → resolution. On completion, increment the user's chapter index for today's storyline. Update routing and home page CTAs.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Single /games/today route steps through all 3 games with narrative wrapping
- [ ] #2 Completing game 3 triggers chapter increment via /api/story/progress POST
- [ ] #3 Users who revisit after completion see a summary/resolution view, not the games again
- [ ] #4 Home page CTA reflects today's storyline and user's chapter number
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
MissionFlowPage orchestrates briefing→game1→beat1→game2→beat2→game3→complete. onMissionComplete prop added to all 3 game components. /games/today now renders MissionFlowPage. Chapter progress incremented via /api/story/progress on completion. Total score = sum of all 3 game scores.
<!-- SECTION:NOTES:END -->

