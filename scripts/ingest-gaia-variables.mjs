import { cycleDailyRows, defaultStartDate, parseArgs, parseInteger, upsertRows } from "./lib/science-feed-runtime.mjs";
import {
  coerceStringArray,
  getProjectBySlugCandidates,
  listSubjectsForProject,
  pickFirstString,
  subjectMetadata,
} from "./lib/zooniverse-panoptes.mjs";

const PROJECT_SLUGS = ["gaia-vari", "gaia"];
const PROJECT_URL = "https://www.zooniverse.org/projects?discipline=space";

function toNumericPoint(point, index) {
  if (Array.isArray(point) && point.length >= 2) {
    const x = Number(point[0]);
    const y = Number(point[1]);
    if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
  }

  if (point && typeof point === "object") {
    const x = Number(point.x ?? point.time ?? point.phase ?? index);
    const y = Number(point.y ?? point.value ?? point.mag ?? point.flux);
    if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
  }

  return null;
}

function extractSeries(value) {
  let candidate = value;

  if (typeof candidate === "string") {
    try {
      candidate = JSON.parse(candidate);
    } catch {
      return [];
    }
  }

  if (Array.isArray(candidate)) {
    return candidate.map(toNumericPoint).filter(Boolean);
  }

  if (candidate && typeof candidate === "object" && Array.isArray(candidate.points)) {
    return candidate.points.map(toNumericPoint).filter(Boolean);
  }

  if (candidate && typeof candidate === "object" && Array.isArray(candidate.x) && Array.isArray(candidate.y)) {
    const points = [];
    for (let i = 0; i < Math.min(candidate.x.length, candidate.y.length); i += 1) {
      const x = Number(candidate.x[i]);
      const y = Number(candidate.y[i]);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        points.push({ x, y });
      }
    }
    return points;
  }

  return [];
}

function normalizeSubject(subject) {
  const metadata = subjectMetadata(subject);
  const rawSeries =
    metadata.series_payload ??
    metadata.series ??
    metadata.lightcurve ??
    metadata.light_curve ??
    metadata.points;
  const seriesPayload = extractSeries(rawSeries);

  if (!subject?.id || seriesPayload.length < 3) return null;

  return {
    sourceId: String(subject.id),
    seriesPayload,
    classHints: coerceStringArray(metadata.class_hints ?? metadata.labels ?? metadata.classes),
    cadenceSummary: pickFirstString(metadata, ["cadence_summary", "cadence", "baseline"], null),
    provenanceUrl: pickFirstString(metadata, ["provenance_url", "source_url", "url"], null),
    sourceMetadata: {
      title: pickFirstString(metadata, ["title", "#title"], `Gaia variable ${subject.id}`),
      prompt: "What kind of variability pattern does this light curve show?",
      sourceName: "Zooniverse / Gaia-style variability intake",
      sourceUrl: PROJECT_URL,
      metadata,
    },
  };
}

const options = parseArgs();
const startDate = String(options["start-date"] ?? defaultStartDate());
const days = parseInteger(options.days, 30);
const pageSize = parseInteger(options["page-size"], 100);
const maxPages = parseInteger(options["max-pages"], 5);
const dryRun = Boolean(options["dry-run"]);

const project = await getProjectBySlugCandidates(PROJECT_SLUGS);
const subjects = (await listSubjectsForProject(project.id, { pageSize, maxPages }))
  .map(normalizeSubject)
  .filter(Boolean);

const rows = cycleDailyRows(subjects, days, startDate, (subject, gameDate) => ({
  game_date: gameDate,
  source_id: subject.sourceId,
  series_payload: subject.seriesPayload,
  class_hints: subject.classHints,
  cadence_summary: subject.cadenceSummary,
  provenance_url: subject.provenanceUrl,
  source_metadata: subject.sourceMetadata,
}));

if (dryRun) {
  console.log(JSON.stringify({ table: "gaia_variables_daily", count: rows.length, sample: rows.slice(0, 3) }, null, 2));
} else {
  const result = await upsertRows({
    table: "gaia_variables_daily",
    rows,
    onConflict: "game_date,source_id",
  });
  console.log(`Upserted ${result.count} gaia variable rows starting at ${startDate}`);
}
