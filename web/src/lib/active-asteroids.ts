import { resolveGameDate } from "@/lib/game";

export type ActiveAsteroidsSubject = {
  id: string;
  imageUrl: string;
  title: string;
  prompt: string;
  caption: string;
  candidateId: string | null;
  epochLabel: string | null;
  sourceName: string;
  sourceUrl: string;
  projectUrl: string;
};

export type ActiveAsteroidsCacheRow = {
  game_date: string | null;
  subject_id: string | number | null;
  image_url: string | null;
  caption: string | null;
  candidate_id: string | null;
  epoch_label: string | null;
  source_metadata: unknown;
};

const PROJECT_URL = "https://www.zooniverse.org/projects/orionnau/active-asteroids";

export const ACTIVE_ASTEROIDS_FALLBACK_SUBJECTS: ActiveAsteroidsSubject[] = [
  {
    id: "AA-001",
    imageUrl: "https://www.zooniverse.org/assets/project-background.jpg", // Placeholder or real example URL if known
    title: "Asteroid Candidate Review",
    prompt: "Is there convincing activity around this asteroid candidate?",
    caption: "A candidate asteroid for activity review.",
    candidateId: "C-2021-A1",
    epochLabel: "2021-01-15",
    sourceName: "Zooniverse / Active Asteroids",
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

export function getDailyActiveAsteroidsSubject(
  date?: string,
  pool: ActiveAsteroidsSubject[] = ACTIVE_ASTEROIDS_FALLBACK_SUBJECTS,
): ActiveAsteroidsSubject {
  const dateKey = resolveGameDate(date);
  return seededPick(pool, hashString(dateKey));
}

export function toActiveAsteroidsSubject(row: ActiveAsteroidsCacheRow): ActiveAsteroidsSubject | null {
  const subjectId = row.subject_id == null ? "" : String(row.subject_id).trim();
  const imageUrl = row.image_url?.trim() ?? "";
  if (!subjectId || !imageUrl) return null;

  const metadata = row.source_metadata && typeof row.source_metadata === "object"
    ? (row.source_metadata as Record<string, unknown>)
    : null;

  const title = typeof metadata?.title === "string" ? metadata.title.trim() : `Asteroid Candidate ${subjectId}`;
  const sourceName = typeof metadata?.sourceName === "string" ? metadata.sourceName.trim() : "Zooniverse / Active Asteroids";
  const sourceUrl = typeof metadata?.sourceUrl === "string" ? metadata.sourceUrl.trim() : PROJECT_URL;
  const prompt =
    typeof metadata?.prompt === "string" && metadata.prompt.trim()
      ? metadata.prompt.trim()
      : "Is there convincing activity around this asteroid candidate?";

  return {
    id: subjectId,
    imageUrl,
    title,
    prompt,
    caption: row.caption?.trim() || "Cached Active Asteroids subject.",
    candidateId: row.candidate_id?.trim() || null,
    epochLabel: row.epoch_label?.trim() || null,
    sourceName,
    sourceUrl,
    projectUrl: PROJECT_URL,
  };
}
