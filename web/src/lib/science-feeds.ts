export type ScienceFeedId =
  | "cloudspotting_mars"
  | "gaia_variables"
  | "rubin_comet_catchers"
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

export type CachedTimeSeriesPoint = {
  x: number;
  y: number;
};

export type CachedTimeSeriesSubject = CachedSubjectCommon & {
  sourceId: string;
  prompt: string;
  series: CachedTimeSeriesPoint[];
  summary?: string | null;
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

export type RubinCometCatchersDaily = CachedSubjectCommon & {
  subjectId: string;
  imageUrls: string[];
  activityPrompt: string;
  objectLabel?: string | null;
  knownTrainingFlag?: boolean;
};

export type GaiaVariablesDaily = CachedTimeSeriesSubject & {
  provenanceUrl?: string | null;
  cadenceSummary?: string | null;
  classHints?: string[] | null;
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
  rubin_comet_catchers: {
    id: "rubin_comet_catchers",
    label: "Rubin Comet Catchers",
    shortLabel: "Rubin",
    provider: "Zooniverse",
    projectUrl: "https://www.zooniverse.org/projects/orionnau/rubin-comet-catchers",
    ingestPriority: 3,
    kind: "image_subject",
    cacheTable: "rubin_comet_catchers_daily",
    dailyQuestion: "Do these Rubin frames show a tail, coma, or other small-body activity?",
    notes: "Normalize multi-image subjects into one stable card payload during ingestion.",
  },
  gaia_variables: {
    id: "gaia_variables",
    label: "Gaia Variables",
    shortLabel: "Gaia",
    provider: "Gaia / project-aligned intake",
    projectUrl: "https://www.zooniverse.org/projects?discipline=space",
    ingestPriority: 4,
    kind: "time_series",
    cacheTable: "gaia_variables_daily",
    dailyQuestion: "What kind of variability pattern does this light curve show?",
    notes: "Precompute compact series payloads; avoid live archive complexity in the client.",
  },
};

export const SCIENCE_FEED_ORDER = Object.values(SCIENCE_FEEDS).sort(
  (a, b) => a.ingestPriority - b.ingestPriority,
);

export function getScienceFeedDefinition(feedId: ScienceFeedId): ScienceFeedDefinition {
  return SCIENCE_FEEDS[feedId];
}
