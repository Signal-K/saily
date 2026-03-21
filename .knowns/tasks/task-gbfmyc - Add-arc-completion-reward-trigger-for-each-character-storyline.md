---
id: gbfmyc
title: Add arc-completion reward trigger for each character storyline
status: todo
priority: medium
labels:
  - narrative
  - economy
  - rewards
createdAt: '2026-03-21T01:53:16.608Z'
updatedAt: '2026-03-21T01:53:20.004Z'
timeSpent: 0
---
# Add arc-completion reward trigger for each character storyline

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
When a user finishes chapter 5 (index 4) of any storyline, they should receive a Data Chip and a Postcard. Currently isStorylineComplete() exists in lib/mission.ts but there is no reward dispatch connected to it. Related: @doc/specs/characters-storylines @doc/specs/saily-product-spec
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 isStorylineComplete() is called after chapter resolution is shown
- [ ] #2 Data Chip awarded on arc completion
- [ ] #3 Postcard awarded on arc completion
- [ ] #4 Reward is idempotent — replaying the final chapter does not re-award
<!-- AC:END -->

