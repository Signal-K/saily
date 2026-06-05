import { Kicker } from "@/components/landing/landing-shared";

export function LandingHero() {
  return (
    <section className="tx-hero-public" aria-label="Star Sailors ecosystem">
      <div>
        <Kicker>The Universe in Play &middot; Star Sailors</Kicker>
        <h1 className="tx-hero-title">
          Star <em>Sailors</em>
        </h1>
        <p className="tx-lede">
          A collection of citizen-science games and interactive dispatches. From hunting exoplanets to classifying coral reefs, we turn real scientific data into meaningful play.
        </p>
        <div className="tx-tag-row" aria-label="Star Sailors ecosystem features">
          <span className="tx-tag">Citizen Science</span>
          <span className="tx-tag">Interactive Data</span>
          <span className="tx-tag">Real Discoveries</span>
        </div>
        <div className="tx-hero-actions">
          <a className="button button-primary" href="#notify">Join the mission</a>
          <a className="button" href="#games">Explore the games</a>
        </div>
      </div>

      <aside className="tx-console" aria-label="Ecosystem status">
        <div className="tx-console-card">
          <div className="tx-console-head">
            <span>Discoveries</span>
            <span className="tx-console-value">Active</span>
          </div>
          <div className="tx-bars" aria-hidden>
            {[28, 46, 38, 58, 42, 68].map((height) => (
              <span key={height} style={{ height }} />
            ))}
          </div>
          <div className="tx-console-head">
            <span>Data Feeds</span>
            <span className="tx-console-value">Live</span>
          </div>
        </div>
        <div className="tx-console-card is-dark">
          <div className="tx-console-head">
            <span>Star Sailors Hub</span>
            <span>Coming Soon</span>
          </div>
          <p>We are building a unified home for all Star Sailors experiences. Sign up for early access and updates.</p>
        </div>
      </aside>
    </section>
  );
}
