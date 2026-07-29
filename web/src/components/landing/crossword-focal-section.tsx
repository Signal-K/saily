"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Kicker, StatusPill } from "@/components/landing/landing-shared";

type PublicClue = {
  number: number;
  direction: "across" | "down";
  clue: string;
  length: number;
};

type CrosswordPayload = {
  date: string;
  clues: PublicClue[];
};

type State = { status: "loading" } | { status: "ready"; data: CrosswordPayload } | { status: "error" };

// Focal landing entry point for the daily crossword (sprint-2026-07-25
// priority) — previously the crossword had zero presence on the landing
// page. Links to /games/crossword (a standalone route, same pattern as
// /games/close-approaches) rather than /games/today, which wraps every game
// in a narrative "mission briefing" intro and doesn't guarantee crossword
// plays first now that Close Approach Ranker is also in the daily rotation.
export function CrosswordFocalSection() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/crossword/daily", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: CrosswordPayload) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const previewClues = state.status === "ready" ? state.data.clues.slice(0, 3) : [];

  return (
    <section id="crossword" className="tx-section tx-live" aria-label="Today's crossword">
      <div className="tx-section-head">
        <div>
          <Kicker>Today&apos;s puzzle</Kicker>
          <h2>Solve today&apos;s science crossword.</h2>
          <p>
            A new crossword every day, built entirely from real astronomy and mission data — no
            filler clues, no repeats.
          </p>
        </div>
        {state.status === "ready" ? <StatusPill>{state.data.clues.length} clues today</StatusPill> : null}
      </div>

      <div className="panel" style={{ padding: "1.25rem", marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
        {state.status === "loading" ? <p className="muted">Loading today&apos;s clues...</p> : null}
        {state.status === "error" ? <p className="muted">Could not load today&apos;s crossword right now.</p> : null}
        {state.status === "ready"
          ? previewClues.map((clue) => (
              <p className="muted" key={`${clue.number}-${clue.direction}`} style={{ margin: 0 }}>
                {clue.number}
                {clue.direction === "across" ? "A" : "D"}. {clue.clue} ({clue.length} letters)
              </p>
            ))
          : null}
        <Link href="/games/crossword" className="button button-primary" style={{ justifySelf: "start", marginTop: "0.5rem" }}>
          Play today&apos;s crossword →
        </Link>
      </div>
    </section>
  );
}
