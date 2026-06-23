import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/markdown-content";
import { getPublishedArticle } from "@/lib/cms";
import { parseMarkdown } from "@/lib/markdown";

type Params = { slug: string };

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);

  if (!article) {
    notFound();
  }

  const blocks = parseMarkdown(article.body);
  const tags = article.tags ?? [];
  const citizenScienceLinks = article.citizen_science_links ?? [];

  return (
    <main style={{ maxWidth: "640px", margin: "2rem auto", padding: "0 1rem" }}>
      <article>
        <p className="eyebrow">The Daily Transit</p>
        <h1>{article.title}</h1>
        {article.published_at && (
          <p className="muted" style={{ marginBottom: "1rem" }}>
            {new Date(article.published_at).toLocaleDateString()}
          </p>
        )}

        <MarkdownContent blocks={blocks} />

        {tags.length > 0 && (
          <p className="muted" style={{ marginTop: "1.5rem" }}>
            {tags.map((tag) => `#${tag}`).join(" ")}
          </p>
        )}

        {citizenScienceLinks.length > 0 && (
          <div className="panel" style={{ marginTop: "1.5rem", padding: "1rem" }}>
            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Get involved</p>
            <ul>
              {citizenScienceLinks.map((link) => (
                <li key={link}>
                  <a href={link} target="_blank" rel="noreferrer">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>

      <div style={{ marginTop: "1.5rem" }}>
        <Link href="/articles" className="button">Back to Articles</Link>
      </div>
    </main>
  );
}
