export const EXIT_SURVEY_QUEUE_KEY = "posthog:exit-survey:queue";

export type ExitSurveyPayload = {
  source: string;
  version: string;
  gameDate?: string;
  score?: number;
};

export function queueExitSurvey(payload: ExitSurveyPayload) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(EXIT_SURVEY_QUEUE_KEY, JSON.stringify(payload));
}

export function dequeueExitSurvey(): ExitSurveyPayload | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(EXIT_SURVEY_QUEUE_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(EXIT_SURVEY_QUEUE_KEY);
  try {
    const parsed = JSON.parse(raw) as ExitSurveyPayload;
    if (!parsed || typeof parsed.source !== "string" || typeof parsed.version !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}
