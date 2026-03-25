---
title: Importable science feeds
createdAt: '2026-03-25T09:57:59.501Z'
updatedAt: '2026-03-25T10:02:30.456Z'
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
1. **TESScut + MAST APIs** for the next serious puzzle expansion.
2. **NASA Exoplanet Archive TAP/API** as the metadata/control plane for candidate selection.
3. **NASA PDS Search API** for planetary image-based puzzles beyond the current Mars implementation.
4. **InSight Weather API** for a lightweight time-series anomaly puzzle if we want a non-image science mode.
5. **Zooniverse / Panoptes** as a workflow and export model, not as the primary live data source.

## Candidate sources

### 1. TESScut (MAST / STScI)
- **Official docs:** https://mast.stsci.edu/tesscut/docs/
- **What it gives us:** programmatic cutouts from TESS full-frame images, sector lookup by coordinates, and target-pixel cutout generation.
- **Why it fits Saily:** strongest match for the existing transit-detection fantasy. We can keep the current lightcurve puzzle but move toward real target-pixel / sector-driven daily selections.
- **Implementation notes:** combine sector lookup with cached cutout generation and an offline preprocessing step that converts cutouts to simplified lightcurves for gameplay.
- **Constraints:** the docs note a limit of **5 requests/sec** and that TICA cutouts were discontinued in August 2025, so we should build around SPOC products and cache aggressively.
- **Puzzle ideas:** transit dip ranking, "is this repeatable?", sector-to-sector comparison, moving-target exclusion.

### 2. MAST core API
- **Official docs:** https://mast.stsci.edu/api/v0/
- **What it gives us:** generic programmatic querying of MAST holdings, including CAOM-style searches and data discovery across missions.
- **Why it fits Saily:** useful as the general discovery layer around TESS, Hubble, JWST, GALEX, etc. This is the best route if we want to branch into image classification, variability triage, or archive-driven daily curation.
- **Implementation notes:** use MAST to search and prefetch candidate observations, then materialize a Saily-specific daily cache table so gameplay is not live-query dependent.
- **Constraints:** large queries can fail around **~500k rows**, per the docs, so we should constrain and page searches.
- **Puzzle ideas:** morphology triage, anomaly spotting in image stamps, image pair comparison, variable-object curation.

### 3. NASA Exoplanet Archive TAP/API
- **Official docs:** https://exoplanetarchive.ipac.caltech.edu/docs/program_interfaces.html
- **Useful examples:** https://exoplanetarchive.ipac.caltech.edu/docs/API_queries.html
- **What it gives us:** candidate tables, confirmed-planet tables, KOI/TCE style metadata, mission star lists, and TAP-based querying.
- **Why it fits Saily:** ideal control-plane source for selecting which stars/candidates to feature, attaching scientific context, and building chapter-specific puzzle pools.
- **Implementation notes:** use TAP/API to fetch candidate metadata, dispositions, periods, radii, sectors, and labels, then join those against MAST/TESScut retrieval for the actual playable artifact.
- **Constraints:** the docs explicitly say the archive is transitioning toward **TAP** and that most programmatic access should prefer TAP over older query examples.
- **Puzzle ideas:** "candidate triage" cards, habitability shortlists, confidence-ranking, mission briefings seeded from real system metadata.

### 4. NASA PDS Search API / PDS Data Search
- **Official entry points:** https://pds.nasa.gov/datasearch/keyword-search/ and https://pds.nasa.gov/datasearch/data-search/
- **Protocol PDF:** https://pds.nasa.gov/services/pds4_pds_search_protocol.pdf
- **What it gives us:** programmatic discovery of PDS4 planetary data products across imaging, atmospheres, rings, and small bodies.
- **Why it fits Saily:** strongest route for expanding beyond current Mars tagging into lunar, asteroid, comet, and outer-planet imaging without inventing fake science.
- **Implementation notes:** start with one narrow slice (for example, Mars or small-body imaging), ingest product metadata + browse URLs into a curated puzzle pool, and avoid runtime search in the player path.
- **Constraints:** broad search surface and heterogeneous metadata. Needs curation and normalization before it becomes game-ready.
- **Puzzle ideas:** crater/deposit tagging, dune-vs-rock discrimination, plume/jet spotting, icy patch detection, ring-structure anomaly calls.

### 5. InSight Mars Weather API
- **Official docs:** https://api.nasa.gov/assets/insight/InSight%20Weather%20API%20Documentation.pdf
- **Auth/rate-limit docs:** https://api.nasa.gov/assets/html/authentication.html
- **What it gives us:** per-Sol summary weather data for temperature, pressure, wind, and seasonal context.
- **Why it fits Saily:** lets us add a lightweight "detect the weather anomaly" or "find the outlier Sol" puzzle that still feels like field science.
- **Implementation notes:** ingest and cache batches of Sol summaries, render compact sparklines/mini dashboards, and ask the user to identify unusual pressure drops, wind changes, or missing-sensor days.
- **Constraints:** only the last several available Sols are exposed, values can be recalculated later, and there are known sensor gaps. Better for a supplemental mode than a deep evergreen archive.
- **Puzzle ideas:** anomaly detection, forecast/retrospective matching, pressure-drop identification, sensor-health triage.

### 6. Zooniverse / Panoptes platform
- **Developer docs:** https://developer.zooniverse.org/
- **Platform overview:** https://developer.zooniverse.org/en/latest/apis/platform.html
- **Classification exports:** https://developer.zooniverse.org/en/latest/science/classifications_exports.html
- **What it gives us:** a proven citizen-science workflow model for subjects, subject sets, workflows, classifications, and downstream aggregation.
- **Why it fits Saily:** best reference for **how** to structure classification collection and aggregation, even if we do not use Zooniverse as the live player-facing backend.
- **Implementation notes:** borrow their concepts for subject retirement, export shape, and aggregation thresholds. If we ever partner with an existing Zooniverse project, Panoptes also gives us a practical integration vocabulary.
- **Constraints:** not the best fit as a live puzzle-content API for Saily. Better as a workflow model and possible ingest/export bridge.
- **Puzzle ideas:** internal moderation + aggregation pipeline, consensus thresholds, subject retirement logic, expert review queue.

## What I would build next

### Best near-term path
- Use **Exoplanet Archive** to choose targets/candidates.
- Use **MAST + TESScut** to fetch the actual TESS products.
- Precompute simplified gameplay payloads into Supabase so the app serves stable daily missions without live dependency risk.

### Best planetary path
- Use **PDS Search API** to curate one narrow planetary collection.
- Continue the current point-tagging interaction but with better provenance and a larger catalog.

### Lowest-risk new puzzle type
- Build a compact **InSight weather anomaly** mode.
- It is easier than a full new image pipeline and still feels scientific.

## Scope notes
- I would **not** rely on live third-party APIs directly in request-time gameplay. Pre-ingest and cache instead.
- I would treat **Zooniverse** as a product-design and aggregation reference, not the immediate content API.
- I would keep any new dataset tied back to the core Star Sailors framing by making each puzzle about survey support, route planning, settlement scouting, or anomaly verification.
