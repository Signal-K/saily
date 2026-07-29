---
id: fnjlra
title: Refine podcast editorial layout for The Daily Transit
status: done
priority: medium
labels:
  - normal
  - frontend
  - layout
  - podcast
createdAt: '2026-07-29T20:57:03.348Z'
updatedAt: '2026-07-29T21:05:17.508Z'
timeSpent: 482
assignee: '@me'
---
# Refine podcast editorial layout for The Daily Transit

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Follow up @task-56di2r with a layout-only refinement. Preserve all current branding, colours, typography, copy, URLs, and CMS behavior while giving the episode index and transcript page a stronger newspaper-style editorial hierarchy centered on listening.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The episode index gives the latest episode clear lead-story prominence and separates recent transcripts into a readable secondary hierarchy
- [x] #2 Episode detail pages prioritize the audio player and transcript in a wider editorial layout with useful side rails
- [x] #3 Existing branding, colours, typography, copy, URLs, and CMS behavior remain unchanged
- [x] #4 The revised layouts collapse cleanly for tablet and mobile widths
- [x] #5 Lint, unit tests, and production build pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Restructure `web/src/app/articles/page.tsx` into a wider editorial front: the newest episode becomes the lead package, the next entries form a compact transcript rail, and remaining episodes retain the existing card content below. No branding, colour, URL, metadata, or editorial-copy changes.
2. Restructure `web/src/app/articles/[slug]/page.tsx` so the episode header and optional player span the page, the transcript remains the central reading column, and the existing involvement/Atlas actions sit in restrained side rails.
3. Add responsive layout classes to `web/src/app/globals.css`, using only existing font and colour variables; collapse all grids to a single reading column at tablet/mobile widths.
4. Run `git diff --check`, lint, the unit suite, and the production build; record the unavailable browser backend if visual QA remains inaccessible.

Follow-up to @task-56di2r. This is layout-only: no content-model, route, branding, colour, or typography changes.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Done: lead-episode front with transcript rail, wider episode header/player, central transcript with metadata/action side rails, and single-column responsive collapse. Preserved existing branding, colours, typography, copy, routes, and CMS behavior. Verification: git diff --check; npm run lint; npm run test:unit (53/53); npm run build. Visual browser QA unavailable because no browser backend is connected.
<!-- SECTION:NOTES:END -->

