---
id: z1t2nl
title: Set up secondary game system
status: done
priority: medium
labels:
  - minigame
  - chapters
  - asteroids
  - dmp
  - anomalies
createdAt: '2026-02-18T22:24:48.000Z'
updatedAt: '2026-03-06T08:43:17.460Z'
timeSpent: 0
assignee: '@me'
---
# Set up secondary game system

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Begin the process of setting up the second puzzle. Find asteroid anomalies, and the images, and set up an infrastructure to display them and something for the user to annotate
<!-- SECTION:DESCRIPTION:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Review current game architecture and define extension points for secondary puzzle.
2. Add initial data model/types for asteroid anomalies and image payload.
3. Scaffold UI route/component to render anomaly image and annotation stub.
4. Wire placeholder save flow for user annotations and document next increments.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Started: took ownership and drafted setup plan for secondary game system

Done: scaffolded /games/asteroids with anomaly image display, click-to-annotate markers, and local draft persistence

Done: added server-backed asteroid annotation drafts (Supabase table + /api/asteroid/annotations GET/POST) and wired /games/asteroids to load/save drafts

Complete: secondary asteroid lab route scaffolded with server-backed draft persistence and annotation UI.
<!-- SECTION:NOTES:END -->

