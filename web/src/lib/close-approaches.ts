export const CLOSE_APPROACH_ROUND_MIN_RECORDS = 4;
export const CLOSE_APPROACH_MODE = "closest-distance" as const;

export type CloseApproachMode = typeof CLOSE_APPROACH_MODE;

export type CloseApproachCacheRow = {
  game_date: string;
  mode: CloseApproachMode | string;
  source_record_id: string;
  designation: string;
  display_name: string;
  orbit_id: string;
  close_approach_time: string;
  distance_au: number;
  distance_ld: number;
  distance_min_au: number | null;
  distance_max_au: number | null;
  relative_velocity_km_s: number;
  absolute_magnitude_h: number | null;
  diameter_km: number | null;
  diameter_sigma_km: number | null;
  solution_rank: number;
  source_url: string;
  source_metadata: Record<string, unknown> | null;
};

export type PublicCloseApproachRecord = {
  id: string;
  designation: string;
  displayName: string;
  closeApproachTime: string;
  distanceAu: number;
  distanceLd: number;
  distanceMinAu: number | null;
  distanceMaxAu: number | null;
  relativeVelocityKmS: number;
  absoluteMagnitudeH: number | null;
  diameterKm: number | null;
  sourceUrl: string;
};

export type CloseApproachEvaluation = PublicCloseApproachRecord & {
  correctRank: number;
  submittedRank: number;
  status: "correct" | "near" | "moved";
};

export type CloseApproachSubmitResult = {
  date: string;
  mode: CloseApproachMode;
  score: number;
  exact: number;
  near: number;
  total: number;
  closest: PublicCloseApproachRecord;
  evaluations: CloseApproachEvaluation[];
  sourceName: string;
  sourceSignatureVersion: string | null;
};

export type PublicCloseApproachRound =
  | {
      available: true;
      date: string;
      mode: CloseApproachMode;
      prompt: string;
      records: PublicCloseApproachRecord[];
      sourceName: string;
      sourceSignatureVersion: string | null;
    }
  | {
      available: false;
      date: string;
      mode: CloseApproachMode;
      reason: "missing-cache" | "insufficient-source-records";
      records: [];
      message: string;
    };

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function publicSortKey(date: string, row: CloseApproachCacheRow): number {
  return hashString(`${date}:${row.source_record_id}`);
}

function isValidRow(row: CloseApproachCacheRow): boolean {
  return Boolean(
    row.source_record_id &&
      row.designation &&
      row.close_approach_time &&
      Number.isFinite(row.distance_au) &&
      Number.isFinite(row.distance_ld) &&
      Number.isFinite(row.relative_velocity_km_s),
  );
}

function sourceMetadataValue(row: CloseApproachCacheRow, key: string): string | null {
  const value = row.source_metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function toPublicRecord(row: CloseApproachCacheRow): PublicCloseApproachRecord {
  return {
    id: row.source_record_id,
    designation: row.designation,
    displayName: row.display_name,
    closeApproachTime: row.close_approach_time,
    distanceAu: row.distance_au,
    distanceLd: row.distance_ld,
    distanceMinAu: row.distance_min_au,
    distanceMaxAu: row.distance_max_au,
    relativeVelocityKmS: row.relative_velocity_km_s,
    absoluteMagnitudeH: row.absolute_magnitude_h,
    diameterKm: row.diameter_km,
    sourceUrl: row.source_url,
  };
}

export function toPublicCloseApproachRound(date: string, rows: CloseApproachCacheRow[]): PublicCloseApproachRound {
  const validRows = rows.filter(isValidRow);
  if (validRows.length < CLOSE_APPROACH_ROUND_MIN_RECORDS) {
    return {
      available: false,
      date,
      mode: CLOSE_APPROACH_MODE,
      reason: validRows.length === 0 ? "missing-cache" : "insufficient-source-records",
      records: [],
      message: "No close-approach desk is cached for this date yet.",
    };
  }

  const sortedForPlay = [...validRows].sort((a, b) => {
    const aKey = publicSortKey(date, a);
    const bKey = publicSortKey(date, b);
    if (aKey !== bKey) return aKey - bKey;
    return a.source_record_id.localeCompare(b.source_record_id);
  });
  const first = validRows[0];

  return {
    available: true,
    date,
    mode: CLOSE_APPROACH_MODE,
    prompt: "Rank these close approaches from closest to farthest.",
    sourceName: sourceMetadataValue(first, "sourceName") ?? "NASA/JPL SBDB Close Approach Data API",
    sourceSignatureVersion: sourceMetadataValue(first, "sourceSignatureVersion"),
    records: sortedForPlay.map(toPublicRecord),
  };
}

export function scoreCloseApproachSubmission(
  date: string,
  rows: CloseApproachCacheRow[],
  submittedIds: string[],
): CloseApproachSubmitResult {
  const validRows = rows.filter(isValidRow).sort((a, b) => a.solution_rank - b.solution_rank);
  if (validRows.length < CLOSE_APPROACH_ROUND_MIN_RECORDS) {
    throw new Error("No publishable close-approach round is cached for this date.");
  }

  const expectedIds = new Set(validRows.map((row) => row.source_record_id));
  const submittedSet = new Set(submittedIds);
  if (submittedIds.length !== validRows.length || submittedSet.size !== validRows.length) {
    throw new Error("Submitted ranking must include every close-approach record exactly once.");
  }
  for (const id of submittedIds) {
    if (!expectedIds.has(id)) {
      throw new Error("Submitted ranking contains an unknown close-approach record.");
    }
  }

  const correctRankById = new Map(validRows.map((row, index) => [row.source_record_id, index + 1]));
  const rowById = new Map(validRows.map((row) => [row.source_record_id, row]));
  let points = 0;
  let exact = 0;
  let near = 0;

  const evaluations = submittedIds.map((id, index) => {
    const submittedRank = index + 1;
    const correctRank = correctRankById.get(id) ?? submittedRank;
    const distance = Math.abs(correctRank - submittedRank);
    let status: CloseApproachEvaluation["status"] = "moved";
    if (distance === 0) {
      status = "correct";
      points += 1;
      exact += 1;
    } else if (distance === 1) {
      status = "near";
      points += 0.5;
      near += 1;
    }

    return {
      ...toPublicRecord(rowById.get(id) as CloseApproachCacheRow),
      correctRank,
      submittedRank,
      status,
    };
  });

  const first = validRows[0];
  return {
    date,
    mode: CLOSE_APPROACH_MODE,
    score: Math.round((points / validRows.length) * 100),
    exact,
    near,
    total: validRows.length,
    closest: toPublicRecord(first),
    evaluations,
    sourceName: sourceMetadataValue(first, "sourceName") ?? "NASA/JPL SBDB Close Approach Data API",
    sourceSignatureVersion: sourceMetadataValue(first, "sourceSignatureVersion"),
  };
}
