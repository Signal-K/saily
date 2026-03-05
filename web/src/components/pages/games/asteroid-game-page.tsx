"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
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

export default function AsteroidGamePage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [annotationMap, setAnnotationMap] = useState<Record<string, AsteroidAnnotation[]>>({});
  const [label, setLabel] = useState("Possible anomaly");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const anomaly = ASTEROID_ANOMALIES[selectedIndex] ?? ASTEROID_ANOMALIES[0];
  const annotations = useMemo(() => {
    return annotationMap[anomaly.id] ?? [];
  }, [annotationMap, anomaly.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadDraft() {
      const query = new URLSearchParams({ anomalyKey: anomaly.id });
      const response = await fetch(`/api/asteroid/annotations?${query.toString()}`, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        draft?: { annotations?: unknown; note?: string | null } | null;
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

      setAnnotationMap((current) => ({
        ...current,
        [anomaly.id]: normalizeDraftAnnotations(payload.draft?.annotations),
      }));
      if (typeof payload.draft?.note === "string") {
        setNote(payload.draft.note);
      } else {
        setNote("");
      }
      setStatus(null);
    }

    void loadDraft();
    return () => {
      cancelled = true;
    };
  }, [anomaly.id]);

  function handleImageClick(event: React.MouseEvent<HTMLImageElement>) {
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    const x = clamp01((event.clientX - rect.left) / rect.width);
    const y = clamp01((event.clientY - rect.top) / rect.height);

    const next = [
      ...annotations,
      {
        id: `${Date.now()}-${annotations.length}`,
        x: Number(x.toFixed(4)),
        y: Number(y.toFixed(4)),
        label: label.trim() || "Possible anomaly",
        note: note.trim(),
      },
    ];
    setAnnotationMap((current) => ({ ...current, [anomaly.id]: next }));
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
    setStatus(`Saved ${payload.savedCount ?? annotations.length} annotation(s) for ${anomaly.title}.`);
    setSaving(false);
  }

  async function clearDraft() {
    setSaving(true);
    setAnnotationMap((current) => ({ ...current, [anomaly.id]: [] }));
    const response = await fetch("/api/asteroid/annotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anomalyKey: anomaly.id,
        label: anomaly.title,
        imagePath: anomaly.imagePath,
        note: "",
        annotations: [],
      }),
    });
    if (!response.ok) {
      setStatus("Cleared locally, but server save failed.");
      setSaving(false);
      return;
    }
    setStatus("Draft cleared.");
    setSaving(false);
  }

  function removeAnnotation(id: string) {
    const next = annotations.filter((annotation) => annotation.id !== id);
    setAnnotationMap((current) => ({ ...current, [anomaly.id]: next }));
  }

  return (
    <section className="panel">
      <header>
        <p className="eyebrow">Secondary Puzzle Preview</p>
        <h1>Asteroid Anomaly Lab</h1>
        <p className="muted">Select a candidate image, click to mark anomaly regions, and save server-backed annotation drafts.</p>
      </header>

      <div className="home-grid-two">
        <article className="panel">
          <h2>Candidate Set</h2>
          <div className="puzzle-chip-row" role="tablist" aria-label="Anomaly candidates">
            {ASTEROID_ANOMALIES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`puzzle-chip${index === selectedIndex ? " is-active" : ""}`}
                onClick={() => setSelectedIndex(index)}
              >
                {item.title}
              </button>
            ))}
          </div>
          <div className="puzzle-context-row">
            <span className="puzzle-context-pill">TIC {anomaly.ticId}</span>
            <span className="puzzle-context-pill">{anomaly.mission}</span>
            <span className="puzzle-context-pill">{annotations.length} annotations</span>
          </div>
          <p className="muted">Click the image to place annotations using the current label/note.</p>
          <div style={{ position: "relative" }}>
            <Image
              ref={imageRef}
              src={anomaly.imagePath}
              alt={anomaly.imageAlt}
              width={1200}
              height={800}
              onClick={handleImageClick}
              style={{ width: "100%", borderRadius: "0.75rem", border: "1px solid var(--border)", cursor: "crosshair" }}
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

        <aside className="panel">
          <h2>Annotation Input</h2>
          <label className="puzzle-control-group">
            <p className="puzzle-control-label">Label</p>
            <input className="input" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Possible transit edge" />
          </label>
          <label className="puzzle-control-group">
            <p className="puzzle-control-label">Note</p>
            <textarea
              className="textarea puzzle-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Reason this region looks unusual..."
            />
          </label>

          <div className="puzzle-next-row">
            <button type="button" className="button puzzle-action-secondary" onClick={() => void clearDraft()} disabled={saving}>
              Clear
            </button>
            <button type="button" className="button button-primary" onClick={() => void saveDraft()} disabled={saving}>
              {saving ? "Saving..." : "Save Draft"}
            </button>
          </div>

          {status ? <p className="puzzle-feedback">{status}</p> : null}

          <h3>Saved Markers</h3>
          {annotations.length === 0 ? (
            <p className="muted">No markers yet.</p>
          ) : (
            <ul className="home-list">
              {annotations.map((annotation) => (
                <li key={annotation.id} className="home-list-item">
                  <span>
                    {annotation.label} ({annotation.x.toFixed(3)}, {annotation.y.toFixed(3)})
                  </span>
                  <button type="button" className="button puzzle-action-secondary" onClick={() => removeAnnotation(annotation.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
}
