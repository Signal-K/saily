---
id: 34zaey
title: Add unit tests for storyline narrative integrity
status: done
priority: medium
labels:
  - functionality
createdAt: '2026-04-08T04:36:53.302Z'
updatedAt: '2026-04-08T11:00:03.306Z'
timeSpent: 0
---
# Add unit tests for storyline narrative integrity

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add unit tests for web/src/lib/storylines.ts and web/src/lib/mission.ts. The storylines file exports 4 storylines × 5 chapters each. Tests should verify: all chapters have required fields (briefing, beat1, beat2, resolution), no empty strings, rotation logic (getStorylineForDate) returns correct storyline by day index, getChapterForIndex clamps correctly. Existing test setup is in web/src/lib/__tests__/ (see mission.test.ts for pattern).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All storylines pass integrity checks
- [x] #2 Branching logic is fully tested
- [x] #3 All 4 storylines × 5 chapters pass a completeness check (no empty required fields)
- [x] #4 getStorylineForDate returns correct storyline for known dates
- [ ] #5 getChapterForIndex clamps to 0–4 correctly
- [ ] #6 Tests run with existing test runner (check package.json for test script)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added web/src/lib/__tests__/storylines.test.ts — 12 tests covering data integrity, getStorylineForDate rotation, getChapterForIndex clamping, isStorylineComplete. All pass.
<!-- SECTION:NOTES:END -->

