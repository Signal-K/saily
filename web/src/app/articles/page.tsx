import Link from "next/link";
import { listPublishedArticles } from "@/lib/cms";

export const metadata = {
  title: "Episodes & Transcripts — The Daily Transit",
  description: "Listen to The Daily Transit and read every episode transcript.",
};

export default async function ArticlesPage() {
  const articles = await listPublishedArticles();
  const [leadArticle, ...remainingArticles] = articles;
  const railArticles = remainingArticles.slice(0, 3);
  const archiveArticles = remainingArticles.slice(3);

  return (
    <main className="episode-index">
      <div className="episode-index-header">
        <p className="eyebrow">The Daily Transit · A Star Sailors publication</p>
        <h1>Episodes &amp; Transcripts</h1>
        <p className="muted">
          Space and citizen science, made for listening. Every episode is published
          here with a complete transcript for reading, searching, and sharing.
        </p>
      </div>

      {!leadArticle ? (
        <div className="panel" style={{ textAlign: "center", padding: "2rem" }}>
          <p>No episodes published yet.</p>
        </div>
      ) : (
        <>
          <section
            className={`episode-front${railArticles.length ? " has-rail" : ""}`}
            aria-label="Latest episodes"
          >
            <Link
              href={`/articles/${leadArticle.slug}`}
              className="episode-lead"
            >
              <p className="eyebrow">
                {leadArticle.episode_number
                  ? `Episode ${leadArticle.episode_number}`
                  : "Transcript edition"}
                {leadArticle.audio_duration ? ` · ${leadArticle.audio_duration}` : ""}
              </p>
              <h2>{leadArticle.title}</h2>
              <p className="muted">{leadArticle.summary}</p>
              {leadArticle.published_at && (
                <p className="muted">
                  {new Date(leadArticle.published_at).toLocaleDateString()}
                </p>
              )}
              <p className="episode-link-label">
                {leadArticle.audio_url ? "Listen & read transcript →" : "Read transcript →"}
              </p>
            </Link>

            {railArticles.length > 0 && (
              <aside className="episode-rail">
                {railArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}`}
                    className="episode-rail-item"
                  >
                    <p className="eyebrow">
                      {article.episode_number
                        ? `Episode ${article.episode_number}`
                        : "Transcript edition"}
                      {article.audio_duration ? ` · ${article.audio_duration}` : ""}
                    </p>
                    <h2>{article.title}</h2>
                    <p className="muted">{article.summary}</p>
                    {article.published_at && (
                      <p className="muted">
                        {new Date(article.published_at).toLocaleDateString()}
                      </p>
                    )}
                    <p className="episode-link-label">
                      {article.audio_url ? "Listen & read transcript →" : "Read transcript →"}
                    </p>
                  </Link>
                ))}
              </aside>
            )}
          </section>

          {archiveArticles.length > 0 && (
            <section className="episode-archive-grid" aria-label="More episodes">
              {archiveArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="panel episode-archive-item"
                >
                  <p className="eyebrow">
                    {article.episode_number
                      ? `Episode ${article.episode_number}`
                      : "Transcript edition"}
                    {article.audio_duration ? ` · ${article.audio_duration}` : ""}
                  </p>
                  <h2>{article.title}</h2>
                  <p className="muted">{article.summary}</p>
                  {article.published_at && (
                    <p className="muted">
                      {new Date(article.published_at).toLocaleDateString()}
                    </p>
                  )}
                  <p className="episode-link-label">
                    {article.audio_url ? "Listen & read transcript →" : "Read transcript →"}
                  </p>
                </Link>
              ))}
            </section>
          )}
        </>
      )}

      <aside className="panel episode-index-atlas">
        <p className="eyebrow">Continue with Atlas</p>
        <h2>Take the episode into the night sky.</h2>
        <p className="muted">
          Atlas is the Star Sailors companion for finding what is overhead and
          deciding what to look for next.
        </p>
        <a
          href="https://youratlas.cc"
          target="_blank"
          rel="noreferrer"
          className="button button-primary"
        >
          Explore with Atlas →
        </a>
      </aside>

      <div className="episode-index-back">
        <Link href="/" className="button">Back to Home</Link>
      </div>
    </main>
  );
}
