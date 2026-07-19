import { describe, expect, it } from "vitest";
import {
  scoreCloseApproachSubmission,
  toPublicCloseApproachRound,
  type CloseApproachCacheRow,
} from "./close-approaches";

const ROWS: CloseApproachCacheRow[] = [
  {
    game_date: "2028-06-26",
    mode: "closest-distance",
    source_record_id: "a",
    designation: "A",
    display_name: "Asteroid A",
    orbit_id: "1",
    close_approach_time: "2028-Jun-26 01:00",
    distance_au: 0.004,
    distance_ld: 1.557,
    distance_min_au: 0.003,
    distance_max_au: 0.005,
    relative_velocity_km_s: 12,
    absolute_magnitude_h: null,
    diameter_km: null,
    diameter_sigma_km: null,
    solution_rank: 4,
    source_url: "https://ssd-api.jpl.nasa.gov/cad.api",
    source_metadata: { sourceName: "NASA/JPL SBDB Close Approach Data API", sourceSignatureVersion: "1.5" },
  },
  {
    game_date: "2028-06-26",
    mode: "closest-distance",
    source_record_id: "b",
    designation: "B",
    display_name: "Asteroid B",
    orbit_id: "2",
    close_approach_time: "2028-Jun-26 02:00",
    distance_au: 0.001,
    distance_ld: 0.389,
    distance_min_au: null,
    distance_max_au: null,
    relative_velocity_km_s: 7,
    absolute_magnitude_h: 19,
    diameter_km: 0.34,
    diameter_sigma_km: 0.04,
    solution_rank: 1,
    source_url: "https://ssd-api.jpl.nasa.gov/cad.api",
    source_metadata: { sourceName: "NASA/JPL SBDB Close Approach Data API", sourceSignatureVersion: "1.5" },
  },
  {
    game_date: "2028-06-26",
    mode: "closest-distance",
    source_record_id: "c",
    designation: "C",
    display_name: "Asteroid C",
    orbit_id: "3",
    close_approach_time: "2028-Jun-26 03:00",
    distance_au: 0.002,
    distance_ld: 0.778,
    distance_min_au: null,
    distance_max_au: null,
    relative_velocity_km_s: 8,
    absolute_magnitude_h: null,
    diameter_km: null,
    diameter_sigma_km: null,
    solution_rank: 2,
    source_url: "https://ssd-api.jpl.nasa.gov/cad.api",
    source_metadata: { sourceName: "NASA/JPL SBDB Close Approach Data API", sourceSignatureVersion: "1.5" },
  },
  {
    game_date: "2028-06-26",
    mode: "closest-distance",
    source_record_id: "d",
    designation: "D",
    display_name: "Asteroid D",
    orbit_id: "4",
    close_approach_time: "2028-Jun-26 04:00",
    distance_au: 0.003,
    distance_ld: 1.168,
    distance_min_au: null,
    distance_max_au: null,
    relative_velocity_km_s: 9,
    absolute_magnitude_h: null,
    diameter_km: null,
    diameter_sigma_km: null,
    solution_rank: 3,
    source_url: "https://ssd-api.jpl.nasa.gov/cad.api",
    source_metadata: { sourceName: "NASA/JPL SBDB Close Approach Data API", sourceSignatureVersion: "1.5" },
  },
];

describe("toPublicCloseApproachRound", () => {
  it("returns a public payload without solution ranks or solved order", () => {
    const round = toPublicCloseApproachRound("2028-06-26", ROWS);

    expect(round.available).toBe(true);
    if (!round.available) throw new Error("expected available round");
    expect(round.records).toHaveLength(4);
    expect(round.records[0]).not.toHaveProperty("solution_rank");
    expect(round.records[0]).not.toHaveProperty("solutionRank");
    expect(round.records.map((record) => record.id)).not.toEqual(["b", "c", "d", "a"]);
  });

  it("returns a stable empty state for missing cache", () => {
    const round = toPublicCloseApproachRound("2028-06-26", []);

    expect(round).toMatchObject({
      available: false,
      date: "2028-06-26",
      mode: "closest-distance",
      reason: "missing-cache",
      records: [],
    });
  });

  it("returns insufficient-source-records when invalid rows drop below the floor", () => {
    const round = toPublicCloseApproachRound("2028-06-26", ROWS.slice(0, 3));

    expect(round.available).toBe(false);
    if (round.available) throw new Error("expected unavailable round");
    expect(round.reason).toBe("insufficient-source-records");
  });
});

describe("scoreCloseApproachSubmission", () => {
  it("scores a perfect ranking as 100", () => {
    const result = scoreCloseApproachSubmission("2028-06-26", ROWS, ["b", "c", "d", "a"]);

    expect(result.score).toBe(100);
    expect(result.exact).toBe(4);
    expect(result.near).toBe(0);
    expect(result.closest.id).toBe("b");
  });

  it("scores an adjacent swap with half credit", () => {
    const result = scoreCloseApproachSubmission("2028-06-26", ROWS, ["c", "b", "d", "a"]);

    expect(result.score).toBe(75);
    expect(result.exact).toBe(2);
    expect(result.near).toBe(2);
    expect(result.evaluations.map((row) => row.status)).toEqual(["near", "near", "correct", "correct"]);
  });

  it("rejects missing, duplicate, or unknown record ids", () => {
    expect(() => scoreCloseApproachSubmission("2028-06-26", ROWS, ["b", "c", "d"])).toThrow("every close-approach record");
    expect(() => scoreCloseApproachSubmission("2028-06-26", ROWS, ["b", "b", "d", "a"])).toThrow("every close-approach record");
    expect(() => scoreCloseApproachSubmission("2028-06-26", ROWS, ["b", "c", "d", "x"])).toThrow("unknown close-approach record");
  });
});
