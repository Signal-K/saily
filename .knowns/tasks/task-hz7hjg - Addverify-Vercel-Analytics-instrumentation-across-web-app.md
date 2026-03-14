---
id: hz7hjg
title: Add/verify Vercel Analytics instrumentation across web app
status: in-progress
priority: high
labels:
  - analytics
  - vercel
  - web
createdAt: '2026-03-08T04:56:10.145Z'
updatedAt: '2026-03-08T05:09:23.748Z'
timeSpent: 58
assignee: '@me'
---
# Add/verify Vercel Analytics instrumentation across web app

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ensure Vercel Analytics is correctly integrated in the web app, verify event coverage for key product mechanics/minigames, and document what is captured.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Vercel Analytics runtime is present and active in app layout
- [x] #2 Key gameplay actions emit analytics events
- [x] #3 Implementation notes include tracked events and where they fire
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Verified Vercel Analytics runtime in app layout via @vercel/analytics React component. Added explicit gameplay analytics event tracking utility and instrumented key actions: planet_transit_completed, planet_no_detection_confirmed, asteroid_mapping_completed, mars_classification_completed, narrative_flow_completed. Added event properties for score/date/hint usage/annotation count/classified count/storyline/chapter where applicable.
<!-- SECTION:NOTES:END -->

