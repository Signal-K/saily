---
id: miadz1
title: Enhance 'tour' script for automated validation
status: blocked
priority: medium
labels:
  - functionality
createdAt: '2026-04-08T04:36:54.480Z'
updatedAt: '2026-04-09T03:31:22.627Z'
timeSpent: 0
---
# Enhance 'tour' script for automated validation

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The 'tour' script (check scripts/ or Makefile for 'tour' target) runs a headless walkthrough of the app. Enhance it to also validate: (1) all 4 storylines have 5 chapters with non-empty briefing/beat1/beat2/resolution, (2) all character avatarSeeds resolve to a valid DiceBear URL, (3) the daily anomaly API returns a valid response. Add a make target or CI step that runs this on PRs. See Makefile and .github/ for existing CI config.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tour script detects broken narrative paths
- [ ] #2 Integrated into CI/CD
- [ ] #3 Tour script validates storyline completeness (all required fields non-empty)
- [ ] #4 Tour script validates avatar seeds produce valid URLs
- [ ] #5 Tour script exits non-zero on validation failure
- [ ] #6 CI runs the validation step on PRs
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Archived pre-MVP (2026-04-09). Tour run manually for MVP. Restore to todo on 2026-04-13.
<!-- SECTION:NOTES:END -->

