---
id: v9x7m2
title: Gate non-prod puzzles and prioritize planet game for new users
status: done
priority: medium
labels: ["puzzles", "ux", "prod-readiness"]
createdAt: '2026-04-18T10:00:00.000Z'
updatedAt: '2026-04-18T10:00:00.000Z'
timeSpent: 0
---
# Gate non-prod puzzles and prioritize planet game for new users

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Environment-based gating for puzzles and improved onboarding for new users:
- Gated 'asteroid' game to local/preview environments only using `NEXT_PUBLIC_VERCEL_ENV`.
- Ensured 'planet' (transit analysis) is always the first game for users at chapter 0 to provide a simple entry point.
- Updated `getMissionGameOrder` and `getGameOrderOverrideForDate` in `web/src/lib/mission.ts` to enforce these rules.
- Updated `MissionFlowPage` component to filter URL overrides (`gameOrder` and `firstGame`) against the production-ready `MISSION_GAMES` pool.
<!-- SECTION:DESCRIPTION:END -->
