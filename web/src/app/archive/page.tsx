import Link from "next/link";

export const metadata = { title: "Archive — The Daily Transit" };

const archiveEntries = [
  {
    date: "Today",
    title: "Live sky briefing",
    summary: "NASA APOD, moon phase, meteor watch, local sky mode, and Star Sailors network pulse.",
    href: "/#daily",
    tag: "live edition",
  },
  {
    date: "This week",
    title: "Citizen-science activity",
    summary: "A rolling index of transit classifications, Mars surface pins, comet calls, and Gaia light-curve checks.",
    href: "/discoveries",
    tag: "network",
  },
  {
    date: "Coming next",
    title: "Daily edition history",
    summary: "Saved APOD-led briefings, source links, location-aware observing prompts, and playable mission replays.",
    href: "/calendar",
    tag: "planned",
  },
  {
    date: "Past decision",
    title: "Landing page design vote",
    summary: "We tested four landing page styles and committed to Editorial. See recent votes, cast your own, or browse the archived version with the full style switcher.",
    href: "/vote",
    tag: "design",
  },
];

export default function ArchivePage() {
  return (
    <main className="dt-page-shell">
      <section className="panel" style={{ borderTop: "3px double var(--ink, #16181c)" }}>
        <p className="eyebrow">The Daily Transit</p>
        <h1>Archive</h1>
        <p className="muted" style={{ maxWidth: "62ch" }}>
          Recent editions, source pulls, and daily mission records. The live archive starts with today&apos;s automated
          briefing and will retain each daily edition as the feed matures.
        </p>
      </section>

      <section style={{ display: "grid", gap: "1rem", marginTop: "1rem" }} aria-label="Archive editions">
        {archiveEntries.map((entry) => (
          <Link
            key={entry.title}
            href={entry.href}
            className="panel"
            style={{ display: "grid", gap: "0.45rem", textDecoration: "none", color: "inherit" }}
          >
            <p className="muted" style={{ margin: 0, fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {entry.date} · {entry.tag}
            </p>
            <h2 style={{ margin: 0 }}>{entry.title}</h2>
            <p className="muted" style={{ margin: 0 }}>{entry.summary}</p>
          </Link>
        ))}
      </section>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <Link href="/" className="button">Today</Link>
        <Link href="/articles" className="button button-secondary">Articles</Link>
      </div>
    </main>
  );
}
