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
  sourceName: string;
  projectUrl: string;
};

export type GaiaVariablesCacheRow = {
  game_date: string | null;
  source_id: string | number | null;
  series: GaiaVariablesPoint[] | null;
  summary: string | null;
  provenance_url: string | null;
  cadence_summary: string | null;
  source_metadata: unknown;
};

const PROJECT_URL = "https://www.zooniverse.org/projects?discipline=space"; // Placeholder until specific project found

export const GAIA_VARIABLES_FALLBACK_SUBJECTS: GaiaVariablesSubject[] = [
  {
    id: "GAIA-001",
    series: [
      { x: 0, y: 1 },
      { x: 0.5, y: 0.5 },
      { x: 1, y: 1 },
    ],
    title: "Gaia Light Curve",
    prompt: "What kind of variability pattern does this light curve show?",
    summary: "A standard variable star pattern.",
    provenanceUrl: null,
    cadenceSummary: "Standard 27-day cadence",
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
  const series = row.series || [];
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
    sourceName,
    projectUrl: PROJECT_URL,
  };
}
