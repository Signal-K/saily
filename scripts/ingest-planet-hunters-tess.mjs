import { cycleDailyRows, defaultStartDate, parseArgs, parseInteger, upsertRows } from "./lib/science-feed-runtime.mjs";
import {
  extractImageUrls,
  getProjectBySlugCandidates,
  listSubjectsForProject,
  pickFirstString,
  subjectMetadata,
} from "./lib/zooniverse-panoptes.mjs";

const PROJECT_SLUGS = ["nora-dot-eisner/planet-hunters-tess", "planet-hunters-tess"];
const PROJECT_URL = "https://www.zooniverse.org/projects/nora-dot-eisner/planet-hunters-tess";

function normalizeSubject(subject) {
  const metadata = subjectMetadata(subject);
  const imageUrls = extractImageUrls(subject);
  if (!subject?.id || !imageUrls.length) return null;

  return {
    subjectId: String(subject.id),
    imageUrl: imageUrls[0],
    caption: pickFirstString(metadata, ["caption", "description", "#caption"], "Planet Hunters TESS light curve"),
    sourceMetadata: {
      title: pickFirstString(metadata, ["title", "#title"], `Planet Hunters TESS subject ${subject.id}`),
      prompt: "Review this real TESS light curve and decide whether it shows a transit dip.",
      sourceName: "Zooniverse / Planet Hunters TESS",
      sourceUrl: PROJECT_URL,
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
  image_url: subject.imageUrl,
  caption: subject.caption,
  source_metadata: subject.sourceMetadata,
}));

if (dryRun) {
  console.log(JSON.stringify({ table: "planet_hunters_tess_daily", count: rows.length, sample: rows.slice(0, 3) }, null, 2));
} else {
  const result = await upsertRows({
    table: "planet_hunters_tess_daily",
    rows,
    onConflict: "game_date,subject_id",
  });
  console.log(`Upserted ${result.count} planet-hunters-tess rows starting at ${startDate}`);
}
