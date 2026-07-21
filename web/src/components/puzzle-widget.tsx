"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PuzzleWidgetState = {
  date?: string;
  access?: {
    allowed: boolean;
    completed: boolean;
    signInRequired: boolean;
  };
  user?: { id: string; email: string } | null;
  completedGames?: { game: string; score: number }[];
};

// Embedded within article body copy via a `{{puzzle}}` marker (see
// web/src/lib/markdown.ts). Per STS-304, this does not run its own puzzle
// instance inline — it points to the same daily mission at /games/today, so
// there is no separate progress state to reconcile: opening the full puzzle
// page always reflects the same game_date-keyed play/streak state.
export function PuzzleWidget() {
  const [state, setState] = useState<PuzzleWidgetState | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadState() {
      try {
        const response = await fetch("/api/game/today", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as PuzzleWidgetState;
        if (!cancelled) setState(payload);
      } catch {
        // Widget state is progressive enhancement; the mission CTA still works.
      }
    }
    void loadState();
    return () => {
      cancelled = true;
    };
  }, []);

  const completedCount = state?.completedGames?.length ?? 0;
  const completed = completedCount > 0 || Boolean(state?.access?.completed);
  const signedIn = Boolean(state?.user);
  const missionHref = state?.date ? `/games/today?date=${state.date}` : "/games/today";

  return (
    <section className="panel puzzle-grain puzzle-widget" aria-label="Daily puzzle" style={{ padding: "1.25rem", display: "grid", gap: "0.65rem" }}>
      <p className="eyebrow">The Daily Transit</p>
      <p style={{ margin: 0, fontWeight: 600 }}>{completed ? "Today's games are underway." : "Today's games are live."}</p>
      <p className="muted" style={{ margin: 0 }}>
        {completed
          ? `${completedCount} of today's games completed. Play another or join the discussion.`
          : "A quick science crossword, transit spotting, and more — each built from real data."}
      </p>
      {!signedIn ? (
        <p className="muted" style={{ margin: 0 }}>
          You can start now; sign in when you want streaks and archive access.
        </p>
      ) : null}
      <div className="cta-row">
        <Link href={missionHref} className="button button-primary">
          {completed ? "Replay mission" : "Play today&apos;s mission"}
        </Link>
        {completed && state?.date ? (
          <Link href={`/discuss?date=${state.date}`} className="button">
            Discuss
          </Link>
        ) : null}
      </div>
    </section>
  );
}
