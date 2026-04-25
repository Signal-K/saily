---
id: k7w1he
title: Ecosystem v0 release readiness for Saily
status: done
priority: high
labels:
  - release
  - v0
  - build
  - tests
  - analytics
createdAt: '2026-03-06T00:00:00.000Z'
updatedAt: '2026-03-06T08:44:32.784Z'
timeSpent: 451
assignee: '@me'
---
# Ecosystem v0 release readiness for Saily

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Define and ship a constrained v0 slice for Saily with passing release checks, analytics/feedback wiring, and an explicit launch timeline for early external feedback.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Audit current release blockers (tests/build/env) and confirm minimal v0 scope.
2. Fix highest-priority blocker(s) and capture exact release command sequence.
3. Verify analytics + feedback path is live in runtime.
4. Document launch checklist, rollback trigger, and first-tester script.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Started: took ownership and drafted execution plan for v0 release readiness

Done: added scripts/release/check_v0_readiness.sh to run lint/build + analytics wiring checks

Added launch runbook @doc/runbooks/saily-v0-launch-and-rollback-checklist and first tester script scripts/release/first_external_tester_script.sh

Complete: v0 readiness script, launch/rollback runbook, and first external tester script added; validation run.

Post-change verification: scripts/release/check_v0_readiness.sh re-run and passed (lint warning only, build successful).
<!-- SECTION:NOTES:END -->

