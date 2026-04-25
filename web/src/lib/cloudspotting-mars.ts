import { resolveGameDate } from "@/lib/game";

export type CloudspottingMarsSubject = {
  id: string;
  imageUrl: string;
  title: string;
  prompt: string;
  caption: string;
  seasonOrContext: string | null;
  sourceName: string;
  sourceUrl: string;
  sourceMission: string | null;
  projectUrl: string;
};

export type CloudspottingMarsCacheRow = {
  game_date: string | null;
  subject_id: string | number | null;
  image_url: string | null;
  caption: string | null;
  season_or_context: string | null;
  workflow_version: string | null;
  source_metadata: unknown;
};

const PROJECT_URL = "https://www.zooniverse.org/projects/marek-slipski/cloudspotting-on-mars";

export const CLOUDSPOTTING_MARS_FALLBACK_SUBJECTS: CloudspottingMarsSubject[] = [
  {
    id: "PIA06447",
    imageUrl: "https://photojournal.jpl.nasa.gov/jpeg/PIA06447.jpg",
    title: "Martian Clouds",
    prompt: "Review this Mars cloud subject and classify the dominant cloud structure.",
    caption: "Transparent water-ice cloud ripples near Mars' north pole.",
    seasonOrContext: "Polar spring cloud bands",
    sourceName: "NASA Photojournal",
    sourceUrl: "https://science.nasa.gov/photojournal/martian-clouds/",
    sourceMission: "Mars Odyssey",
    projectUrl: PROJECT_URL,
  },
  {
    id: "PIA23180",
    imageUrl: "https://photojournal.jpl.nasa.gov/jpeg/PIA23180.jpg",
    title: "InSight Images Clouds on Mars",
    prompt: "Review this Mars cloud subject and classify the visible cloud pattern.",
    caption: "InSight captured drifting clouds at sunset on Mars.",
    seasonOrContext: "Sunset cloud sequence",
    sourceName: "NASA Photojournal",
    sourceUrl: "https://science.nasa.gov/photojournal/insight-images-clouds-on-mars/",
    sourceMission: "InSight",
    projectUrl: PROJECT_URL,
  },
  {
    id: "PIA00785",
    imageUrl: "https://photojournal.jpl.nasa.gov/jpeg/PIA00785.jpg",
    title: "First Image of Clouds over Mars",
    prompt: "Review this Mars cloud subject and classify the visible cloud pattern.",
    caption: "Historic overcast sky image from Mars Pathfinder.",
    seasonOrContext: "Surface-viewed overcast clouds",
    sourceName: "NASA Photojournal",
    sourceUrl: "https://science.nasa.gov/photojournal/first-image-of-clouds-over-mars",
    sourceMission: "Mars Pathfinder",
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

export function getDailyCloudspottingMarsSubject(
  date?: string,
  pool: CloudspottingMarsSubject[] = CLOUDSPOTTING_MARS_FALLBACK_SUBJECTS,
): CloudspottingMarsSubject {
  const dateKey = resolveGameDate(date);
  return seededPick(pool, hashString(dateKey));
}

export function toCloudspottingMarsSubject(row: CloudspottingMarsCacheRow): CloudspottingMarsSubject | null {
  const subjectId = row.subject_id == null ? "" : String(row.subject_id).trim();
  const imageUrl = row.image_url?.trim() ?? "";
  if (!subjectId || !imageUrl) return null;

  const metadata = row.source_metadata && typeof row.source_metadata === "object"
    ? (row.source_metadata as Record<string, unknown>)
    : null;

  const title = typeof metadata?.title === "string" ? metadata.title.trim() : `Cloud Subject ${subjectId}`;
  const sourceName = typeof metadata?.sourceName === "string" ? metadata.sourceName.trim() : "Zooniverse / Cloudspotting on Mars";
  const sourceUrl = typeof metadata?.sourceUrl === "string" ? metadata.sourceUrl.trim() : PROJECT_URL;
  const sourceMission = typeof metadata?.sourceMission === "string" ? metadata.sourceMission.trim() : null;
  const prompt =
    typeof metadata?.prompt === "string" && metadata.prompt.trim()
      ? metadata.prompt.trim()
      : "Review this Mars cloud subject and classify the dominant cloud structure.";

  return {
    id: subjectId,
    imageUrl,
    title,
    prompt,
    caption: row.caption?.trim() || "Cached Cloudspotting on Mars subject.",
    seasonOrContext: row.season_or_context?.trim() || null,
    sourceName,
    sourceUrl,
    sourceMission,
    projectUrl: PROJECT_URL,
  };
}
