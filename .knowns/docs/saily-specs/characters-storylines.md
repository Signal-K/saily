---
title: 'Characters & Storylines'
description: Reference doc for the Gizmo character and its 5-chapter story arc
createdAt: '2026-03-21T01:52:24.545Z'
updatedAt: '2026-07-04T00:00:00.000Z'
tags:
  - project-saily
  - doc-kind-spec
  - narrative
  - characters
  - storylines
  - spec
---

[← Back to Index](../INDEX.md)

# Characters & Storylines

Reference for all narrative content in Saily. Source of truth: `web/src/lib/characters.ts`, `web/src/lib/storylines.ts`, `web/src/lib/mission.ts`.

---

## Characters

There is currently a single character. The earlier four-character roster (Zix, Brix, Pip, Carta) was retired in task `mrwlmf`; do not reintroduce those names in code or docs.

| ID | Name | Occupation | Tone |
|----|------|------------|------|
| `gizmo` | Gizmo | Field Classification Unit | warm |

### Gizmo
- **Avatar seed:** `gizmo`
- **Occupation:** Field Classification Unit
- **Tone:** warm
- **Narrative track:** `Active Survey`

---

## Storylines

There is one storyline, `gizmo` / "Active Survey", with **7 chapters** (indices 0-6). This replaces the earlier 4-storyline × 10-chapter structure.

Each mission day covers all missions games in `MISSION_GAMES` (currently `planet` and `mars`); Gizmo's dialogue refers to "surveys" generically rather than distinguishing between them (see Known Gaps below). Chapters 5 and 6 are domain-specific exceptions, written ahead of the Rubin/Gaia game-order wiring landing — see Known Gaps.

### Storyline — Gizmo: `Active Survey`
- **Postcard title:** "Survey Complete"
- **Postcard message:** "Five objects reviewed, five calls made. The catalogue is a little more accurate than it was."
- **Ambience:** `lab` (all chapters)

| Index | Title | Theme |
|-------|-------|-------|
| 0 | Three Datasets | Introduces the day's surveys; orientation and pacing. |
| 1 | Signal vs Noise | Separating real signals from noise across datasets. |
| 2 | Borderline Cases | Handling ambiguous classifications carefully. |
| 3 | Clean Rejections | Confirms that a correct "nothing here" call has value. |
| 4 | Live Queue | Classifications go to real research teams; raises stakes. |
| 5 | Coma Watch | Rubin Comet Catchers — comet tail/coma classification, named explicitly. |
| 6 | Variable Skies | Gaia Variables — light-curve/variability classification, named explicitly. |

Each chapter's `briefing` sets up the day's work, `update1`/`update2` are mid-mission check-ins delivered between mission games, and `resolution` closes out the chapter. See the Chapter Schema section below for the full field shape.

---

## Chapter Schema

Each `Chapter` (defined in `web/src/lib/storylines.ts`) has the following shape:

```ts
type Chapter = {
  index: number;
  title: string;
  briefing: string;
  briefingExpression?: AvatarExpression;
  update1: string;
  update1Expression?: AvatarExpression;
  update2: string;
  update2Expression?: AvatarExpression;
  resolution: string;
  resolutionExpression?: AvatarExpression;
  ambience?: "wind" | "ship" | "lab" | "none";
};
```

`scripts/validate-narrative.mjs` enforces the following required text fields on every chapter — a chapter fails validation if any of these are empty:

```
["briefing", "update1", "update2", "resolution"]
```

The validator also checks:
- Every storyline has ≥ 5 chapters.
- `chapter.index` matches its position in the `chapters` array.
- Any `*Expression` field, if present, is one of `neutral | happy | sad | surprised | serious`.
- `ambience`, if present, is one of `wind | ship | lab | none`.
- Every storyline's `characterId` resolves to an entry in `CHARACTERS`.
- `postcardTitle` / `postcardMessage` are non-empty.
- Every character has a non-empty `avatarSeed`, `name`, and `occupation`.

Run it with `node scripts/validate-narrative.mjs` (delegates to `vite-node` for TS/alias resolution).

---

## Rotation & Chapter Selection Logic

Implemented in `web/src/lib/mission.ts` (file header comment points back to this doc).

```
dayIndex(date) = Melbourne calendar day since Unix epoch (getMelbourneDayIndex)
activeStoryline = STORYLINES[dayIndex % STORYLINES.length]   // getStorylineForDate
activeChapter = STORYLINES[i].chapters[clamp(userChapterIndex, 0, chapters.length - 1)]  // getChapterForIndex
```

- `getStorylineForDate(date)` — picks today's storyline by rotating through `STORYLINES` using the Melbourne day index. With a single storyline (`gizmo`), every day resolves to the same storyline; the modulo logic still supports adding more storylines later without a code change.
- `getChapterForIndex(storyline, chapterIndex)` — clamps a user's personal chapter progress to the storyline's chapter range, so a user who has finished all 5 chapters keeps seeing chapter 4 (index 4) until new chapters ship.
- `getCharacterForStoryline(storyline)` — looks up the storyline's character in `CHARACTERS`.
- `isStorylineComplete(storyline, chapterIndex)` — true once `chapterIndex >= storyline.chapters.length`.
- `getMissionGameOrder(storylineId, chapterIndex)` — deterministically hashes `storylineId:chapterIndex` to pick a permutation of `MISSION_GAMES` (`planet`, `mars`) for the day, with a special case forcing `planet` first on a user's very first chapter (index 0) so new users see the simpler puzzle first.
- `getGameOrderOverrideForDate(dateKey)` — optional per-date override table (currently empty) for forcing a specific game order; filtered against the active `MISSION_GAMES` pool.

All users see the same storyline/chapter title on a given day; each user's chapter progress is tracked independently.

---

## Ambience

| Value | Used in |
|-------|---------|
| `lab` | Gizmo / Active Survey (all 5 chapters) |
| `wind` | Not currently used |
| `ship` | Not currently used |
| `none` | Fallback default |

---

## Known Gaps

These are open narrative issues, not implemented behavior — tracked here so they aren't rediscovered as "surprises":

- **Generic dialogue.** Gizmo's briefing/update/resolution text talks about "surveys" and "datasets" in the abstract. It does not reference the specific science domain (Planet Hunt transit classification vs. Mars surface imagery) a player is working on in a given mission game.
- **No science-domain contextualization.** `getMissionGameOrder` picks an order across `MISSION_GAMES` (`planet`, `mars`), but the chapter dialogue in `storylines.ts` does not branch on which game is active — the same lines play regardless of whether the player is doing planet-transit or Mars-surface classification. Differentiating dialogue by domain is unimplemented future work.
- **Rubin/Gaia chapters not yet wired to mission selection.** Chapters 5 ("Coma Watch") and 6 ("Variable Skies") were written with domain-specific copy for Rubin Comet Catchers (comet tail/coma) and Gaia Variables (light-curve/variability) ahead of those games being added to `MISSION_GAMES` in `mission.ts`. Once `rubin`/`gaia` are added to `MISSION_GAMES` and wired into `getMissionGameOrder`, these chapters should be checked to ensure they're presented on days those games are active, rather than reached only via the plain chapter-index rotation.

(Source: megadoc-2026-05-14, Section 5.)

---

## Code Locations

| File | Purpose |
|------|---------|
| `web/src/lib/characters.ts` | `CHARACTERS` record — character definitions (currently just `gizmo`) |
| `web/src/lib/storylines.ts` | `STORYLINES` array — 1 storyline (`gizmo`) × 5 chapters |
| `web/src/lib/mission.ts` | `getStorylineForDate`, `getChapterForIndex`, `getCharacterForStoryline`, `isStorylineComplete`, `getMissionGameOrder`, `getGameOrderOverrideForDate` |
| `scripts/validate-narrative.mjs` | CI/local validation of storyline & character data integrity |
| `web/src/components/mission/mission-briefing.tsx` | Renders briefing + avatar |
| legacy mid-mission update component | Renders update1/update2/resolution |
| `web/src/components/mission/mission-complete.tsx` | End-of-chapter screen |
