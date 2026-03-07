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
updatedAt: '2026-03-07T09:56:08.061Z'
timeSpent: 0
---
# Narrative UI components

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build the UI layer that wraps the 3 minigames in the daily mission narrative. Character portrait (DiceBear), chapter briefing screen, between-game narrative beats, and mission complete/resolution screen. Update home page Today card to show today's character and storyline.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 MissionBriefing component shows character avatar, name, chapter title, and first-person briefing text
- [ ] #2 NarrativeBeat component shown between games with short continuation text
- [ ] #3 MissionComplete component shows resolution text, score, and chapter completion
- [ ] #4 Home page Today card shows today's character portrait and storyline name
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
MissionBriefing, NarrativeBeat, MissionComplete components in src/components/mission/. Home page updated to show today's character, avatar, and storyline title. CSS added to globals.css.
<!-- SECTION:NOTES:END -->

