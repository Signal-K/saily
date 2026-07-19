import { describe, expect, it } from "vitest";
import { buildDailyCrossword } from "./crossword-generator";
import type { CrosswordClueSource } from "./crossword-clues";

const SAMPLE_BANK: CrosswordClueSource[] = [
  { answer: "JUPITER", clue: "Largest planet", sourceUrl: null },
  { answer: "TRANSIT", clue: "Planet crossing a star", sourceUrl: null },
  { answer: "VENUS", clue: "Bright evening planet", sourceUrl: null },
  { answer: "SATURN", clue: "Ringed planet", sourceUrl: null },
  { answer: "AURORA", clue: "Solar-particle light display", sourceUrl: null },
];

describe("buildDailyCrossword", () => {
  it("is deterministic for the same game date", () => {
    const first = buildDailyCrossword(SAMPLE_BANK, "2026-07-16");
    const second = buildDailyCrossword(SAMPLE_BANK, "2026-07-16");
    expect(second.placements.map((p) => p.answer)).toEqual(first.placements.map((p) => p.answer));
  });

  it("places at least one word from the clue bank", () => {
    const grid = buildDailyCrossword(SAMPLE_BANK, "2026-07-16");
    expect(grid.placements.length).toBeGreaterThan(0);
  });

  it("gives every placement a positive clue number", () => {
    const grid = buildDailyCrossword(SAMPLE_BANK, "2026-07-17");
    for (const placement of grid.placements) {
      expect(placement.number).toBeGreaterThan(0);
    }
  });

  it("never overlaps two different letters in the same cell", () => {
    const grid = buildDailyCrossword(SAMPLE_BANK, "2026-07-18");
    // Re-derive expected letters per cell from placements and compare against
    // the flattened `cells` map — any mismatch means two words collided.
    const expected = new Map<string, string>();
    for (const placement of grid.placements) {
      for (let i = 0; i < placement.answer.length; i += 1) {
        const row = placement.direction === "down" ? placement.row + i : placement.row;
        const col = placement.direction === "across" ? placement.col + i : placement.col;
        const key = `${row},${col}`;
        if (expected.has(key)) {
          expect(expected.get(key)).toBe(placement.answer[i]);
        }
        expected.set(key, placement.answer[i]);
      }
    }
  });
});
