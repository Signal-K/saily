"use client";

import { useState, useEffect, FormEvent } from "react";
import { submitInterest } from "@/components/landing/landing-interest";

export function VariantCosmic() {
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
    <div className="tx-cos">
      {/* Star field */}
      <div className="tx-cos-stars" aria-hidden />
      <div className="tx-cos-stars tx-cos-stars-2" aria-hidden />
      <div className="tx-cos-stars tx-cos-stars-3" aria-hidden />

      {/* Floating nav */}
      <nav className="tx-cos-nav">
        <span className="tx-cos-nav-brand">★ Star Sailors</span>
        <div className="tx-cos-nav-links">
          <a href="#missions">Missions</a>
          <a href="#crew">Crew</a>
        </div>
      </nav>

      {/* Hero — full viewport */}
      <section className="tx-cos-hero">
        <div className="tx-cos-hero-inner">
          <p className="tx-cos-eyebrow">
            <span className="tx-cos-ping" aria-hidden /> You are here: Orion Arm · Milky Way
          </p>
          <h1 className="tx-cos-title">
            Into the<br /><em>{theme === "dark" ? "Dark" : "Light"}</em>
          </h1>
          <p className="tx-cos-sub">
            Real telescope data. Real exoplanet signals. A citizen-science crew hunting the cosmos, one transit at a time.
          </p>
          <div className="tx-cos-briefs" aria-label="Launch briefing">
            <span>Daily dispatches</span>
            <span>3 launch missions</span>
            <span>10-minute classifications</span>
          </div>

          {state === "sent" ? (
            <div className="tx-cos-success">
              ✓ &nbsp; Transmission received. Mission briefings incoming.
            </div>
          ) : (
            <form className="tx-cos-form" onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter coordinates (email)"
                required
                disabled={state === "sending"}
                className="tx-cos-input"
              />
              <button type="submit" className="tx-cos-btn" disabled={state === "sending"}>
                {state === "sending" ? "Transmitting…" : "Join the Crew →"}
              </button>
              {state === "error" && <p className="tx-cos-err">Signal lost. Try again.</p>}
            </form>
          )}
        </div>

        {/* Orbital rings */}
        <div className="tx-cos-orbit tx-cos-orbit-1" aria-hidden />
        <div className="tx-cos-orbit tx-cos-orbit-2" aria-hidden />
      </section>

      {/* Floating stat cards */}
      <section className="tx-cos-stats" id="missions">
        <div className="tx-cos-card">
          <span className="tx-cos-card-n">5,502</span>
          <span className="tx-cos-card-label">Confirmed exoplanets</span>
          <span className="tx-cos-card-sub">in the known galaxy</span>
        </div>
        <div className="tx-cos-card">
          <span className="tx-cos-card-n">3</span>
          <span className="tx-cos-card-label">Active missions</span>
          <span className="tx-cos-card-sub">open to all operators</span>
        </div>
        <div className="tx-cos-card">
          <span className="tx-cos-card-n">∞</span>
          <span className="tx-cos-card-label">Data to classify</span>
          <span className="tx-cos-card-sub">more than eyes to read it</span>
        </div>
      </section>

      {/* Mission log */}
      <section className="tx-cos-log">
        <p className="tx-cos-log-kicker">{"// MISSION_LOG"}</p>
        <div className="tx-cos-log-grid">
          <div className="tx-cos-log-item">
            <span className="tx-cos-log-id">LND-001</span>
            <div>
              <h3>Landnam — Exoplanet Transit Hunt</h3>
              <p>Hunt real TESS lightcurve dips. Classify candidate signals with the crew. When consensus forms, the narrative begins.</p>
              <a href="https://starsailors.space" className="tx-cos-link" target="_blank" rel="noreferrer">Enter mission →</a>
            </div>
            <span className="tx-cos-status tx-cos-status-live">LIVE</span>
          </div>
          <div className="tx-cos-log-item">
            <span className="tx-cos-log-id">CRL-001</span>
            <div>
              <h3>Coral Clicker — Reef Classification</h3>
              <p>Identify real reef species in survey imagery. Your classifications feed population health datasets.</p>
              <span className="tx-cos-link" style={{ opacity: 0.5 }}>Staging ↗</span>
            </div>
            <span className="tx-cos-status">STAGING</span>
          </div>
          <div className="tx-cos-log-item">
            <span className="tx-cos-log-id">AST-001</span>
            <div>
              <h3>Asteroid Hunters — Survey Sweep</h3>
              <p>Scan survey frames for moving points of light. Help track near-Earth objects crossing our sky.</p>
              <span className="tx-cos-link" style={{ opacity: 0.5 }}>Planned ↗</span>
            </div>
            <span className="tx-cos-status">PLANNED</span>
          </div>
        </div>
      </section>

      {/* Crew */}
      <section className="tx-cos-crew" id="crew">
        <p className="tx-cos-log-kicker">{"// CREW_MANIFEST"}</p>
        <div className="tx-cos-crew-grid">
          {[
            { name: "Liam Martin", role: "Commander · Game Design", callsign: "LM-01" },
            { name: "Rhys Campbell", role: "Data Officer · ML", callsign: "RC-02" },
            { name: "Fred Bruce", role: "Comms · Audio & Visual", callsign: "FB-03" },
          ].map(p => (
            <div key={p.name} className="tx-cos-crew-card">
              <span className="tx-cos-crew-callsign">{p.callsign}</span>
              <strong>{p.name}</strong>
              <span>{p.role}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
