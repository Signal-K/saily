---
slug: sprint-10-daily-puzzle-floor
title: What Sprint 10 Locks In for The Daily Transit
status: published
summary: Liam's Sprint 10 build turns the daily puzzle path into a reliable release floor: one playable mission, one article loop, and one clear place to test the next science game.
tags: saily, sprint-10, release-floor
sources: /games/today, /games/close-approaches
citizenScienceLinks: /games/today, /games/close-approaches
publishedAt: 2026-07-19T12:00:00.000Z
updatedAt: 2026-07-19T12:00:00.000Z
---

Sprint 10 is about making The Daily Transit feel dependable before it feels large.

Liam's release floor is deliberately simple: the daily mission should load, the current crossword and transit-spotter games should be playable, and the article surface should point readers back into the puzzle loop without asking them to understand the whole Star Sailors ecosystem first.

That means the default daily route stays conservative. The mission still opens with the two games that already have stable mocks, access checks, and completion handling. New puzzles can appear as experimental routes before they graduate into the daily rotation.

{{puzzle}}

The practical goal is a weekly rhythm:

- Publish a short piece that explains what today's puzzle is asking.
- Let readers jump straight into the daily mission.
- Use the standalone games page to test the next puzzle candidate.
- Promote only the pieces that survive build, lint, and end-to-end checks.

Close Approach Ranker is the first Sprint 10 example of that pattern. It exists as a playable experiment, but it does not replace the reliable mission path until the cache and verification story is complete.
