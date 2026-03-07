---
id: d3iadl
title: Upgrade asteroid lab to daily scored game
status: done
priority: high
labels:
  - minigame
  - asteroids
  - scoring
createdAt: '2026-03-07T09:40:43.548Z'
updatedAt: '2026-03-07T10:02:09.243Z'
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added submitted_at migration. New /api/asteroid/submit route (score=40+annotations*8). Asteroid page now shows daily-seeded single target, Submit Survey button, score on completion. Removed 'Secondary Puzzle Preview' label.
<!-- SECTION:NOTES:END -->

