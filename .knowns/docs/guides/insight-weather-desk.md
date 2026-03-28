---
title: InSight weather desk
createdAt: '2026-03-25T20:33:33.727Z'
updatedAt: '2026-03-25T20:34:02.389Z'
description: Implementation notes for the InSight-based anomaly puzzle in Saily
tags:
  - insight
  - nasa
  - weather
  - puzzle
  - docid-8d7d41
---
# InSight Weather Desk

## Overview
The InSight Weather Desk adds a compact science puzzle built from NASA's official InSight Mars weather feed. The player reviews a small set of recent Sol readings and selects the Sol that looks most anomalous for a daily-selected metric.

## Source
- Live source: NASA InSight Weather API (`https://api.nasa.gov/insight_weather/?api_key=...&feedtype=json&ver=1.0`)
- Auth: `NASA_API_KEY`, defaulting to `DEMO_KEY` for local/dev fallback
- Fallback: committed Sol summaries in `web/src/lib/insight.ts`

## Current product shape
- Route: `/games/insight`
- Data API: `/api/insight/daily`
- Scoring API: `/api/insight/submit`
- Home hub links to the Weather Desk from both the console quick-links and the game-card row.

This is currently a standalone puzzle surface, not part of the 3-step `/games/today` storyline mission flow.

## Puzzle mechanic
1. Resolve the requested game date using the shared Melbourne-midnight date utility.
2. Fetch live InSight Sol summaries; if unavailable or too small, use the committed fallback set.
3. Seed a 5-Sol window and one target metric (`pressure`, `temperature`, or `wind`) by date.
4. Ask the player which Sol is most anomalous relative to the median reading in that window.
5. Score server-side by recomputing the answer for the selected date.

## Archive behavior
The Weather Desk uses the same day-access guard as the rest of the project.
- Today: open access.
- Past day: requires completion or archive unlock.
- Archive runs: allowed after unlock, but designed as review mode rather than core streak progression.

## Analytics
The puzzle emits:
- survey trigger source: `insight_weather`
- gameplay event: `insight_weather_completed`

If a live PostHog survey is created for the source, it can be mounted with `NEXT_PUBLIC_POSTHOG_SURVEY_INSIGHT_ID`.

## Follow-up ideas
- Fold InSight into the main mission rotation after adding narrative beats for a 4-step flow.
- Persist Weather Desk outcomes if we want profile history or science exports.
- Add a richer chart/sparkline view once the basic anomaly-pick interaction proves fun.
