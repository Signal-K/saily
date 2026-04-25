import { describe, expect, it } from "vitest";
import {
  scoreGuess,
  normalizeGuess,
  getDailyWord,
  getPuzzleForDate,
  normalizeGameDateParam,
  resolveGameDate,
  isPastGameDate,
} from "../game";

describe("scoreGuess", () => {
  it("returns 0 when the user did not win", () => {
    expect(scoreGuess(1, false)).toBe(0);
    expect(scoreGuess(3, false)).toBe(0);
    expect(scoreGuess(10, false)).toBe(0);
  });

  it("returns 100 for a first-attempt win", () => {
    expect(scoreGuess(1, true)).toBe(100);
  });

  it("subtracts 15 per additional attempt", () => {
    expect(scoreGuess(2, true)).toBe(85);
    expect(scoreGuess(3, true)).toBe(70);
    expect(scoreGuess(4, true)).toBe(55);
    expect(scoreGuess(5, true)).toBe(40);
  });

  it("floors at 25 for many attempts", () => {
    expect(scoreGuess(6, true)).toBe(25);
    expect(scoreGuess(7, true)).toBe(25);
    expect(scoreGuess(20, true)).toBe(25);
  });
});

describe("normalizeGuess", () => {
  it("trims whitespace and lowercases", () => {
    expect(normalizeGuess("  HELLO  ")).toBe("hello");
    expect(normalizeGuess("MiXeD")).toBe("mixed");
    expect(normalizeGuess("ocean")).toBe("ocean");
  });

  it("handles empty string", () => {
    expect(normalizeGuess("")).toBe("");
  });

  it("handles already-normalized input", () => {
    expect(normalizeGuess("spark")).toBe("spark");
  });
});

describe("getDailyWord", () => {
  it("returns a 5-letter word", () => {
    const word = getDailyWord("2024-01-01");
    expect(typeof word).toBe("string");
    expect(word.length).toBe(5);
  });

  it("is deterministic for the same date key", () => {
    expect(getDailyWord("2024-06-15")).toBe(getDailyWord("2024-06-15"));
  });

  it("produces different words for different date keys", () => {
    const words = new Set([
      getDailyWord("2024-01-01"),
      getDailyWord("2024-01-02"),
      getDailyWord("2024-01-03"),
      getDailyWord("2024-01-05"),
      getDailyWord("2024-02-01"),
    ]);
    // Not all dates map to the same word (hash spread over 20-word bank)
    expect(words.size).toBeGreaterThan(1);
  });

  it("only returns words from the known word bank", () => {
    const WORD_BANK = [
      "crown", "pilot", "clear", "siren", "brave",
      "torch", "grain", "shine", "vivid", "stone",
      "frame", "ocean", "spark", "flint", "trail",
      "river", "daisy", "pearl", "angle", "mirth",
    ];
    for (const date of ["2024-01-01", "2024-03-15", "2024-07-04", "2024-12-25"]) {
      expect(WORD_BANK).toContain(getDailyWord(date));
    }
  });
});

describe("getPuzzleForDate", () => {
  it("returns an object with all required fields", () => {
    const puzzle = getPuzzleForDate("2024-01-01");
    expect(puzzle).toHaveProperty("date", "2024-01-01");
    expect(puzzle).toHaveProperty("letters");
    expect(puzzle).toHaveProperty("hint");
    expect(puzzle).toHaveProperty("wordLength");
  });

  it("letters contain exactly the characters of the daily word", () => {
    const date = "2024-06-10";
    const word = getDailyWord(date);
    const puzzle = getPuzzleForDate(date);
    expect(puzzle.letters).toHaveLength(word.length);
    expect([...puzzle.letters].sort()).toEqual([...word].sort());
  });

  it("wordLength matches the actual word length", () => {
    const date = "2024-09-01";
    const puzzle = getPuzzleForDate(date);
    expect(puzzle.wordLength).toBe(getDailyWord(date).length);
  });

  it("is deterministic for the same date", () => {
    const a = getPuzzleForDate("2024-03-21");
    const b = getPuzzleForDate("2024-03-21");
    expect(a.letters).toEqual(b.letters);
  });
});

describe("normalizeGameDateParam", () => {
  it("returns null for null/undefined/empty inputs", () => {
    expect(normalizeGameDateParam(null)).toBeNull();
    expect(normalizeGameDateParam(undefined)).toBeNull();
    expect(normalizeGameDateParam("")).toBeNull();
  });

  it("returns the date string for a valid YYYY-MM-DD date", () => {
    expect(normalizeGameDateParam("2026-04-25")).toBe("2026-04-25");
    expect(normalizeGameDateParam("2020-01-01")).toBe("2020-01-01");
  });

  it("returns null for wrong separator format", () => {
    expect(normalizeGameDateParam("2026/04/25")).toBeNull();
  });

  it("returns null for unpadded month or day", () => {
    expect(normalizeGameDateParam("2026-4-25")).toBeNull();
    expect(normalizeGameDateParam("2026-04-5")).toBeNull();
  });

  it("returns null for ISO datetime strings", () => {
    expect(normalizeGameDateParam("2026-04-25T00:00:00Z")).toBeNull();
  });

  it("returns null for non-date strings", () => {
    expect(normalizeGameDateParam("not-a-date")).toBeNull();
    expect(normalizeGameDateParam("hello")).toBeNull();
  });
});

describe("resolveGameDate", () => {
  it("returns the date unchanged for a valid past date", () => {
    expect(resolveGameDate("2020-01-01")).toBe("2020-01-01");
  });

  it("falls back to today for null/undefined/empty", () => {
    const result = resolveGameDate(null);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("clamps a future date to today", () => {
    const today = resolveGameDate(null);
    expect(resolveGameDate("2099-12-31")).toBe(today);
  });

  it("returns a valid YYYY-MM-DD string", () => {
    expect(resolveGameDate("2024-06-01")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("isPastGameDate", () => {
  it("returns true for clearly past dates", () => {
    expect(isPastGameDate("2020-01-01")).toBe(true);
    expect(isPastGameDate("2000-06-15")).toBe(true);
  });

  it("returns false for clearly future dates", () => {
    expect(isPastGameDate("2099-12-31")).toBe(false);
    expect(isPastGameDate("2050-01-01")).toBe(false);
  });
});
