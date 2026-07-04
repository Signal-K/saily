import { resolveGameDate } from "@/lib/game";

export type GaiaVariablesPoint = {
  x: number;
  y: number;
};

export type GaiaVariablesSubject = {
  id: string;
  series: GaiaVariablesPoint[];
  title: string;
  prompt: string;
  summary: string | null;
  provenanceUrl: string | null;
  cadenceSummary: string | null;
  classHints: string[];
  sourceName: string;
  projectUrl: string;
};

export type GaiaVariablesCacheRow = {
  game_date: string | null;
  source_id: string | number | null;
  series_payload: GaiaVariablesPoint[] | null;
  summary: string | null;
  provenance_url: string | null;
  cadence_summary: string | null;
  class_hints?: string[] | null;
  source_metadata: unknown;
};

const PROJECT_URL = "https://www.zooniverse.org/projects?discipline=space"; // Placeholder until specific project found

// Synthetic representative light curve standing in for real Gaia Archive data
// (per ticket gm9ltt AC #3: "representative variable-star data", not an image).
// Shape: a classic Cepheid-style periodic brightness curve — fast rise, slow decline,
// asymmetric sawtooth-ish profile — sampled at 20 phase points over one cycle (x: phase 0-1,
// y: normalized relative brightness). This is NOT real Gaia photometry; it is a plausible
// stand-in until real cache rows exist (see populate-rubin-gaia-cache-tables.md).
const CEPHEID_LIKE_SERIES: GaiaVariablesPoint[] = Array.from({ length: 20 }, (_, i) => {
  const phase = i / 20;
  // Fast rise (steep sine rise for phase < 0.3), slower asymmetric decline after.
  const y =
    phase < 0.3
      ? 0.6 + 0.4 * Math.sin((phase / 0.3) * (Math.PI / 2))
      : 1.0 - 0.5 * ((phase - 0.3) / 0.7) ** 0.7;
  return { x: Number(phase.toFixed(3)), y: Number(y.toFixed(3)) };
});

export const GAIA_VARIABLES_FALLBACK_SUBJECTS: GaiaVariablesSubject[] = [
  {
    id: "GAIA-001",
    series: CEPHEID_LIKE_SERIES,
    title: "Gaia Light Curve",
    prompt: "What kind of variability pattern does this light curve show?",
    summary: "A representative Cepheid-like periodic brightness curve (synthetic, not real Gaia photometry).",
    provenanceUrl: null,
    cadenceSummary: "Standard 27-day cadence",
    classHints: ["cepheid"],
    sourceName: "Gaia Archive",
    projectUrl: PROJECT_URL,
  },
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededPick<T>(array: T[], seed: number): T {
  return array[seed % array.length];
}

export function getDailyGaiaVariablesSubject(
  date?: string,
  pool: GaiaVariablesSubject[] = GAIA_VARIABLES_FALLBACK_SUBJECTS,
): GaiaVariablesSubject {
  const dateKey = resolveGameDate(date);
  return seededPick(pool, hashString(dateKey));
}

export function toGaiaVariablesSubject(row: GaiaVariablesCacheRow): GaiaVariablesSubject | null {
  const sourceId = row.source_id == null ? "" : String(row.source_id).trim();
  const series = row.series_payload || [];
  if (!sourceId || series.length === 0) return null;

  const metadata = row.source_metadata && typeof row.source_metadata === "object"
    ? (row.source_metadata as Record<string, unknown>)
    : null;

  const title = typeof metadata?.title === "string" ? metadata.title.trim() : `Gaia Variable ${sourceId}`;
  const sourceName = typeof metadata?.sourceName === "string" ? metadata.sourceName.trim() : "Gaia Archive";
  const prompt =
    typeof metadata?.prompt === "string" && metadata.prompt.trim()
      ? metadata.prompt.trim()
      : "What kind of variability pattern does this light curve show?";

  return {
    id: sourceId,
    series,
    title,
    prompt,
    summary: row.summary?.trim() || null,
    provenanceUrl: row.provenance_url?.trim() || null,
    cadenceSummary: row.cadence_summary?.trim() || null,
    classHints: Array.isArray(row.class_hints)
      ? row.class_hints.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      : [],
    sourceName,
    projectUrl: PROJECT_URL,
  };
}
