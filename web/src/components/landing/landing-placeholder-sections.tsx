import { Kicker } from "@/components/landing/landing-shared";

const HOW_STEPS = [
  {
    n: "01",
    head: "Pick a mission",
    body: "Browse the active mission list and choose a dataset to work with — exoplanet lightcurves, reef survey imagery, or asteroid sweep frames. Each mission ships with a short briefing so you know what you're looking for.",
  },
  {
    n: "02",
    head: "Classify and annotate",
    body: "Step through data one unit at a time. Flag what looks interesting, mark what doesn't, and leave notes for the crew. Most sessions take under ten minutes. You can stop and resume at any point.",
  },
  {
    n: "03",
    head: "Consensus drives the science",
    body: "Your classifications are weighted against the rest of the crew's. When the community agrees on a candidate signal, it enters the research pipeline and the narrative arc of the game advances. Real data, real stakes.",
  },
];

const DISPATCHES = [
  {
    tag: "Science",
    date: "Jun 2026",
    head: "How TESS measures a transit — and why it needs your eyes",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vehicula orci a justo commodo, vel cursus felis dapibus. Sed euismod sapien nec ante tristique, at gravida nisi facilisis.",
    readTime: "4 min read",
  },
  {
    tag: "Dispatch",
    date: "May 2026",
    head: "Coral Clicker: behind the classification task we built with AIMS researchers",
    body: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras convallis magna sed leo faucibus, ac ultricies felis posuere.",
    readTime: "6 min read",
  },
  {
    tag: "Mission log",
    date: "Apr 2026",
    head: "Sector 7-G: what the crew found in three months of lightcurve work",
    body: "Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Integer posuere erat a ante venenatis dapibus.",
    readTime: "8 min read",
  },
];

const FAQ = [
  {
    q: "Do I need a science background?",
    a: "No. Each mission comes with a tutorial and reference guide. If you can tell a curve from a flat line, you can classify a transit. Most people are up and running in five minutes.",
  },
  {
    q: "Is my data actually used by researchers?",
    a: "Yes. Classifications feed into crowd-consensus pipelines that run alongside automated algorithms. Signals flagged by the community are reviewed by the science team and, if validated, enter the formal literature with contributor credits.",
  },
  {
    q: "How long does a session take?",
    a: "A standard classification run takes eight to twelve minutes. You can stop at any point — the platform saves your position and picks up where you left off.",
  },
  {
    q: "What is the narrative layer?",
    a: "On top of the science tasks there is a crew-management game. Your discoveries become the inciting events of branching missions. Resources, personnel, and ship upgrades are earned through classification accuracy, not time spent.",
  },
];

export function LandingPlaceholderSections() {
  return (
    <>
      {/* ── How it works ───────────────────────────────────────────── */}
      <section className="tx-section tx-ph-how">
        <Kicker>How it works</Kicker>
        <h2 style={{ margin: "0.35rem 0 2rem", fontSize: "clamp(1.5rem, 3vw, 2rem)", lineHeight: 1.2 }}>
          Three steps from zero to discovery
        </h2>
        <ol className="tx-ph-steps">
          {HOW_STEPS.map(s => (
            <li key={s.n} className="tx-ph-step">
              <span className="tx-ph-step-n">{s.n}</span>
              <div>
                <h3 className="tx-ph-step-head">{s.head}</h3>
                <p className="tx-ph-step-body">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Dispatches ─────────────────────────────────────────────── */}
      <section className="tx-section tx-ph-dispatches">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <Kicker>From the dispatch</Kicker>
            <h2 style={{ margin: "0.35rem 0 0", fontSize: "clamp(1.5rem, 3vw, 2rem)", lineHeight: 1.2 }}>
              Reads from the field
            </h2>
          </div>
          <span className="tx-ph-see-all">View all dispatches →</span>
        </div>
        <div className="tx-ph-card-grid">
          {DISPATCHES.map(d => (
            <article key={d.head} className="tx-ph-card">
              <div className="tx-ph-card-meta">
                <span className="tx-ph-card-tag">{d.tag}</span>
                <span className="tx-ph-card-date">{d.date}</span>
              </div>
              <h3 className="tx-ph-card-head">{d.head}</h3>
              <p className="tx-ph-card-body">{d.body}</p>
              <span className="tx-ph-card-read">{d.readTime}</span>
            </article>
          ))}
        </div>
      </section>

      {/* ── Long-form "About the science" ──────────────────────────── */}
      <section className="tx-section tx-ph-science">
        <div className="tx-ph-two-col">
          <div className="tx-ph-prose">
            <Kicker>About the science</Kicker>
            <h2 style={{ margin: "0.35rem 0 1.25rem", fontSize: "clamp(1.5rem, 3vw, 2rem)", lineHeight: 1.2 }}>
              Why citizen science still matters when algorithms are everywhere
            </h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi vitae justo ut nisi facilisis posuere.
              Quisque fringilla nisl vel arcu pretium, non faucibus diam ornare. Pellentesque habitant morbi tristique
              senectus et netus et malesuada fames ac turpis egestas.
            </p>
            <p>
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
            <p>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
              laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio, et tempus feugiat.
            </p>
            <p>
              Nullam varius, turpis molestie dictum ultricies, mi sem tempor arcu, a mattis massa nisi sit amet arcu.
              Fusce fermentum. Nullam cursus lacinia erat. Praesent blandit laoreet nibh.
            </p>
          </div>
          <aside className="tx-ph-aside">
            <div className="tx-ph-aside-block">
              <p className="tx-ph-aside-label">By the numbers</p>
              <ul className="tx-ph-stat-list">
                {[
                  ["5,502", "confirmed exoplanets"],
                  ["23M+", "citizen classifications to date"],
                  ["147", "peer-reviewed papers citing crowdsourced data"],
                  ["3", "missions at launch"],
                ].map(([n, label]) => (
                  <li key={label} className="tx-ph-stat-item">
                    <strong className="tx-ph-stat-n">{n}</strong>
                    <span className="tx-ph-stat-label">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="tx-ph-aside-block">
              <p className="tx-ph-aside-label">Further reading</p>
              <ul className="tx-ph-link-list">
                {[
                  "The case for citizen astronomy",
                  "How crowdsourcing found Boyajian's star",
                  "TESS: a primer for non-astronomers",
                  "What makes a good transit signal?",
                ].map(l => (
                  <li key={l}><span className="tx-ph-fake-link">{l} →</span></li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section className="tx-section tx-ph-faq">
        <Kicker>FAQ</Kicker>
        <h2 style={{ margin: "0.35rem 0 1.75rem", fontSize: "clamp(1.5rem, 3vw, 2rem)", lineHeight: 1.2 }}>
          Common questions
        </h2>
        <dl className="tx-ph-faq-list">
          {FAQ.map(item => (
            <div key={item.q} className="tx-ph-faq-item">
              <dt className="tx-ph-faq-q">{item.q}</dt>
              <dd className="tx-ph-faq-a">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
