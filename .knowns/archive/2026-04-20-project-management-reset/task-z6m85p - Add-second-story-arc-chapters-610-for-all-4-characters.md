---
id: z6m85p
title: Add second story arc (chapters 6–10) for all 4 characters
status: done
priority: medium
labels:
  - narrative
  - characters
  - storylines
createdAt: '2026-03-21T01:53:05.449Z'
updatedAt: '2026-03-28T04:33:09.588Z'
timeSpent: 0
assignee: '@me'
---
# Add second story arc (chapters 6–10) for all 4 characters

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Each character currently has 5 chapters. Once a user completes all 5, the storyline clamps to the last chapter. This task adds a second 5-chapter arc for each character, continuing their story. Related: @doc/specs/characters-storylines
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Zix arc 2 written (5 chapters continuing from Verdant Paradise arrival)
- [x] #2 Brix arc 2 written (5 chapters continuing from completed supply run)
- [x] #3 Pip arc 2 written (5 chapters continuing from first real client assignment)
- [x] #4 Carta arc 2 written (5 chapters continuing from completed sector chart)
- [x] #5 STORYLINES array updated with new chapters in lib/storylines.ts
- [x] #6 getChapterForIndex handles chapter indices 5–9 correctly
- [ ] #7 Doc @doc/specs/characters-storylines updated with arc 2 summaries
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added ZIX_ARC2_CHAPTERS, BRIX_ARC2_CHAPTERS, PIP_ARC2_CHAPTERS, CARTA_ARC2_CHAPTERS (5 chapters each, indices 5–9) to lib/storylines.ts. STORYLINES array updated to spread arc 2 arrays onto each character. getChapterForIndex already handles indices 5–9 correctly via bounds clamping (now clamps at 9). isStorylineComplete now requires chapterIndex >= 10. TypeScript and unit tests pass.
<!-- SECTION:NOTES:END -->

