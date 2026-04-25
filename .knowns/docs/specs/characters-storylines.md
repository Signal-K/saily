---
title: Characters & Storylines
createdAt: '2026-03-21T01:52:24.545Z'
updatedAt: '2026-04-25T00:44:55.601Z'
description: Reference doc for all 4 characters and their 5-chapter story arcs
tags:
  - narrative
  - characters
  - storylines
---
# Characters & Storylines

Reference for all narrative content in Saily. Source of truth: `web/src/lib/characters.ts`, `web/src/lib/storylines.ts`, `web/src/lib/mission.ts`.

---

## Characters

| ID | Name | Occupation | Tone |
|----|------|------------|------|
| `zix` | Zix | Atmosphere Tourist | warm |
| `brix` | Commander Brix | Variable-Star Triage Lead | serious |
| `pip` | Pip | Junior Comet Scout | warm |
| `carta` | The Cartographer | Small-Body Cartographer | serious |

### Zix
- **Avatar seed:** `zix-tourist`
- **Situation:** Came to Mars for the scenery and accidentally became invested in cloud classification.
- **Narrative track:** `Cloudspotting on Mars`

### Commander Brix
- **Avatar seed:** `brix-corps`
- **Situation:** Sorting Gaia variable-star alerts into targets worth real telescope time.
- **Narrative track:** `Gaia Variables`

### Pip
- **Avatar seed:** `pip-cadet`
- **Situation:** Learning to tell real small-body activity from noise in Rubin imagery.
- **Narrative track:** `Rubin Comet Catchers`

### The Cartographer
- **Avatar seed:** `carta-map`
- **Situation:** Revising the active-asteroid catalogue anywhere rocks start behaving like comets.
- **Narrative track:** `Active Asteroids`

---

## Storylines

Each storyline now has 10 chapters. Daily rotation still cycles through all 4 storylines by Melbourne date (`dayIndex % 4`). A user's chapter is their personal progress within the active storyline.

### Storyline A — Zix: `Cloudspotting on Mars`
- Chapters 0-4: Zix becomes a reliable classifier of Martian cloud shapes and seasonal patterns.
- Chapters 5-9: Zix moves into harder atmospheric cases, public-facing explanation, and final archive-quality entries.

### Storyline B — Commander Brix: `Gaia Variables`
- Chapters 0-4: Brix triages variable-star candidates, corrects archive drift, and protects telescope time from bad calls.
- Chapters 5-9: Brix works a harder queue, resolves alias/catalog issues, and closes a defensible observing ledger.

### Storyline C — Pip: `Rubin Comet Catchers`
- Chapters 0-4: Pip learns how to distinguish tails and comae from noise in small-body imagery.
- Chapters 5-9: Pip advances to real queue work, teaches newer volunteers, and contributes on a discovery-grade night.

### Storyline D — The Cartographer: `Active Asteroids`
- Chapters 0-4: Carta reviews candidate active asteroids and improves the small-body map through careful judgment.
- Chapters 5-9: Carta performs second-pass checks, archive revisions, ranking, and atlas-quality reporting.

---

## Rotation Logic

```
dayIndex(date) = Melbourne calendar day since Unix epoch
activeStoryline = STORYLINES[dayIndex % 4]
activeChapter = CHAPTERS[clamp(userChapterIndex, 0, storyline.chapters.length - 1)]
```

All users see the same storyline on a given day. Each user's chapter is their personal progress counter.

---

## Ambience

| Value | Used in |
|-------|---------|
| `wind` | Zix / Cloudspotting on Mars |
| `ship` | Brix / Gaia Variables |
| `lab` | Pip / Rubin Comet Catchers · Carta / Active Asteroids |
| `none` | Fallback default |

---

## Code Locations

| File | Purpose |
|------|---------|
| `web/src/lib/characters.ts` | `CHARACTERS` record — character definitions |
| `web/src/lib/storylines.ts` | `STORYLINES` array — 4 storylines × 10 chapters |
| `web/src/lib/mission.ts` | `getStorylineForDate`, `getChapterForIndex`, `getMissionGameOrder` |
| `web/src/components/mission/mission-briefing.tsx` | Renders briefing + avatar |
| `web/src/components/mission/narrative-beat.tsx` | Renders beat1/beat2/resolution |
| `web/src/components/mission/mission-complete.tsx` | End-of-chapter screen |
