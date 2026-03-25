---
id: 79s5jr
title: Narrative UI components
status: done
priority: high
labels:
  - ui
  - narrative
  - components
createdAt: '2026-03-07T09:40:30.807Z'
updatedAt: '2026-03-26T02:30:17.894Z'
timeSpent: 0
---
# Narrative UI components

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build the UI layer that wraps the 3 minigames in the daily mission narrative. Character portrait (DiceBear), chapter briefing screen, between-game narrative transition screens, and mission complete/resolution screen. Update home page Today card to show today's character and storyline.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 MissionBriefing component shows character avatar, name, chapter title, and first-person briefing text
- [ ] #2 MissionComplete component shows resolution text, score, and chapter completion
- [ ] #3 Home page Today card shows today's character portrait and storyline name
- [ ] #4 lib/storylines.ts exports 4 storylines, each with 5 chapters containing briefing, two narrative transitions, and resolution text
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
MissionBriefing, NarrativeBeat, MissionComplete components in src/components/mission/. Home page updated to show today's character, avatar, and storyline title. CSS added to globals.css.
<!-- SECTION:NOTES:END -->

