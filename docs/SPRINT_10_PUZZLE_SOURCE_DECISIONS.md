# Sprint 10 Puzzle Source Decisions

Status: Sprint 10 handoff for `STS-387`  
Date: 2026-07-19  

## Decision

Sprint 10 uses **Close Approach Ranker** as the next Saily puzzle-source experiment.

It is registered as a mission game but not enabled in the default daily rotation. The stable daily mission remains crossword plus transit spotter until Close Approach Ranker has production cache data and broader end-to-end coverage.

## Why This Source

Close Approach Ranker is a good Sprint 10 candidate because it is:

- small enough for a newspaper-style puzzle
- based on real source data
- playable from cached rows without a live runtime dependency
- easy to score deterministically
- easy to explain in article copy

## Source Contract

Primary source: NASA/JPL SBDB Close-Approach Data API  
Docs: https://ssd-api.jpl.nasa.gov/doc/cad.html

Implementation decisions:

- Ingest may call the JPL CAD API.
- Gameplay must read Saily cache only.
- The parser expects CAD API signature version `1.5`.
- The ingest path stores source URL, raw field list, source signature version, and ingest timestamp.
- Public daily payloads expose measurements but not `solution_rank` or solved order.
- Submission scoring happens server-side against cached ranks.

## Deferred Candidates

These remain Sprint 11+ candidates, not Sprint 10 release-floor work:

- Connections-style science groups
- APOD caption/fact puzzle
- Space Weather Decoder
- Cloudspotting on Mars
- Asteroid Activity Spotter
- Variable Star Pattern Match
- Catalog Cipher

See `docs/SPRINT_11_MINIGAME_RANKING_SYNTHESIS.md` for the current feasibility ranking.

## Remaining Risks

- No local PostHog credentials were available during Sprint 10, so puzzle-interest signal is not vote-derived yet.
- Craft searches for matching minigame vision notes returned no relevant results in this environment.
- Production still needs real `close_approach_daily` cache rows before the game should enter the default mission rotation.
- The default daily mission should stay conservative until the cache path, schema, UI, submit route, and Cypress coverage are all green in the target deployment environment.

## Follow-up Rule

Do not add a new puzzle to `MISSION_GAMES` by default just because it has a standalone route. Register it first, verify it through query-gated mission flow, then promote it only after source freshness and production e2e coverage are known-good.
