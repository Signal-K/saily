---
id: 0155ks
title: Fix failing tests (18/2/26)
status: done
priority: medium
labels:
  - tests
createdAt: '2026-02-18T22:23:19.000Z'
updatedAt: '2026-02-18T14:25:49.231Z'
timeSpent: 0
assignee: '@me'
---
# Fix failing tests (18/2/26)

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
<!-- SECTION:DESCRIPTION:BEGIN -->
<!-- SECTION:DESCRIPTION:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Update Cypress smoke test to assert stable hero heading content introduced by the recent UI copy update.
2. Update game-flow return-home assertion to match current homepage heading variants.
3. Run targeted Cypress specs (smoke + game-flow) and lint/build sanity checks to verify no regression.
4. Append task notes with root cause/fix and keep selectors resilient to future copy churn.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Root cause: Cypress specs asserted old home hero copy after responsive/text updates. Fix: updated smoke + game-flow heading assertions to current copy variants. Verified npm run lint + npm run build locally; Cypress binary failed to start in this env (SIGABRT), so CI run is required for E2E confirmation.
<!-- SECTION:NOTES:END -->

