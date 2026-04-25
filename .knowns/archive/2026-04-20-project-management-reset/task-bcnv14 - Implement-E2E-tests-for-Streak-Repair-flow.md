---
id: bcnv14
title: Implement E2E tests for Streak Repair flow
status: blocked
priority: high
labels:
  - functionality
createdAt: '2026-04-08T04:36:53.964Z'
updatedAt: '2026-04-09T03:31:21.380Z'
timeSpent: 0
---
# Implement E2E tests for Streak Repair flow

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The streak repair flow lives in web/src/components/streak-repair-prompt.tsx and calls economy.ts repairStreak() → supabase RPC repair_streak. The prompt checks if yesterday was missed but day-before was played, and the user has chips. Write Playwright tests (or extend existing test setup) covering: happy path (chips available, repair succeeds), no chips (button disabled), already played yesterday (prompt not shown), and chip balance updates after repair.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Streak repair works end-to-end
- [ ] #2 Data Chips are consumed correctly
- [ ] #3 E2E test: streak repair prompt appears when yesterday missed and chips > 0
- [ ] #4 E2E test: repair button consumes a chip and updates streak
- [ ] #5 E2E test: prompt does not appear when yesterday was played
- [ ] #6 E2E test: repair button is disabled when chips = 0
- [ ] #7 Tests run in CI (make test or equivalent)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Archived pre-MVP (2026-04-09). Streak repair UI simplified to static banner for MVP — full E2E tests deferred. Restore to todo on 2026-04-13.
<!-- SECTION:NOTES:END -->

