---
id: v00q8u
title: Fix archive date handling and discussion gating
status: done
priority: high
labels:
  - archive
  - dates
  - forum
  - gameplay
createdAt: '2026-03-25T09:20:30.511Z'
updatedAt: '2026-03-25T10:05:21.338Z'
timeSpent: 0
assignee: '@me'
---
# Fix archive date handling and discussion gating

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Correct Melbourne-midnight date handling, separate archive play from live mission progression, and gate discuss access by completion/unlock. Related: @doc/specs/saily-product-spec @doc/specs/saily-system-spec
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Historical puzzle selection uses Melbourne-date semantics consistently
- [x] #2 Archive play requires unlock for past days and does not advance live storyline progress
- [x] #3 Discussion threads are locked until the user completed or unlocked that day
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Unify game/forum/archive date utilities around Melbourne midnight and audit current callers.
2. Add archive access checks so past-day mission entry requires unlock or existing completion.
3. Prevent archive runs from mutating live storyline progression or daily scoring.
4. Gate forum thread visibility/posting by completed-or-unlocked access for the selected day.
5. Validate with targeted tests/build and append implementation notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Done: added shared Melbourne date utility; archive access gating in mission + forum APIs; archive runs no longer award score/streak or advance storyline; selected mission date now flows into all 3 puzzle surfaces; added archive unlock trigger survey.
<!-- SECTION:NOTES:END -->

