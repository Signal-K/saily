import { describe, expect, it } from "vitest";
import {
  clamp01,
  normalizePeriodDays,
  toDisplayPoints,
  mergeSegments,
} from "../planet-logic";

describe("clamp01", () => {
  it("passes through values already in [0, 1]", () => {
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1)).toBe(1);
  });

  it("clamps values below 0 to 0", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(-100)).toBe(0);
  });

  it("clamps values above 1 to 1", () => {
    expect(clamp01(2)).toBe(1);
    expect(clamp01(100)).toBe(1);
  });
});

describe("normalizePeriodDays", () => {
  it("returns 2 for non-finite inputs", () => {
    expect(normalizePeriodDays(NaN)).toBe(2);
    expect(normalizePeriodDays(Infinity)).toBe(2);
    expect(normalizePeriodDays(-Infinity)).toBe(2);
  });

  it("clamps to minimum of 0.2", () => {
    expect(normalizePeriodDays(0)).toBe(0.2);
    expect(normalizePeriodDays(-5)).toBe(0.2);
    expect(normalizePeriodDays(0.2)).toBe(0.2);
  });

  it("clamps to maximum of 30", () => {
    expect(normalizePeriodDays(100)).toBe(30);
    expect(normalizePeriodDays(30)).toBe(30);
  });

  it("passes through valid mid-range values", () => {
    expect(normalizePeriodDays(5)).toBe(5);
    expect(normalizePeriodDays(15)).toBe(15);
  });
});

describe("toDisplayPoints — edge cases", () => {
  it("returns empty array for empty input", () => {
    const result = toDisplayPoints([], { phaseFold: false, bin: false, periodDays: 2 });
    expect(result).toEqual([]);
  });

  it("handles a single point without crashing", () => {
    const result = toDisplayPoints([{ x: 0.5, y: 1.0 }], { phaseFold: false, bin: false, periodDays: 2 });
    expect(result).toHaveLength(1);
    expect(result[0].x).toBe(0.5);
  });

  it("returns at most 70 bins when binning enabled", () => {
    const pts = Array.from({ length: 500 }, (_, i) => ({ x: i / 499, y: 1 }));
    const result = toDisplayPoints(pts, { phaseFold: false, bin: true, periodDays: 2 });
    expect(result.length).toBeLessThanOrEqual(70);
  });

  it("returns all points when binning is disabled", () => {
    const pts = Array.from({ length: 100 }, (_, i) => ({ x: i / 99, y: 1 }));
    const result = toDisplayPoints(pts, { phaseFold: false, bin: false, periodDays: 2 });
    expect(result).toHaveLength(100);
  });

  it("uses normalizePeriodDays internally (NaN period falls back to 2)", () => {
    const pts = [{ x: 0, y: 1 }, { x: 1, y: 1 }];
    // Should not throw even with invalid period
    expect(() => toDisplayPoints(pts, { phaseFold: true, bin: false, periodDays: NaN })).not.toThrow();
  });
});

describe("mergeSegments — edge cases", () => {
  it("returns empty array for empty input", () => {
    expect(mergeSegments([])).toEqual([]);
  });

  it("returns a single segment unchanged", () => {
    const result = mergeSegments([{ xStart: 0.1, xEnd: 0.5 }]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ xStart: 0.1, xEnd: 0.5 });
  });

  it("does not merge non-overlapping non-adjacent segments", () => {
    const input = [
      { xStart: 0.1, xEnd: 0.2 },
      { xStart: 0.5, xEnd: 0.6 },
    ];
    const result = mergeSegments(input);
    expect(result).toHaveLength(2);
  });

  it("merges adjacent segments (touching at boundary)", () => {
    const input = [
      { xStart: 0.1, xEnd: 0.3 },
      { xStart: 0.3, xEnd: 0.5 },
    ];
    const result = mergeSegments(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ xStart: 0.1, xEnd: 0.5 });
  });

  it("merges multiple overlapping segments into one", () => {
    const input = [
      { xStart: 0.0, xEnd: 0.4 },
      { xStart: 0.2, xEnd: 0.6 },
      { xStart: 0.5, xEnd: 0.8 },
    ];
    const result = mergeSegments(input);
    expect(result).toHaveLength(1);
    expect(result[0].xStart).toBeCloseTo(0.0);
    expect(result[0].xEnd).toBeCloseTo(0.8);
  });

  it("sorts segments before merging (handles out-of-order input)", () => {
    const input = [
      { xStart: 0.7, xEnd: 0.9 },
      { xStart: 0.1, xEnd: 0.3 },
      { xStart: 0.4, xEnd: 0.6 },
    ];
    const result = mergeSegments(input);
    expect(result[0].xStart).toBe(0.1);
    expect(result[result.length - 1].xEnd).toBe(0.9);
  });
});
