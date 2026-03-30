import { resolveGameDate } from "@/lib/game";

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

export type InsightSolRisk = {
  sol: string;
  riskScore: number;    // 0–100, higher = more dangerous
  windRisk: number;     // 0–100
  pressureRisk: number; // 0–100
  tempRisk: number;     // 0–100
};

export type InsightWindow = {
  solA: string;
  solB: string;
  windowRisk: number; // average risk of both sols
  rank: number;       // 1 = safest
};

export type InsightPuzzle = {
  date: string;
  prompt: string;
  subtitle: string;
  sols: InsightSol[];
};

export type InsightAnswerResult = {
  puzzle: InsightPuzzle;
  solRisks: InsightSolRisk[];
  allWindows: InsightWindow[];
  optimalWindow: InsightWindow;
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
    hws: { av: 5.565, mn: 0.231, mx: 19.409, ct: 87171 },
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

function sortSolsAscending(sols: InsightSol[]) {
  return [...sols].sort((a, b) => Number(a.sol) - Number(b.sol));
}

function pickWindow(date: string, pool: InsightSol[], size = 7) {
  const sorted = sortSolsAscending(pool);
  if (sorted.length <= size) return sorted;
  const start = hashString(`${date}:window`) % (sorted.length - size + 1);
  return sorted.slice(start, start + size);
}

function safeVal(v: number | null | undefined, fallback: number): number {
  return typeof v === "number" ? v : fallback;
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

// Risk factors per sol:
//   Wind hazard    (40%): peak gust (hws.mx) — higher = more dangerous
//   Pressure churn (40%): daily range (pre.mx - pre.mn) — larger = more unstable
//   Temp floor     (20%): daily minimum (at.mn) — colder = harder on hardware
export function computeSolRisks(sols: InsightSol[]): InsightSolRisk[] {
  const windPeaks = sols.map((s) => safeVal(s.hws.mx, safeVal(s.hws.av, 0)));
  const windMin = Math.min(...windPeaks);
  const windMax = Math.max(...windPeaks);

  const presRanges = sols.map(
    (s) => safeVal(s.pre.mx, safeVal(s.pre.av, 0)) - safeVal(s.pre.mn, safeVal(s.pre.av, 0)),
  );
  const presMin = Math.min(...presRanges);
  const presMax = Math.max(...presRanges);

  // Lower min temp = more dangerous, so invert: coldest maps to risk 1.0
  const tempMins = sols.map((s) => safeVal(s.at.mn, safeVal(s.at.av, 0)));
  const tempFloorMin = Math.min(...tempMins); // coldest (highest risk)
  const tempFloorMax = Math.max(...tempMins); // warmest (lowest risk)

  return sols.map((sol, i) => {
    const windNorm = normalize(windPeaks[i]!, windMin, windMax);
    const presNorm = normalize(presRanges[i]!, presMin, presMax);
    // Invert: normalize against swapped min/max so colder = higher score
    const tempNorm = normalize(tempMins[i]!, tempFloorMax, tempFloorMin);

    const riskScore = (windNorm * 0.4 + presNorm * 0.4 + tempNorm * 0.2) * 100;
    return {
      sol: sol.sol,
      riskScore: Math.round(riskScore * 10) / 10,
      windRisk: Math.round(windNorm * 1000) / 10,
      pressureRisk: Math.round(presNorm * 1000) / 10,
      tempRisk: Math.round(tempNorm * 1000) / 10,
    };
  });
}

export function computeWindows(solRisks: InsightSolRisk[]): InsightWindow[] {
  const raw: Omit<InsightWindow, "rank">[] = [];
  for (let i = 0; i < solRisks.length - 1; i++) {
    raw.push({
      solA: solRisks[i]!.sol,
      solB: solRisks[i + 1]!.sol,
      windowRisk: Math.round(((solRisks[i]!.riskScore + solRisks[i + 1]!.riskScore) / 2) * 10) / 10,
    });
  }
  const sorted = [...raw].sort((a, b) => a.windowRisk - b.windowRisk);
  return raw.map((w) => ({
    ...w,
    rank: sorted.findIndex((s) => s.solA === w.solA && s.solB === w.solB) + 1,
  }));
}

export function scoreInsightWindow(selectedSolA: string, selectedSolB: string, allWindows: InsightWindow[]): number {
  const selected = allWindows.find((w) => w.solA === selectedSolA && w.solB === selectedSolB);
  if (!selected) return 0;
  if (selected.rank === 1) return 100;
  if (selected.rank === 2) return 75;
  if (selected.rank === 3) return 50;
  return 25;
}

export function getInsightPuzzle(date?: string, pool: InsightSol[] = INSIGHT_FALLBACK_SOLS): InsightPuzzle {
  const dateKey = resolveGameDate(date);
  const sols = pickWindow(dateKey, pool, 7);
  return {
    date: dateKey,
    prompt: "Select the safest 2-Sol transit window for the surface unit.",
    subtitle:
      "Check wind peaks, pressure swings, and temperature floors. Pick two consecutive Sols that give the rover the clearest run.",
    sols,
  };
}

export function getInsightAnswer(date?: string, pool: InsightSol[] = INSIGHT_FALLBACK_SOLS): InsightAnswerResult {
  const puzzle = getInsightPuzzle(date, pool);
  const solRisks = computeSolRisks(puzzle.sols);
  const allWindows = computeWindows(solRisks);
  const optimalWindow = allWindows.find((w) => w.rank === 1) ?? allWindows[0]!;
  return { puzzle, solRisks, allWindows, optimalWindow };
}
