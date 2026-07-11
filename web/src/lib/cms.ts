import { getSailyPocketBaseUrl } from "@/lib/pocketbase/config";

export type CmsArticle = {
  id: string;
  slug: string;
  title: string;
  status: string;
  summary: string;
  body: string;
  tags: string[] | null;
  sources: string[] | null;
  citizen_science_links: string[] | null;
  hero_image: string;
  published_at: string;
  updated_at: string;
};

type PocketBaseListResponse<T> = {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

/**
 * Published articles are publicly readable directly from PocketBase's REST
 * API (see the `cms_articles` collection's list/view rules), so the
 * frontend doesn't need to go through the authenticated `/api/saily/cms`
 * routes used by the editor.
 */
export async function listPublishedArticles(): Promise<CmsArticle[]> {
  const baseUrl = getSailyPocketBaseUrl().replace(/\/$/, "");
  const url = `${baseUrl}/api/collections/cms_articles/records?filter=${encodeURIComponent(
    'status = "published"',
  )}&sort=-published_at`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as PocketBaseListResponse<CmsArticle>;
  return data.items;
}

export async function getLatestPublishedArticle(): Promise<CmsArticle | null> {
  const baseUrl = getSailyPocketBaseUrl().replace(/\/$/, "");
  const url = `${baseUrl}/api/collections/cms_articles/records?filter=${encodeURIComponent(
    'status = "published"',
  )}&sort=-published_at&perPage=1`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as PocketBaseListResponse<CmsArticle>;
  return data.items[0] ?? null;
}

export async function getPublishedArticle(slug: string): Promise<CmsArticle | null> {
  const baseUrl = getSailyPocketBaseUrl().replace(/\/$/, "");
  const filter = `status = "published" && slug = "${slug.replace(/"/g, '\\"')}"`;
  const url = `${baseUrl}/api/collections/cms_articles/records?filter=${encodeURIComponent(filter)}`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as PocketBaseListResponse<CmsArticle>;
  return data.items[0] ?? null;
}
