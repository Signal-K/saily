---
id: 2sccp0
title: 'Game 3: Mars surface classification'
status: todo
priority: high
labels:
  - minigame
  - mars
  - nasa
  - classification
createdAt: '2026-03-07T09:40:58.384Z'
updatedAt: '2026-03-07T09:40:58.384Z'
timeSpent: 0
---
# Game 3: Mars surface classification

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build the third citizen science minigame. Users classify Mars rover photos (Curiosity/Perseverance) by terrain type. Use NASA Mars Rover Photos API with DEMO_KEY placeholder for dev; hardcode 15 reference images as fallback. Classification categories: Rock field, Sand/dust, Crater, Equipment/rover, Sky/horizon. Narrative framing: scouting the landing zone on the target planet.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 15 reference Mars rover images hardcoded as static fallback (public domain NASA images)
- [ ] #2 NASA API integration with NASA_MARS_API_KEY env var, falls back to static set if unset
- [ ] #3 Daily image selection seeded by date (consistent for all users)
- [ ] #4 Classification UI: show image, 5-button category picker, confidence slider, submit
- [ ] #5 Score recorded and integrated with mission flow
<!-- AC:END -->

