"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type PuzzleStage = {
  id: number;
  title: string;
  objective: string;
  image: string;
  tutorial: string[];
};

const PUZZLES: PuzzleStage[] = [
  {
    id: 1,
    title: "Puzzle 1: Scene Annotation",
    objective: "Mark suspicious areas in the image and classify what you see.",
    image: "/puzzles/puzzle-1.svg",
    tutorial: [
      "Scan the full image before placing any markers.",
      "Use the mode controls to mark object, boundary, or anomaly.",
      "Aim for at least three high-confidence annotations.",
    ],
  },
  {
    id: 2,
    title: "Puzzle 2: Pattern Trace",
    objective: "Find repeated geometry and highlight the strongest pattern lane.",
    image: "/puzzles/puzzle-2.svg",
    tutorial: [
      "Start from the dominant shape cluster.",
      "Compare spacing and orientation for repeating motifs.",
      "Use confidence to indicate certainty in the detected path.",
    ],
  },
  {
    id: 3,
    title: "Puzzle 3: Final Recognition",
    objective: "Identify the governing pattern and submit your final label.",
    image: "/puzzles/puzzle-3.svg",
    tutorial: [
      "Cross-check all marks against the entire frame.",
      "Focus on pattern transitions, not just isolated objects.",
      "Use final note to summarize your recognition logic.",
    ],
  },
];

export default function TodayGamePage() {
  const [index, setIndex] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [mode, setMode] = useState("Object");
  const [confidence, setConfidence] = useState(60);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const puzzle = PUZZLES[index];
  const isLast = index === PUZZLES.length - 1;
  const progress = useMemo(() => `${index + 1} / ${PUZZLES.length}`, [index]);

  function handleNext() {
    if (isLast) return;
    setIndex((current) => current + 1);
    setNote("");
    setConfidence(60);
    setMode("Object");
    setShowTutorial(false);
    setFeedback(null);
  }

  async function handleFinish() {
    setSubmitting(true);
    setFeedback(null);

    const response = await fetch("/api/game/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completedPuzzles: PUZZLES.length,
        confidence,
        note,
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      score?: number;
      badgesAwarded?: number;
    };

    if (!response.ok) {
      setFeedback(payload.error ?? "Could not save your daily result.");
      setSubmitting(false);
      return;
    }

    setFeedback(
      `Saved. Score ${payload.score ?? 0}${payload.badgesAwarded ? `. New badges: ${payload.badgesAwarded}.` : "."}`,
    );
    setSubmitting(false);
  }

  return (
    <section className="puzzle-screen">
      <header className="puzzle-header panel">
        <p className="eyebrow">Daily Puzzle Session</p>
        <div className="puzzle-header-row">
          <div>
            <h1>{puzzle.title}</h1>
            <p className="muted">{puzzle.objective}</p>
          </div>
          <span className="puzzle-progress">{progress}</span>
        </div>
      </header>

      <div className="puzzle-workspace">
        <article className="puzzle-canvas panel">
          <div className="puzzle-media-wrap">
            <Image src={puzzle.image} alt={puzzle.title} width={1300} height={760} className="puzzle-media" priority />
          </div>
        </article>

        <aside className="puzzle-sidebar panel">
          <div className="puzzle-toolbar">
            <button className="button puzzle-action-secondary" type="button" onClick={() => setShowTutorial((value) => !value)}>
              <span data-cy="puzzle-help-toggle">{showTutorial ? "Hide help" : "Help / Tutorial"}</span>
            </button>
          </div>

          {showTutorial ? (
            <aside className="puzzle-help" aria-live="polite">
              <p className="puzzle-help-title">Tutorial</p>
              <ol>
                {puzzle.tutorial.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </aside>
          ) : null}

          <section className="puzzle-controls" aria-label="Puzzle controls">
            <div className="puzzle-control-group">
              <p className="puzzle-control-label">Annotation mode</p>
              <div className="puzzle-chip-row">
                {["Object", "Boundary", "Anomaly"].map((item) => (
                  <button
                    key={item}
                    className={`puzzle-chip${mode === item ? " is-active" : ""}`}
                    data-cy={`puzzle-mode-${item.toLowerCase()}`}
                    type="button"
                    onClick={() => setMode(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="puzzle-control-group">
              <p className="puzzle-control-label">Confidence</p>
              <div className="puzzle-range-row">
                <input
                  data-cy="puzzle-confidence-range"
                  type="range"
                  min={0}
                  max={100}
                  value={confidence}
                  onChange={(event) => setConfidence(Number(event.target.value))}
                />
                <span>{confidence}%</span>
              </div>
            </div>

            <div className="puzzle-control-group">
              <p className="puzzle-control-label">Final note</p>
              <textarea
                className="textarea puzzle-note"
                data-cy="puzzle-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Summarize what pattern you detected..."
              />
            </div>
          </section>

          <div className="puzzle-next-row">
            {isLast ? (
              <button className="button button-primary puzzle-action-primary" type="button" onClick={() => void handleFinish()} disabled={submitting}>
                <span data-cy="puzzle-finish-button">{submitting ? "Saving..." : "Finish Daily Set"}</span>
              </button>
            ) : (
              <button className="button button-primary puzzle-action-primary" type="button" onClick={handleNext}>
                <span data-cy="puzzle-next-button">Continue to Puzzle {index + 2}</span>
              </button>
            )}
          </div>

          {feedback ? <p className="puzzle-feedback" data-cy="puzzle-feedback">{feedback}</p> : null}
        </aside>
      </div>
    </section>
  );
}
