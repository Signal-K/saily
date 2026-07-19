export const SURVEY_QUEUE_KEY = "posthog:survey:queue";
const SURVEY_SHOWN_KEY = "posthog:survey:shown";

// Single source of truth for which trigger sources exist and which env var
// holds each one's real PostHog survey ID — adding a source here is now the
// only edit needed (previously this list and the env-var lookup lived in
// two separate files, posthog-runtime.tsx duplicating the enumeration).
const SURVEY_ENV_VAR_BY_SOURCE = {
  narrative_flow: "NEXT_PUBLIC_POSTHOG_SURVEY_NARRATIVE_ID",
  archive_unlock: "NEXT_PUBLIC_POSTHOG_SURVEY_ARCHIVE_ID",
  discussion_flow: "NEXT_PUBLIC_POSTHOG_SURVEY_DISCUSS_ID",
} as const;

export const SURVEY_TRIGGER_SOURCES = Object.keys(SURVEY_ENV_VAR_BY_SOURCE) as SurveyTriggerSource[];

export type SurveyTriggerSource = keyof typeof SURVEY_ENV_VAR_BY_SOURCE;

export function getSurveyIdForSource(source: SurveyTriggerSource): string {
  const envVarName = SURVEY_ENV_VAR_BY_SOURCE[source];
  return process.env[envVarName]?.trim() || "";
}

export type SurveyTriggerPayload = {
  source: SurveyTriggerSource;
  version: string;
  gameDate?: string;
  score?: number;
};

function readShownMap() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SURVEY_SHOWN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeShownMap(map: Record<string, number>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SURVEY_SHOWN_KEY, JSON.stringify(map));
}

function isSurveyTriggerSource(source: string): source is SurveyTriggerSource {
  return (SURVEY_TRIGGER_SOURCES as readonly string[]).includes(source);
}

export function queueSurveyTrigger(payload: SurveyTriggerPayload, options?: { cooldownDays?: number; sampleRate?: number }) {
  if (typeof window === "undefined") return;
  const cooldownDays = options?.cooldownDays ?? 10;
  const sampleRate = options?.sampleRate ?? 0.28;
  if (Math.random() > sampleRate) return;

  const shownMap = readShownMap();
  const lastShownAt = shownMap[payload.source] ?? 0;
  const elapsedMs = Date.now() - lastShownAt;
  if (elapsedMs < cooldownDays * 24 * 60 * 60 * 1000) return;

  sessionStorage.setItem(SURVEY_QUEUE_KEY, JSON.stringify(payload));
}

export function dequeueSurveyTrigger(): SurveyTriggerPayload | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SURVEY_QUEUE_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(SURVEY_QUEUE_KEY);
  try {
    const parsed = JSON.parse(raw) as SurveyTriggerPayload;
    if (!parsed || typeof parsed.source !== "string" || typeof parsed.version !== "string") return null;
    if (!isSurveyTriggerSource(parsed.source)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function markSurveyShown(source: SurveyTriggerSource) {
  const shownMap = readShownMap();
  shownMap[source] = Date.now();
  writeShownMap(shownMap);
}
