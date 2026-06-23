"use client";

import { useState, FormEvent } from "react";
import { submitInterest } from "@/components/landing/landing-interest";

export function VariantEditorial() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === "sending") return;
    setState("sending");
    try {
      await submitInterest({ kind: "notify", email: email.trim() });
      setState("sent");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="tx-ed">
      {/* Masthead */}
      <header className="tx-ed-mast">
        <div className="tx-ed-mast-stripe">
          <span>Citizen Science · Space · Discovery</span>
          <span>The Universe in Play</span>
          <span>Edition 0 · Pre-Launch</span>
        </div>
        <div className="tx-ed-mast-brand">
          <h1>
            <span className="tx-ed-mast-sub">Star Sailors</span>
            Herald
          </h1>
          <p className="tx-ed-mast-tagline">Real data. Real discoveries. Yours to make.</p>
        </div>
        <nav className="tx-ed-mast-nav">
          <a href="#missions">Missions</a>
          <a href="#science">Science</a>
          <a href="#dispatch">Dispatch</a>
          <a href="#team">Team</a>
        </nav>
      </header>

      {/* Above the fold */}
      <section className="tx-ed-fold">
        <div className="tx-ed-lead">
          <p className="tx-ed-kicker">BREAKING · LAUNCH APPROACHING</p>
          <h2 className="tx-ed-headline">
            5,502 Exoplanet Candidates<br />Await Citizen Classification
          </h2>
          <p className="tx-ed-byline">Star Sailors Editorial Team · June 2026</p>
          <p className="tx-ed-para">
            A new platform for citizen science is opening. Star Sailors turns real TESS lightcurve data and ESA mission feeds into daily games and interactive dispatches — and it needs readers like you to catch the signals automated pipelines miss.
          </p>
          <p className="tx-ed-para">
            No degree required. No telescope. Just your eyes, a daily ten minutes, and the understanding that real planets have been found this way before.
          </p>
          <div className="tx-ed-pull">
            &ldquo;Every planet found by citizen science<br />was missed by the algorithm first.&rdquo;
          </div>
        </div>
        <aside className="tx-ed-sidebar">
          <div className="tx-ed-box">
            <p className="tx-ed-kicker">SUBSCRIBE · FREE</p>
            <p style={{ marginBottom: "0.85rem" }}>First edition, mission briefings, and early access — in your inbox.</p>
            {state === "sent" ? (
              <p style={{ color: "var(--primary, #0a82b3)", fontWeight: 700 }}>✓ You&apos;re on the list.</p>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.55rem" }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={state === "sending"}
                  className="tx-ed-input"
                />
                <button type="submit" className="tx-ed-btn" disabled={state === "sending"}>
                  {state === "sending" ? "Subscribing…" : "Subscribe →"}
                </button>
                {state === "error" && <p style={{ color: "#c00", margin: 0, fontSize: "0.82rem" }}>Something went wrong.</p>}
              </form>
            )}
          </div>

          <div className="tx-ed-stats">
            <div className="tx-ed-stat">
              <span className="tx-ed-stat-n">5,502</span>
              <span>confirmed exoplanets</span>
            </div>
            <div className="tx-ed-stat">
              <span className="tx-ed-stat-n">3</span>
              <span>games at launch</span>
            </div>
            <div className="tx-ed-stat">
              <span className="tx-ed-stat-n">1</span>
              <span>daily dispatch</span>
            </div>
          </div>

          <div className="tx-ed-box">
            <p className="tx-ed-kicker">TODAY IN SCIENCE</p>
            <ul className="tx-ed-brief">
              <li>TESS Sector 7-G data: transit candidates under review</li>
              <li>Coral reef classification queue opens Q3</li>
              <li>Asteroid sweep survey: instrument calibration underway</li>
            </ul>
          </div>
        </aside>
      </section>

      <div className="tx-ed-rule-double" />

      {/* Three-column news grid */}
      <section id="missions" className="tx-ed-cols">
        <article className="tx-ed-col">
          <p className="tx-ed-kicker">FLAGSHIP · LANDNAM</p>
          <h3 className="tx-ed-col-head">Hunt a Real Planet, Then Run the Ship That Finds It</h3>
          <p>Landnam combines transit photometry with a crew management game. You classify a real lightcurve dip. If the community agrees it&apos;s a planet candidate, the narrative mission begins.</p>
          <p>It&apos;s the only citizen-science game where your observation becomes the inciting event of the story.</p>
          <a href="https://starsailors.space" className="tx-ed-link" target="_blank" rel="noreferrer">Read more →</a>
        </article>
        <article className="tx-ed-col">
          <p className="tx-ed-kicker">COMING SOON · CORAL CLICKER</p>
          <h3 className="tx-ed-col-head">Species Identification From a Relaxed Puzzle Game</h3>
          <p>Coral reefs cover less than 1% of the ocean floor but support 25% of marine species. Coral Clicker takes survey imagery and turns reef ID into a calm daily game.</p>
          <p>Your classifications contribute to population health monitoring used by real marine research teams.</p>
          <span className="tx-ed-tag">Staging</span>
        </article>
        <article className="tx-ed-col">
          <p className="tx-ed-kicker">SCIENCE DESK · WHY IT MATTERS</p>
          <h3 className="tx-ed-col-head">More Data Than Scientists Can Inspect Alone</h3>
          <p>Automated pipelines miss edge cases that human visual systems catch instantly. Transit signals buried in noise. Morphological features algorithms won&apos;t flag.</p>
          <p>The Daily Transit exists because the data is real, the backlog is vast, and your ten minutes are worth something.</p>
          <span className="tx-ed-tag">Analysis</span>
        </article>
      </section>

      <div className="tx-ed-rule" />

      {/* Team as editorial board */}
      <section id="team" className="tx-ed-board">
        <p className="tx-ed-kicker">EDITORIAL BOARD</p>
        <div className="tx-ed-board-grid">
          {[
            { name: "Liam Martin", role: "Editor-in-Chief · Game Design" },
            { name: "Rhys Campbell", role: "Data Editor · Machine Learning" },
            { name: "Fred Bruce", role: "Visual Editor · Audio & Interface" },
          ].map(p => (
            <div key={p.name} className="tx-ed-board-member">
              <strong>{p.name}</strong>
              <span>{p.role}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
