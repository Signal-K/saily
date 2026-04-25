---
title: Importable science feeds
createdAt: '2026-03-25T09:57:59.501Z'
updatedAt: '2026-04-25T00:44:56.153Z'
description: >-
  Current-source evaluation of official datasets/APIs for new Saily puzzle
  imports
tags:
  - research
  - api
  - data
  - astronomy
  - docid-bde859
---
# Importable Science Feeds

## Recommendation order
1. **Cloudspotting on Mars** as the first post-MVP expansion: strong fit with existing Mars surface familiarity, high scientific value, and straightforward cached daily subject intake.
2. **Active Asteroids** as the best small-body image-review path: close to the existing asteroid/anomaly interaction model.
3. **Rubin Comet Catchers** as the best comet-tail/coma activity path once small-body cache plumbing exists.
4. **Gaia Variables** as the best non-image classification path once we are ready to support time-series variability cards.
5. **Zooniverse / Panoptes** remains the workflow and export model, not the request-time gameplay backend.

## Candidate sources

### 1. Cloudspotting on Mars (Zooniverse)
- **Project:** https://www.zooniverse.org/projects/marek-slipski/cloudspotting-on-mars
- **What it gives us:** Mars cloud-shape classifications around real mesospheric cloud imagery and associated atmospheric context.
- **Why it fits Saily:** strongest immediate replacement/extension for the Mars research fantasy with clearer science value than generic surface tagging.
- **Cache shape:** `cloudspotting_mars_daily` table with `game_date`, `subject_id`, `project_slug`, `image_url`, `crop_url`, `caption`, `season_or_context`, `workflow_version`, `source_metadata`.
- **Daily play path:** serve one preselected cached subject per day. Do not fetch Zooniverse at request time.
- **Ingestion notes:** ingest subject metadata and curated image URLs in batches, normalize to a compact image+label prompt payload, and snapshot provenance into JSON.

### 2. Active Asteroids (Zooniverse)
- **Project:** https://www.zooniverse.org/projects/orionnau/active-asteroids
- **What it gives us:** candidate small-body image stamps where players judge whether activity is present.
- **Why it fits Saily:** closest match to the current asteroid review interaction; easiest conceptual bridge from today's asteroid game into a real science-backed queue.
- **Cache shape:** `active_asteroids_daily` table with `game_date`, `subject_id`, `image_url`, `candidate_id`, `epoch_label`, `source_collection`, `prompt`, `source_metadata`.
- **Daily play path:** select one cached candidate per day, with local scoring/consensus mechanics layered on top.
- **Ingestion notes:** keep multiple subject epochs where available; preserve enough metadata to support future expert-review exports.

### 3. Rubin Comet Catchers (Zooniverse)
- **Project:** https://www.zooniverse.org/projects/orionnau/rubin-comet-catchers
- **What it gives us:** Rubin small-body imagery focused on comet-like activity such as tails and comae.
- **Why it fits Saily:** strong fit for a premium small-body classification mode after Active Asteroids establishes the cache/import pattern.
- **Cache shape:** `rubin_comet_catchers_daily` table with `game_date`, `subject_id`, `image_urls`, `object_label`, `known_training_flag`, `activity_prompt`, `source_metadata`.
- **Daily play path:** serve pre-ingested candidate frames and keep any training/known-object flags out of the player-visible payload.
- **Ingestion notes:** normalize multi-image subjects into one stable card payload; retain provenance for later replay/export.

### 4. Gaia Variables (project-aligned variability intake)
- **Reference project:** Zooniverse `Gaia Vari` / Gaia-style variability classification workflows.
- **What it gives us:** variable-object light-curve triage and classification opportunities outside the transit-only TESS path.
- **Why it fits Saily:** best next non-image science mode after TESS; scientifically richer than route-clearance style weather scoring.
- **Cache shape:** `gaia_variables_daily` table with `game_date`, `source_id`, `series_payload`, `class_hints`, `cadence_summary`, `provenance_url`, `source_metadata`.
- **Daily play path:** serve compact precomputed variability cards with no dependency on live archive/API availability.
- **Ingestion notes:** precompute simplified time-series payloads suitable for the UI; avoid shipping raw archive complexity to the client.

### 5. Zooniverse / Panoptes platform
- **Developer docs:** https://developer.zooniverse.org/
- **API reference:** https://zooniverse.github.io/panoptes/
- **What it gives us:** project/workflow/subject vocabulary, subject-set structure, and export/aggregation concepts.
- **Why it fits Saily:** use it as the model for cached subject intake, moderation, export shape, and future consensus thresholds.
- **Constraint:** classification retrieval is not a dependable public runtime source for our needs; treat Panoptes as metadata/workflow inspiration unless a partner export is available.

## What I would build next

### Best near-term path
- Start with **Cloudspotting on Mars**.
- Build a daily cache table, one ingestion script, and one normalized image-card payload.
- Use that import pattern as the template for **Active Asteroids** and **Rubin Comet Catchers**.

### Best small-body path
- After CoM, implement **Active Asteroids** first.
- Reuse the same cache + image-card pipeline.
- Add **Rubin Comet Catchers** once multi-image subject normalization is ready.

### Best non-image path
- Add **Gaia Variables** only after the app has a stable cache/intake layer for precomputed puzzle payloads.
- Keep the first Gaia integration small: one compact variability classification card per day.

## Scope notes
- Do **not** rely on live third-party APIs directly in request-time gameplay.
- Prefer one cache table per source at intake time, then converge later on a shared internal mission-payload shape if needed.
- Treat Zooniverse as a source of public project/subject metadata and a workflow model, not as the request-time puzzle API.
- Keep each imported source tied to a clear scientific question so narrative, UI, and eventual export all stay coherent.
