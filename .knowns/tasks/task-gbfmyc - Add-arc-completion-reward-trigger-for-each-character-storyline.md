---
id: gbfmyc
title: Add arc-completion reward trigger for each character storyline
status: done
priority: medium
labels:
  - narrative
  - economy
  - rewards
createdAt: '2026-03-21T01:53:16.608Z'
updatedAt: '2026-03-28T04:26:21.061Z'
timeSpent: 0
---
# Add arc-completion reward trigger for each character storyline

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
When a user finishes chapter 5 (index 4) of any storyline, they should receive a Data Chip and a Postcard. Currently isStorylineComplete() exists in lib/mission.ts but there is no reward dispatch connected to it. Related: @doc/specs/characters-storylines @doc/specs/saily-product-spec
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 isStorylineComplete() is called after chapter resolution is shown
- [x] #2 Data Chip awarded on arc completion
- [x] #3 Postcard awarded on arc completion
- [x] #4 Reward is idempotent — replaying the final chapter does not re-award
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Already implemented: story/progress POST calls isStorylineComplete (chapter_index >= maxChapter), awards 2 data_chips idempotently via completed_storylines check. Postcard shown in MissionComplete when isStorylineComplete=true; postcard content from storyline.postcardTitle/postcardMessage.
<!-- SECTION:NOTES:END -->

