---
id: d3iadl
title: Upgrade asteroid lab to daily scored game
status: todo
priority: high
labels:
  - minigame
  - asteroids
  - scoring
createdAt: '2026-03-07T09:40:43.548Z'
updatedAt: '2026-03-07T09:40:43.548Z'
timeSpent: 0
---
# Upgrade asteroid lab to daily scored game

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Game 2 is currently a preview with no daily scoring or streaks. Seed today's asteroid anomaly selection by date (same pattern as Game 1), add a submit flow that records a score, and integrate with the daily_plays table. Remove 'Secondary Puzzle Preview' label.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Asteroid anomaly selection is deterministic by date (seeded)
- [ ] #2 Submitting annotations records a score to daily_plays
- [ ] #3 Asteroid game contributes to streak calculation
- [ ] #4 Preview label removed, game presented as a proper daily mission step
<!-- AC:END -->

