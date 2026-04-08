---
id: p1hcrx
title: Wire story progress increment for all game types
status: done
priority: high
labels:
  - functionality
  - narrative
createdAt: '2026-04-08T10:49:11.748Z'
updatedAt: '2026-04-08T10:53:04.914Z'
timeSpent: 0
---
# Wire story progress increment for all game types

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Currently story progress (user_story_progress table, /api/story/progress) may only be incremented by the Planet Hunter game path. Verify and fix so that completing Mars, Asteroid, and InSight games also increments the user's chapter progress for the active storyline. The story progress API is at web/src/app/api/story/progress/route.ts. The active storyline is determined by getStorylineForDate (web/src/lib/mission.ts). Each game's completion route is: /api/game/complete (planet), /api/asteroid/submit, /api/mars/classify, /api/insight/submit. This is related to xvb4ki but focused specifically on the story progress increment, not rewards.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Completing any of the 4 game types increments story chapter progress
- [ ] #2 Progress is only incremented once per day per storyline (idempotent)
- [ ] #3 Arc completion (chapter 4 → 5) triggers the reward flow
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Already implemented: mission-flow-page.tsx calls /api/story/progress with complete-chapter after all 3 games finish, regardless of game type. All 4 game types feed into handleGameComplete() which triggers the progress POST.
<!-- SECTION:NOTES:END -->

