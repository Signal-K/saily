"use client";

import { useEffect, useState, useCallback } from "react";
import { type RubinCometCatchersSubject } from "@/lib/rubin-comet-catchers";
import { RUBIN_CLASSIFICATION_DICTIONARY, type RubinClassificationChoice } from "@/lib/rubin-dictionary";
import { queueSurveyTrigger } from "@/lib/posthog/survey-queue";
import { trackGameplayEvent } from "@/lib/analytics/events";
import { StreakRepairPrompt } from "@/components/streak-repair-prompt";
import { getMelbourneDateKey, resolveMelbourneDateKey } from "@/lib/melbourne-date";

type RubinCometCatchersGamePageProps = {
  onMissionComplete?: (score: number) => void;
  gameDate?: string;
};

export default function RubinCometCatchersGamePage({ onMissionComplete, gameDate }: RubinCometCatchersGamePageProps = {}) {
  const date = resolveMelbourneDateKey(gameDate ?? getMelbourneDateKey());
  const isArchiveDay = date < getMelbourneDateKey();

  const [subject, setSubject] = useState<RubinCometCatchersSubject | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<RubinClassificationChoice | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const loadSubject = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const res = await fetch(`/api/rubin-comet-catchers/daily?date=${date}`, { cache: "no-store" });
      const payload = (await res.json().catch(() => ({}))) as {
        subject?: RubinCometCatchersSubject;
        user?: { id: string };
        error?: string;
      };

      if (payload.user?.id) {
        setUserId(payload.user.id);
      }

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
      const res = await fetch(`/api/rubin-comet-catchers/classify?date=${date}`, { cache: "no-store" });
      const payload = (await res.json().catch(() => ({}))) as {
        classifications?: Array<{ subject_id: string; classification: string }>;
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

  async function handleSubmit() {
    if (!subject || !selectedChoice) {
      setStatus("Pick a classification before submitting.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/rubin-comet-catchers/classify", {
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
      source: "rubin_comet_catchers_classification",
      version: process.env.NEXT_PUBLIC_APP_VERSION?.trim() || "v1",
      gameDate: date,
      score: finalScore,
    });
    trackGameplayEvent("rubin_comet_catchers_classification_completed", {
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
          <h1>Comet Activity Review</h1>
          <p className="muted puzzle-header-summary">Loading today&apos;s Rubin subject...</p>
        </header>
      </section>
    );
  }

  if (submitted && score !== null) {
    return (
      <section className="puzzle-screen">
        <header className="puzzle-header panel">
          <p className="eyebrow">Daily Mission</p>
          <h1>Comet Review Complete</h1>
          <p className="muted puzzle-header-summary">
            Your classification helps confirm activity on newly discovered small bodies.
          </p>
        </header>
        <div className="panel">
          <div className="mission-complete-score" style={{ margin: "1.25rem 0" }}>
            <span className="mission-complete-score-label muted">Score</span>
            <span className="mission-complete-score-value">{score}</span>
          </div>
          <p className="muted">Come back tomorrow for a new subject.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="puzzle-screen">
      {userId && !isArchiveDay ? (
        <StreakRepairPrompt userId={userId} gameDate={date} onRepairComplete={() => void loadSubject()} />
      ) : null}
      <header className="puzzle-header panel">
        <p className="eyebrow">Daily Mission</p>
        <h1>Comet Activity Review</h1>
        <div className="puzzle-header-row">
          <p className="muted puzzle-header-summary">
            {subject?.prompt ?? "Do these frames show a tail, coma, or other small-body activity?"}
          </p>
          <span className="puzzle-progress">Review</span>
        </div>
        <div className="puzzle-context-row">
          <span className="puzzle-context-pill">Date {date}</span>
          {isArchiveDay ? <span className="puzzle-context-pill">Archive day (no score/streak)</span> : null}
          {subject?.objectLabel ? <span className="puzzle-context-pill">Object {subject.objectLabel}</span> : null}
        </div>
      </header>

      <div className="puzzle-workspace">
        {subject ? (
          <article className="puzzle-canvas panel">
            <h2>{subject.title}</h2>
            <p className="muted" style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>{subject.sourceName}</p>
            <div className="rubin-frame-row">
              {subject.imageUrls.map((url, idx) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${subject.id}-${idx}`} src={url} alt={`${subject.title} frame ${idx + 1}`} className="rubin-frame-image" />
              ))}
            </div>
          </article>
        ) : (
          <article className="puzzle-canvas panel">
            <p className="muted">No subject available for this date.</p>
          </article>
        )}

        <aside className="puzzle-sidebar panel">
          <div className="puzzle-controls">
            <p className="puzzle-control-label">Classification</p>
            <div className="rubin-choice-grid">
              {RUBIN_CLASSIFICATION_DICTIONARY.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className={`rubin-choice-card${selectedChoice?.id === choice.id ? " is-selected" : ""}`}
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
              className="rubin-note-field"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything else worth flagging about this subject?"
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
        .rubin-frame-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .rubin-frame-image {
          width: 100%;
          max-width: 420px;
          max-height: min(48vh, 480px);
          object-fit: contain;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: var(--surface-container-low);
        }
        .rubin-choice-grid {
          display: grid;
          gap: 0.5rem;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }
        .rubin-choice-card {
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
        .rubin-choice-card.is-selected {
          border-color: var(--brand);
          background: color-mix(in oklab, var(--brand) 10%, var(--surface));
          box-shadow: 0 0 0 1px var(--brand);
        }
        .rubin-choice-card:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
        .rubin-choice-card p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--muted);
          line-height: 1.2;
        }
        .rubin-note-field {
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
          .rubin-choice-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
