"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
    <div className="panel puzzle-grain" style={{ padding: "1.5rem", display: "grid", gap: "1.25rem" }}>
      <div>
        <p className="eyebrow">Today&apos;s Crossword</p>
        <p className="muted">Clues drawn from real upcoming sky events and today&apos;s discoveries.</p>
      </div>

      <div
        aria-hidden
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${puzzle.width}, 1.75rem)`,
          gridTemplateRows: `repeat(${puzzle.height}, 1.75rem)`,
          gap: "2px",
          width: "fit-content",
        }}
      >
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
                {startClue ? (
                  <span style={{ position: "absolute", top: 1, left: 2, fontSize: "0.55rem" }}>{startClue.number}</span>
                ) : null}
              </div>
            );
          }),
        )}
      </div>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {puzzle.clues.map((clue) => (
          <label key={clueKey(clue)} style={{ display: "grid", gap: "0.25rem" }}>
            <span className="muted">
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
              style={{ textTransform: "uppercase", letterSpacing: "0.15em" }}
            />
          </label>
        ))}
      </div>

      {feedback ? <p className="puzzle-feedback">{feedback}</p> : null}

      {result ? (
        <p className="muted">
          {result.correct} of {result.total} correct — score {result.score}.
        </p>
      ) : (
        <button type="button" className="button button-primary" onClick={() => void handleSubmit()} disabled={submitting}>
          {submitting ? "Checking..." : "Check answers"}
        </button>
      )}
    </div>
  );
}
