export const metadata = { title: "About — The Daily Transit" };

export default function AboutPage() {
  return (
    <main className="panel" style={{ maxWidth: "640px", margin: "2rem auto" }}>
      <p className="eyebrow">About</p>
      <h1>The Daily Transit</h1>
      <p className="muted">
        The Daily Transit is the entry point into the Star Sailors ecosystem — a
        citizen-science daily edition. Read real astronomy datasets framed as
        short stories, classify data through simple minigames, and see your
        contributions feed back into ongoing research.
      </p>
      <p className="muted">
        Every mission draws on real observational data (TESS, Gaia, InSight,
        and others). We keep the framing realistic — no fictional backstory —
        so anyone can pick up a mission and understand exactly what they&apos;re
        contributing to.
      </p>
      <p className="muted">
        The Daily Transit is one part of Star Sailors, alongside{" "}
        <a href="https://playlandnam.space" target="_blank" rel="noreferrer">
          Landnam
        </a>{" "}
        and the wider{" "}
        <a href="https://starsailors.space" target="_blank" rel="noreferrer">
          Star Sailors
        </a>{" "}
        project. Source is on{" "}
        <a href="https://github.com/signal-k" target="_blank" rel="noreferrer">
          GitHub
        </a>
        .
      </p>
    </main>
  );
}
