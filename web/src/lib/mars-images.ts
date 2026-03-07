import { resolveGameDate } from "@/lib/game";

export type MarsImage = {
  id: string;
  url: string;
  title: string;
  credit: string;
};

export const MARS_CLASSIFICATIONS = [
  "Rock field",
  "Sand & dust",
  "Crater",
  "Equipment / rover",
  "Sky & horizon",
] as const;

export type MarsClassification = (typeof MARS_CLASSIFICATIONS)[number];

// ---------------------------------------------------------------------------
// Static fallback set — 15 public-domain NASA Mars images via the NASA
// Image and Video Library CDN. Used when the live API is unavailable.
// ---------------------------------------------------------------------------

export const MARS_FALLBACK_IMAGES: MarsImage[] = [
  {
    id: "PIA21723",
    url: "https://images-assets.nasa.gov/image/PIA21723/PIA21723~medium.jpg",
    title: "Curiosity Self-Portrait at Murray Buttes",
    credit: "NASA/JPL-Caltech/MSSS",
  },
  {
    id: "PIA21716",
    url: "https://images-assets.nasa.gov/image/PIA21716/PIA21716~medium.jpg",
    title: "Curiosity Drilling at Quela",
    credit: "NASA/JPL-Caltech/MSSS",
  },
  {
    id: "PIA20755",
    url: "https://images-assets.nasa.gov/image/PIA20755/PIA20755~medium.jpg",
    title: "Curiosity at Murray Buttes",
    credit: "NASA/JPL-Caltech/MSSS",
  },
  {
    id: "PIA19920",
    url: "https://images-assets.nasa.gov/image/PIA19920/PIA19920~medium.jpg",
    title: "Curiosity on Martian Surface",
    credit: "NASA/JPL-Caltech/MSSS",
  },
  {
    id: "PIA19397",
    url: "https://images-assets.nasa.gov/image/PIA19397/PIA19397~medium.jpg",
    title: "Curiosity at Marias Pass",
    credit: "NASA/JPL-Caltech/MSSS",
  },
  {
    id: "PIA16563",
    url: "https://images-assets.nasa.gov/image/PIA16563/PIA16563~medium.jpg",
    title: "Curiosity on Windblown Sand",
    credit: "NASA/JPL-Caltech",
  },
  {
    id: "PIA21261",
    url: "https://images-assets.nasa.gov/image/PIA21261/PIA21261~medium.jpg",
    title: "Curiosity Rocky Terrain",
    credit: "NASA/JPL-Caltech",
  },
  {
    id: "PIA24430",
    url: "https://images-assets.nasa.gov/image/PIA24430/PIA24430~medium.jpg",
    title: "Perseverance Rocky Terrain",
    credit: "NASA/JPL-Caltech",
  },
  {
    id: "PIA24420",
    url: "https://images-assets.nasa.gov/image/PIA24420/PIA24420~medium.jpg",
    title: "Perseverance First Drive",
    credit: "NASA/JPL-Caltech",
  },
  {
    id: "PIA23764",
    url: "https://images-assets.nasa.gov/image/PIA23764/PIA23764~medium.jpg",
    title: "Perseverance Landing Site",
    credit: "NASA/JPL-Caltech",
  },
  {
    id: "PIA22207",
    url: "https://images-assets.nasa.gov/image/PIA22207/PIA22207~medium.jpg",
    title: "Curiosity Vera Rubin Ridge",
    credit: "NASA/JPL-Caltech/MSSS",
  },
  {
    id: "PIA22735",
    url: "https://images-assets.nasa.gov/image/PIA22735/PIA22735~medium.jpg",
    title: "Curiosity Drilling Duluth",
    credit: "NASA/JPL-Caltech/MSSS",
  },
  {
    id: "PIA23240",
    url: "https://images-assets.nasa.gov/image/PIA23240/PIA23240~medium.jpg",
    title: "Curiosity Glen Etive",
    credit: "NASA/JPL-Caltech/MSSS",
  },
  {
    id: "PIA21600",
    url: "https://images-assets.nasa.gov/image/PIA21600/PIA21600~medium.jpg",
    title: "Curiosity Dark Sand",
    credit: "NASA/JPL-Caltech/MSSS",
  },
  {
    id: "PIA18087",
    url: "https://images-assets.nasa.gov/image/PIA18087/PIA18087~medium.jpg",
    title: "Curiosity Sandy Surface",
    credit: "NASA/JPL-Caltech",
  },
];

// ---------------------------------------------------------------------------
// Seeded daily selection — picks 3 images from the pool for a given date.
// ---------------------------------------------------------------------------

function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function hashDateString(date: string): number {
  let h = 0;
  for (let i = 0; i < date.length; i++) {
    h = (h << 5) - h + date.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getDailyMarsImages(date?: string, pool: MarsImage[] = MARS_FALLBACK_IMAGES): MarsImage[] {
  const dateKey = resolveGameDate(date);
  const seed = hashDateString(dateKey);
  return seededShuffle(pool, seed).slice(0, 3);
}
