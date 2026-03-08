"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ASTEROID_ANOMALIES } from "@/lib/secondary-game";

type AsteroidAnnotation = {
  id: string;
  x: number;
  y: number;
  label: string;
  note: string;
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDailyAnomalyIndex(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash << 5) - hash + date.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % ASTEROID_ANOMALIES.length;
}

function normalizeDraftAnnotations(value: unknown): AsteroidAnnotation[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((row) => Number.isFinite((row as AsteroidAnnotation)?.x) && Number.isFinite((row as AsteroidAnnotation)?.y))
    .map((row, index) => {
      const entry = row as Partial<AsteroidAnnotation>;
      return {
        id: String(entry.id ?? `server-${index}`),
        x: clamp01(Number(entry.x)),
        y: clamp01(Number(entry.y)),
        label: typeof entry.label === "string" && entry.label.trim() ? entry.label.trim() : "Possible anomaly",
        note: typeof entry.note === "string" ? entry.note : "",
      };
    });
}

type AsteroidGamePageProps = {
  onMissionComplete?: (score: number) => void;
};

export default function AsteroidGamePage({ onMissionComplete }: AsteroidGamePageProps = {}) {
  const date = getTodayKey();
  const dailyIndex = getDailyAnomalyIndex(date);
  const anomaly = ASTEROID_ANOMALIES[dailyIndex];

  const [annotations, setAnnotations] = useState<AsteroidAnnotation[]>([]);
  const [label, setLabel] = useState("Possible anomaly");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDraft() {
      const query = new URLSearchParams({ anomalyKey: anomaly.id });
      const response = await fetch(`/api/asteroid/annotations?${query.toString()}`, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        draft?: { annotations?: unknown; note?: string | null; submitted_at?: string | null } | null;
      };

      if (cancelled) return;
      if (!response.ok) {
        if (response.status === 401) {
          setStatus("Sign in to save asteroid annotation drafts.");
          return;
        }
        setStatus(payload.error ?? "Could not load saved draft.");
        return;
      }

      setAnnotations(normalizeDraftAnnotations(payload.draft?.annotations));
      if (typeof payload.draft?.note === "string") setNote(payload.draft.note);
      if (payload.draft?.submitted_at) {
        setSubmitted(true);
        setStatus("You've already submitted today's asteroid survey.");
      }
    }

    void loadDraft();
    return () => { cancelled = true; };
  }, [anomaly.id]);

  function handleImageClick(event: React.MouseEvent<HTMLImageElement>) {
    if (submitted) return;
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    const x = clamp01((event.clientX - rect.left) / rect.width);
    const y = clamp01((event.clientY - rect.top) / rect.height);

    setAnnotations((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        x: Number(x.toFixed(4)),
        y: Number(y.toFixed(4)),
        label: label.trim() || "Possible anomaly",
        note: note.trim(),
      },
    ]);
    setStatus("Annotation added.");
  }

  async function saveDraft() {
    setSaving(true);
    const response = await fetch("/api/asteroid/annotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anomalyKey: anomaly.id,
        label: anomaly.title,
        imagePath: anomaly.imagePath,
        note: note.trim(),
        annotations,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; savedCount?: number };
    if (!response.ok) {
      setStatus(payload.error ?? "Could not save draft.");
      setSaving(false);
      return;
    }
    setStatus(`Saved ${payload.savedCount ?? annotations.length} annotation(s).`);
    setSaving(false);
  }

  async function submitAnnotations() {
    setSaving(true);
    // Save draft first to ensure latest annotations are persisted.
    await fetch("/api/asteroid/annotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anomalyKey: anomaly.id,
        label: anomaly.title,
        imagePath: anomaly.imagePath,
        note: note.trim(),
        annotations,
      }),
    });

    const response = await fetch("/api/asteroid/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anomalyKey: anomaly.id, date }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; score?: number };
    if (!response.ok) {
      setStatus(payload.error ?? "Could not submit.");
      setSaving(false);
      return;
    }
    const finalScore = payload.score ?? 0;
    if (onMissionComplete) {
      onMissionComplete(finalScore);
    } else {
      setSubmitted(true);
      setScore(finalScore);
      setStatus(null);
    }
    setSaving(false);
  }

  function removeAnnotation(id: string) {
    if (submitted) return;
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }

  if (submitted && score !== null) {
    return (
      <section className="puzzle-screen">
        <header className="puzzle-header panel">
          <p className="eyebrow">Daily Mission</p>
          <h1>Asteroid Survey Complete</h1>
          <p className="muted puzzle-header-summary">
            You mapped anomaly candidates on <strong>{anomaly.title}</strong> (TIC {anomaly.ticId}).
          </p>
        </header>
        <div className="panel">
          <div className="mission-complete-score" style={{ margin: "1.25rem 0" }}>
            <span className="mission-complete-score-label muted">Score</span>
            <span className="mission-complete-score-value">{score}</span>
          </div>
          <p className="muted">Come back tomorrow for a new survey target.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="puzzle-screen">
      <header className="puzzle-header panel">
        <p className="eyebrow">Daily Mission</p>
        <h1>Water-Ice Mapping</h1>
        <div className="puzzle-header-row">
          <p className="muted puzzle-header-summary">
            Mark anomaly regions on today&apos;s asteroid candidate. Your annotations help identify
            potential water-ice deposits.
          </p>
          <span className="puzzle-progress">Survey</span>
        </div>
        <div className="puzzle-context-row">
          <span className="puzzle-context-pill">Date {date}</span>
          <span className="puzzle-context-pill">TIC {anomaly.ticId}</span>
          <span className="puzzle-context-pill">{anomaly.mission}</span>
          <span className="puzzle-context-pill">{anomaly.title}</span>
          <span className="puzzle-context-pill">{annotations.length} annotations</span>
        </div>
      </header>

      <div className="puzzle-workspace">
        <article className="puzzle-canvas panel">
          <h2>Today&apos;s Target</h2>
          <p className="muted">{submitted ? "Survey submitted." : "Tap the image to place markers."}</p>
          <div style={{ position: "relative" }}>
            <Image
              ref={imageRef}
              src={anomaly.imagePath}
              alt={anomaly.imageAlt}
              width={1200}
              height={800}
              onClick={handleImageClick}
              style={{
                width: "100%",
                borderRadius: "0.75rem",
                border: "1px solid var(--border)",
                cursor: submitted ? "default" : "crosshair",
              }}
            />
            {annotations.map((annotation, index) => (
              <span
                key={annotation.id}
                title={`${annotation.label}${annotation.note ? `: ${annotation.note}` : ""}`}
                style={{
                  position: "absolute",
                  left: `${annotation.x * 100}%`,
                  top: `${annotation.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                  width: "18px",
                  height: "18px",
                  borderRadius: "999px",
                  border: "2px solid #ffffff",
                  background: "var(--brand)",
                  color: "#ffffff",
                  fontSize: "0.65rem",
                  display: "grid",
                  placeItems: "center",
                  pointerEvents: "none",
                }}
              >
                {index + 1}
              </span>
            ))}
          </div>
        </article>

        <aside className="puzzle-sidebar panel">
          <div className="puzzle-controls" aria-label="Asteroid survey controls">
            <label className="puzzle-control-group">
              <p className="puzzle-control-label">Label</p>
              <input
                className="input"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Possible water-ice region"
                disabled={submitted}
              />
            </label>
            <label className="puzzle-control-group">
              <p className="puzzle-control-label">Note</p>
              <textarea
                className="textarea puzzle-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why does this region look unusual?"
                disabled={submitted}
              />
            </label>
          </div>

          {status ? <p className="puzzle-feedback">{status}</p> : null}

          <details className="puzzle-collapsible" open={annotations.length > 0}>
            <summary>Markers {annotations.length > 0 ? `(${annotations.length})` : ""}</summary>
            {annotations.length === 0 ? (
              <p className="muted">No markers yet. Tap the image to begin.</p>
            ) : (
              <ul className="home-list">
                {annotations.map((annotation) => (
                  <li key={annotation.id} className="home-list-item">
                    <span>
                      {annotation.label} ({annotation.x.toFixed(3)}, {annotation.y.toFixed(3)})
                    </span>
                    {!submitted && (
                      <button
                        type="button"
                        className="button puzzle-action-secondary"
                        onClick={() => removeAnnotation(annotation.id)}
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </details>

          {!submitted && (
            <div className="puzzle-next-row mission-sticky-actions">
              <button
                type="button"
                className="button puzzle-action-secondary"
                onClick={() => void saveDraft()}
                disabled={saving}
              >
                Save Draft
              </button>
              <button
                type="button"
                className="button button-primary puzzle-action-primary"
                onClick={() => void submitAnnotations()}
                disabled={saving || annotations.length === 0}
              >
                {saving ? "Submitting..." : "Submit Survey"}
              </button>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
