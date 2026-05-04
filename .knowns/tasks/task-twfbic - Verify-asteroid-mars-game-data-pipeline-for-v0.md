---
id: twfbic
title: Verify asteroid + mars game data pipeline for v0
status: done
priority: high
labels:
  - v0
  - science-data
  - asteroid
  - mars
  - blocking
createdAt: '2026-05-02T10:10:57.293Z'
updatedAt: '2026-05-02T11:53:01.729Z'
timeSpent: 0
---
# Verify asteroid + mars game data pipeline for v0

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The 4 Zooniverse science feed cache tables are defined in science-feeds.ts but all intake tasks (2o7kbq, 45ao85, 4l7rce, np5izl) were planning-only. The asteroid and mars game pages are in the mission rotation. Confirm what data these games are actually serving today — real data, synthetic stubs, or empty? If empty, this is a v0 blocker.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Asteroid game: uses ASTEROID_ANOMALIES from secondary-game.ts — 3 hardcoded stub entries with SVG placeholder images (puzzle-1/2/3.svg) and fake TESS TIC IDs. Not serving Zooniverse or real imagery. Mars game: fetches from /api/mars/daily which uses mars-images.ts — this appears to serve real imagery. Need to verify /api/mars/daily and /api/asteroid/submit are actually functional and check what images exist under /public/puzzles/.

Mars: solid — fetches live from NASA Image Library API (no key), 15-image fallback set of real Curiosity/Perseverance photos. Asteroid: was 3 SVG placeholders with fake TESS TIC IDs. Fixed: replaced with 6 real NASA asteroid images (Bennu×2, Eros, Vesta, Ida, Gaspra) from images-assets.nasa.gov (already in remotePatterns). Renamed ticId→catalogId in AsteroidAnomaly type, updated UI labels. tsc clean.
<!-- SECTION:NOTES:END -->

