"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import posthog from "posthog-js";
import { getMelbourneDateKey, resolveMelbourneDateKey } from "@/lib/melbourne-date";
import { trackGameplayEvent } from "@/lib/analytics/events";

type CrosswordDirection = "across" | "down";

type PublicClue = {
  number: number;
  direction: CrosswordDirection;
  row: number;
  col: number;
  length: number;
  clue: string;
  sourceUrl: string | null;
};

type CrosswordPayload = {
  date: string;
  width: number;
  height: number;
  cells: string[];
  clues: PublicClue[];
};

type CrosswordGamePageProps = {
  onMissionComplete?: (result: { score: number; terminatedEarly?: boolean }) => void;
  gameDate?: string;
};

function clueKey(clue: PublicClue) {
  return `${clue.number}-${clue.direction}`;
}

export default function CrosswordGamePage({ onMissionComplete, gameDate: gameDateProp }: CrosswordGamePageProps = {}) {
  const gameDate = useMemo(
    () => resolveMelbourneDateKey(gameDateProp ?? getMelbourneDateKey()),
    [gameDateProp],
  );

  const [puzzle, setPuzzle] = useState<CrosswordPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [result, setResult] = useState<{ correct: number; total: number; score: number } | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const loadPuzzle = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/crossword/daily?date=${encodeURIComponent(gameDate)}`, { cache: "no-store" });
      const payload = (await res.json()) as CrosswordPayload & { error?: string };
      if (!res.ok) {
        setFeedback(payload.error ?? "Could not load today's crossword.");
        setPuzzle(null);
      } else {
        setPuzzle(payload);
        startedAtRef.current = Date.now();
        posthog.capture("crossword_opened", { game_date: gameDate, clue_count: payload.clues.length });
      }
    } catch {
      setFeedback("Network error loading today's crossword.");
    } finally {
      setLoading(false);
    }
  }, [gameDate]);

  useEffect(() => {
    void loadPuzzle();
  }, [loadPuzzle]);

  const filledCells = useMemo(() => new Set(puzzle?.cells ?? []), [puzzle]);

  async function handleSubmit() {
    if (!puzzle) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/crossword/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: gameDate, answers }),
      });
      const payload = (await res.json()) as { correct: number; total: number; score: number; error?: string };
      if (!res.ok) {
        setFeedback(payload.error ?? "Could not check your answers.");
        return;
      }

      setResult(payload);
      trackGameplayEvent("crossword_submitted", { game_date: gameDate, correct: payload.correct, total: payload.total });
      const elapsedSeconds = startedAtRef.current ? Math.round((Date.now() - startedAtRef.current) / 1000) : undefined;
      posthog.capture("crossword_submitted", {
        game_date: gameDate,
        correct: payload.correct,
        total: payload.total,
        score: payload.score,
        all_correct: payload.correct === payload.total,
        elapsed_seconds: elapsedSeconds,
      });
      onMissionComplete?.({ score: payload.score });
    } catch {
      setFeedback("Network error checking your answers.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="panel" style={{ padding: "1.5rem", textAlign: "center" }}>
        <p className="muted">Loading today&apos;s crossword...</p>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="panel puzzle-grain" style={{ padding: "1.5rem" }}>
        <p className="puzzle-feedback">{feedback ?? "No crossword available for this date."}</p>
      </div>
    );
  }

  return (
    <div
      className="panel puzzle-grain crossword-shell"
      style={
        {
          "--grid-cols": puzzle.width,
          "--grid-rows": puzzle.height,
        } as React.CSSProperties
      }
    >
      <style jsx>{`
        .crossword-shell {
          padding: 1rem 1.25rem;
          display: grid;
          gap: 0.75rem;
          /*
           * Cell size shrinks to fit whichever dimension is tighter — the
           * available viewport height (crosswords can be up to ~18 rows on
           * some dates) or the container width (up to ~15 cols) — so the
           * whole game fits on screen without the page needing to scroll,
           * instead of a fixed 1.75rem cell blowing out to 500px+ tall.
           */
          --cell-size: clamp(14px, min(calc(34dvh / var(--grid-rows)), calc(60vw / var(--grid-cols))), 24px);
        }

        .crossword-grid {
          display: grid;
          grid-template-columns: repeat(var(--grid-cols), var(--cell-size));
          grid-template-rows: repeat(var(--grid-rows), var(--cell-size));
          gap: 1px;
          width: fit-content;
          margin-inline: auto;
        }

        .crossword-cell-number {
          position: absolute;
          top: 0;
          left: 1px;
          font-size: clamp(0.4rem, calc(var(--cell-size) * 0.32), 0.55rem);
          line-height: 1;
        }

        .crossword-clues {
          display: grid;
          gap: 0.4rem;
          max-height: 34dvh;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .crossword-clue-text {
          font-size: 0.78rem;
          line-height: 1.25;
        }

        .crossword-clue-input {
          padding: 0.3rem 0.5rem;
          font-size: 0.85rem;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          background: var(--color-paper);
          color: var(--color-ink);
          font-family: inherit;
        }

        .crossword-clue-input:focus {
          outline: 2px solid var(--color-ink);
          outline-offset: 1px;
          border-color: var(--color-ink);
        }

        .crossword-clue-input:disabled {
          background: var(--color-bg);
          color: var(--color-ink-muted);
        }

        @media (min-width: 640px) {
          .crossword-shell {
            grid-template-columns: max-content 1fr;
            align-items: start;
          }

          .crossword-shell > .crossword-header {
            grid-column: 1 / -1;
          }

          .crossword-grid {
            margin-inline: 0;
          }

          .crossword-clues {
            max-height: min(34dvh, calc(var(--grid-rows) * var(--cell-size)));
          }

          .crossword-shell > .crossword-feedback,
          .crossword-shell > .crossword-actions {
            grid-column: 1 / -1;
          }
        }
      `}</style>

      <div className="crossword-header">
        <p className="eyebrow">Today&apos;s Crossword</p>
        <p className="muted">Clues drawn from real upcoming sky events and today&apos;s discoveries.</p>
      </div>

      <div className="crossword-grid" aria-hidden>
        {Array.from({ length: puzzle.height }).map((_, row) =>
          Array.from({ length: puzzle.width }).map((_, col) => {
            const filled = filledCells.has(`${row},${col}`);
            const startClue = puzzle.clues.find((c) => c.row === row && c.col === col);
            return (
              <div
                key={`${row}-${col}`}
                style={{
                  position: "relative",
                  background: filled ? "var(--color-paper)" : "transparent",
                  border: filled ? "1px solid var(--color-border)" : "none",
                }}
              >
                {startClue ? <span className="crossword-cell-number">{startClue.number}</span> : null}
              </div>
            );
          }),
        )}
      </div>

      <div className="crossword-clues">
        {puzzle.clues.map((clue) => (
          <label key={clueKey(clue)} style={{ display: "grid", gap: "0.2rem" }}>
            <span className="muted crossword-clue-text">
              {clue.number}
              {clue.direction === "across" ? "A" : "D"}. {clue.clue} ({clue.length} letters)
            </span>
            <input
              type="text"
              maxLength={clue.length}
              value={answers[clueKey(clue)] ?? ""}
              disabled={Boolean(result)}
              onChange={(event) =>
                setAnswers((prev) => ({ ...prev, [clueKey(clue)]: event.target.value.toUpperCase() }))
              }
              className="crossword-clue-input"
              style={{ textTransform: "uppercase", letterSpacing: "0.15em" }}
            />
          </label>
        ))}
      </div>

      {feedback ? <p className="puzzle-feedback crossword-feedback">{feedback}</p> : null}

      {result ? (
        <p className="muted crossword-actions">
          {result.correct} of {result.total} correct — score {result.score}.
        </p>
      ) : (
        <button
          type="button"
          className="button button-primary crossword-actions"
          onClick={() => void handleSubmit()}
          disabled={submitting}
        >
          {submitting ? "Checking..." : "Check answers"}
        </button>
      )}
    </div>
  );
}
