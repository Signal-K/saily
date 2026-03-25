---
id: xywrqh
title: Add missing briefingExpression to all chapters
status: done
priority: low
labels:
  - narrative
  - polish
createdAt: '2026-03-21T01:53:23.685Z'
updatedAt: '2026-03-28T04:28:41.511Z'
timeSpent: 0
---
# Add missing briefingExpression to all chapters

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Several chapters in lib/storylines.ts have no briefingExpression set, so the avatar defaults to 'neutral' for every briefing. Each chapter should have an intentional expression. Related: @doc/specs/characters-storylines
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All 20 chapters have an explicit briefingExpression (not relying on undefined → neutral fallback)
- [x] #2 Expressions are consistent with each character's tone (warm vs serious)
- [ ] #3 Doc @doc/specs/characters-storylines updated if expression table is added
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added briefingExpression to all 16 missing chapters in lib/storylines.ts. Zix: neutral/serious/happy/happy. Brix: neutral/serious/neutral/serious. Pip: happy/serious/happy/serious. Carta: serious/neutral/serious/neutral. Expressions match each character's established tone. AC3 (doc update) skipped — no expression table was previously in the doc.
<!-- SECTION:NOTES:END -->

