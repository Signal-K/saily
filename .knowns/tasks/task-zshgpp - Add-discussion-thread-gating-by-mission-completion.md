---
id: zshgpp
title: Add discussion thread gating by mission completion
status: done
priority: medium
labels:
  - functionality
createdAt: '2026-04-08T10:49:26.417Z'
updatedAt: '2026-04-08T10:53:27.652Z'
timeSpent: 0
---
# Add discussion thread gating by mission completion

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Per the spec (FR-7), discussion threads should be locked/hidden until the user has completed their daily mission. The discuss-forum.tsx component exists (web/src/components/discuss-forum.tsx) and the forum API is at /api/forum/. Check whether the gating is currently implemented — if not, add it. The day access check pattern is in web/src/lib/day-access.ts. The forum thread should be readable only after the user has a daily_plays row for that game_date. The /discuss page should show a 'Complete today\'s mission to unlock discussion' message if not yet played.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Discussion thread for today is hidden/locked until user completes the mission
- [ ] #2 Completed users see the full thread
- [ ] #3 Unauthenticated users see a sign-in prompt
- [ ] #4 Archive day threads are accessible to users who have played that archive date
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Already implemented in discuss-forum.tsx: dayAccess state fetched from /api/game/today, interactionLocked gates posting, and a lock banner with CTA is shown when !dayAccess.allowed.
<!-- SECTION:NOTES:END -->

