---
id: wxkefi
title: Character & storyline data layer
status: todo
priority: high
labels:
  - narrative
  - characters
  - storylines
createdAt: '2026-03-07T09:40:04.287Z'
updatedAt: '2026-03-07T09:40:04.287Z'
timeSpent: 0
---
# Character & storyline data layer

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Define all static data: 4 characters with DiceBear seeds, 4 storylines × 5 chapters each, and the mission resolution logic (date → storyline, user progress → chapter). No DB changes yet — pure TypeScript constants in lib/.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 lib/characters.ts exports 4 characters with name, seed, occupation, and flee reason
- [ ] #2 lib/storylines.ts exports 4 storylines, each with 5 chapters containing briefing, two narrative beats, and resolution text
- [ ] #3 lib/mission.ts exports getStorylineForDate(date) and getUserChapter(userId, storylineId)
<!-- AC:END -->

