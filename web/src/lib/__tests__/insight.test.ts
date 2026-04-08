import { describe, expect, it } from "vitest";
import {
  INSIGHT_FALLBACK_SOLS,
  computeSolRisks,
  computeWindows,
  getInsightAnswer,
  getInsightPuzzle,
  parseInsightFeed,
  scoreInsightWindow,
} from "../insight";

describe("insight puzzle generation", () => {
  it("returns a stable 7-sol puzzle for a given date", () => {
    const first = getInsightPuzzle("2026-03-26", INSIGHT_FALLBACK_SOLS);
    const second = getInsightPuzzle("2026-03-26", INSIGHT_FALLBACK_SOLS);

    expect(first.sols.map((sol) => sol.sol)).toEqual(second.sols.map((sol) => sol.sol));
    expect(first.sols).toHaveLength(7);
  });

  it("computes risk scores for each sol with values 0–100", () => {
    const risks = computeSolRisks(INSIGHT_FALLBACK_SOLS);
    expect(risks).toHaveLength(INSIGHT_FALLBACK_SOLS.length);
    for (const r of risks) {
      expect(r.riskScore).toBeGreaterThanOrEqual(0);
      expect(r.riskScore).toBeLessThanOrEqual(100);
      expect(r.windRisk).toBeGreaterThanOrEqual(0);
      expect(r.pressureRisk).toBeGreaterThanOrEqual(0);
      expect(r.tempRisk).toBeGreaterThanOrEqual(0);
    }
  });

  it("computes consecutive windows ranked by risk", () => {
    const risks = computeSolRisks(INSIGHT_FALLBACK_SOLS);
    const windows = computeWindows(risks);

    expect(windows).toHaveLength(INSIGHT_FALLBACK_SOLS.length - 1);

    const ranks = windows.map((w) => w.rank).sort((a, b) => a - b);
    expect(ranks[0]).toBe(1);
    expect(ranks[ranks.length - 1]).toBe(windows.length);

    // Rank 1 window has lowest risk
    const optimal = windows.find((w) => w.rank === 1)!;
    for (const w of windows) {
      expect(w.windowRisk).toBeGreaterThanOrEqual(optimal.windowRisk);
    }
  });

  it("getInsightAnswer returns an optimal window from the puzzle sols", () => {
    const answer = getInsightAnswer("2026-03-26", INSIGHT_FALLBACK_SOLS);
    const solIds = answer.puzzle.sols.map((s) => s.sol);

    expect(solIds).toContain(answer.optimalWindow.solA);
    expect(solIds).toContain(answer.optimalWindow.solB);
    expect(answer.optimalWindow.rank).toBe(1);
  });

  it("scores optimal window as 100, degrades by rank", () => {
    const answer = getInsightAnswer("2026-03-26", INSIGHT_FALLBACK_SOLS);
    const { allWindows, optimalWindow } = answer;

    expect(scoreInsightWindow(optimalWindow.solA, optimalWindow.solB, allWindows)).toBe(100);

    const rank2 = allWindows.find((w) => w.rank === 2);
    if (rank2) expect(scoreInsightWindow(rank2.solA, rank2.solB, allWindows)).toBe(75);

    expect(scoreInsightWindow("999", "1000", allWindows)).toBe(0);
  });

  it("parses valid sol rows and drops empty entries from the live feed shape", () => {
    const parsed = parseInsightFeed({
      sol_keys: ["1", "2"],
      "1": {
        Season: "winter",
        PRE: { av: 730.4, mn: 720.1, mx: 740.8, ct: 100 },
        AT: { av: -63.2, mn: -91.4, mx: -12.3, ct: 100 },
        HWS: { av: 8.1, mn: 1.2, mx: 16.8, ct: 100 },
      },
      "2": {},
    });

    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.sol).toBe("1");
    expect(parsed[0]?.pre.av).toBe(730.4);
  });
});
