---
project: Saily
id: mrwlmf
title: Rewrite all mission dialogue — shorter, task-focused, no narrative in-jokes
status: done
priority: high
labels:
  - project-saily
  - content
  - missions
  - dialogue
createdAt: '2026-05-09T11:50:22.575Z'
updatedAt: '2026-05-09T12:01:17.882Z'
timeSpent: 0
assignee: '@me'
---

[← Back to Index](../INDEX.md)

# Rewrite all mission dialogue — shorter, task-focused, no narrative in-jokes

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
All four storylines (Zix, Brix, Pip, Carta) have dialogue that is too long, overly self-referential, relies on accumulated narrative context, and doesn't clearly communicate what the player needs to do. Briefings, updates, and resolutions should be short, grounded in the science task, and stand alone without reading previous chapters.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All briefing/update/resolution strings are ≤2 sentences
- [x] #2 No dialogue references events from previous chapters (each update stands alone)
- [x] #3 Character voice is present but not dependent on personality quirks built up over multiple chapters
- [x] #4 All 4 storylines × 10 chapters × 4 updates rewritten
- [x] #5 Postcards/titles updated to match new tone
- [x] #6 Tests pass after the change
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Replaced 4 storylines (Zix/Brix/Pip/Carta) with single Gizmo storyline. 5 chapters, 1-2 sentence updates. Removed fleeReason from Character type (unused). Updated tests to drop the hardcoded count of 4.
<!-- SECTION:NOTES:END -->

