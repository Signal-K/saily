export const SURVEY_QUEUE_KEY = "posthog:survey:queue";
const SURVEY_SHOWN_KEY = "posthog:survey:shown";

export type SurveyTriggerSource =
  | "planet_transit"
  | "planet_no_detection"
  | "asteroid_mapping"
  | "mars_classification"
  | "narrative_flow";

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
