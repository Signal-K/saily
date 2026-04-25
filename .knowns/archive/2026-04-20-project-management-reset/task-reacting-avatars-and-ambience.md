---
id: task-reacting-avatars-and-ambience
title: Implement Reacting Avatars and Ambient Soundscapes
status: open
priority: medium
labels:
  - ui
  - audio
  - narrative
createdAt: '2026-03-18T00:00:00.000Z'
---
# Implement Reacting Avatars and Ambient Soundscapes

## Description
Enhance the narrative immersion by adding reacting expressions to DiceBear avatars and subtle ambient soundscapes during the mission briefings.

## Acceptance Criteria
- [ ] Implement expression states for `DiceBearAvatar` (e.g., neutral, happy, disappointed, thoughtful).
- [ ] Update `MissionBriefing` and `MissionComplete` components to trigger expression changes based on the story beat or puzzle outcome.
- [ ] Add a lightweight ambient audio system (using Web Audio API or a simple `<audio>` wrapper).
- [ ] Implement 2-3 basic loops (e.g., `wind-ambient.mp3`, `ship-hum.mp3`) that play during the briefing screens.
- [ ] Add a global mute/volume toggle in the settings.

## Implementation Notes
- Avatars should react with disappointment if a user submits a "Low Confidence" classification or fails a streak.
- Soundscapes should be subtle and non-intrusive, strictly for mood.
- Expressions can be mapped to DiceBear's built-in variation parameters if available, or simple CSS transforms/overlays.
