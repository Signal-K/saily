"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { type MarsImage } from "@/lib/mars-images";
import { MARS_TEMPLATE_DICTIONARY, type MarsTemplate } from "@/lib/mars-dictionary";
import { queueSurveyTrigger } from "@/lib/posthog/survey-queue";
import { trackGameplayEvent } from "@/lib/analytics/events";
import { StreakRepairPrompt } from "@/components/streak-repair-prompt";
import { getMelbourneDateKey, resolveMelbourneDateKey } from "@/lib/melbourne-date";

type MarsAnnotation = {
  id: string;
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  type: string;
  label: string;
};

type ClassificationEntry = {
  imageId: string;
  imageUrl: string;
  annotations: MarsAnnotation[];
  confidence: number;
  note: string;
};

type MarsGamePageProps = {
  onMissionComplete?: (score: number) => void;
  gameDate?: string;
};

export default function MarsGamePage({ onMissionComplete, gameDate }: MarsGamePageProps = {}) {
  const date = resolveMelbourneDateKey(gameDate ?? getMelbourneDateKey());
  const isArchiveDay = date < getMelbourneDateKey();

  const [images, setImages] = useState<MarsImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [entries, setEntries] = useState<ClassificationEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<MarsTemplate>(MARS_TEMPLATE_DICTIONARY[0]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const loadImages = useCallback(async () => {
    // Avoid synchronous setState in effect
    await Promise.resolve();
    setLoading(true);
    try {
      const res = await fetch(`/api/mars/daily?date=${date}`, { cache: "no-store" });
      const payload = (await res.json().catch(() => ({}))) as {
        images?: MarsImage[];
        user?: { id: string };
        error?: string;
      };
      
      if (payload.user?.id) {
        setUserId(payload.user.id);
      }

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
          annotations: [],
          confidence: 70,
          note: "",
        })),
      );
    } catch {
      setStatus("Could not load today's images.");
    }
    setLoading(false);
  }, [date]);

  useEffect(() => {
    let cancelled = false;

    // Check if already submitted today.
    async function checkExisting() {
      const res = await fetch(`/api/mars/classify?date=${date}`, { cache: "no-store" });
      const payload = (await res.json().catch(() => ({}))) as {
        classifications?: Array<{ image_id: string; classification: string; confidence: number }>;
      };
      if (cancelled) return;
      if (res.ok && Array.isArray(payload.classifications) && payload.classifications.length > 0) {
        setSubmitted(true);
        const avg = payload.classifications.reduce((s, c) => s + c.confidence, 0) / payload.classifications.length;
        setScore(Math.round(40 + (payload.classifications.length / 3) * 40 + avg * 0.2));
      }
    }

    const fetchData = async () => {
      if (cancelled) return;
      await loadImages();
      if (cancelled) return;
      await checkExisting();
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [date, loadImages]);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current || submitted) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const newAnnotation: MarsAnnotation = {
      id: Date.now().toString(),
      x,
      y,
      type: selectedTemplate.id,
      label: selectedTemplate.label,
    };

    setEntries((prev) =>
      prev.map((entry, i) =>
        i === activeIndex
          ? { ...entry, annotations: [...entry.annotations, newAnnotation] }
          : entry
      )
    );
  };

  const removeAnnotation = (id: string) => {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === activeIndex
          ? { ...entry, annotations: entry.annotations.filter((a) => a.id !== id) }
          : entry
      )
    );
  };

  function setConfidence(index: number, value: number) {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, confidence: value } : e)),
    );
  }

  async function handleSubmit() {
    const complete = entries.filter((e) => e.annotations.length > 0);
    if (complete.length === 0) {
      setStatus("Add at least one annotation before submitting.");
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
    queueSurveyTrigger({
      source: "mars_classification",
      version: process.env.NEXT_PUBLIC_APP_VERSION?.trim() || "v1",
      gameDate: date,
      score: finalScore,
    });
    trackGameplayEvent("mars_classification_completed", {
      game_date: date,
      score: finalScore,
      classified_count: complete.length,
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

  const activeEntry = entries[activeIndex];
  const activeImage = images[activeIndex];
  const annotatedCount = entries.filter((e) => e.annotations.length > 0).length;

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
      {userId && !isArchiveDay ? (
        <StreakRepairPrompt 
          userId={userId} 
          gameDate={date} 
          onRepairComplete={() => void loadImages()} 
        />
      ) : null}
      <header className="puzzle-header panel">
        <p className="eyebrow">Daily Mission</p>
        <h1>Mars Surface Classification</h1>
        <div className="puzzle-header-row">
          <p className="muted puzzle-header-summary">
            Identify and tag geological features. Tap the image to place a marker.
          </p>
          <span className="puzzle-progress">Survey</span>
        </div>
        <div className="puzzle-context-row">
          <span className="puzzle-context-pill">Date {date}</span>
          {isArchiveDay ? <span className="puzzle-context-pill">Archive day (no score/streak)</span> : null}
          <span className="puzzle-context-pill">
            Images tagged {annotatedCount}/{images.length}
          </span>
        </div>
      </header>

      <div className="puzzle-workspace">
        {activeImage && activeEntry && (
          <article className="puzzle-canvas panel mars-canvas-wrap">
            <div className="mars-image-container" style={{ position: "relative" }}>
              <h2>{activeImage.title}</h2>
              <p className="muted" style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>{activeImage.credit}</p>
              
              <div className="mars-annotation-wrapper" style={{ position: "relative", cursor: "crosshair" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={activeImage.url}
                  alt={activeImage.title}
                  onClick={handleImageClick}
                  style={{
                    width: "100%",
                    borderRadius: "0.75rem",
                    border: "1px solid var(--border)",
                    display: "block",
                  }}
                />
                {activeEntry.annotations.map((a) => (
                  <div
                    key={a.id}
                    className="mars-marker"
                    title={a.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAnnotation(a.id);
                    }}
                    style={{
                      position: "absolute",
                      left: `${a.x * 100}%`,
                      top: `${a.y * 100}%`,
                      width: "24px",
                      height: "24px",
                      background: "rgba(255, 0, 0, 0.6)",
                      border: "2px solid white",
                      borderRadius: "50%",
                      transform: "translate(-50%, -50%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      boxShadow: "0 0 4px rgba(0,0,0,0.5)",
                    }}
                  >
                    ×
                  </div>
                ))}
              </div>
            </div>
          </article>
        )}

        <aside className="puzzle-sidebar panel">
          <div className="puzzle-controls">
            <p className="puzzle-control-label">Template Dictionary</p>
            <div className="mars-template-grid">
              {MARS_TEMPLATE_DICTIONARY.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={`mars-template-card${selectedTemplate.id === template.id ? " is-selected" : ""}`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={template.imageUrl} alt={template.label} />
                  <div className="mars-template-info">
                    <strong>{template.label}</strong>
                    <p>{template.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <p className="puzzle-control-label" style={{ marginTop: "1.5rem" }}>Image Set</p>
            <div className="puzzle-chip-row" role="tablist">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  role="tab"
                  className={`puzzle-chip${i === activeIndex ? " is-active" : ""}${entries[i]?.annotations.length > 0 ? " is-done" : ""}`}
                  onClick={() => setActiveIndex(i)}
                >
                  Image {i + 1}
                  {entries[i]?.annotations.length > 0 ? ` (${entries[i].annotations.length})` : ""}
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
            </div>
          </div>

          {status ? <p className="puzzle-feedback">{status}</p> : null}
          
          {activeEntry?.annotations.length > 0 ? (
            <div className="puzzle-annotation-list" style={{ marginTop: "1rem" }}>
              <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>Annotations ({activeEntry.annotations.length}):</p>
              <div className="chip-list">
                {activeEntry.annotations.map(a => (
                  <span key={a.id} className="puzzle-context-pill">
                    {a.label} <button onClick={() => removeAnnotation(a.id)} style={{ border: "none", background: "none", cursor: "pointer", marginLeft: "4px" }}>×</button>
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="puzzle-next-row mission-sticky-actions">
            {activeIndex < images.length - 1 ? (
              <button
                type="button"
                className="button button-primary puzzle-action-primary"
                onClick={() => setActiveIndex((i) => i + 1)}
              >
                Next Image
              </button>
            ) : (
              <button
                type="button"
                className="button button-primary puzzle-action-primary"
                onClick={() => void handleSubmit()}
                disabled={submitting || annotatedCount === 0}
              >
                {submitting ? "Submitting..." : `Submit Survey (${annotatedCount}/${images.length})`}
              </button>
            )}
          </div>
        </aside>
      </div>
      <style jsx>{`
        .mars-template-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 300px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .mars-template-card {
          display: flex;
          gap: 0.75rem;
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          background: var(--surface);
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mars-template-card.is-selected {
          border-color: var(--brand);
          background: color-mix(in oklab, var(--brand) 10%, var(--surface));
          box-shadow: 0 0 0 1px var(--brand);
        }
        .mars-template-card img {
          width: 60px;
          height: 60px;
          border-radius: 0.25rem;
          object-fit: cover;
        }
        .mars-template-info strong {
          display: block;
          font-size: 0.9rem;
          margin-bottom: 0.125rem;
        }
        .mars-template-info p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--muted);
          line-height: 1.2;
        }
        .chip-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
      `}</style>
    </section>
  );
}
