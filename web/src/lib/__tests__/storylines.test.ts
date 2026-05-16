import { describe, expect, it } from "vitest";
import { STORYLINES } from "../storylines";
import { getStorylineForDate, getChapterForIndex, isStorylineComplete } from "../mission";

const REQUIRED_FIELDS = ["briefing", "update1", "update2", "resolution"] as const;

describe("storylines data integrity", () => {
  it("has at least 1 storyline", () => {
    expect(STORYLINES.length).toBeGreaterThanOrEqual(1);
  });

  it("each storyline has at least 5 chapters", () => {
    for (const storyline of STORYLINES) {
      expect(storyline.chapters.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("all chapters have non-empty required text fields", () => {
    for (const storyline of STORYLINES) {
      for (const chapter of storyline.chapters) {
        for (const field of REQUIRED_FIELDS) {
          expect(
            chapter[field].trim(),
            `${storyline.id} ch${chapter.index} "${field}" is empty`,
          ).not.toBe("");
        }
      }
    }
  });

  it("chapter indexes are sequential starting from 0", () => {
    for (const storyline of STORYLINES) {
      storyline.chapters.forEach((chapter, i) => {
        expect(chapter.index).toBe(i);
      });
    }
  });

  it("all storylines have postcardTitle and postcardMessage", () => {
    for (const storyline of STORYLINES) {
      expect(storyline.postcardTitle.trim()).not.toBe("");
      expect(storyline.postcardMessage.trim()).not.toBe("");
    }
  });
});

describe("getStorylineForDate", () => {
  it("returns a storyline for any date", () => {
    const base = new Date("2026-01-01T12:00:00+10:00");
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      expect(getStorylineForDate(d).id).toBeTruthy();
    }
  });

  it("returns the same storyline for the same date", () => {
    const d = new Date("2026-03-15T12:00:00+10:00");
    expect(getStorylineForDate(d).id).toBe(getStorylineForDate(d).id);
  });
});

describe("getChapterForIndex", () => {
  it("clamps below 0 to chapter 0", () => {
    const storyline = STORYLINES[0];
    expect(getChapterForIndex(storyline, -1).index).toBe(0);
  });

  it("clamps above max to last chapter", () => {
    const storyline = STORYLINES[0];
    const last = storyline.chapters.length - 1;
    expect(getChapterForIndex(storyline, 999).index).toBe(last);
  });

  it("returns the correct chapter for a valid index", () => {
    const storyline = STORYLINES[0];
    expect(getChapterForIndex(storyline, 2).index).toBe(2);
  });
});

describe("isStorylineComplete", () => {
  it("returns false when chapterIndex < chapter count", () => {
    const storyline = STORYLINES[0];
    expect(isStorylineComplete(storyline, storyline.chapters.length - 1)).toBe(false);
  });

  it("returns true when chapterIndex >= chapter count", () => {
    const storyline = STORYLINES[0];
    expect(isStorylineComplete(storyline, storyline.chapters.length)).toBe(true);
  });
});
