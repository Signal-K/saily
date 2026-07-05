"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { type GaiaVariablesSubject } from "@/lib/gaia-variables";
import { GAIA_CLASSIFICATION_DICTIONARY, type GaiaClassificationChoice } from "@/lib/gaia-dictionary";
import { clamp01 } from "@/lib/planet-logic";
import { queueSurveyTrigger } from "@/lib/posthog/survey-queue";
import { trackGameplayEvent } from "@/lib/analytics/events";
import { getMelbourneDateKey, resolveMelbourneDateKey } from "@/lib/melbourne-date";

type GaiaVariablesGamePageProps = {
  onMissionComplete?: (score: number) => void;
  gameDate?: string;
};

function xToSvg(x: number) {
  return 40 + clamp01(x) * 920;
}

export default function GaiaVariablesGamePage({ onMissionComplete, gameDate }: GaiaVariablesGamePageProps = {}) {
  const date = resolveMelbourneDateKey(gameDate ?? getMelbourneDateKey());
  const isArchiveDay = date < getMelbourneDateKey();

  const [subject, setSubject] = useState<GaiaVariablesSubject | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChoice, setSelectedChoice] = useState<GaiaClassificationChoice | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const loadSubject = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const res = await fetch(`/api/gaia-variables/daily?date=${date}`, { cache: "no-store" });
      const payload = (await res.json().catch(() => ({}))) as {
        subject?: GaiaVariablesSubject;
        error?: string;
      };

      if (!res.ok || !payload.subject) {
        setStatus(payload.error ?? "Could not load today's subject.");
        setLoading(false);
        return;
      }
      setSubject(payload.subject);
    } catch {
      setStatus("Could not load today's subject.");
    }
    setLoading(false);
  }, [date]);

  useEffect(() => {
    let cancelled = false;

    async function checkExisting() {
      const res = await fetch(`/api/gaia-variables/classify?date=${date}`, { cache: "no-store" });
      const payload = (await res.json().catch(() => ({}))) as {
        classifications?: Array<{ source_id: string; classification: string }>;
      };
      if (cancelled) return;
      if (res.ok && Array.isArray(payload.classifications) && payload.classifications.length > 0) {
        setSubmitted(true);
        setScore(70);
      }
    }

    const fetchData = async () => {
      if (cancelled) return;
      await loadSubject();
      if (cancelled) return;
      await checkExisting();
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [date, loadSubject]);

  const bounds = useMemo(() => {
    const series = subject?.series ?? [];
    if (series.length === 0) {
      return { minY: 0.98, maxY: 1.02 };
    }
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    series.forEach((point) => {
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
    const pad = Math.max((maxY - minY) * 0.2, 0.002);
    return { minY: minY - pad, maxY: maxY + pad };
  }, [subject]);

  const yToSvg = useCallback(
    (value: number) => {
      const t = (value - bounds.minY) / (bounds.maxY - bounds.minY || 1);
      return 20 + (1 - t) * 300;
    },
    [bounds.maxY, bounds.minY],
  );

  const path = useMemo(() => {
    const series = subject?.series ?? [];
    if (series.length === 0) return "";
    return series
      .map((point, idx) => `${idx === 0 ? "M" : "L"} ${xToSvg(point.x).toFixed(2)} ${yToSvg(point.y).toFixed(2)}`)
      .join(" ");
  }, [subject, yToSvg]);

  async function handleSubmit() {
    if (!subject || !selectedChoice) {
      setStatus("Pick a variability type before submitting.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/gaia-variables/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, subjectId: subject.id, choice: selectedChoice.id, note }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string; score?: number };
    if (!res.ok) {
      setStatus(payload.error ?? "Submission failed.");
      setSubmitting(false);
      return;
    }
    const finalScore = payload.score ?? 0;
    queueSurveyTrigger({
      source: "gaia_variables_classification",
      version: process.env.NEXT_PUBLIC_APP_VERSION?.trim() || "v1",
      gameDate: date,
      score: finalScore,
    });
    trackGameplayEvent("gaia_variables_classification_completed", {
      game_date: date,
      score: finalScore,
      choice: selectedChoice.id,
    });
    if (onMissionComplete) {
      onMissionComplete(finalScore);
    } else {
      setSubmitted(true);
      setScore(finalScore);
      setStatus(null);
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <section className="puzzle-screen">
        <header className="puzzle-header panel">
          <p className="eyebrow">Daily Mission</p>
          <h1>Gaia Light Curve Review</h1>
          <p className="muted puzzle-header-summary">Loading today&apos;s light curve...</p>
        </header>
      </section>
    );
  }

  if (submitted && score !== null) {
    return (
      <section className="puzzle-screen">
        <header className="puzzle-header panel">
          <p className="eyebrow">Daily Mission</p>
          <h1>Light Curve Review Complete</h1>
          <p className="muted puzzle-header-summary">
            Your classification helps sort real variable-star candidates from the Gaia Archive.
          </p>
        </header>
        <div className="panel">
          <div className="mission-complete-score" style={{ margin: "1.25rem 0" }}>
            <span className="mission-complete-score-label muted">Score</span>
            <span className="mission-complete-score-value">{score}</span>
          </div>
          <p className="muted">Come back tomorrow for a new light curve.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="puzzle-screen">
      <header className="puzzle-header panel">
        <p className="eyebrow">Daily Mission</p>
        <h1>Gaia Light Curve Review</h1>
        <div className="puzzle-header-row">
          <p className="muted puzzle-header-summary">
            {subject?.prompt ?? "What kind of variability pattern does this light curve show?"}
          </p>
          <span className="puzzle-progress">Review</span>
        </div>
        <div className="puzzle-context-row">
          <span className="puzzle-context-pill">Date {date}</span>
          {isArchiveDay ? <span className="puzzle-context-pill">Archive replay (no score)</span> : null}
          {subject?.cadenceSummary ? <span className="puzzle-context-pill">{subject.cadenceSummary}</span> : null}
        </div>
      </header>

      <div className="puzzle-workspace">
        <article className="puzzle-canvas panel">
          <div className="puzzle-lightcurve-wrap">
            {subject && subject.series.length > 0 ? (
              <svg className="puzzle-lightcurve" viewBox="0 0 1000 360" role="img" aria-label={`Light curve for ${subject.title}`}>
                <defs>
                  <linearGradient id="gaiaCurveBg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="color-mix(in oklab, var(--surface) 90%, #dbeafe 10%)" />
                    <stop offset="100%" stopColor="color-mix(in oklab, var(--surface) 88%, #ecfccb 12%)" />
                  </linearGradient>
                </defs>
                <rect x="40" y="20" width="920" height="300" fill="url(#gaiaCurveBg)" stroke="var(--border)" />
                {[0, 0.25, 0.5, 0.75, 1].map((xTick) => (
                  <line key={`v-${xTick}`} x1={xToSvg(xTick)} y1="20" x2={xToSvg(xTick)} y2="320" stroke="rgba(100, 116, 139, 0.15)" />
                ))}
                {[0, 1, 2, 3, 4].map((row) => {
                  const yValue = bounds.maxY - ((bounds.maxY - bounds.minY) * row) / 4;
                  return (
                    <g key={`h-${row}`}>
                      <line x1="40" y1={yToSvg(yValue)} x2="960" y2={yToSvg(yValue)} stroke="rgba(100, 116, 139, 0.18)" />
                      <text x="4" y={yToSvg(yValue) + 4} fontSize="11" fill="var(--muted)">
                        {yValue.toFixed(3)}
                      </text>
                    </g>
                  );
                })}
                <path d={path} fill="none" stroke="var(--text)" strokeWidth="1.8" />
                {subject.series.map((point, idx) => (
                  <circle key={`pt-${idx}`} cx={xToSvg(point.x)} cy={yToSvg(point.y)} r="2" fill="var(--brand)" />
                ))}
                <text x="40" y="345" fontSize="12" fill="var(--muted)">
                  Phase
                </text>
                <text x="10" y="24" fontSize="12" fill="var(--muted)">
                  Brightness
                </text>
              </svg>
            ) : (
              <p className="muted">No light curve available for this date.</p>
            )}
          </div>
          {subject?.summary ? <p className="muted" style={{ marginTop: "0.75rem" }}>{subject.summary}</p> : null}
        </article>

        <aside className="puzzle-sidebar panel">
          <div className="puzzle-helper-card">
            <p className="puzzle-control-label">How to read the light curve</p>
            <p>
              Look for repeating brightness changes. Periodic dips suggest eclipsing systems, smooth pulses suggest pulsators, and uneven jumps point to irregular variability.
            </p>
          </div>
          <div className="puzzle-controls">
            <p className="puzzle-control-label">Variability Type</p>
            <div className="gaia-choice-grid">
              {GAIA_CLASSIFICATION_DICTIONARY.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className={`gaia-choice-card${selectedChoice?.id === choice.id ? " is-selected" : ""}`}
                  onClick={() => {
                    setSelectedChoice(choice);
                    setStatus(`Selected ${choice.label}.`);
                  }}
                >
                  <strong>{choice.label}</strong>
                  <p>{choice.description}</p>
                </button>
              ))}
            </div>

            <p className="puzzle-control-label" style={{ marginTop: "1.5rem" }}>Notes (optional)</p>
            <textarea
              className="gaia-note-field"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything else worth flagging about this curve?"
              rows={3}
            />
          </div>

          {status ? <p className="puzzle-feedback">{status}</p> : null}

          <div className="puzzle-next-row mission-sticky-actions">
            <button
              type="button"
              className="button button-primary puzzle-action-primary"
              onClick={() => void handleSubmit()}
              disabled={submitting || !selectedChoice}
            >
              {submitting ? "Submitting..." : "Submit Classification"}
            </button>
          </div>
        </aside>
      </div>
      <style jsx>{`
        .gaia-choice-grid {
          display: grid;
          gap: 0.5rem;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }
        .gaia-choice-card {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-height: 64px;
          padding: 0.7rem;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          background: var(--surface);
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }
        .gaia-choice-card.is-selected {
          border-color: var(--brand);
          background: color-mix(in oklab, var(--brand) 10%, var(--surface));
          box-shadow: 0 0 0 1px var(--brand);
        }
        .gaia-choice-card:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
        .gaia-choice-card p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--muted);
          line-height: 1.2;
        }
        .gaia-note-field {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          background: var(--surface);
          color: inherit;
          padding: 0.6rem;
          font: inherit;
          resize: vertical;
        }
        @media (max-width: 767px) {
          .gaia-choice-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
