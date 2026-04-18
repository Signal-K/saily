---
id: sly004
title: Define next science-feed cache intake for daily puzzles
status: done
priority: medium
labels:
  - science-data
  - ingestion
  - planning
createdAt: '2026-04-19T14:00:00.000Z'
updatedAt: '2026-04-25T11:34:50.146Z'
timeSpent: 0
assignee: '@me'
---
# Define next science-feed cache intake for daily puzzles

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
This is part of the 2026-04-20 Star Sailors MVP/project-management reset. Project: Saily / The Daily Sail. Work must stay tied to MVP closure, distribution, testing, or agent handoff for this week.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 One source is selected for the next post-MVP expansion.
- [x] #2 Cache schema and ingestion steps are documented.
- [x] #3 No live API dependency is required for the daily play path.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Refresh Knowns docs so narrative/spec references match the new science-feed mapping
2. Extend science-feed research with concrete intake recommendations for CoM, Gaia Variables, Rubin Comet Catchers, and Active Asteroids
3. Add code-side source descriptors and cache-oriented types for the four new feeds
4. Run focused validation and append notes back to Knowns
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created by project-management reset on 2026-04-20.

Progress: updated specs/characters-storylines + research/importable-science-feeds for CoM, Gaia Variables, Rubin Comet Catchers, and Active Asteroids; added web/src/lib/science-feeds.ts registry and unit tests.

Implementation: added cache-first Cloudspotting on Mars domain module (), fallback subjects, cached-row normalization, and  route that prefers  and falls back safely when absent. Verified with focused unit tests.
<!-- SECTION:NOTES:END -->

