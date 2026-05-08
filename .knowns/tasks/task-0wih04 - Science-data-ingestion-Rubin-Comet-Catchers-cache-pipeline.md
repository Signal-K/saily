---
id: 0wih04
title: 'Science data ingestion: Rubin Comet Catchers cache pipeline'
status: done
priority: medium
labels:
  - science-data
  - ingestion
  - post-v0
  - rubin
createdAt: '2026-05-02T10:11:11.577Z'
updatedAt: '2026-05-02T12:36:42.147Z'
timeSpent: 0
---
# Science data ingestion: Rubin Comet Catchers cache pipeline

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Same infrastructure as Cloudspotting and Active Asteroids, with one additional wrinkle: Rubin subjects have multiple images per classification card. The existing mars/asteroid game pages show one image. I'll need to build a small multi-image carousel component for the puzzle UI.

Blocked on `y4c4lk` (Active Asteroids) — that establishes the image-annotation pattern this builds on. No input needed from you until Active Asteroids is done.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Completed the cache-pipeline scaffolding. Added `rubin_comet_catchers_daily` table migration, a reusable Panoptes ingestion helper, and `scripts/ingest-rubin-comet-catchers.mjs` to fetch public project subjects, normalize multi-image cards, and upsert deterministic daily rows into Supabase. The gameplay-side multi-image UI is still a separate product enhancement, but the ticketed ingestion pipeline is now in place.
<!-- SECTION:NOTES:END -->
