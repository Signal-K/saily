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
  const episodeLabel = article.episode_number
    ? `Episode ${article.episode_number}`
    : "Episode transcript";

  return (
    <main className="episode-page">
      <article>
        <header className="episode-story-header">
          <p className="eyebrow">The Daily Transit · A Star Sailors publication</p>
          <h1>{article.title}</h1>
        </header>

        {article.audio_url && (
          <section className="panel episode-player">
            <p className="eyebrow">Listen to this episode</p>
            <audio
              controls
              preload="metadata"
              src={article.audio_url}
            >
              Your browser does not support embedded audio.
            </audio>
          </section>
        )}

        <div className="episode-story-layout">
          <aside className="episode-story-meta">
            <p className="muted">
              {episodeLabel}
              {article.audio_duration ? ` · ${article.audio_duration}` : ""}
            </p>
            {article.published_at && (
              <p className="muted">
                {new Date(article.published_at).toLocaleDateString()}
              </p>
            )}
            {tags.length > 0 && (
              <p className="muted">
                {tags.map((tag) => `#${tag}`).join(" ")}
              </p>
            )}
          </aside>

          <section className="episode-transcript">
            <div className="episode-transcript-header">
              <p className="eyebrow">Full transcript</p>
              <h2>Read the episode</h2>
            </div>

            <MarkdownContent blocks={blocks} />
          </section>

          <aside className="episode-story-actions">
            {citizenScienceLinks.length > 0 && (
              <div className="panel episode-involvement">
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

            <div className="panel episode-story-atlas">
              <p className="eyebrow">Continue with Atlas</p>
              <h2>See what the story looks like from where you are.</h2>
              <p className="muted">
                Open Atlas to explore the sky overhead and carry this episode into your
                next observing session.
              </p>
              <a
                href="https://youratlas.cc"
                target="_blank"
                rel="noreferrer"
                className="button button-primary"
              >
                Open Atlas →
              </a>
            </div>
          </aside>
        </div>
      </article>

      <div className="episode-page-back">
        <Link href="/articles" className="button">Back to Episodes</Link>
      </div>
    </main>
  );
}
