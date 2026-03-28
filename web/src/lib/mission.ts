// @doc/specs/characters-storylines — rotation and chapter selection logic

import { STORYLINES, type Chapter, type Storyline } from "./storylines";
import { CHARACTERS, type Character } from "./characters";
import { getMelbourneDayIndex } from "./melbourne-date";

export type MissionGame = "planet" | "asteroid" | "mars" | "insight";

const MISSION_GAMES: MissionGame[] = ["planet", "asteroid", "mars", "insight"];
const MISSION_GAME_COUNT = 3;

function buildMissionGamePermutations() {
  const permutations: MissionGame[][] = [];
  MISSION_GAMES.forEach((first) => {
    MISSION_GAMES.forEach((second) => {
      if (second === first) return;
      MISSION_GAMES.forEach((third) => {
        if (third === first || third === second) return;
        permutations.push([first, second, third]);
      });
    });
  });
  return permutations;
}

const GAME_ORDER_PERMUTATIONS = buildMissionGamePermutations();

/**
 * Returns the number of full days since Unix epoch for a given date in Melbourne time (AEST/AEDT).
 * Used to deterministically pick a storyline by calendar date.
 * Melbourne is UTC+10 (AEST) or UTC+11 (AEDT).
 */
function dayIndex(date: Date): number {
  return getMelbourneDayIndex(date);
}

/**
 * Returns today's active storyline — the same for all users on a given date.
 * Rotates through STORYLINES in order, cycling by day.
 */
export function getStorylineForDate(date: Date): Storyline {
  const index = dayIndex(date) % STORYLINES.length;
  return STORYLINES[index];
}

/**
 * Returns the chapter a user should see, given their personal chapter index
 * within the active storyline. Clamps to the last chapter if they've
 * finished the arc (shows the final chapter until new chapters are added).
 */
export function getChapterForIndex(storyline: Storyline, chapterIndex: number): Chapter {
  const clamped = Math.max(0, Math.min(chapterIndex, storyline.chapters.length - 1));
  return storyline.chapters[clamped];
}

/**
 * Returns the character for a given storyline.
 */
export function getCharacterForStoryline(storyline: Storyline): Character {
  return CHARACTERS[storyline.characterId];
}

/**
 * Returns true if the user has completed the full arc for a storyline.
 */
export function isStorylineComplete(storyline: Storyline, chapterIndex: number): boolean {
  return chapterIndex >= storyline.chapters.length;
}

/**
 * Returns a deterministic but chapter-varying game order for the active storyline.
 */
export function getMissionGameOrder(storylineId: string, chapterIndex: number): MissionGame[] {
  const seed = `${storylineId}:${chapterIndex}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % GAME_ORDER_PERMUTATIONS.length;
  return GAME_ORDER_PERMUTATIONS[idx].slice(0, MISSION_GAME_COUNT);
}
