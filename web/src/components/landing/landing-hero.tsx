import { Kicker } from "@/components/landing/landing-shared";

export function LandingHero() {
  return (
    <section className="tx-hero-public" aria-label="The Daily Transit pre-launch edition">
      <div>
        <Kicker>Pre-launch edition &middot; Vol. 0 &middot; Star Sailors</Kicker>
        <h1 className="tx-hero-title">
          The Daily <em>Transit</em>
        </h1>
        <p className="tx-lede">
          A coming-soon daily paper for people who want to play with real space data. Expect citizen-science puzzles, short discovery reels, headline articles, and updates from the Star Sailors universe.
        </p>
        <div className="tx-tag-row" aria-label="Planned Daily Transit features">
          <span className="tx-tag">Games</span>
          <span className="tx-tag">Daily puzzles</span>
          <span className="tx-tag">Discovery news</span>
          <span className="tx-tag">Reels</span>
        </div>
        <div className="tx-hero-actions">
          <a className="button button-primary" href="#briefing">Tell us what to publish</a>
          <a className="button" href="#games">Meet the games</a>
        </div>
      </div>

      <aside className="tx-console" aria-label="Launch console">
        <div className="tx-console-card">
          <div className="tx-console-head">
            <span>Launch window</span>
            <span className="tx-console-value">Soon</span>
          </div>
          <div className="tx-bars" aria-hidden>
            {[28, 46, 38, 58, 42, 68].map((height) => (
              <span key={height} style={{ height }} />
            ))}
          </div>
          <div className="tx-console-head">
            <span>No hard date</span>
            <span className="tx-console-value">Prepping</span>
          </div>
        </div>
        <div className="tx-console-card is-dark">
          <div className="tx-console-head">
            <span>Reader briefing</span>
            <span>Open</span>
          </div>
          <p>Tell the desk which puzzles, reels, and discovery stories should make the first edition.</p>
        </div>
      </aside>
    </section>
  );
}
