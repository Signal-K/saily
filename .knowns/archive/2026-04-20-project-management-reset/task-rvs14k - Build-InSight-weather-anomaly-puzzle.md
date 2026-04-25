---
id: rvs14k
title: Build InSight weather anomaly puzzle
status: done
priority: high
labels:
  - insight
  - weather
  - puzzle
  - nasa
createdAt: '2026-03-25T20:26:56.010Z'
updatedAt: '2026-03-25T20:34:34.984Z'
timeSpent: 0
assignee: '@me'
---
# Build InSight weather anomaly puzzle

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add an InSight-based weather anomaly game using NASA's official Mars weather feed with cached fallback data, mobile-first UI, and analytics. Tie it into Saily's science-survey framing and document the data source in Knowns. Related: @doc/specs/saily-product-spec @doc/specs/saily-system-spec @doc/research/importable-science-feeds
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Daily InSight puzzle fetches official weather data or falls back to a committed dataset
- [x] #2 Players can inspect recent Sol readings and identify an anomalous Sol with score submission
- [x] #3 The new puzzle is linked from the hub and documented in Knowns
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add a small InSight data layer with official-feed fetch + committed fallback payloads seeded by date.
2. Build a mobile-first weather anomaly puzzle route/API using the existing puzzle shell style.
3. Link the new game from the home hub and wire analytics/surveys.
4. Add Knowns docs for the source/integration details and validate with lint/build.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Done: added InSight weather data layer + committed fallback Sol dataset, built /api/insight/daily and /api/insight/submit, added standalone /games/insight weather anomaly puzzle, linked it from the home hub, added PostHog survey support for insight_weather, and documented the feature in @doc/guides/insight-weather-desk.
<!-- SECTION:NOTES:END -->

