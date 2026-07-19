---
id: 20260719-1911-register-new-saily-puzzles-before-enabling-them-in-the-default-mission-rotation
title: Register new Saily puzzles before enabling them in the default mission rotation
status: accepted
supersedes: []
supersededBy: []
tags:
  - saily
  - mission-flow
  - puzzle-source
sources: []
relatedDocs:
  - docs/SPRINT_10_PUZZLE_SOURCE_DECISIONS.md
  - docs/SPRINT_11_MINIGAME_RANKING_SYNTHESIS.md
relatedTasks:
  - STS-387
  - STS-382
createdAt: '2026-07-19T17:11:25.717Z'
updatedAt: '2026-07-19T17:11:25.717Z'
---

## Context

Sprint 10 added Close Approach Ranker as a standalone and query-gated mission-flow game. It has source parsing, cache schema, API, UI, scoring, and focused Cypress coverage, but production cache freshness and broader deployment verification still need to be proven before replacing the reliable daily mission path.

## Decision

New Saily puzzle candidates may be added to the mission-game registry and exercised through query-gated mission flow, but they must not be added to the default MISSION_GAMES rotation until source freshness, cache population, and production e2e coverage are known-good.

## Alternatives Considered

Immediately add every implemented game to MISSION_GAMES; rejected because standalone implementation does not prove cache availability or production readiness. Keep unshipped games entirely unregistered; rejected because query-gated mission-flow coverage is useful before promotion.

## Consequences

The default daily mission remains conservative and reliable. Standalone routes and query-gated Cypress paths can validate new puzzle candidates without breaking the release floor. Promotion to the default rotation becomes an explicit product/verification decision rather than a side effect of implementation.
