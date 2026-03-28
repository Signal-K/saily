import { resolveGameDate } from "@/lib/game";

export type InsightMetric = "pressure" | "temperature" | "wind";

export type InsightMetricSummary = {
  av: number | null;
  mn: number | null;
  mx: number | null;
  ct: number | null;
};

export type InsightSol = {
  sol: string;
  season: string | null;
  northernSeason: string | null;
  southernSeason: string | null;
  firstUtc: string | null;
  lastUtc: string | null;
  at: InsightMetricSummary;
  pre: InsightMetricSummary;
  hws: InsightMetricSummary;
};

export type InsightPuzzle = {
  date: string;
  metric: InsightMetric;
  metricLabel: string;
  prompt: string;
  subtitle: string;
  sols: InsightSol[];
};

type RawInsightFeed = {
  sol_keys?: string[];
  [sol: string]: unknown;
};

type RawInsightSol = {
  Season?: string;
  Northern_season?: string;
  Southern_season?: string;
  First_UTC?: string;
  Last_UTC?: string;
  AT?: Partial<InsightMetricSummary>;
  PRE?: Partial<InsightMetricSummary>;
  HWS?: Partial<InsightMetricSummary>;
};

function metricSummary(raw?: Partial<InsightMetricSummary> | null): InsightMetricSummary {
  return {
    av: typeof raw?.av === "number" ? raw.av : null,
    mn: typeof raw?.mn === "number" ? raw.mn : null,
    mx: typeof raw?.mx === "number" ? raw.mx : null,
    ct: typeof raw?.ct === "number" ? raw.ct : null,
  };
}

export const INSIGHT_FALLBACK_SOLS: InsightSol[] = [
  {
    sol: "675",
    season: "fall",
    northernSeason: "early winter",
    southernSeason: "early summer",
    firstUtc: "2020-10-19T18:32:20Z",
    lastUtc: "2020-10-20T19:11:55Z",
    at: { av: -62.314, mn: -96.872, mx: -15.908, ct: 177556 },
    pre: { av: 750.563, mn: 722.0901, mx: 768.791, ct: 887776 },
    hws: { av: 7.233, mn: 1.051, mx: 22.455, ct: 88628 },
  },
  {
    sol: "676",
    season: "fall",
    northernSeason: "early winter",
    southernSeason: "early summer",
    firstUtc: "2020-10-20T19:11:55Z",
    lastUtc: "2020-10-21T19:51:31Z",
    at: { av: -62.812, mn: -96.912, mx: -16.499, ct: 177554 },
    pre: { av: 749.09, mn: 722.473, mx: 767.1426, ct: 887777 },
    hws: { av: 8.526, mn: 1.11, mx: 26.905, ct: 88250 },
  },
  {
    sol: "677",
    season: "fall",
    northernSeason: "mid winter",
    southernSeason: "mid summer",
    firstUtc: "2020-10-21T19:51:31Z",
    lastUtc: "2020-10-22T20:31:06Z",
    at: { av: -63.056, mn: -97.249, mx: -16.853, ct: 177556 },
    pre: { av: 748.698, mn: 720.5873, mx: 767.4249, ct: 887776 },
    hws: { av: 7.887, mn: 0.511, mx: 23.197, ct: 88610 },
  },
  {
    sol: "678",
    season: "fall",
    northernSeason: "mid winter",
    southernSeason: "mid summer",
    firstUtc: "2020-10-22T20:31:06Z",
    lastUtc: "2020-10-23T21:10:41Z",
    at: { av: -62.562, mn: -97.728, mx: -9.055, ct: 177556 },
    pre: { av: 743.741, mn: 717.7254, mx: 760.2834, ct: 887777 },
    hws: { av: 5.246, mn: 0.244, mx: 18.399, ct: 86963 },
  },
  {
    sol: "679",
    season: "fall",
    northernSeason: "mid winter",
    southernSeason: "mid summer",
    firstUtc: "2020-10-23T21:10:41Z",
    lastUtc: "2020-10-24T21:50:16Z",
    at: { av: -62.551, mn: -96.644, mx: -11.561, ct: 177554 },
    pre: { av: 744.529, mn: 719.4178, mx: 763.2724, ct: 887776 },
    hws: { av: 5.565, mn: 0.231, mx: 19.409000000000002, ct: 87171 },
  },
  {
    sol: "680",
    season: "fall",
    northernSeason: "mid winter",
    southernSeason: "mid summer",
    firstUtc: "2020-10-24T21:50:16Z",
    lastUtc: "2020-10-25T22:29:51Z",
    at: { av: -61.789, mn: -96.811, mx: -15.298, ct: 168902 },
    pre: { av: 743.99, mn: 717.1398, mx: 764.0093, ct: 887767 },
    hws: { av: 6.517, mn: 0.275, mx: 24.235, ct: 88478 },
  },
  {
    sol: "681",
    season: "fall",
    northernSeason: "mid winter",
    southernSeason: "mid summer",
    firstUtc: "2020-10-25T22:29:51Z",
    lastUtc: "2020-10-26T23:09:26Z",
    at: { av: -62.434, mn: -95.447, mx: -4.444, ct: 88778 },
    pre: { av: 743.55, mn: 718.463, mx: 760.2244, ct: 887777 },
    hws: { av: 5.632, mn: 0.228, mx: 18.577, ct: 87184 },
  },
];

export function parseInsightFeed(feed: RawInsightFeed): InsightSol[] {
  const sols = Array.isArray(feed.sol_keys) ? feed.sol_keys : [];
  return sols
    .map((sol) => {
      const row = feed[sol] as RawInsightSol | undefined;
      if (!row) return null;
      return {
        sol,
        season: row.Season ?? null,
        northernSeason: row.Northern_season ?? null,
        southernSeason: row.Southern_season ?? null,
        firstUtc: row.First_UTC ?? null,
        lastUtc: row.Last_UTC ?? null,
        at: metricSummary(row.AT),
        pre: metricSummary(row.PRE),
        hws: metricSummary(row.HWS),
      } satisfies InsightSol;
    })
    .filter((row): row is InsightSol => row !== null)
    .filter((row) => row.pre.av !== null || row.at.av !== null || row.hws.av !== null);
}

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function metricValue(sol: InsightSol, metric: InsightMetric) {
  if (metric === "pressure") return sol.pre.av;
  if (metric === "temperature") return sol.at.av;
  return sol.hws.av;
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length === 0) return 0;
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

function sortSolsAscending(sols: InsightSol[]) {
  return [...sols].sort((a, b) => Number(a.sol) - Number(b.sol));
}

function pickWindow(date: string, pool: InsightSol[], size = 5) {
  const sorted = sortSolsAscending(pool);
  if (sorted.length <= size) return sorted;
  const start = hashString(`${date}:window`) % (sorted.length - size + 1);
  return sorted.slice(start, start + size);
}

function pickMetric(date: string): InsightMetric {
  const metrics: InsightMetric[] = ["pressure", "temperature", "wind"];
  return metrics[hashString(`${date}:metric`) % metrics.length];
}

function metricLabel(metric: InsightMetric) {
  if (metric === "pressure") return "pressure";
  if (metric === "temperature") return "temperature";
  return "wind speed";
}

export function getInsightPuzzle(date?: string, pool: InsightSol[] = INSIGHT_FALLBACK_SOLS): InsightPuzzle {
  const dateKey = resolveGameDate(date);
  const sols = pickWindow(dateKey, pool, 5);
  const metric = pickMetric(dateKey);
  const label = metricLabel(metric);
  return {
    date: dateKey,
    metric,
    metricLabel: label,
    prompt: `Which Sol looks most anomalous for ${label} compared with the surrounding readings?`,
    subtitle: "Compare the average readings and pick the day that most likely disrupted route planning.",
    sols,
  };
}

export function getInsightAnswer(date?: string, pool: InsightSol[] = INSIGHT_FALLBACK_SOLS) {
  const puzzle = getInsightPuzzle(date, pool);
  const values = puzzle.sols.map((sol) => metricValue(sol, puzzle.metric)).filter((value): value is number => typeof value === "number");
  const baseline = median(values);

  let winner = puzzle.sols[0];
  let bestDelta = -1;
  puzzle.sols.forEach((sol) => {
    const value = metricValue(sol, puzzle.metric);
    const delta = typeof value === "number" ? Math.abs(value - baseline) : -1;
    if (delta > bestDelta) {
      bestDelta = delta;
      winner = sol;
    }
  });

  return {
    puzzle,
    answerSol: winner.sol,
    answerValue: metricValue(winner, puzzle.metric),
    baseline,
  };
}
