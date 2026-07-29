---
slug: close-approach-ranker-field-guide
title: A Field Guide to Close Approach Ranker
status: published
summary: Close Approach Ranker asks readers to order real near-Earth flybys by distance, using cached NASA/JPL data instead of live gameplay calls.
tags: saily, close-approach-ranker, science
sources: https://ssd-api.jpl.nasa.gov/doc/cad.html, /games/close-approaches
citizenScienceLinks: /games/close-approaches
publishedAt: 2026-07-19T12:05:00.000Z
updatedAt: 2026-07-19T12:05:00.000Z
---

Close Approach Ranker is a small newspaper-style science puzzle: take a handful of near-Earth flybys and rank them from closest to farthest.

The important part is that "close" is still astronomical. A flyby can be close enough to compare in lunar distances and still be far beyond anything a person would experience as nearby. The puzzle is meant to teach scale, not fear.

The Sprint 10 version uses cached rows from the NASA/JPL SBDB Close-Approach Data API. Gameplay reads from Saily's cache only. The ingest path may call the source API, but the player route should not depend on a live network request to JPL.

When a round is available, each card shows:

- designation or display name
- close approach time
- nominal distance in astronomical units and lunar distances
- relative velocity
- optional size context when the source provides it

The answer is not hidden trivia. The measurements are visible because the challenge is reading and ordering real scientific fields. The solved order and score stay server-side until the reader locks a ranking.

For Liam's Sprint 10 plan, this makes Close Approach Ranker a good test case: it is real-data, lightweight, and easy to verify before it becomes part of the daily mission rotation.
