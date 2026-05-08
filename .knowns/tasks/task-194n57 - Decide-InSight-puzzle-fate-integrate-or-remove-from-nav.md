---
id: 194n57
title: 'Decide InSight puzzle fate: integrate or remove from nav'
status: done
priority: high
labels:
  - v0
  - ux
  - puzzle
  - decision
createdAt: '2026-05-02T10:10:53.325Z'
updatedAt: '2026-05-02T12:36:26.083Z'
timeSpent: 0
---
# Decide InSight puzzle fate: integrate or remove from nav

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
InSight is unreachable from any nav — testers won't stumble on it. But it's a live route taking up maintenance surface. Pick one:

**A)** Leave it hidden — no action needed.
**B)** Add a link in Quick Access on the home page — I can do this in 10 minutes.
**C)** Remove the route and all related API + lib files entirely — I can do this in 15 minutes.

Just reply with A, B, or C.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Chose **C** and removed InSight entirely. Deleted the hidden `/games/insight` route, both `/api/insight/*` endpoints, the `insight.ts` gameplay helper, the InSight game page component, and its unit test. Also removed the orphaned PostHog survey source mapping so the dead mechanic no longer adds maintenance surface.
<!-- SECTION:NOTES:END -->
