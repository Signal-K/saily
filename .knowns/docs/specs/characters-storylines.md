---
title: Characters & Storylines
createdAt: '2026-03-21T01:52:24.545Z'
updatedAt: '2026-03-21T01:52:50.339Z'
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
| `zix` | Zix | Tourist | warm |
| `brix` | Commander Brix | Supply Corps | serious |
| `pip` | Pip | Navigation Cadet | warm |
| `carta` | The Cartographer | Cartographer | serious |

### Zix
- **Avatar seed:** `zix-tourist`
- **Situation:** Booked a holiday to Verdant Paradise and got dropped off in the wrong star system. Travel agent not responding.

### Commander Brix
- **Avatar seed:** `brix-corps`
- **Situation:** Surveying planets for future supply depots across the outer rim.

### Pip
- **Avatar seed:** `pip-cadet`
- **Situation:** First solo certification mission — needs to find a planet with water.

### The Cartographer
- **Avatar seed:** `carta-map`
- **Situation:** Mapping an entire sector listed on existing charts as "probably fine."

---

## Storylines

Each storyline has 5 chapters. Daily rotation cycles through all 4 storylines by Melbourne date (`dayIndex % 4`). A user's chapter is their personal progress within the active storyline.

### Storyline A — Zix: "Wrong Star System"

| # | Title | Summary |
|---|-------|---------|
| 0 | The Brochure Was Misleading | Zix needs a planet with breathable atmosphere and a beach |
| 1 | The Shelter Situation | Leaky shelter — needs a calmer, shadier location |
| 2 | The Food Problem | Snacks gone — needs a planet where things can grow |
| 3 | The Navigation Update | Nav system finally updated; plotting route to Verdant Paradise |
| 4 | Verdant Paradise | Final approach — one last data check before landing |

### Storyline B — Commander Brix: "Supply Run"

| # | Title | Summary |
|---|-------|---------|
| 0 | The Supply List | 12 candidate systems, not enough fuel to check all — needs efficiency |
| 1 | Candidate Seven | Previous six ruled out; cautiously optimistic about this one |
| 2 | The Detour | Off-list system flagged by Corps — verify and report |
| 3 | Candidate Ten | Unusual star type; fuel situation better than expected |
| 4 | Final Report | Last candidate; wrapping up with 4 viable depot sites found |

### Storyline C — Pip: "First Solo"

| # | Title | Summary |
|---|-------|---------|
| 0 | First Solo | Certification exam — needs transit signal, water, surface scan |
| 1 | The Second One | Passed with distinction; now finding a research outpost site |
| 2 | The Tricky One | Variable star system — noisier light curve, harder transit |
| 3 | Teaching Someone Else | Demonstrating the full survey process to a new student |
| 4 | The Real Thing | First real client assignment — settlement feasibility study |

### Storyline D — The Cartographer: "Blank Space"

| # | Title | Summary |
|---|-------|---------|
| 0 | Blank Space | Replacing "probably fine" with actual data — first entry |
| 1 | The Cluster | Old charts marked signals as interference — investigating |
| 2 | The Edge | First data beyond the mapped region |
| 3 | Corrections | Three errors found in existing charts — correcting them |
| 4 | The Last Blank | Final unmapped section — completing the expedition chart |

---

## Rotation Logic

```
dayIndex(date) = Melbourne calendar day since Unix epoch
activeStoryline = STORYLINES[dayIndex % 4]
activeChapter = CHAPTERS[clamp(userChapterIndex, 0, 4)]
```

All users see the same storyline on a given day. Each user's chapter is their personal progress counter.

---

## Ambience

| Value | Used in |
|-------|---------|
| `ship` | Zix ch.0, ch.4 · Brix ch.0, ch.4 |
| `lab` | Pip ch.0, ch.4 · Carta ch.0, ch.4 |
| `none` | All other chapters (default) |

---

## Code Locations

| File | Purpose |
|------|---------|
| `web/src/lib/characters.ts` | `CHARACTERS` record — 4 character definitions |
| `web/src/lib/storylines.ts` | `STORYLINES` array — 4 storylines × 5 chapters |
| `web/src/lib/mission.ts` | `getStorylineForDate`, `getChapterForIndex`, `getMissionGameOrder` |
| `web/src/components/mission/mission-briefing.tsx` | Renders briefing + avatar |
| `web/src/components/mission/narrative-beat.tsx` | Renders beat1/beat2/resolution |
| `web/src/components/mission/mission-complete.tsx` | End-of-chapter screen |
