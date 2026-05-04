---
id: ej7sdg
title: 'Audit word-scramble code: still live or legacy?'
status: done
priority: medium
labels:
  - cleanup
  - v0
  - game
createdAt: '2026-05-02T10:10:46.825Z'
updatedAt: '2026-05-02T10:24:12.288Z'
timeSpent: 0
---
# Audit word-scramble code: still live or legacy?

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
game.ts contains a full word-scramble mechanic (WORD_BANK, getDailyWord, getPuzzleForDate, scoreGuess, normalizeGuess) that api/game/submit and api/game/today import. The lightcurve mission uses a separate anomaly flow. Determine whether this word game is still reachable from the UI or is dead code, and either wire it back in intentionally or remove it.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Confirmed dead. app/games/today now renders MissionFlowPage (lightcurve), not the word game. Removed: WORD_BANK, DailyPuzzle, getDailyWord, getPuzzleForDate, scoreGuess, normalizeGuess, seededShuffle, hashString from game.ts. Deleted api/game/submit/route.ts entirely (nothing called it). Removed puzzle field + getPuzzleForDate import from api/game/today/route.ts. tsc clean.
<!-- SECTION:NOTES:END -->

