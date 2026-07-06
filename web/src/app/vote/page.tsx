import Link from "next/link";
import { VoteRanking } from "@/components/landing/vote-ranking";
import { RecentVotes } from "@/components/landing/recent-votes";

export const metadata = { title: "Landing page design vote — The Daily Transit" };

const OLD_DESIGNS_URL = "https://thedailysail-i2ce19z1z-signal-k.vercel.app";

export default function VotePage() {
  return (
    <main className="dt-page-shell">
      <section className="panel" style={{ borderTop: "3px double var(--ink, #16181c)" }}>
        <p className="eyebrow">The Daily Transit</p>
        <h1>Design vote</h1>
        <p className="muted" style={{ maxWidth: "62ch" }}>
          We ran a small vote across four landing page designs — Editorial, Cosmic, Solar, and
          Minimal — and went with 📰 <strong>Editorial</strong>. You can still rank your favourite
          below, and browse the{" "}
          <a href={OLD_DESIGNS_URL} target="_blank" rel="noreferrer">
            archived version with the full style switcher
          </a>{" "}
          to see what the other three looked like.
        </p>
      </section>

      <VoteRanking />
      <RecentVotes />

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <Link href="/" className="button">Back to Today</Link>
        <a href={OLD_DESIGNS_URL} target="_blank" rel="noreferrer" className="button button-secondary">
          View old designs
        </a>
      </div>
    </main>
  );
}
