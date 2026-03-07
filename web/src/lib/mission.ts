import { STORYLINES, type Chapter, type Storyline } from "./storylines";
import { CHARACTERS, type Character } from "./characters";

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
