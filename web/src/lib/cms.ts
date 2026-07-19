import { getSailyPocketBaseUrl } from "@/lib/pocketbase/config";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

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

const FILE_ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

function parseArrayField(value: string | undefined): string[] | null {
  if (!value) return null;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, string>; body: string } {
  if (!raw.startsWith("---\n")) return { frontmatter: {}, body: raw.trim() };
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return { frontmatter: {}, body: raw.trim() };

  const frontmatterText = raw.slice(4, end);
  const body = raw.slice(end + 5).trim();
  const frontmatter: Record<string, string> = {};
  for (const line of frontmatterText.split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key) frontmatter[key] = value;
  }
  return { frontmatter, body };
}

async function listFileArticles(): Promise<CmsArticle[]> {
  let files: string[];
  try {
    files = await readdir(FILE_ARTICLES_DIR);
  } catch {
    return [];
  }

  const articles = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map(async (file) => {
        const raw = await readFile(path.join(FILE_ARTICLES_DIR, file), "utf8");
        const { frontmatter, body } = parseFrontmatter(raw);
        const slug = frontmatter.slug || file.replace(/\.md$/, "");
        const publishedAt = frontmatter.publishedAt || "";
        return {
          id: `file:${slug}`,
          slug,
          title: frontmatter.title || slug,
          status: frontmatter.status || "published",
          summary: frontmatter.summary || "",
          body,
          tags: parseArrayField(frontmatter.tags),
          sources: parseArrayField(frontmatter.sources),
          citizen_science_links: parseArrayField(frontmatter.citizenScienceLinks),
          hero_image: frontmatter.heroImage || "",
          published_at: publishedAt,
          updated_at: frontmatter.updatedAt || publishedAt,
        };
      }),
  );

  return articles
    .filter((article) => article.status === "published")
    .sort((a, b) => b.published_at.localeCompare(a.published_at));
}

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
    return listFileArticles();
  }

  const data = (await response.json()) as PocketBaseListResponse<CmsArticle>;
  return data.items.length > 0 ? data.items : listFileArticles();
}

export async function getLatestPublishedArticle(): Promise<CmsArticle | null> {
  const baseUrl = getSailyPocketBaseUrl().replace(/\/$/, "");
  const url = `${baseUrl}/api/collections/cms_articles/records?filter=${encodeURIComponent(
    'status = "published"',
  )}&sort=-published_at&perPage=1`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const articles = await listFileArticles();
    return articles[0] ?? null;
  }

  const data = (await response.json()) as PocketBaseListResponse<CmsArticle>;
  if (data.items[0]) return data.items[0];
  const articles = await listFileArticles();
  return articles[0] ?? null;
}

export async function getPublishedArticle(slug: string): Promise<CmsArticle | null> {
  const baseUrl = getSailyPocketBaseUrl().replace(/\/$/, "");
  const filter = `status = "published" && slug = "${slug.replace(/"/g, '\\"')}"`;
  const url = `${baseUrl}/api/collections/cms_articles/records?filter=${encodeURIComponent(filter)}`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const articles = await listFileArticles();
    return articles.find((article) => article.slug === slug) ?? null;
  }

  const data = (await response.json()) as PocketBaseListResponse<CmsArticle>;
  if (data.items[0]) return data.items[0];
  const articles = await listFileArticles();
  return articles.find((article) => article.slug === slug) ?? null;
}
