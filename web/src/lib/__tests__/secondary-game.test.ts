import { describe, expect, it } from "vitest";
import { ASTEROID_ANOMALIES } from "../secondary-game";

describe("ASTEROID_ANOMALIES", () => {
  it("contains exactly 3 entries", () => {
    expect(ASTEROID_ANOMALIES).toHaveLength(3);
  });

  it("each entry has all required fields as non-empty strings", () => {
    for (const anomaly of ASTEROID_ANOMALIES) {
      expect(typeof anomaly.id).toBe("string");
      expect(anomaly.id.length).toBeGreaterThan(0);

      expect(typeof anomaly.title).toBe("string");
      expect(anomaly.title.length).toBeGreaterThan(0);

      expect(typeof anomaly.ticId).toBe("string");
      expect(anomaly.ticId.length).toBeGreaterThan(0);

      expect(typeof anomaly.mission).toBe("string");
      expect(anomaly.mission.length).toBeGreaterThan(0);

      expect(typeof anomaly.imagePath).toBe("string");
      expect(anomaly.imagePath.length).toBeGreaterThan(0);

      expect(typeof anomaly.imageAlt).toBe("string");
      expect(anomaly.imageAlt.length).toBeGreaterThan(0);
    }
  });

  it("all ids are unique", () => {
    const ids = ASTEROID_ANOMALIES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all missions are TESS", () => {
    for (const anomaly of ASTEROID_ANOMALIES) {
      expect(anomaly.mission).toBe("TESS");
    }
  });

  it("all image paths start with /", () => {
    for (const anomaly of ASTEROID_ANOMALIES) {
      expect(anomaly.imagePath).toMatch(/^\//);
    }
  });

  it("all ticIds are numeric strings", () => {
    for (const anomaly of ASTEROID_ANOMALIES) {
      expect(anomaly.ticId).toMatch(/^\d+$/);
    }
  });
});
