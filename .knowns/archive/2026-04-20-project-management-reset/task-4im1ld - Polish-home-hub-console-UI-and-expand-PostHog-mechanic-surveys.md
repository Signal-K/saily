---
id: 4im1ld
title: Polish home hub console UI and expand PostHog mechanic surveys
status: done
priority: medium
labels:
  - home
  - ui
  - analytics
  - posthog
createdAt: '2026-03-25T09:20:30.511Z'
updatedAt: '2026-03-25T11:24:35.785Z'
timeSpent: 1200
assignee: '@me'
---
# Polish home hub console UI and expand PostHog mechanic surveys

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refresh the home page into a restrained sci-fi console hub while preserving puzzle-app clarity, and add more lightweight PostHog surveys for key product surfaces. Related: @doc/specs/saily-product-spec
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Home page gains a subtle console-style visual treatment without hurting readability
- [x] #2 Hub surfaces clearer mission/archive/community actions
- [x] #3 At least 3 additional 1-2 question PostHog surveys are defined for uncovered mechanics
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Audit the existing home hub information architecture and identify low-noise console visual affordances.
2. Implement restrained console-inspired styling and clearer hub actions without turning the app into a full game UI.
3. Audit current PostHog survey coverage and add at least three missing mechanic/surface surveys plus trigger definitions.
4. Validate visual readability and build output, then append notes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Done: refreshed home page into a restrained console-style hub with mission/status/readout panels and clearer archive/discuss/profile links. Added three new PostHog survey definitions + runtime triggers for archive unlock, discussion flow, and streak repair; updated env example and survey creation script.
<!-- SECTION:NOTES:END -->

