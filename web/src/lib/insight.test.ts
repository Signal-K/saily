import { describe, expect, it } from "vitest";
import { INSIGHT_FALLBACK_SOLS, getInsightAnswer, getInsightPuzzle, parseInsightFeed } from "./insight";

describe("insight puzzle generation", () => {
  it("returns a stable 5-sol puzzle for a given date", () => {
    const first = getInsightPuzzle("2026-03-26", INSIGHT_FALLBACK_SOLS);
    const second = getInsightPuzzle("2026-03-26", INSIGHT_FALLBACK_SOLS);

    expect(first.metric).toBe(second.metric);
    expect(first.sols.map((sol) => sol.sol)).toEqual(second.sols.map((sol) => sol.sol));
    expect(first.sols).toHaveLength(5);
  });

  it("chooses an answer from the presented sol window", () => {
    const answer = getInsightAnswer("2026-03-26", INSIGHT_FALLBACK_SOLS);

    expect(answer.puzzle.sols.map((sol) => sol.sol)).toContain(answer.answerSol);
    expect(["pressure", "temperature", "wind"]).toContain(answer.puzzle.metric);
    expect(typeof answer.baseline).toBe("number");
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
