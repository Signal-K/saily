"use client";

import { useState, FormEvent } from "react";
import { submitInterest } from "@/components/landing/landing-interest";

function EmailForm({ placement }: { placement: string }) {
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

  if (state === "sent") return <p className="tx-min-sent">Registration received.</p>;

  return (
    <form className="tx-min-form" onSubmit={handleSubmit} aria-label={`Email form — ${placement}`}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email address"
        required
        disabled={state === "sending"}
        className="tx-min-input"
      />
      <button type="submit" className="tx-min-btn" disabled={state === "sending"}>
        {state === "sending" ? "…" : "Register interest"}
      </button>
      {state === "error" && <p className="tx-min-err">Failed. Please try again.</p>}
    </form>
  );
}

export function VariantMinimal() {
  return (
    <div className="tx-min">
      <header className="tx-min-header">
        <span className="tx-min-brand">Star Sailors</span>
        <span className="tx-min-status">Launching 2026</span>
      </header>

      <main className="tx-min-main">
        <h1 className="tx-min-h1">
          Citizen science.<br />
          Turned into games<br />
          anyone can play.
        </h1>

        <EmailForm placement="top" />

        <div className="tx-min-body">
          <p>
            Star Sailors turns peer-reviewed astronomical and ecological datasets into interactive daily games. Participation is free and open. Methodology is transparent. Discoveries are real and credited.
          </p>
          <p>
            The platform launches with three games. Landnam is open now. Coral Clicker and Asteroid Hunters follow in Q3 and Q4 of 2026.
          </p>
        </div>

        <div className="tx-min-rule" />

        <h2 className="tx-min-h2">What you&apos;ll do</h2>
        <ul className="tx-min-list">
          <li>Inspect real telescope lightcurve data for transit dips</li>
          <li>Classify coral reef species in survey imagery</li>
          <li>Sweep asteroid survey frames for moving objects</li>
          <li>Contribute to crowd-consensus datasets used by research teams</li>
          <li>Play a narrative crew-management game driven by your own discoveries</li>
        </ul>

        <div className="tx-min-rule" />

        <h2 className="tx-min-h2">Why it works</h2>
        <p>
          Automated pipelines produce more data than researchers can inspect manually. Human visual systems reliably catch edge-cases that algorithms miss — transit signals below automated thresholds, morphological features that pattern-matching skips.
        </p>
        <p>
          This is documented. It&apos;s why citizen science platforms have already contributed to confirmed exoplanet discoveries. Star Sailors is built on that precedent.
        </p>

        <div className="tx-min-rule" />

        <h2 className="tx-min-h2">The team</h2>
        <dl className="tx-min-team">
          <div>
            <dt>Liam Martin</dt>
            <dd>Game designer</dd>
          </div>
          <div>
            <dt>Rhys Campbell</dt>
            <dd>Machine learning lead</dd>
          </div>
          <div>
            <dt>Fred Bruce</dt>
            <dd>Audio and visual interfacing</dd>
          </div>
        </dl>

        <div className="tx-min-rule" />

        <p className="tx-min-cta-copy">
          Register to receive the first edition and early mission access.
        </p>

        <EmailForm placement="bottom" />
      </main>

      <footer className="tx-min-foot">
        <a href="https://starsailors.space" target="_blank" rel="noreferrer">starsailors.space</a>
        <span>·</span>
        <span>© 2026 Star Sailors</span>
      </footer>
    </div>
  );
}
