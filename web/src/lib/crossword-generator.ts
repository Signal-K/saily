import type { CrosswordClueSource } from "@/lib/crossword-clues";

export type CrosswordDirection = "across" | "down";

export type CrosswordPlacement = {
  answer: string;
  clue: string;
  sourceUrl: string | null;
  row: number;
  col: number;
  direction: CrosswordDirection;
  number: number;
};

export type CrosswordGrid = {
  width: number;
  height: number;
  // Sparse map of "row,col" -> letter, for filled (non-blocked) cells only.
  cells: Record<string, string>;
  placements: CrosswordPlacement[];
};

const TARGET_WORD_COUNT = 8;
const MAX_CANDIDATES = 40;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Deterministic shuffle seeded by the game date, so the same day always
// produces the same puzzle (needed since this runs per-request until cached
// in the crossword_daily PocketBase row).
function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let state = seed || 1;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    state = (state * 48271) % 2147483647;
    const j = state % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type PlacedWord = { answer: string; row: number; col: number; direction: CrosswordDirection };

function canPlace(cells: Map<string, string>, word: string, row: number, col: number, direction: CrosswordDirection): boolean {
  for (let i = 0; i < word.length; i += 1) {
    const r = direction === "down" ? row + i : row;
    const c = direction === "across" ? col + i : col;
    const existing = cells.get(`${r},${c}`);
    if (existing && existing !== word[i]) return false;

    // Disallow a new word running directly alongside an existing parallel
    // word with no gap (avoids visually-merged unrelated words).
    if (!existing) {
      const neighborKeys =
        direction === "across"
          ? [`${r - 1},${c}`, `${r + 1},${c}`]
          : [`${r},${c - 1}`, `${r},${c + 1}`];
      for (const key of neighborKeys) {
        if (cells.has(key)) return false;
      }
    }
  }

  // Cell immediately before/after the word must be empty (word boundary).
  const beforeKey = direction === "across" ? `${row},${col - 1}` : `${row - 1},${col}`;
  const afterKey = direction === "across" ? `${row},${col + word.length}` : `${row + word.length},${col}`;
  if (cells.has(beforeKey) || cells.has(afterKey)) return false;

  return true;
}

function placeWord(cells: Map<string, string>, word: string, row: number, col: number, direction: CrosswordDirection) {
  for (let i = 0; i < word.length; i += 1) {
    const r = direction === "down" ? row + i : row;
    const c = direction === "across" ? col + i : col;
    cells.set(`${r},${c}`, word[i]);
  }
}

export function buildDailyCrossword(clueBank: CrosswordClueSource[], gameDate: string): CrosswordGrid {
  const seed = hashString(gameDate);
  const dedupedByAnswer = new Map(clueBank.map((entry) => [entry.answer, entry]));
  const shuffled = seededShuffle(Array.from(dedupedByAnswer.values()), seed).slice(0, MAX_CANDIDATES);
  // Longer words first — easier to find intersections against later, shorter words.
  shuffled.sort((a, b) => b.answer.length - a.answer.length);

  const cells = new Map<string, string>();
  const placed: PlacedWord[] = [];
  const placements: CrosswordPlacement[] = [];

  for (const candidate of shuffled) {
    if (placed.length >= TARGET_WORD_COUNT) break;
    const { answer } = candidate;

    if (placed.length === 0) {
      placeWord(cells, answer, 0, 0, "across");
      placed.push({ answer, row: 0, col: 0, direction: "across" });
      placements.push({ ...candidate, row: 0, col: 0, direction: "across", number: 0 });
      continue;
    }

    let bestSpot: { row: number; col: number; direction: CrosswordDirection } | null = null;
    for (const existing of placed) {
      if (bestSpot) break;
      for (let i = 0; i < existing.answer.length && !bestSpot; i += 1) {
        const letter = existing.answer[i];
        const matchIndex = answer.indexOf(letter);
        if (matchIndex === -1) continue;

        const crossDirection: CrosswordDirection = existing.direction === "across" ? "down" : "across";
        const row = crossDirection === "down" ? existing.row - matchIndex : existing.row + i;
        const col = crossDirection === "across" ? existing.col - matchIndex : existing.col + i;

        if (canPlace(cells, answer, row, col, crossDirection)) {
          bestSpot = { row, col, direction: crossDirection };
        }
      }
    }

    if (!bestSpot) continue;
    placeWord(cells, answer, bestSpot.row, bestSpot.col, bestSpot.direction);
    placed.push({ answer, row: bestSpot.row, col: bestSpot.col, direction: bestSpot.direction });
    placements.push({ ...candidate, ...bestSpot, number: 0 });
  }

  // Normalize to non-negative coordinates and compute grid bounds.
  const rows = placed.flatMap((w) => (w.direction === "down" ? [w.row, w.row + w.answer.length - 1] : [w.row]));
  const cols = placed.flatMap((w) => (w.direction === "across" ? [w.col, w.col + w.answer.length - 1] : [w.col]));
  const minRow = Math.min(...rows, 0);
  const minCol = Math.min(...cols, 0);

  const normalizedCells: Record<string, string> = {};
  for (const [key, letter] of cells.entries()) {
    const [r, c] = key.split(",").map(Number);
    normalizedCells[`${r - minRow},${c - minCol}`] = letter;
  }

  const startCells = new Set<string>();
  const numberedPlacements = placements
    .map((p) => ({ ...p, row: p.row - minRow, col: p.col - minCol }))
    .sort((a, b) => (a.row - b.row) || (a.col - b.col));

  let clueNumber = 1;
  for (const placement of numberedPlacements) {
    const key = `${placement.row},${placement.col}`;
    if (!startCells.has(key)) {
      startCells.add(key);
      placement.number = clueNumber;
      clueNumber += 1;
    } else {
      // Two words legitimately starting at the same cell share a number.
      const already = numberedPlacements.find((p) => p !== placement && `${p.row},${p.col}` === key);
      placement.number = already?.number ?? clueNumber;
    }
  }

  const maxRow = Math.max(...rows) - minRow;
  const maxCol = Math.max(...cols) - minCol;

  return {
    width: maxCol + 1,
    height: maxRow + 1,
    cells: normalizedCells,
    placements: numberedPlacements,
  };
}
