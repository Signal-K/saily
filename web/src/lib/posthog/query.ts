const POSTHOG_HOST = process.env.POSTHOG_HOST ?? "https://us.posthog.com";

export function isPostHogQueryConfigured() {
  return Boolean(process.env.POSTHOG_PROJECT_ID?.trim() && process.env.POSTHOG_PERSONAL_API_KEY?.trim());
}

export async function runHogQLQuery<Row extends unknown[] = unknown[]>(query: string): Promise<Row[]> {
  const projectId = process.env.POSTHOG_PROJECT_ID?.trim();
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY?.trim();

  if (!projectId || !apiKey) {
    throw new Error("PostHog server credentials are not configured (POSTHOG_PROJECT_ID / POSTHOG_PERSONAL_API_KEY)");
  }

  const response = await fetch(`${POSTHOG_HOST}/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`PostHog query failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { results?: Row[] };
  return data.results ?? [];
}
