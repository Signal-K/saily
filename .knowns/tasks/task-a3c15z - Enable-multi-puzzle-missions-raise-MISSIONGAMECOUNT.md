---
id: a3c15z
title: Enable multi-puzzle missions (raise MISSION_GAME_COUNT)
status: blocked
priority: medium
labels:
  - project-saily
  - game
  - narrative
  - post-v0
  - mvp
createdAt: '2026-05-02T10:11:05.285Z'
updatedAt: '2026-05-15T08:37:31.846Z'
timeSpent: 0
---
# Enable multi-puzzle missions (raise MISSION_GAME_COUNT)

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The multi-puzzle flow (briefing, game 1, narrative update 1, game 2, narrative update 2, complete) is fully coded. MISSION_GAME_COUNT = 1 is the only thing holding it back. When you are ready to turn it on, tell me the count (2 or 3) and I will flip it and verify the narrative transitions end-to-end. No decision needed until the science data pipelines are live and stable.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Left intentionally blocked instead of silently flipping it. This ticket directly conflicts with the existing MVP lock (`sly002`), which deliberately set `MISSION_GAME_COUNT = 1` to keep first-session testing narrow. Enabling 2- or 3-step missions now would be a product-level behavior reversal, not a safe maintenance change.
<!-- SECTION:NOTES:END -->

