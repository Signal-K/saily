import { cycleDailyRows, defaultStartDate, parseArgs, parseInteger, upsertRows } from "./lib/science-feed-runtime.mjs";
import {
  coerceStringArray,
  extractImageUrls,
  getProjectBySlugCandidates,
  listSubjectsForProject,
  pickFirstString,
  subjectMetadata,
} from "./lib/zooniverse-panoptes.mjs";

const PROJECT_SLUGS = ["orionnau/rubin-comet-catchers", "rubin-comet-catchers"];
const PROJECT_URL = "https://www.zooniverse.org/projects/orionnau/rubin-comet-catchers";

function normalizeSubject(subject) {
  const metadata = subjectMetadata(subject);
  const imageUrls = extractImageUrls(subject);
  if (!subject?.id || !imageUrls.length) return null;

  const knownFlags = coerceStringArray(metadata.known_training_flag ?? metadata.training ?? metadata.flags);

  return {
    subjectId: String(subject.id),
    imageUrls,
    objectLabel: pickFirstString(metadata, ["object_label", "object", "target_name", "#object"], null),
    activityPrompt: pickFirstString(metadata, ["activity_prompt", "prompt", "#prompt"], "Do these Rubin frames show a tail, coma, or other small-body activity?"),
    knownTrainingFlag:
      typeof metadata.known_training_flag === "boolean"
        ? metadata.known_training_flag
        : knownFlags.some((flag) => flag.toLowerCase() === "training" || flag.toLowerCase() === "known"),
    sourceMetadata: {
      title: pickFirstString(metadata, ["title", "#title"], `Rubin subject ${subject.id}`),
      sourceName: "Zooniverse / Rubin Comet Catchers",
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
  subject_id: subject.subjectId,
  image_urls: subject.imageUrls,
  object_label: subject.objectLabel,
  known_training_flag: subject.knownTrainingFlag,
  activity_prompt: subject.activityPrompt,
  source_metadata: subject.sourceMetadata,
}));

if (dryRun) {
  console.log(JSON.stringify({ table: "rubin_comet_catchers_daily", count: rows.length, sample: rows.slice(0, 3) }, null, 2));
} else {
  const result = await upsertRows({
    table: "rubin_comet_catchers_daily",
    rows,
    onConflict: "game_date,subject_id",
  });
  console.log(`Upserted ${result.count} rubin comet catcher rows starting at ${startDate}`);
}
