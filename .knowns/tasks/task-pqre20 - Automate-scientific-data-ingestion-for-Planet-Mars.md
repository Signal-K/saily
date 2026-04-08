---
id: pqre20
title: Automate scientific data ingestion for Planet & Mars
status: blocked
priority: high
labels:
  - functionality
createdAt: '2026-04-08T04:36:51.639Z'
updatedAt: '2026-04-09T03:31:24.898Z'
timeSpent: 0
---
# Automate scientific data ingestion for Planet & Mars

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build a Node.js script (scripts/ingest-anomalies.ts or similar) that fetches real TESS lightcurve data from the MAST/ExoFOP API and upserts into the anomalies table. A parallel script for Mars images already has a DB table (mars_images, migration 20260408151000). Both scripts should be runnable locally and via a cron/Edge Function. The anomalies table schema is in supabase/migrations/20260210151200_create_anomalies_table.sql. The anomalyConfiguration JSONB column stores lightcurve points as { lightcurve: [{x,y}] }. See web/src/lib/anomaly.ts for the shape expected by the frontend.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Supports automated ingestion from external APIs or storage
- [ ] #2 Integrates with existing seed logic
- [ ] #3 Script fetches TESS lightcurve data from MAST API and upserts into anomalies table
- [ ] #4 Script fetches Mars images from NASA Image API and upserts into mars_images table
- [ ] #5 Both scripts are idempotent (safe to re-run)
- [ ] #6 Scripts are documented with usage instructions in a README or inline comments
- [ ] #7 Existing seed logic in supabase/seed.sql is not broken
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Archived pre-MVP (2026-04-09). Manual seeding sufficient for launch. Restore to todo on 2026-04-13.
<!-- SECTION:NOTES:END -->

