import { resolveGameDate } from "@/lib/game";

export type LightcurvePoint = {
  x: number;
  y: number;
};

export type DailyAnomaly = {
  id: number;
  ticId: string;
  label: string;
  anomalyType: string | null;
  anomalySet: string | null;
  lightcurve: LightcurvePoint[];
  sourceName: string;
  sourceUrl: string;
  sourceMission: string | null;
  sourceSector: number | null;
  isSynthetic: boolean;
};

type AnomalyRow = {
  id: number | string;
  content: string | null;
  ticId: string | null;
  anomalytype: string | null;
  anomalySet: string | null;
  anomalyConfiguration: unknown;
};

type SourceInfo = Pick<DailyAnomaly, "sourceName" | "sourceUrl" | "sourceMission" | "sourceSector">;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDateSeed(dateKey: string): number {
  return hashString(resolveGameDate(dateKey));
}

export function generateSyntheticLightcurve(ticId: string, points = 320): LightcurvePoint[] {
  const seed = hashString(ticId);
  const base = 1 + (seed % 11) / 1000;
  const phase = (seed % 360) * (Math.PI / 180);

  const dipCenters = [
    0.18 + ((seed % 17) / 100),
    0.47 + (((seed >> 3) % 11) / 100),
    0.76 + (((seed >> 5) % 13) / 100),
  ].map((value) => Math.min(0.92, Math.max(0.08, value)));

  const dipDepths = [
    0.012 + (seed % 7) / 2000,
    0.007 + ((seed >> 2) % 7) / 2500,
    0.005 + ((seed >> 4) % 5) / 3000,
  ];

  const dipWidths = [
    0.018 + (seed % 5) / 1000,
    0.022 + ((seed >> 3) % 5) / 1000,
    0.026 + ((seed >> 5) % 5) / 1000,
  ];

  const rows: LightcurvePoint[] = [];
  for (let i = 0; i < points; i += 1) {
    const x = i / (points - 1);
    const wave = 0.0018 * Math.sin(2 * Math.PI * x * 4 + phase);
    const drift = 0.0008 * Math.sin(2 * Math.PI * x + phase * 0.5);
    const noiseSeed = hashString(`${ticId}:${i}`);
    const noise = ((noiseSeed % 200) - 100) / 100000;

    let y = base + wave + drift + noise;
    for (let j = 0; j < dipCenters.length; j += 1) {
      const dx = x - dipCenters[j];
      y -= dipDepths[j] * Math.exp(-((dx * dx) / (2 * dipWidths[j] * dipWidths[j])));
    }

    rows.push({
      x: Number(x.toFixed(5)),
      y: Number(y.toFixed(6)),
    });
  }

  return rows;
}

function toLightcurveFromConfig(value: unknown): LightcurvePoint[] | null {
  if (!value || typeof value !== "object") return null;
  const config = value as { lightcurve?: unknown };
  if (!Array.isArray(config.lightcurve)) return null;

  const parsed = config.lightcurve
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const point = row as { x?: unknown; y?: unknown };
      const x = Number(point.x);
      const y = Number(point.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      return { x, y };
    })
    .filter((row): row is LightcurvePoint => row !== null);

  return parsed.length >= 20 ? parsed : null;
}

function parseSourceInfo(value: unknown, ticId: string): SourceInfo {
  const fallback: SourceInfo = {
    sourceName: "MAST / TESS",
    sourceUrl: `https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html?searchQuery=${encodeURIComponent(`TIC ${ticId}`)}`,
    sourceMission: "TESS",
    sourceSector: null,
  };
  if (!value || typeof value !== "object") return fallback;

  const config = value as Record<string, unknown>;
  const sourceCandidate = config.source && typeof config.source === "object" ? (config.source as Record<string, unknown>) : null;
  const missionRaw =
    typeof config.mission === "string"
      ? config.mission
      : sourceCandidate && typeof sourceCandidate.mission === "string"
        ? sourceCandidate.mission
        : null;
  const sectorRaw =
    typeof config.sector === "number"
      ? config.sector
      : sourceCandidate && typeof sourceCandidate.sector === "number"
        ? sourceCandidate.sector
        : null;
  const sourceUrlRaw =
    typeof config.sourceUrl === "string"
      ? config.sourceUrl
      : typeof config.lightkurveUrl === "string"
        ? config.lightkurveUrl
        : typeof config.url === "string"
          ? config.url
          : sourceCandidate && typeof sourceCandidate.url === "string"
            ? sourceCandidate.url
            : sourceCandidate && typeof sourceCandidate.lightkurveUrl === "string"
              ? sourceCandidate.lightkurveUrl
              : null;
  const sourceNameRaw =
    typeof config.sourceName === "string"
      ? config.sourceName
      : sourceCandidate && typeof sourceCandidate.name === "string"
        ? sourceCandidate.name
        : null;

  return {
    sourceName: sourceNameRaw?.trim() || fallback.sourceName,
    sourceUrl: sourceUrlRaw?.trim() || fallback.sourceUrl,
    sourceMission: missionRaw?.trim() || fallback.sourceMission,
    sourceSector: Number.isFinite(sectorRaw) ? Number(sectorRaw) : null,
  };
}

export function toDailyAnomaly(row: AnomalyRow): DailyAnomaly {
  const id = Number(row.id);
  const ticId = (row.ticId ?? String(row.id)).replace(/^TIC\s*/i, "").trim();
  const label = row.content?.trim() || `TIC ${ticId}`;
  const configuredLightcurve = toLightcurveFromConfig(row.anomalyConfiguration);
  const lightcurve = configuredLightcurve ?? generateSyntheticLightcurve(ticId);
  const source = parseSourceInfo(row.anomalyConfiguration, ticId);

  return {
    id,
    ticId,
    label,
    anomalyType: row.anomalytype,
    anomalySet: row.anomalySet,
    lightcurve,
    sourceName: source.sourceName,
    sourceUrl: source.sourceUrl,
    sourceMission: source.sourceMission,
    sourceSector: source.sourceSector,
    isSynthetic: configuredLightcurve === null,
  };
}
