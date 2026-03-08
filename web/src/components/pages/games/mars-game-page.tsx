"use client";

import { useEffect, useState } from "react";
import { MARS_CLASSIFICATIONS, type MarsImage, type MarsClassification } from "@/lib/mars-images";

type ClassificationEntry = {
  imageId: string;
  imageUrl: string;
  classification: MarsClassification | "";
  confidence: number;
};

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

type MarsGamePageProps = {
  onMissionComplete?: (score: number) => void;
};

export default function MarsGamePage({ onMissionComplete }: MarsGamePageProps = {}) {
  const date = getTodayKey();

  const [images, setImages] = useState<MarsImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<ClassificationEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadImages() {
      setLoading(true);
      try {
        const res = await fetch(`/api/mars/daily?date=${date}`, { cache: "no-store" });
        const payload = (await res.json().catch(() => ({}))) as {
          images?: MarsImage[];
          error?: string;
        };
        if (!res.ok || !Array.isArray(payload.images)) {
          setStatus(payload.error ?? "Could not load today's images.");
          setLoading(false);
          return;
        }
        setImages(payload.images);
        setEntries(
          payload.images.map((img) => ({
            imageId: img.id,
            imageUrl: img.url,
            classification: "",
            confidence: 70,
          })),
        );
      } catch {
        setStatus("Could not load today's images.");
      }
      setLoading(false);
    }

    // Check if already submitted today.
    async function checkExisting() {
      const res = await fetch(`/api/mars/classify?date=${date}`, { cache: "no-store" });
      const payload = (await res.json().catch(() => ({}))) as {
        classifications?: Array<{ image_id: string; classification: string; confidence: number }>;
      };
      if (res.ok && Array.isArray(payload.classifications) && payload.classifications.length > 0) {
        setSubmitted(true);
        const avg = payload.classifications.reduce((s, c) => s + c.confidence, 0) / payload.classifications.length;
        setScore(Math.round(40 + (payload.classifications.length / 3) * 40 + avg * 0.2));
      }
    }

    void loadImages();
    void checkExisting();
  }, [date]);

  function setClassification(index: number, value: MarsClassification) {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, classification: value } : e)),
    );
  }

  function setConfidence(index: number, value: number) {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, confidence: value } : e)),
    );
  }

  async function handleSubmit() {
    const complete = entries.filter((e) => e.classification !== "");
    if (complete.length === 0) {
      setStatus("Classify at least one image before submitting.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/mars/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, classifications: complete }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string; score?: number; classified?: number };
    if (!res.ok) {
      setStatus(payload.error ?? "Submission failed.");
      setSubmitting(false);
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
    setSubmitting(false);
  }

  const activeEntry = entries[activeIndex];
  const activeImage = images[activeIndex];
  const allClassified = entries.length > 0 && entries.every((e) => e.classification !== "");
  const classifiedCount = entries.filter((e) => e.classification !== "").length;

  if (loading) {
    return (
      <section className="puzzle-screen">
        <header className="puzzle-header panel">
          <p className="eyebrow">Daily Mission</p>
          <h1>Mars Surface Classification</h1>
          <p className="muted puzzle-header-summary">Loading today&apos;s survey images...</p>
        </header>
      </section>
    );
  }

  if (submitted && score !== null) {
    return (
      <section className="puzzle-screen">
        <header className="puzzle-header panel">
          <p className="eyebrow">Daily Mission</p>
          <h1>Surface Survey Complete</h1>
          <p className="muted puzzle-header-summary">
            Your terrain classifications help build a surface map for mission planning.
          </p>
        </header>
        <div className="panel">
          <div className="mission-complete-score" style={{ margin: "1.25rem 0" }}>
            <span className="mission-complete-score-label muted">Score</span>
            <span className="mission-complete-score-value">{score}</span>
          </div>
          <p className="muted">Come back tomorrow for a new survey set.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="puzzle-screen">
      <header className="puzzle-header panel">
        <p className="eyebrow">Daily Mission</p>
        <h1>Mars Surface Classification</h1>
        <div className="puzzle-header-row">
          <p className="muted puzzle-header-summary">
            Classify each rover image by terrain type to improve surface map quality.
          </p>
          <span className="puzzle-progress">Survey</span>
        </div>
        <div className="puzzle-context-row">
          <span className="puzzle-context-pill">Date {date}</span>
          <span className="puzzle-context-pill">
            Classified {classifiedCount}/{images.length}
          </span>
        </div>
      </header>

      <div className="puzzle-workspace">
        {activeImage && activeEntry && (
          <article className="puzzle-canvas panel">
            <h2>{activeImage.title}</h2>
            <p className="muted" style={{ fontSize: "0.8rem" }}>{activeImage.credit}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.url}
              alt={activeImage.title}
              style={{
                width: "100%",
                borderRadius: "0.75rem",
                border: "1px solid var(--border)",
                marginTop: "0.5rem",
                display: "block",
              }}
            />
          </article>
        )}

        <aside className="puzzle-sidebar panel">
          <div className="puzzle-controls">
            <p className="puzzle-control-label">Image Set</p>
            <div className="puzzle-chip-row" role="tablist">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  role="tab"
                  className={`puzzle-chip${i === activeIndex ? " is-active" : ""}${entries[i]?.classification ? " is-done" : ""}`}
                  onClick={() => setActiveIndex(i)}
                >
                  Image {i + 1}
                  {entries[i]?.classification ? " done" : ""}
                </button>
              ))}
            </div>

            <div className="mars-classification-grid">
              {MARS_CLASSIFICATIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`button mars-cat-btn${activeEntry?.classification === cat ? " button-primary" : ""}`}
                  onClick={() => setClassification(activeIndex, cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="puzzle-control-group">
              <p className="puzzle-control-label">
                Confidence - {activeEntry?.confidence ?? 0}%
              </p>
              <input
                type="range"
                min={0}
                max={100}
                value={activeEntry?.confidence ?? 0}
                onChange={(e) => setConfidence(activeIndex, Number(e.target.value))}
                style={{ width: "100%" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--muted)" }}>
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          </div>

          {status ? <p className="puzzle-feedback">{status}</p> : null}
          {activeEntry?.classification ? (
            <p className="puzzle-feedback">
              Classified as: <strong>{activeEntry.classification}</strong>
            </p>
          ) : null}

          {!allClassified && !submitted && images.length > 0 ? (
            <p className="muted" style={{ fontSize: "0.85rem" }}>
              {classifiedCount} of {images.length} images classified.
              {classifiedCount > 0 && classifiedCount < images.length && " You can submit with partial classifications."}
            </p>
          ) : null}

          <div className="puzzle-next-row mission-sticky-actions">
            {activeIndex < images.length - 1 ? (
              <button
                type="button"
                className="button button-primary puzzle-action-primary"
                onClick={() => setActiveIndex((i) => i + 1)}
                disabled={!activeEntry?.classification}
              >
                Next Image
              </button>
            ) : (
              <button
                type="button"
                className="button button-primary puzzle-action-primary"
                onClick={() => void handleSubmit()}
                disabled={submitting || classifiedCount === 0}
              >
                {submitting ? "Submitting..." : `Submit Survey (${classifiedCount}/${images.length})`}
              </button>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
