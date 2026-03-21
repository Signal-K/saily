// @doc/specs/characters-storylines — rotation and chapter selection logic

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
 * Returns the number of full days since Unix epoch for a given date in Melbourne time (AEST/AEDT).
 * Used to deterministically pick a storyline by calendar date.
 * Melbourne is UTC+10 (AEST) or UTC+11 (AEDT).
 */
function dayIndex(date: Date): number {
  // Offset to Melbourne time. Using Intl for reliability.
  const melbourneDate = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
  
  // We can just use the absolute day since a fixed point in Melbourne time.
  // A simpler way is to offset the UTC time by 10/11 hours.
  // But let's be precise: Melbourne midnight is the reset.
  const formatter = new Intl.DateTimeFormat('en-CA', { // yyyy-mm-dd
    timeZone: 'Australia/Melbourne',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(date);
  const y = parseInt(parts.find(p => p.type === 'year')!.value);
  const m = parseInt(parts.find(p => p.type === 'month')!.value) - 1;
  const d = parseInt(parts.find(p => p.type === 'day')!.value);
  
  const localMidnight = new Date(Date.UTC(y, m, d));
  return Math.floor(localMidnight.getTime() / (1000 * 60 * 60 * 24));
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
