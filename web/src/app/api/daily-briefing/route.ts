import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ApodResponse = {
  copyright?: string;
  date?: string;
  explanation?: string;
  hdurl?: string;
  media_type?: string;
  thumbnail_url?: string;
  title?: string;
  url?: string;
};

type BriefingEvent = {
  title: string;
  body: string;
  source: string;
  href: string;
  tag: string;
};

const NETWORK_EVENTS = [
  "transit intervals marked",
  "Mars surface pins placed",
  "archive replays opened",
  "candidate notes added",
];

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function seededNumber(seed: number, min: number, max: number) {
  const x = Math.sin(seed * 999) * 10000;
  const t = x - Math.floor(x);
  return Math.floor(min + t * (max - min + 1));
}

function getMoonPhaseName(date: Date) {
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14));
  const lunarCycleDays = 29.530588853;
  const days = (date.getTime() - knownNewMoon.getTime()) / 86400000;
  const phase = ((days % lunarCycleDays) + lunarCycleDays) % lunarCycleDays;
  if (phase < 1.84566) return "New Moon";
  if (phase < 5.53699) return "Waxing Crescent";
  if (phase < 9.22831) return "First Quarter";
  if (phase < 12.91963) return "Waxing Gibbous";
  if (phase < 16.61096) return "Full Moon";
  if (phase < 20.30228) return "Waning Gibbous";
  if (phase < 23.99361) return "Last Quarter";
  return "Waning Crescent";
}

function getMeteorEvent(date: Date): BriefingEvent {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const md = month * 100 + day;

  if (md >= 717 && md <= 824) {
    return {
      title: "Perseid meteor watch",
      body: "The Perseids are active now. The best scan is a broad, dark patch of sky after midnight, with the Moon and streetlights out of your direct view.",
      source: "International Meteor Organization",
      href: "https://www.imo.net/resources/calendar/",
      tag: "meteor shower",
    };
  }

  if (md >= 1002 && md <= 1107) {
    return {
      title: "Orionid meteor watch",
      body: "Orionid meteors can arrive as quick, bright streaks. Give your eyes time to adapt and watch a wide field rather than a single star.",
      source: "International Meteor Organization",
      href: "https://www.imo.net/resources/calendar/",
      tag: "meteor shower",
    };
  }

  if (md >= 1204 && md <= 1217) {
    return {
      title: "Geminid meteor watch",
      body: "The Geminids are one of the year's strongest showers. If skies are clear, short observing sessions can still be productive.",
      source: "International Meteor Organization",
      href: "https://www.imo.net/resources/calendar/",
      tag: "meteor shower",
    };
  }

  if (md >= 416 && md <= 425) {
    return {
      title: "Lyrid meteor watch",
      body: "Lyrid activity is active now. Look away from the radiant and log anything bright enough to cut through suburban skyglow.",
      source: "International Meteor Organization",
      href: "https://www.imo.net/resources/calendar/",
      tag: "meteor shower",
    };
  }

  return {
    title: "Meteor watch window",
    body: "Even outside a major shower, a dark after-midnight sky can surface sporadic meteors. The useful habit is logging time, sky clarity, and direction.",
    source: "International Meteor Organization",
    href: "https://www.imo.net/resources/calendar/",
    tag: "night sky",
  };
}

function buildEvents(date: Date, latitude: number | null): BriefingEvent[] {
  const hemisphere = latitude === null ? null : latitude < 0 ? "southern" : "northern";
  const moonPhase = getMoonPhaseName(date);
  const direction = hemisphere === "southern" ? "north-east to overhead" : "south-east to overhead";

  return [
    {
      title: `${moonPhase} field note`,
      body:
        moonPhase === "New Moon"
          ? "Moonlight is low, so this is a stronger night for faint objects, survey imagery, and wide-field comparison work."
          : `The Moon is in ${moonPhase.toLowerCase()}. Use it as a brightness check before choosing faint targets or replaying archived puzzles.`,
      source: "Computed lunar phase",
      href: "https://moon.nasa.gov/moon-in-motion/moon-phases/",
      tag: "moon",
    },
    getMeteorEvent(date),
    {
      title: hemisphere ? `${hemisphere[0].toUpperCase()}${hemisphere.slice(1)} sky orientation` : "Local sky orientation",
      body: hemisphere
        ? `For this latitude, start with the ${direction} sky after dusk and shift toward darker open sky as the night settles.`
        : "Share your location to tune the watchlist for hemisphere, sky direction, and local observing windows.",
      source: "Location-aware observing prompt",
      href: "https://science.nasa.gov/skywatching/",
      tag: hemisphere ?? "location",
    },
    {
      title: "Spot the Station pass check",
      body: "Bright ISS passes are most visible close to dawn or dusk. A real pass check can turn the briefing from inspiration into a tonight task.",
      source: "NASA Spot the Station",
      href: "https://spotthestation.nasa.gov/",
      tag: "satellite",
    },
  ];
}

async function fetchApod(): Promise<ApodResponse | null> {
  const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";
  const params = new URLSearchParams({ api_key: apiKey, thumbs: "true" });

  try {
    const response = await fetch(`https://api.nasa.gov/planetary/apod?${params.toString()}`, {
      next: { revalidate: 60 * 60 },
    });
    if (!response.ok) return null;
    return (await response.json()) as ApodResponse;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawLat = Number(searchParams.get("lat"));
  const latitude = Number.isFinite(rawLat) && Math.abs(rawLat) <= 90 ? rawLat : null;
  const now = new Date();
  const day = dayOfYear(now);
  const apod = await fetchApod();
  const mediaType = apod?.media_type ?? null;
  const imageUrl = mediaType === "image" ? apod?.url ?? null : apod?.thumbnail_url ?? null;

  return NextResponse.json(
    {
      dateLabel: now.toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      moonPhase: getMoonPhaseName(now),
      apod: apod
        ? {
            copyright: apod.copyright ?? null,
            date: apod.date ?? null,
            explanation: apod.explanation ?? null,
            hdUrl: apod.hdurl ?? null,
            imageUrl,
            mediaType,
            sourceUrl: "https://apod.nasa.gov/apod/astropix.html",
            title: apod.title ?? "Astronomy Picture of the Day",
            videoUrl: mediaType === "video" ? apod.url ?? null : null,
          }
        : null,
      events: buildEvents(now, latitude),
      network: NETWORK_EVENTS.map((label, index) => ({
        label,
        value: seededNumber(day + index * 11, 18, 240),
      }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4),
    },
    {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
