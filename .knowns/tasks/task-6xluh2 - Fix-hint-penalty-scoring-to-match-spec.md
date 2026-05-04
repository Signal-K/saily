---
id: 6xluh2
title: Fix hint penalty scoring to match spec
status: done
priority: high
labels:
  - scoring
  - v0
  - game
  - spec
createdAt: '2026-05-02T10:10:50.016Z'
updatedAt: '2026-05-02T10:30:46.700Z'
timeSpent: 0
---
# Fix hint penalty scoring to match spec

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Spec defines: no-hint = 1.25x multiplier, any-hint = 0.75x multiplier, streak = +10 XP/day. Current code in today-game-page.tsx:313 applies 0.8x for phaseFold and 0.85x for bin separately (0.68x combined), with no 1.25x no-hint bonus. The base score and streak bonus wiring also needs audit against the spec values.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Fixed. Three changes: (1) today-game-page.tsx no longer calls /api/game/complete when embedded in mission flow — passes hintUsed up to parent instead, eliminating double-call that was overwriting score with a lower value. (2) mission-flow-page.tsx forwards hintUsed to /api/game/complete. (3) /api/game/complete rewritten to spec: base 100, ×1.25 no-hint, ×0.75 hint-used, +10 XP/day streak bonus. terminatedEarly path records score 0. tsc clean.
<!-- SECTION:NOTES:END -->

