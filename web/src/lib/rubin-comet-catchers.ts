import { resolveGameDate } from "@/lib/game";

export type RubinCometCatchersSubject = {
  id: string;
  imageUrls: string[];
  title: string;
  prompt: string;
  objectLabel: string | null;
  knownTrainingFlag: boolean;
  sourceName: string;
  sourceUrl: string;
  projectUrl: string;
};

export type RubinCometCatchersCacheRow = {
  game_date: string | null;
  subject_id: string | number | null;
  image_urls: string[] | null;
  activity_prompt: string | null;
  object_label: string | null;
  known_training_flag: boolean | null;
  source_metadata: unknown;
};

const PROJECT_URL = "https://www.zooniverse.org/projects/orionnau/rubin-comet-catchers";

export const RUBIN_COMET_CATCHERS_FALLBACK_SUBJECTS: RubinCometCatchersSubject[] = [
  {
    id: "RUBIN-001",
    imageUrls: ["https://www.zooniverse.org/assets/project-background.jpg"], // Placeholder
    title: "Comet Activity Review",
    prompt: "Do these Rubin frames show a tail, coma, or other small-body activity?",
    objectLabel: "C/2023-X1",
    knownTrainingFlag: false,
    sourceName: "Zooniverse / Rubin Comet Catchers",
    sourceUrl: PROJECT_URL,
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

export function getDailyRubinCometCatchersSubject(
  date?: string,
  pool: RubinCometCatchersSubject[] = RUBIN_COMET_CATCHERS_FALLBACK_SUBJECTS,
): RubinCometCatchersSubject {
  const dateKey = resolveGameDate(date);
  return seededPick(pool, hashString(dateKey));
}

export function toRubinCometCatchersSubject(row: RubinCometCatchersCacheRow): RubinCometCatchersSubject | null {
  const subjectId = row.subject_id == null ? "" : String(row.subject_id).trim();
  const imageUrls = row.image_urls || [];
  if (!subjectId || imageUrls.length === 0) return null;

  const metadata = row.source_metadata && typeof row.source_metadata === "object"
    ? (row.source_metadata as Record<string, unknown>)
    : null;

  const title = typeof metadata?.title === "string" ? metadata.title.trim() : `Rubin Comet Subject ${subjectId}`;
  const sourceName = typeof metadata?.sourceName === "string" ? metadata.sourceName.trim() : "Zooniverse / Rubin Comet Catchers";
  const sourceUrl = typeof metadata?.sourceUrl === "string" ? metadata.sourceUrl.trim() : PROJECT_URL;
  const prompt =
    typeof row.activity_prompt === "string" && row.activity_prompt.trim()
      ? row.activity_prompt.trim()
      : "Do these Rubin frames show a tail, coma, or other small-body activity?";

  return {
    id: subjectId,
    imageUrls,
    title,
    prompt,
    objectLabel: row.object_label?.trim() || null,
    knownTrainingFlag: !!row.known_training_flag,
    sourceName,
    sourceUrl,
    projectUrl: PROJECT_URL,
  };
}
