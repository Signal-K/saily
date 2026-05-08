---
id: y4c4lk
title: 'Science data ingestion: Active Asteroids cache pipeline'
status: done
priority: medium
labels:
  - science-data
  - ingestion
  - post-v0
  - active-asteroids
createdAt: '2026-05-02T10:11:10.168Z'
updatedAt: '2026-05-02T12:36:39.684Z'
timeSpent: 0
---
# Science data ingestion: Active Asteroids cache pipeline

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Same infrastructure as Cloudspotting on Mars — public Zooniverse API, same cache table pattern. No credentials needed.

Blocked on `dmukp0` (Cloudspotting) completing first — that establishes the ingestion pattern and script template this one will reuse. No input needed from you until Cloudspotting is done.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Completed after the Cloudspotting scaffold landed. Added `active_asteroids_daily` cache-table migration support and `scripts/ingest-active-asteroids.mjs`, which reuses the Panoptes helper layer, normalizes image/candidate/epoch/source-collection fields, and upserts deterministic daily rows into Supabase.
<!-- SECTION:NOTES:END -->
