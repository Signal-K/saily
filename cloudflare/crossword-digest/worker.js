const POSTHOG_HOST = "https://us.posthog.com";

// Mirrors web/src/lib/melbourne-date.ts's date-key arithmetic: operate on
// the YYYY-MM-DD calendar key itself (via a UTC-anchored Date), not on real
// elapsed milliseconds, so DST transitions in Australia/Melbourne can't
// shift the result by an hour.
function melbourneDateKey(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function shiftDateKey(dateKey, offsetDays) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const base = new Date(Date.UTC(year, month - 1, day));
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString().slice(0, 10);
}

async function runHogQLQuery(env, query) {
  const response = await fetch(`${POSTHOG_HOST}/api/projects/${env.POSTHOG_PROJECT_ID}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.POSTHOG_PERSONAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`PostHog query failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.results ?? [];
}

// HogQL/ClickHouse string literals use single quotes — double quotes (what
// JSON.stringify produces) are parsed as identifiers instead, which is why
// the first deploy of this failed with "Unable to resolve field: <date>".
function hogQLStringLiteral(value) {
  return `'${String(value).replace(/'/g, "\\'")}'`;
}

async function getCrosswordDigest(env, gameDate) {
  const rows = await runHogQLQuery(
    env,
    `
    SELECT
      countIf(event = 'crossword_submitted') AS plays,
      avg(toFloat(properties.score)) AS avg_score,
      avg(toFloat(properties.elapsed_seconds)) AS avg_elapsed_seconds
    FROM events
    WHERE event IN ('crossword_opened', 'crossword_submitted')
      AND properties.game_date = ${hogQLStringLiteral(gameDate)}
      AND timestamp >= now() - INTERVAL 3 DAY
    `,
  );

  const [plays, avgScore, avgElapsedSeconds] = rows[0] ?? [0, null, null];
  return {
    gameDate,
    plays: Number(plays) || 0,
    avgScore: avgScore == null ? null : Math.round(Number(avgScore)),
    avgElapsedSeconds: avgElapsedSeconds == null ? null : Math.round(Number(avgElapsedSeconds)),
  };
}

function buildEmail(digest) {
  const minutes = digest.avgElapsedSeconds == null ? "—" : `${Math.round(digest.avgElapsedSeconds / 60)}m ${digest.avgElapsedSeconds % 60}s`;
  const subject = `Crossword digest ${digest.gameDate}: ${digest.plays} play${digest.plays === 1 ? "" : "s"}`;
  const text = [
    `The Daily Transit — crossword digest for ${digest.gameDate}`,
    "",
    `Plays: ${digest.plays}`,
    `Average score: ${digest.avgScore == null ? "—" : `${digest.avgScore}%`}`,
    `Average completion time: ${minutes}`,
  ].join("\n");
  return { subject, text };
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runDigest(env));
  },

  // GET /run lets you trigger a digest manually (e.g. for a specific
  // ?date=YYYY-MM-DD) without waiting for the cron — useful for testing.
  // Not authenticated beyond Cloudflare route visibility; this worker has no
  // other public surface, so this is acceptable for a low-value internal tool.
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/run") {
      return new Response("not found", { status: 404 });
    }
    const gameDate = url.searchParams.get("date") ?? shiftDateKey(melbourneDateKey(new Date()), -1);
    const result = await runDigest(env, gameDate);
    return new Response(JSON.stringify(result, null, 2), { headers: { "Content-Type": "application/json" } });
  },
};

async function runDigest(env, gameDateOverride) {
  const gameDate = gameDateOverride ?? shiftDateKey(melbourneDateKey(new Date()), -1);
  const digest = await getCrosswordDigest(env, gameDate);

  if (digest.plays <= 0) {
    return { sent: false, reason: "no plays", digest };
  }

  const { subject, text } = buildEmail(digest);
  const response = await env.EMAIL.send({
    to: "liam@skinetics.tech",
    from: "daily-digest@youratlas.cc",
    subject,
    text,
  });

  return { sent: true, messageId: response?.messageId ?? null, digest };
}
