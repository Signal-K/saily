const WORD_BANK = [
  "crown",
  "pilot",
  "clear",
  "siren",
  "brave",
  "torch",
  "grain",
  "shine",
  "vivid",
  "stone",
  "frame",
  "ocean",
  "spark",
  "flint",
  "trail",
  "river",
  "daisy",
  "pearl",
  "angle",
  "mirth",
] as const;

export type DailyPuzzle = {
  date: string;
  letters: string[];
  hint: string;
  wordLength: number;
};

export function getDateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function normalizeGameDateParam(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return value;
}

export function resolveGameDate(value: string | null | undefined): string {
  const today = getDateKey();
  const normalized = normalizeGameDateParam(value);
  if (!normalized) return today;
  // Do not allow future puzzles; cap future requests to today's puzzle.
  if (normalized > today) return today;
  return normalized;
}

export function isPastGameDate(dateKey: string): boolean {
  return dateKey < getDateKey();
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededShuffle(text: string, seed: number): string[] {
  const arr = text.split("");
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = (seed + i * 31) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getDailyWord(dateKey: string): string {
  const idx = hashString(dateKey) % WORD_BANK.length;
  return WORD_BANK[idx];
}

export function getPuzzleForDate(dateKey: string): DailyPuzzle {
  const word = getDailyWord(dateKey);
  return {
    date: dateKey,
    letters: seededShuffle(word, hashString(dateKey)),
    hint: "Unscramble the 5-letter word",
    wordLength: word.length,
  };
}

export function scoreGuess(attempts: number, won: boolean): number {
  if (!won) return 0;
  return Math.max(100 - (attempts - 1) * 15, 25);
}

export function normalizeGuess(value: string): string {
  return value.trim().toLowerCase();
}
