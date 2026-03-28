"use client";

import { useEffect, useMemo, useState } from "react";
import { queueSurveyTrigger } from "@/lib/posthog/survey-queue";
import { trackGameplayEvent } from "@/lib/analytics/events";
import { getMelbourneDateKey, resolveMelbourneDateKey } from "@/lib/melbourne-date";

type DayAccess = {
  allowed: boolean;
  signInRequired: boolean;
};

type InsightMetric = "pressure" | "temperature" | "wind";

type InsightSol = {
  sol: string;
  season: string | null;
  northernSeason: string | null;
  southernSeason: string | null;
  firstUtc: string | null;
  lastUtc: string | null;
  at: { av: number | null; mn: number | null; mx: number | null };
  pre: { av: number | null; mn: number | null; mx: number | null };
  hws: { av: number | null; mn: number | null; mx: number | null };
};

type InsightPuzzle = {
  date: string;
  metric: InsightMetric;
  metricLabel: string;
  prompt: string;
  subtitle: string;
  sols: InsightSol[];
};

type InSightGamePageProps = {
  onMissionComplete?: (result: { score: number }) => void;
  gameDate?: string;
};

function formatReading(value: number | null, suffix: string) {
  if (typeof value !== "number") return "No data";
  return `${value.toFixed(1)}${suffix}`;
}

function metricReading(sol: InsightSol, metric: InsightMetric) {
  if (metric === "pressure") return sol.pre.av;
  if (metric === "temperature") return sol.at.av;
  return sol.hws.av;
}

export default function InSightGamePage({ onMissionComplete, gameDate }: InSightGamePageProps = {}) {
  const date = resolveMelbourneDateKey(gameDate ?? getMelbourneDateKey());
  const [loading, setLoading] = useState(true);
  const [puzzle, setPuzzle] = useState<InsightPuzzle | null>(null);
  const [source, setSource] = useState<"live" | "fallback" | null>(null);
  const [access, setAccess] = useState<DayAccess | null>(null);
  const [selectedSol, setSelectedSol] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | {
    correct: boolean;
    score: number;
    answerSol: string;
    metricLabel: string;
    answerValue: number | null;
    baseline: number;
  }>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPuzzle() {
      setLoading(true);
      const response = await fetch(`/api/insight/daily?date=${encodeURIComponent(date)}`, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as {
        puzzle?: InsightPuzzle | null;
        source?: "live" | "fallback" | null;
        access?: DayAccess;
      };

      if (cancelled) return;
      setPuzzle(payload.puzzle ?? null);
      setSource(payload.source ?? null);
      setAccess(payload.access ?? null);
      setLoading(false);
    }

    void loadPuzzle();
    return () => {
      cancelled = true;
    };
  }, [date]);

  async function handleSubmit() {
    if (!selectedSol) {
      setStatus("Pick the Sol you think is most anomalous.");
      return;
    }

    setSubmitting(true);
    setStatus(null);
    const response = await fetch("/api/insight/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, selectedSol }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      correct?: boolean;
      score?: number;
      answerSol?: string;
      metricLabel?: string;
      answerValue?: number | null;
      baseline?: number;
    };

    if (!response.ok) {
      setStatus(payload.error ?? "Could not score this weather reading.");
      setSubmitting(false);
      return;
    }

    const finalResult = {
      correct: Boolean(payload.correct),
      score: payload.score ?? 0,
      answerSol: payload.answerSol ?? "",
      metricLabel: payload.metricLabel ?? puzzle?.metricLabel ?? "metric",
      answerValue: typeof payload.answerValue === "number" ? payload.answerValue : null,
      baseline: typeof payload.baseline === "number" ? payload.baseline : 0,
    };

    queueSurveyTrigger({
      source: "insight_weather",
      version: process.env.NEXT_PUBLIC_APP_VERSION?.trim() || "v1",
      gameDate: date,
      score: finalResult.score,
    });
    trackGameplayEvent("insight_weather_completed", {
      game_date: date,
      score: finalResult.score,
      correct: finalResult.correct,
      selected_sol: selectedSol,
      answer_sol: finalResult.answerSol,
    });
    if (onMissionComplete) {
      onMissionComplete({ score: finalResult.score });
      setSubmitting(false);
      return;
    }
    setResult(finalResult);
    setSubmitting(false);
  }

  const metricSuffix = useMemo(() => {
    if (puzzle?.metric === "pressure") return " Pa";
    if (puzzle?.metric === "temperature") return "°C";
    return " m/s";
  }, [puzzle?.metric]);

  if (loading) {
    return (
      <section className="puzzle-screen">
        <header className="puzzle-header panel">
          <p className="eyebrow">Weather Desk</p>
          <h1>Loading InSight telemetry…</h1>
        </header>
      </section>
    );
  }

  if (access && !access.allowed) {
    return (
      <section className="puzzle-screen">
        <header className="puzzle-header panel">
          <p className="eyebrow">Weather Desk</p>
          <h1>Archive lock active</h1>
          <p className="muted puzzle-header-summary">
            Unlock this date from the main archive flow before opening the weather desk.
          </p>
        </header>
      </section>
    );
  }

  if (!puzzle) {
    return (
      <section className="puzzle-screen">
        <header className="puzzle-header panel">
          <p className="eyebrow">Weather Desk</p>
          <h1>No telemetry available</h1>
          <p className="muted puzzle-header-summary">The weather desk could not prepare a puzzle for this date.</p>
        </header>
      </section>
    );
  }

  return (
    <section className="puzzle-screen">
      <header className="puzzle-header panel">
        <p className="eyebrow">Weather Desk</p>
        <div className="puzzle-header-row">
          <div>
            <h1>InSight Anomaly Watch</h1>
            <p className="muted puzzle-header-summary">{puzzle.subtitle}</p>
            <div className="puzzle-context-row">
              <span className="puzzle-context-pill">Date {puzzle.date}</span>
              <span className="puzzle-context-pill">Target metric {puzzle.metricLabel}</span>
              <span className="puzzle-context-pill">Source {source === "live" ? "NASA live feed" : "cached fallback"}</span>
            </div>
          </div>
          <span className="puzzle-progress">Telemetry</span>
        </div>
      </header>

      <div className="puzzle-workspace">
        <article className="puzzle-canvas panel">
          <div className="insight-intro">
            <h2>{puzzle.prompt}</h2>
            <p className="muted">
              The shipboard weather desk flagged one Sol as the most suspicious. Review the average, min, and max readings and choose the outlier.
            </p>
          </div>

          <div className="insight-sol-grid">
            {puzzle.sols.map((sol) => {
              const metricValueLabel = formatReading(metricReading(sol, puzzle.metric), metricSuffix);
              const isSelected = selectedSol === sol.sol;
              const isAnswer = result?.answerSol === sol.sol;
              return (
                <button
                  key={sol.sol}
                  type="button"
                  className={`insight-sol-card${isSelected ? " is-selected" : ""}${isAnswer ? " is-answer" : ""}`}
                  data-cy={`insight-sol-${sol.sol}`}
                  onClick={() => setSelectedSol(sol.sol)}
                >
                  <div className="insight-sol-head">
                    <strong>Sol {sol.sol}</strong>
                    <span>{sol.season ?? "season unknown"}</span>
                  </div>
                  <div className="insight-primary-reading">
                    <span className="insight-reading-label">Avg {puzzle.metricLabel}</span>
                    <span className="insight-reading-value">{metricValueLabel}</span>
                  </div>
                  <dl className="insight-reading-grid">
                    <div>
                      <dt>Temp</dt>
                      <dd>{formatReading(sol.at.av, "°C")}</dd>
                    </div>
                    <div>
                      <dt>Pressure</dt>
                      <dd>{formatReading(sol.pre.av, " Pa")}</dd>
                    </div>
                    <div>
                      <dt>Wind</dt>
                      <dd>{formatReading(sol.hws.av, " m/s")}</dd>
                    </div>
                  </dl>
                </button>
              );
            })}
          </div>
        </article>

        <aside className="puzzle-sidebar panel">
          <div className="puzzle-controls">
            <div className="puzzle-control-group is-compact">
              <p className="puzzle-control-label">Mission brief</p>
              <p className="muted">
                Route planning depends on stable atmospheric conditions. One Sol in this set looks least like its neighbors. Mark it for review.
              </p>
            </div>
            <div className="puzzle-control-group is-compact">
              <p className="puzzle-control-label">Selection</p>
              <p className="muted">{selectedSol ? `Sol ${selectedSol} selected for review.` : "No Sol selected yet."}</p>
            </div>
          </div>

          {status ? <p className="puzzle-feedback">{status}</p> : null}

          {result ? (
            <div className="panel insight-result-panel">
              <p className="eyebrow">{result.correct ? "Confirmed" : "Review result"}</p>
              <h3>{result.correct ? "Correct anomaly call" : `The outlier was Sol ${result.answerSol}`}</h3>
              <p className="muted">
                Baseline {result.metricLabel}: {result.baseline.toFixed(1)}
                {metricSuffix}. Sol {result.answerSol} measured {result.answerValue !== null ? result.answerValue.toFixed(1) : "n/a"}
                {metricSuffix}.
              </p>
              <div className="mission-complete-score" style={{ marginTop: "1rem" }}>
                <span className="mission-complete-score-label muted">Score</span>
                <span className="mission-complete-score-value">{result.score}</span>
              </div>
            </div>
          ) : (
            <div className="puzzle-next-row mission-sticky-actions">
              <button
                className="button button-primary puzzle-action-primary"
                type="button"
                data-cy="insight-submit-button"
                onClick={() => void handleSubmit()}
                disabled={submitting}
              >
                <span data-cy="insight-submit-label">{submitting ? "Scoring…" : "Submit Anomaly Call"}</span>
              </button>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
