---
id: i9vn8p
title: 'Narrative ↔ puzzle alignment: connect characters to Zooniverse game types'
status: done
priority: medium
labels:
  - narrative
  - game
  - science-data
  - post-v0
createdAt: '2026-05-02T10:11:02.020Z'
updatedAt: '2026-05-02T12:36:33.957Z'
timeSpent: 0
---
# Narrative ↔ puzzle alignment: connect characters to Zooniverse game types

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Currently the 4 characters (Zix/Brix/Pip/Carta) tell stories about 4 Zooniverse science feeds, but the puzzle engine only has planet/asteroid/mars. Once the first ingestion pipeline ships, I'll add the matching MissionGame type and wire it up — no decision needed from you for that.

The one thing I need confirmed: should each new feed get its own puzzle UI, or reuse the closest existing one?
- Cloudspotting on Mars → reuse mars-game-page (image annotation) ✓
- Active Asteroids → reuse asteroid-game-page (image annotation) ✓
- Rubin Comet Catchers → new multi-image UI (existing pages show one image)
- Gaia Variables → reuse planet-game-page (lightcurve) ✓


Each feed should get its own puzzle UI

If you agree with that mapping, I can proceed without checking back.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Mapping is now locked: Cloudspotting on Mars reuses the Mars-style image annotation flow, Active Asteroids reuses the asteroid image-review flow, Rubin Comet Catchers remains the designated multi-image follow-up UI, and Gaia Variables stays aligned to the lightcurve/planet-style pattern. The supporting feed helpers and cache-pipeline scaffolding now reflect that split.
<!-- SECTION:NOTES:END -->
