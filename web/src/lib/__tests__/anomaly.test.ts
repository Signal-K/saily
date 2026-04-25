import { describe, expect, it } from "vitest";
import { getDateSeed, generateSyntheticLightcurve, toDailyAnomaly } from "../anomaly";

describe("getDateSeed", () => {
  it("returns a non-negative integer", () => {
    const seed = getDateSeed("2024-01-01");
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
  });

  it("is deterministic for the same date key", () => {
    expect(getDateSeed("2024-06-15")).toBe(getDateSeed("2024-06-15"));
  });

  it("produces different seeds for different past dates", () => {
    const seeds = new Set([
      getDateSeed("2024-01-01"),
      getDateSeed("2024-01-02"),
      getDateSeed("2024-03-10"),
      getDateSeed("2024-07-04"),
    ]);
    expect(seeds.size).toBeGreaterThan(1);
  });

  it("clamps future dates to today (returns same seed as today)", () => {
    // Both future dates resolve to today's date key, so they produce the same seed.
    expect(getDateSeed("2099-01-01")).toBe(getDateSeed("2099-12-31"));
  });
});

describe("generateSyntheticLightcurve", () => {
  it("returns 320 points by default", () => {
    const curve = generateSyntheticLightcurve("12345");
    expect(curve).toHaveLength(320);
  });

  it("returns the requested number of points", () => {
    expect(generateSyntheticLightcurve("abc", 50)).toHaveLength(50);
    expect(generateSyntheticLightcurve("abc", 100)).toHaveLength(100);
  });

  it("each point has finite x and y values", () => {
    const curve = generateSyntheticLightcurve("99999");
    for (const pt of curve) {
      expect(Number.isFinite(pt.x)).toBe(true);
      expect(Number.isFinite(pt.y)).toBe(true);
    }
  });

  it("x values span from 0 to 1", () => {
    const curve = generateSyntheticLightcurve("42");
    expect(curve[0].x).toBe(0);
    expect(curve[curve.length - 1].x).toBe(1);
  });

  it("x values are monotonically non-decreasing", () => {
    const curve = generateSyntheticLightcurve("hello");
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].x).toBeGreaterThanOrEqual(curve[i - 1].x);
    }
  });

  it("is deterministic for the same ticId", () => {
    const a = generateSyntheticLightcurve("TIC-67890");
    const b = generateSyntheticLightcurve("TIC-67890");
    expect(a).toEqual(b);
  });

  it("produces different curves for different ticIds", () => {
    const a = generateSyntheticLightcurve("1111111");
    const b = generateSyntheticLightcurve("2222222");
    expect(a[100].y).not.toBe(b[100].y);
  });

  it("y values are close to 1.0 (normalized flux)", () => {
    const curve = generateSyntheticLightcurve("flux-test");
    const ys = curve.map((p) => p.y);
    const avg = ys.reduce((s, v) => s + v, 0) / ys.length;
    expect(avg).toBeGreaterThan(0.98);
    expect(avg).toBeLessThan(1.02);
  });
});

describe("toDailyAnomaly", () => {
  const makeRow = (overrides: Partial<Parameters<typeof toDailyAnomaly>[0]> = {}) => ({
    id: 42,
    content: "My Anomaly",
    ticId: "12345678",
    anomalytype: "transit",
    anomalySet: "tess-s1",
    anomalyConfiguration: null,
    ...overrides,
  });

  describe("isSynthetic flag", () => {
    it("is true when anomalyConfiguration is null", () => {
      const result = toDailyAnomaly(makeRow({ anomalyConfiguration: null }));
      expect(result.isSynthetic).toBe(true);
    });

    it("is false when a valid lightcurve (>=20 points) is in the configuration", () => {
      const lightcurve = Array.from({ length: 25 }, (_, i) => ({ x: i / 24, y: 1.0 }));
      const result = toDailyAnomaly(makeRow({ anomalyConfiguration: { lightcurve } }));
      expect(result.isSynthetic).toBe(false);
      expect(result.lightcurve).toEqual(lightcurve);
    });

    it("is true when lightcurve has fewer than 20 valid points", () => {
      const lightcurve = Array.from({ length: 19 }, (_, i) => ({ x: i / 18, y: 1.0 }));
      const result = toDailyAnomaly(makeRow({ anomalyConfiguration: { lightcurve } }));
      expect(result.isSynthetic).toBe(true);
    });

    it("is true when lightcurve contains non-finite values (filtered below threshold)", () => {
      const lightcurve = [
        { x: NaN, y: 1.0 },
        ...Array.from({ length: 10 }, (_, i) => ({ x: i / 9, y: 1.0 })),
      ];
      const result = toDailyAnomaly(makeRow({ anomalyConfiguration: { lightcurve } }));
      expect(result.isSynthetic).toBe(true);
    });
  });

  describe("ticId parsing", () => {
    it("strips 'TIC ' prefix (case insensitive)", () => {
      expect(toDailyAnomaly(makeRow({ ticId: "TIC 12345" })).ticId).toBe("12345");
      expect(toDailyAnomaly(makeRow({ ticId: "tic 99999" })).ticId).toBe("99999");
    });

    it("uses row.id as ticId when ticId is null", () => {
      const result = toDailyAnomaly(makeRow({ id: 777, ticId: null }));
      expect(result.ticId).toBe("777");
    });

    it("preserves ticId when no prefix", () => {
      expect(toDailyAnomaly(makeRow({ ticId: "98765432" })).ticId).toBe("98765432");
    });
  });

  describe("label parsing", () => {
    it("uses content as label when present", () => {
      const result = toDailyAnomaly(makeRow({ content: "Star flicker", ticId: "111" }));
      expect(result.label).toBe("Star flicker");
    });

    it("defaults to 'TIC {ticId}' when content is null", () => {
      const result = toDailyAnomaly(makeRow({ content: null, ticId: "55555" }));
      expect(result.label).toBe("TIC 55555");
    });

    it("defaults label when content is whitespace-only", () => {
      const result = toDailyAnomaly(makeRow({ content: "   ", ticId: "44444" }));
      expect(result.label).toBe("TIC 44444");
    });
  });

  describe("source info — fallback defaults", () => {
    it("uses MAST/TESS defaults when anomalyConfiguration is null", () => {
      const result = toDailyAnomaly(makeRow({ ticId: "11111", anomalyConfiguration: null }));
      expect(result.sourceName).toBe("MAST / TESS");
      expect(result.sourceMission).toBe("TESS");
      expect(result.sourceSector).toBeNull();
      expect(result.sourceUrl).toContain("TIC%2011111");
    });

    it("uses MAST/TESS defaults when config has no source fields", () => {
      const result = toDailyAnomaly(makeRow({ ticId: "22222", anomalyConfiguration: {} }));
      expect(result.sourceName).toBe("MAST / TESS");
    });
  });

  describe("source info — config.sourceUrl chain", () => {
    it("prefers config.sourceUrl", () => {
      const result = toDailyAnomaly(makeRow({
        anomalyConfiguration: { sourceUrl: "https://direct.example.com", lightkurveUrl: "https://other.com" },
      }));
      expect(result.sourceUrl).toBe("https://direct.example.com");
    });

    it("falls back to config.lightkurveUrl", () => {
      const result = toDailyAnomaly(makeRow({
        anomalyConfiguration: { lightkurveUrl: "https://lightkurve.example.com" },
      }));
      expect(result.sourceUrl).toBe("https://lightkurve.example.com");
    });

    it("falls back to config.url", () => {
      const result = toDailyAnomaly(makeRow({
        anomalyConfiguration: { url: "https://url.example.com" },
      }));
      expect(result.sourceUrl).toBe("https://url.example.com");
    });

    it("falls back to config.source.url", () => {
      const result = toDailyAnomaly(makeRow({
        anomalyConfiguration: { source: { url: "https://source-url.example.com" } },
      }));
      expect(result.sourceUrl).toBe("https://source-url.example.com");
    });

    it("falls back to config.source.lightkurveUrl", () => {
      const result = toDailyAnomaly(makeRow({
        anomalyConfiguration: { source: { lightkurveUrl: "https://source-lk.example.com" } },
      }));
      expect(result.sourceUrl).toBe("https://source-lk.example.com");
    });

    it("falls back to MAST default when no URL is found", () => {
      const result = toDailyAnomaly(makeRow({
        ticId: "33333",
        anomalyConfiguration: { somethingElse: true },
      }));
      expect(result.sourceUrl).toContain("mast.stsci.edu");
    });
  });

  describe("source info — sourceName", () => {
    it("reads config.sourceName directly", () => {
      const result = toDailyAnomaly(makeRow({ anomalyConfiguration: { sourceName: "Custom Source" } }));
      expect(result.sourceName).toBe("Custom Source");
    });

    it("falls back to config.source.name", () => {
      const result = toDailyAnomaly(makeRow({
        anomalyConfiguration: { source: { name: "Nested Source" } },
      }));
      expect(result.sourceName).toBe("Nested Source");
    });

    it("falls back to MAST/TESS when no name is found", () => {
      const result = toDailyAnomaly(makeRow({ anomalyConfiguration: {} }));
      expect(result.sourceName).toBe("MAST / TESS");
    });
  });

  describe("source info — mission and sector", () => {
    it("reads config.mission", () => {
      const result = toDailyAnomaly(makeRow({ anomalyConfiguration: { mission: "Kepler" } }));
      expect(result.sourceMission).toBe("Kepler");
    });

    it("falls back to config.source.mission", () => {
      const result = toDailyAnomaly(makeRow({
        anomalyConfiguration: { source: { mission: "K2" } },
      }));
      expect(result.sourceMission).toBe("K2");
    });

    it("reads config.sector as a number", () => {
      const result = toDailyAnomaly(makeRow({ anomalyConfiguration: { sector: 7 } }));
      expect(result.sourceSector).toBe(7);
    });

    it("returns null for non-finite sector", () => {
      const result = toDailyAnomaly(makeRow({ anomalyConfiguration: { sector: NaN } }));
      expect(result.sourceSector).toBeNull();
    });

    it("falls back to config.source.sector", () => {
      const result = toDailyAnomaly(makeRow({
        anomalyConfiguration: { source: { sector: 42 } },
      }));
      expect(result.sourceSector).toBe(42);
    });
  });

  describe("base fields", () => {
    it("converts id to number", () => {
      const result = toDailyAnomaly(makeRow({ id: "100" }));
      expect(result.id).toBe(100);
    });

    it("passes through anomalyType and anomalySet", () => {
      const result = toDailyAnomaly(makeRow({ anomalytype: "transit", anomalySet: "set-a" }));
      expect(result.anomalyType).toBe("transit");
      expect(result.anomalySet).toBe("set-a");
    });
  });
});
