export type ScienceFeedId =
  | "cloudspotting_mars"
  | "active_asteroids";

export type ScienceFeedKind = "image_subject" | "time_series";

export type ScienceFeedDefinition = {
  id: ScienceFeedId;
  label: string;
  shortLabel: string;
  provider: string;
  projectUrl: string;
  ingestPriority: number;
  kind: ScienceFeedKind;
  cacheTable: string;
  dailyQuestion: string;
  notes: string;
};

export type CachedSubjectCommon = {
  gameDate: string;
  sourceMetadata: Record<string, unknown>;
};

export type CachedImageSubject = CachedSubjectCommon & {
  subjectId: string;
  imageUrl: string;
  prompt: string;
  caption?: string | null;
};

export type CloudspottingMarsDaily = CachedImageSubject & {
  projectSlug: "cloudspotting-on-mars";
  cropUrl?: string | null;
  seasonOrContext?: string | null;
  workflowVersion?: string | null;
};

export type ActiveAsteroidsDaily = CachedImageSubject & {
  candidateId?: string | null;
  epochLabel?: string | null;
  sourceCollection?: string | null;
};

export const SCIENCE_FEEDS: Record<ScienceFeedId, ScienceFeedDefinition> = {
  cloudspotting_mars: {
    id: "cloudspotting_mars",
    label: "Cloudspotting on Mars",
    shortLabel: "CoM",
    provider: "Zooniverse",
    projectUrl: "https://www.zooniverse.org/projects/marek-slipski/cloudspotting-on-mars",
    ingestPriority: 1,
    kind: "image_subject",
    cacheTable: "cloudspotting_mars_daily",
    dailyQuestion: "What cloud shape or morphology is present in this Martian sky image?",
    notes: "Best near-term post-MVP intake. Use cached subjects only in daily play.",
  },
  active_asteroids: {
    id: "active_asteroids",
    label: "Active Asteroids",
    shortLabel: "AA",
    provider: "Zooniverse",
    projectUrl: "https://www.zooniverse.org/projects/orionnau/active-asteroids",
    ingestPriority: 2,
    kind: "image_subject",
    cacheTable: "active_asteroids_daily",
    dailyQuestion: "Is there convincing activity around this asteroid candidate?",
    notes: "Closest fit to the existing asteroid review interaction.",
  },
};

export const SCIENCE_FEED_ORDER = Object.values(SCIENCE_FEEDS).sort(
  (a, b) => a.ingestPriority - b.ingestPriority,
);

export function getScienceFeedDefinition(feedId: ScienceFeedId): ScienceFeedDefinition {
  return SCIENCE_FEEDS[feedId];
}
