---
id: sly002
title: Lock the daily mission MVP to one playable path
status: done
priority: high
labels:
  - mvp
  - daily-game
  - ux
createdAt: '2026-04-19T14:00:00.000Z'
updatedAt: '2026-04-25T11:29:41.154Z'
timeSpent: 0
assignee: '@me'
---
# Lock the daily mission MVP to one playable path

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
This is part of the 2026-04-20 Star Sailors MVP/project-management reset. Project: Saily / The Daily Sail. Work must stay tied to MVP closure, distribution, testing, or agent handoff for this week.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Today mission can be completed from a clean session.
- [x] #2 Non-MVP surfaces do not block or confuse the first-session test.
- [x] #3 Submission creates the expected progress/streak state.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Constrain the MVP path to briefing, one puzzle, submission, result, and progress update.
2. Hide or de-emphasize non-MVP nav/pages that distract testers.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created by project-management reset on 2026-04-20.

Locked daily mission to 1 game (from 3) by updating MISSION_GAME_COUNT in lib/mission.ts. De-emphasized non-MVP surfaces by commenting out Calendar and Search/Registry links in layout.tsx and home-page.tsx. This ensures testers follow the primary mission path.
<!-- SECTION:NOTES:END -->

