export const CAD_API_URL = "https://ssd-api.jpl.nasa.gov/cad.api";
export const EXPECTED_CAD_SIGNATURE_VERSION = "1.5";
export const AU_TO_LUNAR_DISTANCE = 389.17239846883954;
export const DEFAULT_ROUND_SIZE = 5;
export const MIN_ROUND_SIZE = 4;

const REQUIRED_FIELDS = [
  "des",
  "orbit_id",
  "cd",
  "dist",
  "dist_min",
  "dist_max",
  "v_rel",
];

function asFiniteNumber(value, fieldName) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric value for ${fieldName}: ${String(value)}`);
  }
  return parsed;
}

function requiredString(value, fieldName) {
  const text = typeof value === "string" ? value.trim() : String(value ?? "").trim();
  if (!text) throw new Error(`Missing required field: ${fieldName}`);
  return text;
}

function getField(record, fieldIndex, fieldName) {
  const index = fieldIndex.get(fieldName);
  if (index === undefined) return null;
  return record[index] ?? null;
}

function assertExpectedSignature(payload) {
  const version = payload?.signature?.version;
  if (version !== EXPECTED_CAD_SIGNATURE_VERSION) {
    throw new Error(
      `Unsupported NASA/JPL CAD API signature version: ${String(version)} (expected ${EXPECTED_CAD_SIGNATURE_VERSION})`,
    );
  }
}

function buildFieldIndex(fields) {
  if (!Array.isArray(fields)) throw new Error("NASA/JPL CAD payload is missing fields[]");
  const index = new Map(fields.map((field, i) => [field, i]));
  const missing = REQUIRED_FIELDS.filter((field) => !index.has(field));
  if (missing.length > 0) {
    throw new Error(`NASA/JPL CAD payload is missing required fields: ${missing.join(", ")}`);
  }
  return index;
}

export function buildCadApiUrl({ dateMin, dateMax, limit = DEFAULT_ROUND_SIZE, sort = "dist" }) {
  const url = new URL(CAD_API_URL);
  url.searchParams.set("body", "Earth");
  url.searchParams.set("neo", "true");
  url.searchParams.set("date-min", dateMin);
  url.searchParams.set("date-max", dateMax);
  url.searchParams.set("diameter", "true");
  url.searchParams.set("fullname", "true");
  url.searchParams.set("sort", sort);
  url.searchParams.set("limit", String(limit));
  return url.toString();
}

export function normalizeCadPayload(payload, options) {
  assertExpectedSignature(payload);
  const fieldIndex = buildFieldIndex(payload.fields);
  const data = Array.isArray(payload.data) ? payload.data : [];
  const sourceUrl = buildCadApiUrl(options);
  const ingestedAt = options.ingestedAt ?? new Date().toISOString();

  const records = data.map((record) => {
    if (!Array.isArray(record)) throw new Error("NASA/JPL CAD record is not an array");

    const designation = requiredString(getField(record, fieldIndex, "des"), "des");
    const closeApproachTime = requiredString(getField(record, fieldIndex, "cd"), "cd");
    const distanceAu = asFiniteNumber(getField(record, fieldIndex, "dist"), "dist");
    const distanceMinAu = asFiniteNumber(getField(record, fieldIndex, "dist_min"), "dist_min");
    const distanceMaxAu = asFiniteNumber(getField(record, fieldIndex, "dist_max"), "dist_max");
    const relativeVelocityKmS = asFiniteNumber(getField(record, fieldIndex, "v_rel"), "v_rel");

    if (distanceAu === null || relativeVelocityKmS === null) {
      throw new Error(`NASA/JPL CAD record ${designation} is missing distance or relative velocity`);
    }

    const orbitId = requiredString(getField(record, fieldIndex, "orbit_id"), "orbit_id");
    const fullname = getField(record, fieldIndex, "fullname");
    const displayName = typeof fullname === "string" && fullname.trim() ? fullname.trim() : designation;

    return {
      sourceRecordId: `${designation}:${orbitId}:${closeApproachTime}`,
      designation,
      displayName,
      orbitId,
      closeApproachTime,
      distanceAu,
      distanceLd: Number((distanceAu * AU_TO_LUNAR_DISTANCE).toFixed(3)),
      distanceMinAu,
      distanceMaxAu,
      relativeVelocityKmS,
      absoluteMagnitudeH: asFiniteNumber(getField(record, fieldIndex, "h"), "h"),
      diameterKm: asFiniteNumber(getField(record, fieldIndex, "diameter"), "diameter"),
      diameterSigmaKm: asFiniteNumber(getField(record, fieldIndex, "diameter_sigma"), "diameter_sigma"),
      sourceUrl,
      sourceMetadata: {
        sourceName: payload.signature.source ?? "NASA/JPL SBDB Close Approach Data API",
        sourceSignatureVersion: payload.signature.version,
        rawFields: payload.fields,
        ingestedAt,
      },
    };
  });

  records.sort((a, b) => {
    if (a.distanceAu !== b.distanceAu) return a.distanceAu - b.distanceAu;
    if ((a.distanceMinAu ?? Number.POSITIVE_INFINITY) !== (b.distanceMinAu ?? Number.POSITIVE_INFINITY)) {
      return (a.distanceMinAu ?? Number.POSITIVE_INFINITY) - (b.distanceMinAu ?? Number.POSITIVE_INFINITY);
    }
    if (a.closeApproachTime !== b.closeApproachTime) return a.closeApproachTime.localeCompare(b.closeApproachTime);
    return a.designation.localeCompare(b.designation);
  });

  return {
    available: records.length >= MIN_ROUND_SIZE,
    reason: records.length >= MIN_ROUND_SIZE ? null : "insufficient-source-records",
    date: options.gameDate,
    mode: "closest-distance",
    sourceUrl,
    sourceSignatureVersion: payload.signature.version,
    generatedAt: ingestedAt,
    records,
    orderedRecordIds: records.map((record) => record.sourceRecordId),
  };
}

export function toPocketBaseRows(round) {
  return round.records.map((record, index) => ({
    game_date: round.date,
    mode: round.mode,
    source_record_id: record.sourceRecordId,
    designation: record.designation,
    display_name: record.displayName,
    orbit_id: record.orbitId,
    close_approach_time: record.closeApproachTime,
    distance_au: record.distanceAu,
    distance_ld: record.distanceLd,
    distance_min_au: record.distanceMinAu,
    distance_max_au: record.distanceMaxAu,
    relative_velocity_km_s: record.relativeVelocityKmS,
    absolute_magnitude_h: record.absoluteMagnitudeH,
    diameter_km: record.diameterKm,
    diameter_sigma_km: record.diameterSigmaKm,
    solution_rank: index + 1,
    source_url: record.sourceUrl,
    source_metadata: {
      ...record.sourceMetadata,
      generatedAt: round.generatedAt,
    },
  }));
}
