"use client";

import { useState, useEffect, FormEvent } from "react";
import { submitInterest } from "@/components/landing/landing-interest";

export function VariantSolar() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    function syncTheme() {
      setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    }

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

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
    <div className="tx-sol">
      {/* Decorative rule */}
      <div className="tx-sol-top-rule">
        <span>✦</span>
        <span>Star Sailors</span>
        <span>✦</span>
        <span>The Universe in Play</span>
        <span>✦</span>
        <span>Dispatch 001</span>
        <span>✦</span>
      </div>

      {/* Opening: big atmospheric header */}
      <header className="tx-sol-header">
        <div className="tx-sol-header-inner">
          <p className="tx-sol-category">From the Field · Space Exploration</p>
          <h1 className="tx-sol-title">
            {theme === "dark" ? (
              <>Flee<br />the<br /><em>Dark</em></>
            ) : (
              <>Chase<br />the<br /><em>Light</em></>
            )}
          </h1>
          <p className="tx-sol-standfirst">
            {theme === "dark"
              ? "From midnight telescope feeds to faint transit signals, the work is to pull discoveries out of shadow. This is an invitation to join the search."
              : "From ancient navigators reading stars by firelight to today's planet hunters scanning telescope feeds at midnight — human curiosity has always pointed skyward. This is an invitation to join the search."}
          </p>
        </div>
        <aside className="tx-sol-header-aside">
          <div className="tx-sol-field-note">
            <p className="tx-sol-note-label">Field Notes</p>
            <p>Real TESS telescope data. No equipment needed. Your eyes and ten minutes a day.</p>
          </div>
          <div className="tx-sol-field-note">
            <p className="tx-sol-note-label">Current Conditions</p>
            <p>5,502 exoplanet candidates confirmed. More signals waiting to be seen.</p>
          </div>
          <div className="tx-sol-field-note">
            <p className="tx-sol-note-label">Best Season</p>
            <p>Now. The queue is open and the data is live.</p>
          </div>
        </aside>
      </header>

      <div className="tx-sol-divider">✦ ✦ ✦</div>

      {/* Main narrative body */}
      <main className="tx-sol-body">
        <div className="tx-sol-text">
          <h2 className="tx-sol-section-head">The Object of the Expedition</h2>
          <p className="tx-sol-drop-cap">
            There is more telescope data being gathered right now than every astronomer alive could read in a lifetime. Automated algorithms sift most of it. But algorithms miss things — edge cases, subtle dips, signals buried just below the detection threshold.
          </p>
          <p>
            Human visual systems catch these. Routinely. This is well-documented. And it&apos;s the reason citizen science platforms consistently turn up planet candidates that pipelines don&apos;t.
          </p>
          <p>
            Star Sailors turns that work into something you&apos;d actually want to do on a Tuesday morning.
          </p>

          <blockquote className="tx-sol-blockquote">
            <p>&ldquo;The most profound discoveries are often hiding in plain sight — waiting for the right set of eyes.&rdquo;</p>
          </blockquote>

          <h2 className="tx-sol-section-head">The Expeditions</h2>
          <div className="tx-sol-expeditions">
            <div className="tx-sol-expedition">
              <div className="tx-sol-exp-num">I</div>
              <div>
                <h3>Landnam</h3>
                <p className="tx-sol-exp-status">Flagship · Now open</p>
                <p>Hunt exoplanet transit signals in real TESS lightcurve data. Build the crew and ship that follows promising candidates into the narrative.</p>
                <a href="https://starsailors.space" className="tx-sol-link" target="_blank" rel="noreferrer">Begin expedition →</a>
              </div>
            </div>
            <div className="tx-sol-expedition">
              <div className="tx-sol-exp-num">II</div>
              <div>
                <h3>Coral Clicker</h3>
                <p className="tx-sol-exp-status">Coming soon · Q3</p>
                <p>Identify reef species in real survey imagery. A relaxed classification game that feeds marine population monitoring datasets.</p>
              </div>
            </div>
            <div className="tx-sol-expedition">
              <div className="tx-sol-exp-num">III</div>
              <div>
                <h3>Asteroid Hunters</h3>
                <p className="tx-sol-exp-status">Planned · Q4</p>
                <p>Sweep survey frames for moving points of light. Track near-Earth objects the automated pipelines are still cataloguing.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Margin column */}
        <aside className="tx-sol-margin">
          <div className="tx-sol-margin-block">
            <p className="tx-sol-note-label">Join the dispatch</p>
            <p style={{ marginBottom: "0.85rem", lineHeight: 1.6 }}>
              First edition. Mission briefings. Early access. Free.
            </p>
            {state === "sent" ? (
              <p style={{ color: "#92400e", fontWeight: 700 }}>✓ Dispatch incoming.</p>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.55rem" }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={state === "sending"}
                  className="tx-sol-input"
                />
                <button type="submit" className="tx-sol-btn" disabled={state === "sending"}>
                  {state === "sending" ? "Sending…" : "Subscribe"}
                </button>
                {state === "error" && <p style={{ color: "#c00", fontSize: "0.82rem", margin: 0 }}>Failed. Try again.</p>}
              </form>
            )}
          </div>

          <div className="tx-sol-margin-block">
            <p className="tx-sol-note-label">The Crew</p>
            <ul className="tx-sol-crew-list">
              <li><strong>Liam Martin</strong> — Game design</li>
              <li><strong>Rhys Campbell</strong> — Data &amp; ML</li>
              <li><strong>Fred Bruce</strong> — Audio &amp; visual</li>
            </ul>
          </div>

          <div className="tx-sol-margin-block tx-sol-margin-quote">
            <p>&ldquo;Every star is a sun. Most have planets. Some of those planets are being found right now.&rdquo;</p>
          </div>
        </aside>
      </main>

      <div className="tx-sol-divider">✦ ✦ ✦</div>

      <footer className="tx-sol-footer">
        <span>Star Sailors · The Universe in Play · starsailors.space</span>
      </footer>
    </div>
  );
}
