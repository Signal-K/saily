import { STORYLINES, type Chapter, type Storyline } from "./storylines";
import { CHARACTERS, type Character } from "./characters";

export type MissionGame = "planet" | "asteroid" | "mars";

const GAME_ORDER_PERMUTATIONS: MissionGame[][] = [
  ["planet", "asteroid", "mars"],
  ["planet", "mars", "asteroid"],
  ["asteroid", "planet", "mars"],
  ["asteroid", "mars", "planet"],
  ["mars", "planet", "asteroid"],
  ["mars", "asteroid", "planet"],
];

/**
 * Returns the number of full days since Unix epoch for a given date.
 * Used to deterministically pick a storyline by calendar date.
 */
function dayIndex(date: Date): number {
  return Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
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
  return GAME_ORDER_PERMUTATIONS[idx];
}
