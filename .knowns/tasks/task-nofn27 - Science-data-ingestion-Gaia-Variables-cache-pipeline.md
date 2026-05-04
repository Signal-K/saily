---
id: nofn27
title: 'Science data ingestion: Gaia Variables cache pipeline'
status: todo
priority: medium
labels:
  - science-data
  - ingestion
  - post-v0
  - gaia
createdAt: '2026-05-02T10:11:14.720Z'
updatedAt: '2026-05-02T12:36:46.162Z'
timeSpent: 0
---
# Science data ingestion: Gaia Variables cache pipeline

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Gaia Variables uses time-series data (light curves), not images. The existing planet-game-page lightcurve UI is the right template, but Gaia sources come from the Gaia archive, not Zooniverse subjects — the ingestion path is different.

What I need from you: confirm the Gaia data source. Options:
**A)** Gaia DR3 variability catalogue via ESA TAP service (public, no key) — I query and cache compact series payloads.
**B)** A Zooniverse Gaia Variables project export if one exists.

Just use the zooniverse panoptes api to get the data and anomalies/images, identify the format for classification/what users would be doing, and go from there

This is last in priority order per the research doc. No urgency until the image-feed pipelines are done.
<!-- SECTION:DESCRIPTION:END -->

