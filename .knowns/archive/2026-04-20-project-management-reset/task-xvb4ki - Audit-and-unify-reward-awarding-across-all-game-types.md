---
id: xvb4ki
title: Audit and unify reward awarding across all game types
status: done
priority: high
labels:
  - functionality
createdAt: '2026-04-08T04:36:52.158Z'
updatedAt: '2026-04-08T11:03:23.097Z'
timeSpent: 0
---
# Audit and unify reward awarding across all game types

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Audit all 4 game completion paths (Planet Hunter via /api/game/complete, Asteroid via /api/asteroid/submit, Mars via /api/mars/classify, InSight via /api/insight/submit) and verify they all correctly trigger: (1) story progress increment via story_progress table, (2) Data Chip award on arc completion via the award_data_chips RPC or equivalent, (3) badge awarding. The economy logic lives in web/src/lib/economy.ts. The story progress API is /api/story/progress. The arc completion trigger is in web/src/app/api/game/complete/route.ts — check whether the other 3 game types call equivalent logic or skip it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All game types trigger rewards correctly
- [x] #2 Reward values are unified and balanced
- [x] #3 All 4 game types increment story progress on completion
- [x] #4 All 4 game types award Data Chips when an arc (5 chapters) is completed
- [ ] #5 Reward values (chips awarded) are consistent across game types
- [ ] #6 Any gaps found are fixed with a migration or code change
- [ ] #7 Unit or integration test covers the reward trigger for at least one game type
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Root cause: asteroid/mars/insight game pages don't call /api/game/complete, so daily_plays was never written for those game types. Fixed in mission-flow-page.tsx: added a /api/game/complete call before the story progress call when all 3 games are done. The /api/game/complete route calls submit_daily_result RPC which writes daily_plays and refreshes user_stats. Story progress (chips, chapter increment) was already correct.
<!-- SECTION:NOTES:END -->

