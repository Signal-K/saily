import { cycleDailyRows, defaultStartDate, parseArgs, parseInteger, upsertRows } from "./lib/science-feed-runtime.mjs";
import {
  extractImageUrls,
  getProjectBySlugCandidates,
  listSubjectsForProject,
  pickFirstString,
  subjectMetadata,
} from "./lib/zooniverse-panoptes.mjs";

const PROJECT_SLUGS = ["marek-slipski/cloudspotting-on-mars", "cloudspotting-on-mars"];
const PROJECT_URL = "https://www.zooniverse.org/projects/marek-slipski/cloudspotting-on-mars";

function normalizeSubject(subject) {
  const metadata = subjectMetadata(subject);
  const imageUrls = extractImageUrls(subject);
  if (!subject?.id || !imageUrls.length) return null;

  return {
    subjectId: String(subject.id),
    imageUrl: imageUrls[0],
    cropUrl: imageUrls[1] ?? null,
    caption: pickFirstString(metadata, ["caption", "description", "image_title", "#caption"], "Cloudspotting on Mars subject"),
    seasonOrContext: pickFirstString(metadata, ["season", "season_or_context", "context", "#season"], null),
    workflowVersion: pickFirstString(metadata, ["workflow_version", "#workflow_version"], null),
    sourceMetadata: {
      title: pickFirstString(metadata, ["title", "#title"], `Cloudspotting subject ${subject.id}`),
      prompt: "Review this Mars cloud subject and classify the dominant cloud structure.",
      sourceName: "Zooniverse / Cloudspotting on Mars",
      sourceUrl: PROJECT_URL,
      sourceMission: pickFirstString(metadata, ["mission", "instrument", "#mission"], null),
      imageUrls,
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
  project_slug: "cloudspotting-on-mars",
  image_url: subject.imageUrl,
  crop_url: subject.cropUrl,
  caption: subject.caption,
  season_or_context: subject.seasonOrContext,
  workflow_version: subject.workflowVersion,
  source_metadata: subject.sourceMetadata,
}));

if (dryRun) {
  console.log(JSON.stringify({ table: "cloudspotting_mars_daily", count: rows.length, sample: rows.slice(0, 3) }, null, 2));
} else {
  const result = await upsertRows({
    table: "cloudspotting_mars_daily",
    rows,
    onConflict: "game_date,subject_id",
  });
  console.log(`Upserted ${result.count} cloudspotting rows starting at ${startDate}`);
}
