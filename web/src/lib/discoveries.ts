import { getSailyPocketBaseUrl } from "@/lib/pocketbase/config";

export type Discovery = {
  id: string;
  game: string;
  kind: string;
  headline: string;
  summary: string;
  cta_href: string;
  occurred_at: string;
  payload: Record<string, unknown> | null;
};

type PocketBaseListResponse<T> = {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

/**
 * Discoveries are publicly readable directly from PocketBase's REST API
 * (see the `discoveries` collection's list/view rules) — same pattern as
 * `listPublishedArticles()` in `cms.ts`. Generalized across minigames: any
 * producer writing into `discoveries` shows up here with no frontend change.
 */
export async function listDiscoveries(): Promise<Discovery[]> {
  const baseUrl = getSailyPocketBaseUrl().replace(/\/$/, "");
  const url = `${baseUrl}/api/collections/discoveries/records?sort=-occurred_at`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as PocketBaseListResponse<Discovery>;
  return data.items;
}

export async function getLatestDiscovery(): Promise<Discovery | null> {
  const baseUrl = getSailyPocketBaseUrl().replace(/\/$/, "");
  const url = `${baseUrl}/api/collections/discoveries/records?sort=-occurred_at&perPage=1`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as PocketBaseListResponse<Discovery>;
  return data.items[0] ?? null;
}
