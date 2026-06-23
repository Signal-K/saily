import Link from "next/link";
import { listPublishedArticles } from "@/lib/cms";

export const metadata = { title: "Articles — The Daily Transit" };

export default async function ArticlesPage() {
  const articles = await listPublishedArticles();

  return (
    <main style={{ maxWidth: "640px", margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <p className="eyebrow">The Daily Transit</p>
        <h1>Articles</h1>
      </div>

      {articles.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "2rem" }}>
          <p>No articles published yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="panel"
              style={{ display: "block", padding: "1.25rem" }}
            >
              <h2 style={{ marginBottom: "0.25rem" }}>{article.title}</h2>
              <p className="muted">{article.summary}</p>
              {article.published_at && (
                <p className="muted" style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
                  {new Date(article.published_at).toLocaleDateString()}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <Link href="/" className="button">Back to Home</Link>
      </div>
    </main>
  );
}
