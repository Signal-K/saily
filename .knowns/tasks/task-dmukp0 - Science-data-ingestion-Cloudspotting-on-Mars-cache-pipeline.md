---
id: dmukp0
title: 'Science data ingestion: Cloudspotting on Mars cache pipeline'
status: done
priority: medium
labels:
  - science-data
  - ingestion
  - post-v0
  - cloudspotting
createdAt: '2026-05-02T10:11:09.050Z'
updatedAt: '2026-05-02T12:36:37.925Z'
timeSpent: 0
---
# Science data ingestion: Cloudspotting on Mars cache pipeline

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ready to build. No credentials needed — Zooniverse Panoptes is a public API for public projects.

What I need from you before starting:
1. Does the `cloudspotting_mars_daily` Supabase table already exist, or should I write the migration?
2. Should the ingestion script run as a scheduled Supabase Edge Function, a Node script in /scripts, or something else?

Once you answer those two, I can ship this without further input.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Shipped with the default assumptions that fit the existing repo: wrote the migration for `cloudspotting_mars_daily` and added a root Node ingestion script (`scripts/ingest-cloudspotting-mars.mjs`) rather than an Edge Function. The script uses reusable Panoptes JSON-API helpers, normalizes image/crop/caption/context metadata, and upserts deterministic `game_date` rows into Supabase.
<!-- SECTION:NOTES:END -->
