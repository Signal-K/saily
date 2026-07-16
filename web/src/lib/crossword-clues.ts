import { getSharedPocketBaseUrl } from "@/lib/pocketbase/config";
import { listDiscoveries } from "@/lib/discoveries";
import { listPublishedArticles } from "@/lib/cms";

export type CrosswordClueSource = {
  // Answer word: uppercase, letters only (crossword grid requirement).
  answer: string;
  clue: string;
  sourceUrl: string | null;
};

type SkyEventRecord = {
  id: string;
  kind: string;
  target: string;
  title: string;
  description: string;
};

type PocketBaseListResponse<T> = { items: T[] };

// Real upcoming night-sky events from the shared PocketBase `sky_events`
// collection (port 8090) — the same collection Atlas already reads in
// atlas/src/lib/sync.ts via pb.collection('sky_events'). This is a second
// reader, not a duplicate ingestion path.
async function fetchUpcomingSkyEvents(limit = 12): Promise<SkyEventRecord[]> {
  const baseUrl = getSharedPocketBaseUrl().replace(/\/$/, "");
  const now = new Date().toISOString();
  const params = new URLSearchParams({
    filter: `starts_at >= "${now}"`,
    sort: "starts_at",
    perPage: String(limit),
  });

  try {
    const response = await fetch(`${baseUrl}/api/collections/sky_events/records?${params.toString()}`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const data = (await response.json()) as PocketBaseListResponse<SkyEventRecord>;
    return data.items ?? [];
  } catch {
    return [];
  }
}

function toAnswerWord(raw: string): string | null {
  const cleaned = raw.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (cleaned.length < 3 || cleaned.length > 12) return null;
  return cleaned;
}

// Real astronomy/mission terms worth surfacing as clues when they appear in
// a sky event's target/title or an article's tags — no invented facts, this
// only recognizes real vocabulary already present in the source content.
const KNOWN_TERMS: Record<string, string> = {
  jupiter: "Largest planet in the Solar System, visible tonight per current sky events",
  saturn: "Ringed planet, a late-night telescope target",
  venus: "Second planet from the Sun, bright in evening twilight",
  mars: "The Red Planet",
  scorpius: "Southern-sky constellation anchoring the Milky Way core",
  transit: "What a planet does when it crosses in front of its star, dimming it",
  exoplanet: "A planet orbiting a star other than the Sun",
  tess: "NASA mission hunting exoplanets via the transit method",
  lightcurve: "A plot of a star's brightness over time",
  perihelion: "A body's closest point to the Sun in its orbit",
  aurora: "Light display caused by solar particles hitting the atmosphere",
  meteor: "A streak of light from debris burning up in the atmosphere",
};

export async function buildClueBank(): Promise<CrosswordClueSource[]> {
  const [skyEvents, discoveries, articles] = await Promise.all([
    fetchUpcomingSkyEvents(),
    listDiscoveries().catch(() => []),
    listPublishedArticles().catch(() => []),
  ]);

  const bank = new Map<string, CrosswordClueSource>();

  for (const event of skyEvents) {
    const words = `${event.target} ${event.title}`.toLowerCase().split(/[^a-z]+/);
    for (const word of words) {
      const known = KNOWN_TERMS[word];
      if (!known) continue;
      const answer = toAnswerWord(word);
      if (!answer || bank.has(answer)) continue;
      bank.set(answer, { answer, clue: known, sourceUrl: null });
    }
  }

  for (const discovery of discoveries.slice(0, 10)) {
    const words = discovery.headline.toLowerCase().split(/[^a-z]+/);
    for (const word of words) {
      const known = KNOWN_TERMS[word];
      if (!known) continue;
      const answer = toAnswerWord(word);
      if (!answer || bank.has(answer)) continue;
      bank.set(answer, { answer, clue: `${known} — from today's discoveries`, sourceUrl: discovery.cta_href || null });
    }
  }

  for (const article of articles.slice(0, 5)) {
    const tags = article.tags ?? [];
    for (const tag of tags) {
      const word = tag.toLowerCase();
      const known = KNOWN_TERMS[word];
      if (!known) continue;
      const answer = toAnswerWord(word);
      if (!answer || bank.has(answer)) continue;
      bank.set(answer, { answer, clue: `${known} — from today's article "${article.title}"`, sourceUrl: `/articles/${article.slug}` });
    }
  }

  // Always include a small set of evergreen real-science terms so the
  // puzzle is solvable even on a quiet news day with few live sky events.
  for (const [word, clue] of Object.entries(KNOWN_TERMS)) {
    const answer = toAnswerWord(word);
    if (!answer || bank.has(answer)) continue;
    bank.set(answer, { answer, clue, sourceUrl: null });
  }

  return Array.from(bank.values());
}
