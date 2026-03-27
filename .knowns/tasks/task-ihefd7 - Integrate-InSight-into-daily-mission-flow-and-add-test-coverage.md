---
id: ihefd7
title: Integrate InSight into daily mission flow and add test coverage
status: done
priority: high
labels:
  - feature
  - testing
  - insight
createdAt: '2026-03-26T00:30:02.564Z'
updatedAt: '2026-03-28T05:24:57.075Z'
timeSpent: 190477
assignee: '@me'
---
# Integrate InSight into daily mission flow and add test coverage

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Fold the InSight Weather Desk into the main mission loop, preserve archive/story rules, and add unit/e2e coverage for mission selection and submission behavior. Related: @doc/guides/insight-weather-desk
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Daily mission flow can serve InSight as a mission game without breaking archive/story progression
- [x] #2 Unit tests cover InSight puzzle generation or submission logic
- [x] #3 E2E tests cover the player path for InSight in the daily mission flow
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Inspect current mission sequencing and identify the cleanest place to add InSight as a mission step.
2. Implement InSight integration in the daily mission flow without regressing archive or story progression rules.
3. Add automated coverage: unit tests for InSight puzzle logic or submission validation, and e2e coverage for the mission path.
4. Run build, lint, and targeted tests; update task notes and completion state.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
InSight fully integrated: insight in MISSION_GAMES, rendered in renderActiveGame(), API routes at /api/insight/daily+submit with day-access guard. Unit tests (insight.test.ts, mission.test.ts) and e2e (insight-mission-flow.cy.ts) all pass. Added vitest.config.ts with @/ alias so unit tests resolve correctly.
<!-- SECTION:NOTES:END -->

