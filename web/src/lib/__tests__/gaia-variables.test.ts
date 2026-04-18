import { describe, expect, it } from "vitest";
import {
  getDailyGaiaVariablesSubject,
  toGaiaVariablesSubject,
  GAIA_VARIABLES_FALLBACK_SUBJECTS,
} from "../gaia-variables";

describe("gaia variables helpers", () => {
  it("returns a stable daily fallback subject for a given date", () => {
    const s1 = getDailyGaiaVariablesSubject("2026-04-25");
    const s2 = getDailyGaiaVariablesSubject("2026-04-25");
    expect(s1.id).toBe(s2.id);
  });

  it("normalizes a cached row into a playable subject", () => {
    const row = {
      game_date: "2026-04-25",
      source_id: "G-123",
      series: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      summary: "Ascending pattern",
      provenance_url: "https://gaia.esa.int",
      cadence_summary: "40 days",
      source_metadata: { title: "Gaia Star X" },
    };
    const subject = toGaiaVariablesSubject(row);
    expect(subject).not.toBeNull();
    expect(subject?.id).toBe("G-123");
    expect(subject?.title).toBe("Gaia Star X");
    expect(subject?.series).toHaveLength(2);
  });
});
