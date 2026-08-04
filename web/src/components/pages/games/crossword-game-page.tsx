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

function cellKey(row: number, col: number) {
  return `${row},${col}`;
}

function clueAnswer(clue: PublicClue, letters: Record<string, string>) {
  let answer = "";
  for (let i = 0; i < clue.length; i += 1) {
    const row = clue.direction === "down" ? clue.row + i : clue.row;
    const col = clue.direction === "across" ? clue.col + i : clue.col;
    answer += letters[cellKey(row, col)] ?? "";
  }
  return answer;
}

export default function CrosswordGamePage({ onMissionComplete, gameDate: gameDateProp }: CrosswordGamePageProps = {}) {
  const gameDate = useMemo(
    () => resolveMelbourneDateKey(gameDateProp ?? getMelbourneDateKey()),
    [gameDateProp],
  );

  const [puzzle, setPuzzle] = useState<CrosswordPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [letters, setLetters] = useState<Record<string, string>>({});
  const [activeClueKey, setActiveClueKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [result, setResult] = useState<{ correct: number; total: number; score: number } | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const cellInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const clueCells = useMemo(() => {
    const map = new Map<string, Partial<Record<CrosswordDirection, PublicClue>>>();
    if (!puzzle) return map;
    for (const clue of puzzle.clues) {
      for (let i = 0; i < clue.length; i += 1) {
        const row = clue.direction === "down" ? clue.row + i : clue.row;
        const col = clue.direction === "across" ? clue.col + i : clue.col;
        const entry = map.get(cellKey(row, col)) ?? {};
        entry[clue.direction] = clue;
        map.set(cellKey(row, col), entry);
      }
    }
    return map;
  }, [puzzle]);

  const [activeDirection, setActiveDirection] = useState<CrosswordDirection>("across");

  function focusCell(row: number, col: number) {
    cellInputRefs.current[cellKey(row, col)]?.focus();
  }

  function bestClueForCell(row: number, col: number) {
    const entry = clueCells.get(cellKey(row, col));
    return entry?.[activeDirection] ?? entry?.across ?? entry?.down;
  }

  function handleCellFocus(row: number, col: number) {
    const clue = bestClueForCell(row, col);
    if (clue) {
      setActiveDirection(clue.direction);
      setActiveClueKey(clueKey(clue));
    }
  }

  function handleCellChange(row: number, col: number, value: string) {
    const key = cellKey(row, col);
    const letter = value.slice(-1).toUpperCase();
    setLetters((prev) => ({ ...prev, [key]: letter }));
    if (!letter) return;
    const clue = bestClueForCell(row, col);
    if (!clue) return;
    const nextRow = clue.direction === "down" ? row + 1 : row;
    const nextCol = clue.direction === "across" ? col + 1 : col;
    if (filledCells.has(cellKey(nextRow, nextCol))) {
      focusCell(nextRow, nextCol);
    }
  }

  function handleCellKeyDown(row: number, col: number, event: React.KeyboardEvent<HTMLInputElement>) {
    const key = cellKey(row, col);
    if (event.key === "Backspace" && !letters[key]) {
      const clue = bestClueForCell(row, col);
      if (!clue) return;
      const prevRow = clue.direction === "down" ? row - 1 : row;
      const prevCol = clue.direction === "across" ? col - 1 : col;
      if (filledCells.has(cellKey(prevRow, prevCol))) {
        focusCell(prevRow, prevCol);
      }
      return;
    }
    if (event.key === "ArrowRight" && filledCells.has(cellKey(row, col + 1))) {
      setActiveDirection("across");
      focusCell(row, col + 1);
    } else if (event.key === "ArrowLeft" && filledCells.has(cellKey(row, col - 1))) {
      setActiveDirection("across");
      focusCell(row, col - 1);
    } else if (event.key === "ArrowDown" && filledCells.has(cellKey(row + 1, col))) {
      setActiveDirection("down");
      focusCell(row + 1, col);
    } else if (event.key === "ArrowUp" && filledCells.has(cellKey(row - 1, col))) {
      setActiveDirection("down");
      focusCell(row - 1, col);
    }
  }

  function focusClue(clue: PublicClue) {
    setActiveDirection(clue.direction);
    setActiveClueKey(clueKey(clue));
    focusCell(clue.row, clue.col);
  }

  async function handleSubmit() {
    if (!puzzle) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const answers = Object.fromEntries(
        puzzle.clues.map((clue) => [clueKey(clue), clueAnswer(clue, letters)]),
      );
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
          --cell-size: clamp(20px, min(calc(44dvh / var(--grid-rows)), calc(70vw / var(--grid-cols))), 32px);
        }

        .crossword-grid {
          display: grid;
          grid-template-columns: repeat(var(--grid-cols), var(--cell-size));
          grid-template-rows: repeat(var(--grid-rows), var(--cell-size));
          gap: 1px;
          width: fit-content;
          margin-inline: auto;
        }

        .crossword-cell {
          position: relative;
        }

        .crossword-cell-blocked {
          background: transparent;
        }

        .crossword-cell-number {
          position: absolute;
          top: 0;
          left: 1px;
          font-size: clamp(0.45rem, calc(var(--cell-size) * 0.3), 0.65rem);
          line-height: 1;
          pointer-events: none;
          z-index: 1;
        }

        .crossword-cell-input {
          width: 100%;
          height: 100%;
          border: 1px solid var(--color-border);
          background: var(--color-paper);
          color: var(--color-ink);
          font-family: inherit;
          text-align: center;
          text-transform: uppercase;
          padding: 0;
          font-size: clamp(0.7rem, calc(var(--cell-size) * 0.5), 1rem);
        }

        .crossword-cell-input:focus {
          outline: 2px solid var(--color-ink);
          outline-offset: -2px;
          position: relative;
          z-index: 2;
        }

        .crossword-cell-input:disabled {
          background: var(--color-bg);
          color: var(--color-ink-muted);
        }

        .crossword-clues {
          display: grid;
          gap: 0.4rem;
          align-content: start;
          max-height: 42dvh;
          overflow-y: auto;
          padding-right: 0.25rem;
          min-width: 0;
        }

        .crossword-clue-text {
          display: block;
          width: 100%;
          text-align: left;
          font-size: 0.9rem;
          line-height: 1.35;
          padding: 0.35rem 0.5rem;
          border: 1px solid transparent;
          border-radius: 4px;
          background: none;
          color: var(--color-ink-muted);
          font-family: inherit;
          cursor: pointer;
          overflow-wrap: break-word;
        }

        .crossword-clue-text:hover {
          border-color: var(--color-border);
        }

        .crossword-clue-text.is-active {
          color: var(--color-ink);
          border-color: var(--color-ink);
          background: var(--color-paper);
        }

        .crossword-clue-text:disabled {
          cursor: default;
        }

        @media (min-width: 640px) {
          .crossword-shell {
            grid-template-columns: max-content minmax(0, 1fr);
            align-items: start;
          }

          .crossword-shell > .crossword-header {
            grid-column: 1 / -1;
          }

          .crossword-grid {
            margin-inline: 0;
          }

          .crossword-clues {
            max-height: min(42dvh, calc(var(--grid-rows) * var(--cell-size)));
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

      <div className="crossword-grid">
        {Array.from({ length: puzzle.height }).map((_, row) =>
          Array.from({ length: puzzle.width }).map((_, col) => {
            const key = cellKey(row, col);
            const filled = filledCells.has(key);
            if (!filled) {
              return <div key={key} className="crossword-cell crossword-cell-blocked" />;
            }
            const startClue = puzzle.clues.find((c) => c.row === row && c.col === col);
            return (
              <div key={key} className="crossword-cell">
                {startClue ? <span className="crossword-cell-number">{startClue.number}</span> : null}
                <input
                  ref={(el) => {
                    cellInputRefs.current[key] = el;
                  }}
                  type="text"
                  inputMode="text"
                  maxLength={1}
                  value={letters[key] ?? ""}
                  disabled={Boolean(result)}
                  onFocus={() => handleCellFocus(row, col)}
                  onChange={(event) => handleCellChange(row, col, event.target.value)}
                  onKeyDown={(event) => handleCellKeyDown(row, col, event)}
                  className="crossword-cell-input"
                  aria-label={`Row ${row + 1}, column ${col + 1}`}
                />
              </div>
            );
          }),
        )}
      </div>

      <div className="crossword-clues">
        {puzzle.clues.map((clue) => (
          <button
            key={clueKey(clue)}
            type="button"
            className={`crossword-clue-text${activeClueKey === clueKey(clue) ? " is-active" : ""}`}
            onClick={() => focusClue(clue)}
            disabled={Boolean(result)}
          >
            {clue.number}
            {clue.direction === "across" ? "A" : "D"}. {clue.clue} ({clue.length} letters)
          </button>
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
