import { NextResponse } from "next/server";
import { resolveGameDate } from "@/lib/game";
import { getDailyMarsImages, MARS_FALLBACK_IMAGES, type MarsImage } from "@/lib/mars-images";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Fetches today's Mars images from the NASA Image Library (no API key needed)
// and applies a date-seeded selection. Falls back to the static set on error.
// ---------------------------------------------------------------------------

type NasaItem = {
  data?: Array<{
    nasa_id?: string;
    title?: string;
    description?: string;
    photographer?: string;
    keywords?: string[];
    secondary_creator?: string;
  }>;
  links?: Array<{ href?: string; rel?: string }>;
};

const DISALLOWED_TERMS = [
  "illustration",
  "gradient illustration",
  "artist concept",
  "artist's concept",
  "artists concept",
  "artists rendering",
  "rendering",
  "concept art",
  "animation",
  "poster",
  "infographic",
  "composite",
  "mosaic",
] as const;

function isLikelyRoverPhoto(data: NonNullable<NasaItem["data"]>[number]) {
  const combined = [
    data.title,
    data.description,
    data.photographer,
    data.secondary_creator,
    ...(data.keywords ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!combined) return false;

  if (DISALLOWED_TERMS.some((term) => combined.includes(term))) {
    return false;
  }

  const hasMarsSignal = combined.includes("mars") || combined.includes("martian");
  const hasRoverSignal =
    combined.includes("rover") ||
    combined.includes("perseverance") ||
    combined.includes("curiosity") ||
    combined.includes("mastcam") ||
    combined.includes("navcam") ||
    combined.includes("hazcam");

  return hasMarsSignal && hasRoverSignal;
}

async function fetchNasaImages(page: number): Promise<MarsImage[]> {
  const url = new URL("https://images-api.nasa.gov/search");
  url.searchParams.set("q", "\"mars rover\" surface -illustration -rendering -concept");
  url.searchParams.set("media_type", "image");
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", "20");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) return [];

  const json = (await res.json()) as {
    collection?: { items?: NasaItem[] };
  };

  const items = json.collection?.items ?? [];
  const images: MarsImage[] = [];

  for (const item of items) {
    const data = item.data?.[0];
    const thumb = item.links?.find((l) => l.rel === "preview")?.href ?? "";
    if (!data?.nasa_id || !thumb || !isLikelyRoverPhoto(data)) continue;

    images.push({
      id: data.nasa_id,
      // Upgrade thumbnail to medium size image.
      url: thumb.replace("~thumb.jpg", "~medium.jpg"),
      title: data.title ?? data.nasa_id,
      credit: data.photographer ?? "NASA",
    });
  }

  return images;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = resolveGameDate(url.searchParams.get("date"));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Pick a page number seeded by date (pages 1–8 of NASA results).
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash << 5) - hash + date.charCodeAt(i);
    hash |= 0;
  }
  const page = (Math.abs(hash) % 8) + 1;

  let pool: MarsImage[] = [];
  try {
    pool = await fetchNasaImages(page);
  } catch {
    // Network failure — fall through to static set.
  }

  if (pool.length < 3) {
    pool = MARS_FALLBACK_IMAGES;
  }

  const images = getDailyMarsImages(date, pool);

  return NextResponse.json({
    ok: true,
    date,
    images,
    user: user ? { id: user.id, email: user.email } : null,
  });
}
