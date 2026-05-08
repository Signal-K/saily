import { cycleDailyRows, defaultStartDate, parseArgs, parseInteger, upsertRows } from "./lib/science-feed-runtime.mjs";
import {
  extractImageUrls,
  getProjectBySlugCandidates,
  listSubjectsForProject,
  pickFirstString,
  subjectMetadata,
} from "./lib/zooniverse-panoptes.mjs";

const PROJECT_SLUGS = ["orionnau/active-asteroids", "active-asteroids"];
const PROJECT_URL = "https://www.zooniverse.org/projects/orionnau/active-asteroids";

function normalizeSubject(subject) {
  const metadata = subjectMetadata(subject);
  const imageUrls = extractImageUrls(subject);
  if (!subject?.id || !imageUrls.length) return null;

  return {
    subjectId: String(subject.id),
    imageUrl: imageUrls[0],
    candidateId: pickFirstString(metadata, ["candidate_id", "candidate", "object_id", "#candidate_id"], null),
    epochLabel: pickFirstString(metadata, ["epoch", "epoch_label", "date", "#epoch"], null),
    sourceCollection: pickFirstString(metadata, ["source_collection", "collection", "campaign"], null),
    prompt: pickFirstString(metadata, ["prompt", "#prompt"], "Is there convincing activity around this asteroid candidate?"),
    sourceMetadata: {
      title: pickFirstString(metadata, ["title", "#title"], `Active Asteroids subject ${subject.id}`),
      sourceName: "Zooniverse / Active Asteroids",
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
  candidate_id: subject.candidateId,
  epoch_label: subject.epochLabel,
  source_collection: subject.sourceCollection,
  prompt: subject.prompt,
  source_metadata: subject.sourceMetadata,
}));

if (dryRun) {
  console.log(JSON.stringify({ table: "active_asteroids_daily", count: rows.length, sample: rows.slice(0, 3) }, null, 2));
} else {
  const result = await upsertRows({
    table: "active_asteroids_daily",
    rows,
    onConflict: "game_date,subject_id",
  });
  console.log(`Upserted ${result.count} active asteroid rows starting at ${startDate}`);
}
