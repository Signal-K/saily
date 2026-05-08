const API_BASE_URL = "https://www.zooniverse.org/api";
const API_ACCEPT = "application/vnd.api+json; version=1";

function cleanEnv(value) {
  return (value ?? "").trim().replace(/^"+|"+$/g, "");
}

export async function fetchPanoptes(pathname, searchParams = {}) {
  const url = new URL(pathname, API_BASE_URL);
  for (const [key, value] of Object.entries(searchParams)) {
    if (value == null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const token = cleanEnv(process.env.ZOONIVERSE_BEARER_TOKEN);
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
