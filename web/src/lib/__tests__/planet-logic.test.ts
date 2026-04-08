import { describe, expect, it } from "vitest";
import {
  toDisplayPoints,
  mergeSegments,
  projectAnnotationToView,
  TOTAL_DAYS,
  type Annotation,
} from "../planet-logic";

describe("planet-logic", () => {
  describe("toDisplayPoints", () => {
    const mockCurve = [
      { x: 0, y: 1 },
      { x: 0.5, y: 0.9 },
      { x: 1, y: 1 },
    ];

    it("normalizes x to TOTAL_DAYS when phaseFold is false", () => {
      const result = toDisplayPoints(mockCurve, { phaseFold: false, bin: false, periodDays: 2 });
      expect(result[0].x).toBe(0);
      expect(result[1].x).toBe(0.5);
      expect(result[2].x).toBe(1);
    });

    it("folds points into phase [0, 1] based on period", () => {
      // TOTAL_DAYS is 27. If period is 9, we have 3 cycles.
      // x=0.5 -> day 13.5. 13.5 % 9 = 4.5. Phase = 4.5 / 9 = 0.5.
      const result = toDisplayPoints(mockCurve, { phaseFold: true, bin: false, periodDays: 9 });
      // Points are sorted by x, so we check if 0.5 is present.
      const phases = result.map(p => p.x);
      expect(phases).toContain(0.5);
      expect(phases.every(x => x >= 0 && x < 1)).toBe(true);
    });

    it("bins data points into a fixed number of buckets", () => {
      const manyPoints = Array.from({ length: 200 }, (_, i) => ({ x: i / 199, y: 1 }));
      const result = toDisplayPoints(manyPoints, { phaseFold: false, bin: true, periodDays: 2 });
      // Bins are fixed at 70 in toDisplayPoints
      expect(result.length).toBeLessThanOrEqual(70);
    });
  });

  describe("mergeSegments", () => {
    it("merges overlapping segments", () => {
      const input = [
        { xStart: 0.1, xEnd: 0.3 },
        { xStart: 0.2, xEnd: 0.4 },
        { xStart: 0.6, xEnd: 0.7 },
      ];
      const result = mergeSegments(input);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ xStart: 0.1, xEnd: 0.4 });
      expect(result[1]).toEqual({ xStart: 0.6, xEnd: 0.7 });
    });

    it("handles out of order segments", () => {
      const input = [
        { xStart: 0.6, xEnd: 0.7 },
        { xStart: 0.1, xEnd: 0.3 },
      ];
      const result = mergeSegments(input);
      expect(result[0].xStart).toBe(0.1);
      expect(result[1].xStart).toBe(0.6);
    });
  });

  describe("projectAnnotationToView", () => {
    const mockAnnotation: Annotation = {
      id: "1",
      xStart: 0.1, // Day 2.7
      xEnd: 0.2,   // Day 5.4
      confidence: 100,
      tag: "Transit dip",
      coordinateMode: "time",
    };

    it("projects time interval to phase segments (may merge if overlapping in phase)", () => {
      // Day 2.7 to 5.4. If period is 5 days:
      // Cycle 1 (0-5): overlap [2.7, 5] -> phase [2.7/5, 1.0] = [0.54, 1.0]
      // Cycle 2 (5-10): overlap [5, 5.4] -> phase [0, 0.4/5] = [0, 0.08]
      // These do NOT overlap in phase.
      const result = projectAnnotationToView(mockAnnotation, { phaseFold: true, periodDays: 5 });
      expect(result).toHaveLength(2);
      
      const seg1 = result.find(s => s.xStart > 0.5)!;
      const seg2 = result.find(s => s.xStart < 0.1)!;
      
      expect(seg1.xStart).toBeCloseTo(0.54);
      expect(seg1.xEnd).toBeCloseTo(1.0);
      expect(seg2.xStart).toBeCloseTo(0.0);
      expect(seg2.xEnd).toBeCloseTo(0.08);
    });

    it("projects phase interval back to multiple time segments", () => {
      const phaseAnnotation: Annotation = {
        ...mockAnnotation,
        coordinateMode: "phase",
        xStart: 0.1,
        xEnd: 0.2,
        sourcePeriodDays: 10,
      };
      // Period 10. Phase 0.1-0.2 is Day 1-2.
      // TOTAL_DAYS 27.
      // Cycle 1: Day 1-2.
      // Cycle 2: Day 11-12.
      // Cycle 3: Day 21-22.
      const result = projectAnnotationToView(phaseAnnotation, { phaseFold: false, periodDays: 10 });
      expect(result).toHaveLength(3);
      // Day 1-2 is 1/27 to 2/27
      expect(result[0].xStart).toBeCloseTo(1 / 27);
      expect(result[1].xStart).toBeCloseTo(11 / 27);
      expect(result[2].xStart).toBeCloseTo(21 / 27);
    });
  });
});
