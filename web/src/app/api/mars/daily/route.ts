import { NextResponse } from "next/server";
import { resolveGameDate } from "@/lib/game";
import { getDailyMarsImages, MARS_FALLBACK_IMAGES, type MarsImage } from "@/lib/mars-images";

// ---------------------------------------------------------------------------
// Fetches today's Mars images from the NASA Image Library (no API key needed)
// and applies a date-seeded selection. Falls back to the static set on error.
// ---------------------------------------------------------------------------

type NasaItem = {
  data?: Array<{ nasa_id?: string; title?: string; photographer?: string }>;
  links?: Array<{ href?: string; rel?: string }>;
};

async function fetchNasaImages(page: number): Promise<MarsImage[]> {
  const url = new URL("https://images-api.nasa.gov/search");
  url.searchParams.set("q", "mars rover surface");
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
    if (!data?.nasa_id || !thumb) continue;

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

  return NextResponse.json({ ok: true, date, images });
}
