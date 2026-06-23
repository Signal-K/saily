// One-off setup script: creates a "Landing Page Signups" dashboard in PostHog
// with a trend insight for the daily_transit_landing_interest event, broken
// down by signup kind (notify vs briefing).
//
// Usage:
//   POSTHOG_HOST=https://us.posthog.com \
//   POSTHOG_PROJECT_ID=199773 \
//   POSTHOG_PERSONAL_API_KEY=phx_... \
//   node scripts/posthog/create-landing-dashboard.mjs

function cleanEnv(value) {
  return (value ?? "").trim().replace(/^"+|"+$/g, "");
}

const host = cleanEnv(process.env.POSTHOG_HOST) || "https://us.posthog.com";
const projectId = cleanEnv(process.env.POSTHOG_PROJECT_ID);
const apiKey = cleanEnv(process.env.POSTHOG_PERSONAL_API_KEY);

if (!projectId || !apiKey) {
  console.error("Missing POSTHOG_PROJECT_ID or POSTHOG_PERSONAL_API_KEY");
  process.exit(1);
}

const baseUrl = `${host.replace(/\/$/, "")}/api/projects/${projectId}`;
const headers = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
};

async function postJson(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`POST ${path} failed (${response.status}): ${text}`);
  }

  return response.json();
}

const dashboard = await postJson("/dashboards/", {
  name: "Landing Page Signups",
  description: "Email capture and suggestion signups from the Saily landing page.",
});

console.log(`Created dashboard "${dashboard.name}" (id ${dashboard.id})`);

const insight = await postJson("/insights/", {
  name: "Landing signups by kind",
  description: "daily_transit_landing_interest events, split by signup kind (notify vs briefing).",
  dashboards: [dashboard.id],
  filters: {
    insight: "TRENDS",
    date_from: "-30d",
    interval: "day",
    events: [
      {
        id: "daily_transit_landing_interest",
        name: "daily_transit_landing_interest",
        type: "events",
        math: "total",
      },
    ],
    breakdown: "kind",
    breakdown_type: "event",
  },
});

console.log(`Created insight "${insight.name}" (id ${insight.id})`);
console.log(`Dashboard URL: ${host.replace(/\/$/, "")}/project/${projectId}/dashboard/${dashboard.id}`);
