"use client";

import { useState, FormEvent } from "react";
import { Kicker } from "@/components/landing/landing-shared";
import { submitInterest } from "@/components/landing/landing-interest";

export function LandingHero() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || state === "sending") return;

    setState("sending");
    try {
      await submitInterest({
        kind: "notify",
        email: email.trim(),
      });
      setState("sent");
      setEmail("");
    } catch (error) {
      console.error("[landing-interest] hero signup failed", error);
      setState("error");
    }
  }

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

        {state === "sent" ? (
          <div className="tx-hero-signup-success">
            <p><strong>You&apos;re on the list!</strong> We&apos;ll notify you of new missions.</p>
          </div>
        ) : (
          <form className="tx-hero-signup" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email for launch updates"
              required
              disabled={state === "sending"}
              className="tx-hero-input"
            />
            <button type="submit" className="button button-primary" disabled={state === "sending"}>
              {state === "sending" ? "Joining..." : "Join Mission"}
            </button>
            {state === "error" && <p className="tx-form-note is-error">Something went wrong. Please try again.</p>}
          </form>
        )}

        <div className="tx-tag-row" aria-label="Star Sailors ecosystem features">
          <span className="tx-tag">Citizen Science</span>
          <span className="tx-tag">Interactive Data</span>
          <span className="tx-tag">Real Discoveries</span>
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
