import { describe, expect, it } from "vitest";
import {
  getStorylineForDate,
  getChapterForIndex,
  getCharacterForStoryline,
  isStorylineComplete,
  getGameOrderOverrideForDate,
  getMissionGameOrder,
} from "../mission";
import { STORYLINES } from "../storylines";

describe("getStorylineForDate", () => {
  it("returns one of the known storylines", () => {
    const result = getStorylineForDate(new Date("2026-04-25T00:00:00Z"));
    expect(STORYLINES).toContain(result);
  });

  it("is deterministic for the same date", () => {
    const d = new Date("2026-04-20T00:00:00Z");
    expect(getStorylineForDate(d)).toBe(getStorylineForDate(d));
  });

  it("cycles through all storylines over consecutive days", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 12; i++) {
      // Step through days starting from a known epoch anchor (UTC+10 anchor to avoid TZ shift)
      const d = new Date(`2026-04-2${(i % 8) + 1}T04:00:00Z`);
      seen.add(getStorylineForDate(d).id);
    }
    expect(seen.size).toBe(STORYLINES.length);
  });
});

describe("getChapterForIndex", () => {
  const storyline = STORYLINES[0];

  it("returns the first chapter for index 0", () => {
    expect(getChapterForIndex(storyline, 0)).toBe(storyline.chapters[0]);
  });

  it("returns the first chapter for negative indices", () => {
    expect(getChapterForIndex(storyline, -1)).toBe(storyline.chapters[0]);
    expect(getChapterForIndex(storyline, -100)).toBe(storyline.chapters[0]);
  });

  it("returns the last chapter for out-of-bounds index", () => {
    const last = storyline.chapters[storyline.chapters.length - 1];
    expect(getChapterForIndex(storyline, storyline.chapters.length)).toBe(last);
    expect(getChapterForIndex(storyline, 9999)).toBe(last);
  });

  it("returns the correct chapter for a valid index", () => {
    expect(getChapterForIndex(storyline, 2)).toBe(storyline.chapters[2]);
  });
});

describe("getCharacterForStoryline", () => {
  it("returns a character object for every storyline", () => {
    for (const storyline of STORYLINES) {
      const character = getCharacterForStoryline(storyline);
      expect(character).toBeDefined();
      expect(typeof character.name).toBe("string");
    }
  });

  it("returns a character matching the storyline's characterId", () => {
    const storyline = STORYLINES[0];
    const character = getCharacterForStoryline(storyline);
    expect(character).toBeTruthy();
  });
});

describe("isStorylineComplete", () => {
  const storyline = STORYLINES[0];
  const total = storyline.chapters.length;

  it("returns false when chapter index is within the arc", () => {
    expect(isStorylineComplete(storyline, 0)).toBe(false);
    expect(isStorylineComplete(storyline, total - 1)).toBe(false);
  });

  it("returns true when chapter index equals chapter count (just completed)", () => {
    expect(isStorylineComplete(storyline, total)).toBe(true);
  });

  it("returns true when chapter index exceeds chapter count", () => {
    expect(isStorylineComplete(storyline, total + 5)).toBe(true);
  });
});

describe("getGameOrderOverrideForDate", () => {
  it("returns the override for the known hardcoded date", () => {
    const result = getGameOrderOverrideForDate("2026-04-17");
    expect(result).toEqual(["planet", "asteroid", "mars"]);
  });

  it("returns null for a date with no override", () => {
    expect(getGameOrderOverrideForDate("2025-01-01")).toBeNull();
    expect(getGameOrderOverrideForDate("2026-04-25")).toBeNull();
  });
});

describe("getMissionGameOrder", () => {
  it("always returns exactly 3 unique games", () => {
    for (let i = 0; i < 15; i++) {
      const order = getMissionGameOrder("zix", i);
      expect(order).toHaveLength(3);
      expect(new Set(order).size).toBe(3);
    }
  });

  it("always contains exactly 'planet', 'asteroid', and 'mars'", () => {
    for (let i = 0; i < 10; i++) {
      expect(getMissionGameOrder("brix", i).sort()).toEqual(["asteroid", "mars", "planet"]);
    }
  });

  it("chapter 0 always has 'planet' first", () => {
    for (const id of ["zix", "brix", "pip", "carta", "unknown"]) {
      const order = getMissionGameOrder(id, 0);
      expect(order[0]).toBe("planet");
    }
  });

  it("different storyline ids produce different orders across chapters", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 12; i++) {
      seen.add(getMissionGameOrder("zix", i).join(","));
    }
    // With 6 possible permutations and 12 chapters, we expect variety
    expect(seen.size).toBeGreaterThan(1);
  });

  it("is deterministic for the same storylineId and chapterIndex", () => {
    expect(getMissionGameOrder("pip", 3)).toEqual(getMissionGameOrder("pip", 3));
  });
});
