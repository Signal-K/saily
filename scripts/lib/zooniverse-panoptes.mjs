const API_BASE_URL = "https://www.zooniverse.org/api/";
const TOKEN_URL = "https://panoptes.zooniverse.org/oauth/token";
const API_ACCEPT = "application/vnd.api+json; version=1";
// Client-credentials tokens expire in ~2h (confirmed against the live
// endpoint) — refresh a little early rather than right at expiry.
const TOKEN_REFRESH_MARGIN_SECONDS = 60;

function cleanEnv(value) {
  return (value ?? "").trim().replace(/^"+|"+$/g, "");
}

let cachedToken = null; // { accessToken, expiresAt } — process-lifetime cache only.

async function fetchClientCredentialsToken() {
  const clientId = cleanEnv(process.env.ZOONIVERSE_CLIENT_ID);
  const clientSecret = cleanEnv(process.env.ZOONIVERSE_CLIENT_SECRET);
  if (!clientId || !clientSecret) return null;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: API_ACCEPT },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret, scope: "public" }),
  });

  if (!response.ok) {
    throw new Error(`Panoptes OAuth token exchange failed with ${response.status}`);
  }

  const payload = await response.json();
  if (!payload?.access_token) {
    throw new Error("Panoptes OAuth token exchange did not return an access_token.");
  }

  return { accessToken: payload.access_token, expiresAt: Date.now() + Math.max(0, (payload.expires_in ?? 0) - TOKEN_REFRESH_MARGIN_SECONDS) * 1000 };
}

// Client_id/secret (long-lived) are preferred — this exchanges them for a
// fresh access token every run, since a static ZOONIVERSE_BEARER_TOKEN
// secret would silently expire (~2h) between a scheduled cron job's runs.
// Falls back to a raw ZOONIVERSE_BEARER_TOKEN for quick local dry-runs.
async function getAuthToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }

  const exchanged = await fetchClientCredentialsToken();
  if (exchanged) {
    cachedToken = exchanged;
    return exchanged.accessToken;
  }

  return cleanEnv(process.env.ZOONIVERSE_BEARER_TOKEN);
}

export async function fetchPanoptes(pathname, searchParams = {}) {
  // API_BASE_URL must end with "/" and pathname must NOT start with "/" —
  // otherwise WHATWG URL resolution treats the leading-slash path as
  // absolute and drops the "/api" base segment entirely, silently hitting
  // the Zooniverse frontend (which returns HTML, not JSON) instead of the
  // Panoptes API.
  const url = new URL(String(pathname).replace(/^\/+/, ""), API_BASE_URL);
  for (const [key, value] of Object.entries(searchParams)) {
    if (value == null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const token = await getAuthToken();
  const response = await fetch(url, {
    headers: {
      Accept: API_ACCEPT,
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Panoptes ${pathname} failed with ${response.status}`);
  }

  return response.json();
}

export async function getProjectBySlugCandidates(candidates) {
  for (const candidate of candidates) {
    const payload = await fetchPanoptes("/projects", { slug: candidate });
    if (Array.isArray(payload?.projects) && payload.projects.length > 0) {
      return payload.projects[0];
    }
  }

  throw new Error(`Project not found for slug candidates: ${candidates.join(", ")}`);
}

export async function listSubjectsForProject(projectId, { pageSize = 100, maxPages = 5 } = {}) {
  const subjects = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const payload = await fetchPanoptes("/subjects", {
      project_id: projectId,
      page_size: pageSize,
      page,
    });

    const pageSubjects = Array.isArray(payload?.subjects) ? payload.subjects : [];
    subjects.push(...pageSubjects);

    if (pageSubjects.length < pageSize) break;
  }

  return subjects;
}

export function subjectMetadata(subject) {
  return subject && typeof subject.metadata === "object" && subject.metadata !== null ? subject.metadata : {};
}

export function extractImageUrls(subject) {
  const urls = [];
  const seen = new Set();

  function pushUrl(value) {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (!trimmed.startsWith("http")) return;
    if (seen.has(trimmed)) return;
    seen.add(trimmed);
    urls.push(trimmed);
  }

  if (Array.isArray(subject?.locations)) {
    for (const location of subject.locations) {
      if (!location || typeof location !== "object") continue;
      for (const value of Object.values(location)) {
        pushUrl(value);
      }
    }
  }

  const metadata = subjectMetadata(subject);
  for (const value of Object.values(metadata)) {
    if (typeof value === "string") {
      pushUrl(value);
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach(pushUrl);
    }
  }

  return urls;
}

export function pickFirstString(record, keys, fallback = null) {
  for (const key of keys) {
    const value = record?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return fallback;
}

export function coerceStringArray(value) {
  if (Array.isArray(value)) {
    return value.filter((entry) => typeof entry === "string" && entry.trim()).map((entry) => entry.trim());
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((entry) => typeof entry === "string" && entry.trim()).map((entry) => entry.trim());
      }
    } catch {
      return value.split(",").map((entry) => entry.trim()).filter(Boolean);
    }
  }

  return [];
}
