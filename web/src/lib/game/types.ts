import { type LightcurvePoint, type Annotation } from "@/lib/planet-logic";

export type DailyAnomaly = {
  id: number;
  ticId: string;
  label: string;
  anomalyType: string | null;
  anomalySet: string | null;
  lightcurve: LightcurvePoint[];
  sourceName?: string | null;
  sourceUrl?: string | null;
  sourceMission?: string | null;
  sourceSector?: number | null;
  isSynthetic?: boolean;
};

export type SavedAnnotation = Omit<Annotation, "id" | "coordinateMode" | "sourcePeriodDays"> & {
  coordinateMode?: "time" | "phase";
  sourcePeriodDays?: number;
};

export type SavedHintFlags = {
  phaseFold?: boolean;
  bin?: boolean;
};

export const TAGS = ["Transit dip", "Periodic pattern", "Noise/uncertain", "Other"] as const;
export type Tag = (typeof TAGS)[number];

export const STAGE_DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export type StageDifficulty = (typeof STAGE_DIFFICULTIES)[number];

export const TAG_COLORS: Record<Tag, { fill: string; stroke: string; chip: string }> = {
  "Transit dip": { fill: "rgba(14, 165, 233, 0.2)", stroke: "#0284c7", chip: "#e0f2fe" },
  "Periodic pattern": { fill: "rgba(20, 184, 166, 0.2)", stroke: "#0f766e", chip: "#ccfbf1" },
  "Noise/uncertain": { fill: "rgba(245, 158, 11, 0.24)", stroke: "#b45309", chip: "#ffedd5" },
  Other: { fill: "rgba(168, 85, 247, 0.2)", stroke: "#6d28d9", chip: "#ede9fe" },
};
