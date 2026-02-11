"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type LightcurvePoint = {
  x: number;
  y: number;
};

type DisplayPoint = {
  x: number;
  y: number;
};

type DailyAnomaly = {
  id: number;
  ticId: string;
  label: string;
  anomalyType: string | null;
  anomalySet: string | null;
  lightcurve: LightcurvePoint[];
};

type Annotation = {
  id: string;
  xStart: number;
  xEnd: number;
  confidence: number;
  tag: string;
  note?: string;
};

type SavedAnnotation = Omit<Annotation, "id">;
type SavedHintFlags = {
  phaseFold?: boolean;
  bin?: boolean;
};

type DemoStage = {
  id: 2 | 3;
  title: string;
  objective: string;
  image: string;
  instructions: string[];
};

const DEMO_STAGES: DemoStage[] = [
  {
    id: 2,
    title: "Minigame 2 (Demo): Pattern Trace",
    objective: "Demo mode: follow repeating structures and identify the strongest lane.",
    image: "/puzzles/puzzle-2.svg",
    instructions: ["Scan the full frame.", "Compare spacing consistency.", "Select the lane that repeats most clearly."],
  },
  {
    id: 3,
    title: "Minigame 3 (Demo): Final Recognition",
    objective: "Demo mode: choose the final interpretation from your observed pattern cues.",
    image: "/puzzles/puzzle-3.svg",
    instructions: ["Cross-check major marks.", "Prefer coherent global patterns.", "Summarize your final reasoning briefly."],
  },
];

const TAGS = ["Transit dip", "Periodic pattern", "Noise/uncertain", "Other"] as const;

const TAG_COLORS: Record<string, { fill: string; stroke: string; chip: string }> = {
  "Transit dip": { fill: "rgba(14, 165, 233, 0.2)", stroke: "#0284c7", chip: "#e0f2fe" },
  "Periodic pattern": { fill: "rgba(20, 184, 166, 0.2)", stroke: "#0f766e", chip: "#ccfbf1" },
  "Noise/uncertain": { fill: "rgba(245, 158, 11, 0.24)", stroke: "#b45309", chip: "#ffedd5" },
  Other: { fill: "rgba(168, 85, 247, 0.2)", stroke: "#6d28d9", chip: "#ede9fe" },
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function xToSvg(x: number) {
  return 40 + clamp01(x) * 920;
}

function toDisplayPoints(base: LightcurvePoint[], opts: { phaseFold: boolean; bin: boolean; periodDays: number }) {
  const period = Math.max(0.2, opts.periodDays);
  const totalDays = 27;
  const withTime = base.map((point) => ({
    time: clamp01(point.x) * totalDays,
    y: point.y,
  }));

  const mapped: DisplayPoint[] = opts.phaseFold
    ? withTime
        .map((point) => ({
          x: ((point.time % period) + period) % period / period,
          y: point.y,
        }))
        .sort((a, b) => a.x - b.x)
    : withTime.map((point) => ({ x: point.time / totalDays, y: point.y }));

  if (!opts.bin) return mapped;

  const bins = 70;
  const bucket: { sumY: number; count: number }[] = Array.from({ length: bins }, () => ({ sumY: 0, count: 0 }));
  mapped.forEach((point) => {
    const idx = Math.min(bins - 1, Math.max(0, Math.floor(point.x * bins)));
    bucket[idx].sumY += point.y;
    bucket[idx].count += 1;
  });

  return bucket
    .map((row, idx) => ({
      x: (idx + 0.5) / bins,
      y: row.count > 0 ? row.sumY / row.count : Number.NaN,
    }))
    .filter((row) => Number.isFinite(row.y));
}

export default function TodayGamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showTutorial, setShowTutorial] = useState(false);
  const [anomaly, setAnomaly] = useState<DailyAnomaly | null>(null);
  const [loading, setLoading] = useState(true);
  const [minigameIndex, setMinigameIndex] = useState(0);
  const [confidence, setConfidence] = useState(70);
  const [tag, setTag] = useState<(typeof TAGS)[number]>(TAGS[0]);
  const [periodDays, setPeriodDays] = useState(2);
  const [phaseFoldHint, setPhaseFoldHint] = useState(false);
  const [binHint, setBinHint] = useState(false);
  const [annotationNote, setAnnotationNote] = useState("");
  const [note, setNote] = useState("");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [draftStart, setDraftStart] = useState<number | null>(null);
  const [draftEnd, setDraftEnd] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const selectedDateParam = searchParams.get("date");
  const todayDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const gameDate = useMemo(() => {
    if (!selectedDateParam) return todayDate;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDateParam)) return todayDate;
    return selectedDateParam > todayDate ? todayDate : selectedDateParam;
  }, [selectedDateParam, todayDate]);
  const isPastDay = gameDate < todayDate;
  const draftStorageKey = useMemo(() => (anomaly ? `anomaly-draft:${gameDate}:${anomaly.id}` : null), [anomaly, gameDate]);
  const isTransitStage = minigameIndex === 0;
  const demoStage = !isTransitStage ? DEMO_STAGES[minigameIndex - 1] : null;

  useEffect(() => {
    let cancelled = false;

    async function loadToday() {
      setLoading(true);
      setFeedback(null);
      const response = await fetch(`/api/game/today?date=${encodeURIComponent(gameDate)}`, { cache: "no-store" });
      const payload = (await response.json()) as { anomaly: DailyAnomaly | null; error?: string };
      if (cancelled) return;
      if (!response.ok) {
        setFeedback(payload.error ?? "Could not load daily anomaly.");
        setAnomaly(null);
        setLoading(false);
        return;
      }

      setAnomaly(payload.anomaly ?? null);
      setAnnotations([]);
      setNote("");
      setPhaseFoldHint(false);
      setBinHint(false);
      setPeriodDays(2);
      setMinigameIndex(0);
      setLoading(false);
    }

    void loadToday();
    return () => {
      cancelled = true;
    };
  }, [gameDate]);

  useEffect(() => {
    if (!anomaly) return;
    let cancelled = false;
    const currentAnomalyId = anomaly.id;

    async function loadSavedSubmission() {
      const query = `/api/anomaly/submit?date=${encodeURIComponent(gameDate)}&anomalyId=${encodeURIComponent(currentAnomalyId)}`;
      const response = await fetch(query, { cache: "no-store" });
      if (cancelled) return;
      if (!response.ok) return;

      const payload = (await response.json()) as {
        submission?: {
          annotations?: SavedAnnotation[];
          note?: string | null;
          hint_flags?: SavedHintFlags | null;
          period_days?: number | null;
        } | null;
      };
      const saved = payload.submission;
      if (saved && Array.isArray(saved.annotations)) {
        setAnnotations(
          saved.annotations.map((item, idx) => ({
            id: `saved-${idx}-${Date.now()}`,
            xStart: clamp01(Number(item.xStart)),
            xEnd: clamp01(Number(item.xEnd)),
            confidence: Math.max(0, Math.min(100, Math.round(Number(item.confidence)))),
            tag: String(item.tag || "Other"),
            note: typeof item.note === "string" ? item.note : undefined,
          })),
        );
        setNote(typeof saved.note === "string" ? saved.note : "");
        if (saved.hint_flags) {
          setPhaseFoldHint(Boolean(saved.hint_flags.phaseFold));
          setBinHint(Boolean(saved.hint_flags.bin));
        }
        if (typeof saved.period_days === "number" && Number.isFinite(saved.period_days)) {
          setPeriodDays(saved.period_days);
        }
        return;
      }

      if (!draftStorageKey) return;
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        annotations?: SavedAnnotation[];
        note?: string;
        hintFlags?: SavedHintFlags;
        periodDays?: number;
      };
      if (Array.isArray(parsed.annotations)) {
        setAnnotations(
          parsed.annotations.map((item, idx) => ({
            id: `local-${idx}-${Date.now()}`,
            xStart: clamp01(Number(item.xStart)),
            xEnd: clamp01(Number(item.xEnd)),
            confidence: Math.max(0, Math.min(100, Math.round(Number(item.confidence)))),
            tag: String(item.tag || "Other"),
            note: typeof item.note === "string" ? item.note : undefined,
          })),
        );
      }
      if (typeof parsed.note === "string") {
        setNote(parsed.note);
      }
      if (parsed.hintFlags) {
        setPhaseFoldHint(Boolean(parsed.hintFlags.phaseFold));
        setBinHint(Boolean(parsed.hintFlags.bin));
      }
      if (typeof parsed.periodDays === "number" && Number.isFinite(parsed.periodDays)) {
        setPeriodDays(parsed.periodDays);
      }
    }

    void loadSavedSubmission();
    return () => {
      cancelled = true;
    };
  }, [anomaly, gameDate, draftStorageKey]);

  useEffect(() => {
    if (!draftStorageKey) return;
    const compact = annotations.map((item) => ({
      xStart: item.xStart,
      xEnd: item.xEnd,
      confidence: item.confidence,
      tag: item.tag,
      note: item.note,
    }));
    localStorage.setItem(
      draftStorageKey,
      JSON.stringify({
        annotations: compact,
        note,
        hintFlags: { phaseFold: phaseFoldHint, bin: binHint },
        periodDays,
      }),
    );
  }, [annotations, note, phaseFoldHint, binHint, periodDays, draftStorageKey]);

  const displayPoints = useMemo(
    () =>
      anomaly
        ? toDisplayPoints(anomaly.lightcurve, {
            phaseFold: phaseFoldHint,
            bin: binHint,
            periodDays,
          })
        : [],
    [anomaly, phaseFoldHint, binHint, periodDays],
  );

  const rewardMultiplier = useMemo(() => {
    let value = 1;
    if (phaseFoldHint) value *= 0.8;
    if (binHint) value *= 0.85;
    return Number(Math.max(0.5, value).toFixed(2));
  }, [phaseFoldHint, binHint]);

  const bounds = useMemo(() => {
    if (displayPoints.length === 0) {
      return { minY: 0.98, maxY: 1.02 };
    }
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    displayPoints.forEach((point) => {
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
    const pad = Math.max((maxY - minY) * 0.2, 0.002);
    return { minY: minY - pad, maxY: maxY + pad };
  }, [displayPoints]);

  const yToSvg = useCallback(
    (value: number) => {
      const t = (value - bounds.minY) / (bounds.maxY - bounds.minY || 1);
      return 20 + (1 - t) * 300;
    },
    [bounds.maxY, bounds.minY],
  );

  const path = useMemo(() => {
    if (displayPoints.length === 0) return "";
    return displayPoints
      .map((point, idx) => `${idx === 0 ? "M" : "L"} ${xToSvg(point.x).toFixed(2)} ${yToSvg(point.y).toFixed(2)}`)
      .join(" ");
  }, [displayPoints, yToSvg]);

  const areaPath = useMemo(() => {
    if (!path || displayPoints.length === 0) return "";
    return `${path} L 960 320 L 40 320 Z`;
  }, [path, displayPoints]);

  const xAxisLabel = phaseFoldHint ? `Phase (${periodDays.toFixed(2)}d period)` : "Time (normalized 27-day segment)";
  const xTickLabel = (xTick: number) => (phaseFoldHint ? `${(xTick * periodDays).toFixed(2)}d` : `${(xTick * 27).toFixed(1)}d`);

  function pointerToNormalizedX(clientX: number) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    if (rect.width <= 0) return null;
    const local = (clientX - rect.left - 40) / (rect.width - 80);
    return clamp01(local);
  }

  function handleChartPointerDown(clientX: number) {
    const x = pointerToNormalizedX(clientX);
    if (x === null) return;
    setDragging(true);
    setDraftStart(x);
    setDraftEnd(x);
  }

  function handleChartPointerMove(clientX: number) {
    if (!dragging) return;
    const x = pointerToNormalizedX(clientX);
    if (x === null) return;
    setDraftEnd(x);
  }

  function handleChartPointerUp() {
    if (!dragging || draftStart === null || draftEnd === null) {
      setDragging(false);
      return;
    }

    const xStart = Number(Math.min(draftStart, draftEnd).toFixed(5));
    const xEnd = Number(Math.max(draftStart, draftEnd).toFixed(5));
    if (xEnd - xStart >= 0.006) {
      setAnnotations((current) => [
        ...current,
        {
          id: `${Date.now()}-${current.length}`,
          xStart,
          xEnd,
          confidence,
          tag,
          note: annotationNote.trim() || undefined,
        },
      ]);
      setAnnotationNote("");
    }

    setDragging(false);
    setDraftStart(null);
    setDraftEnd(null);
  }

  function clearDraft() {
    setAnnotations([]);
    setNote("");
    setFeedback(null);
    if (draftStorageKey) {
      localStorage.removeItem(draftStorageKey);
    }
  }

  function removeAnnotation(id: string) {
    setAnnotations((current) => current.filter((row) => row.id !== id));
  }

  async function handleSubmitEvidenceAndContinue() {
    if (!anomaly) {
      setFeedback("No anomaly loaded for this date.");
      return;
    }
    if (annotations.length === 0) {
      setFeedback("Add at least one annotated interval before continuing.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const response = await fetch("/api/anomaly/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anomalyId: anomaly.id,
        ticId: anomaly.ticId,
        annotations,
        note,
        hintFlags: {
          phaseFold: phaseFoldHint,
          bin: binHint,
        },
        rewardMultiplier,
        periodDays,
        date: gameDate,
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      rewardMultiplier?: number;
    };

    if (!response.ok) {
      setFeedback(payload.error ?? "Could not save your evidence.");
      setSubmitting(false);
      return;
    }

    if (draftStorageKey) {
      localStorage.removeItem(draftStorageKey);
    }

    setMinigameIndex(1);
    setFeedback(`Evidence saved. Reward x${(payload.rewardMultiplier ?? rewardMultiplier).toFixed(2)}. Starting minigame 2.`);
    setSubmitting(false);
  }

  async function handleAdvanceDemo() {
    if (minigameIndex === 1) {
      setMinigameIndex(2);
      setFeedback("Moved to minigame 3 (demo).");
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const response = await fetch("/api/game/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completedPuzzles: 3,
        confidence,
        note,
        date: gameDate,
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      score?: number;
      badgesAwarded?: number;
      xpMultiplier?: number;
    };

    if (!response.ok) {
      setFeedback(payload.error ?? "Could not complete the daily set.");
      setSubmitting(false);
      return;
    }

    setFeedback(
      `Daily set complete. Score ${payload.score ?? 0}${payload.xpMultiplier === 0.5 ? " (50% XP for past-day puzzle)." : ""}${payload.badgesAwarded ? ` New badges: ${payload.badgesAwarded}.` : ""}`,
    );
    setSubmitting(false);
    router.push("/");
  }

  const pendingStart = draftStart === null || draftEnd === null ? null : Math.min(draftStart, draftEnd);
  const pendingEnd = draftStart === null || draftEnd === null ? null : Math.max(draftStart, draftEnd);
  const confidenceLevel = confidence >= 80 ? "High" : confidence >= 55 ? "Medium" : "Low";
  const confidenceLevelClass = confidenceLevel.toLowerCase();
  const title = isTransitStage ? "Find the Transit Signal" : demoStage?.title ?? "Demo";
  const progressLabel = `${minigameIndex + 1} / 3`;

  return (
    <section className="puzzle-screen">
      <header className="puzzle-header panel">
        <p className="eyebrow">Daily Planet Hunt</p>
        <div className="puzzle-header-row">
          <div>
            <h1>{title}</h1>
            {isTransitStage ? (
              <>
                <p className="muted">
                  You are checking whether this star&apos;s brightness dips in a repeatable way, which can indicate a planet passing in front of it.
                </p>
                <p className="muted">
                  Puzzle date {gameDate}
                  {isPastDay ? " • Past day (50% XP)" : ""}
                </p>
                {anomaly ? <p className="muted">Today&apos;s target: {anomaly.label}</p> : null}
                <p className="puzzle-header-edu">
                  Beginner tip: focus on short downward dips that appear at similar spacing, then recover back to the normal brightness line.
                </p>
                {anomaly ? (
                  <div className="puzzle-context-row">
                    <span className="puzzle-context-pill">TIC {anomaly.ticId}</span>
                    <span className="puzzle-context-pill">Type {anomaly.anomalyType ?? "planet"}</span>
                    <span className="puzzle-context-pill">Set {anomaly.anomalySet ?? "telescope-tess"}</span>
                    <span className="puzzle-context-pill">Goal mark likely transit windows</span>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <p className="muted">{demoStage?.objective}</p>
                <p className="muted">Puzzle date {gameDate}</p>
              </>
            )}
          </div>
          <span className="puzzle-progress">{loading ? "Loading..." : progressLabel}</span>
        </div>
      </header>

      <div className="puzzle-workspace">
        <article className="puzzle-canvas panel">
          {isTransitStage ? (
            <div className="puzzle-lightcurve-wrap">
              {anomaly ? (
                <svg
                  ref={svgRef}
                  className="puzzle-lightcurve"
                  viewBox="0 0 1000 360"
                  role="img"
                  aria-label={`Lightcurve for TIC ${anomaly.ticId}`}
                  onPointerDown={(event) => handleChartPointerDown(event.clientX)}
                  onPointerMove={(event) => handleChartPointerMove(event.clientX)}
                  onPointerUp={handleChartPointerUp}
                  onPointerLeave={handleChartPointerUp}
                >
                  <defs>
                    <linearGradient id="curveBg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="color-mix(in oklab, var(--surface) 90%, #dbeafe 10%)" />
                      <stop offset="100%" stopColor="color-mix(in oklab, var(--surface) 88%, #ecfccb 12%)" />
                    </linearGradient>
                    <linearGradient id="curveArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(20, 83, 45, 0.26)" />
                      <stop offset="100%" stopColor="rgba(20, 83, 45, 0.02)" />
                    </linearGradient>
                  </defs>

                  <rect x="40" y="20" width="920" height="300" fill="url(#curveBg)" stroke="var(--border)" />
                  {[0, 0.25, 0.5, 0.75, 1].map((xTick) => (
                    <g key={`v-${xTick}`}>
                      <line x1={xToSvg(xTick)} y1="20" x2={xToSvg(xTick)} y2="320" stroke="rgba(100, 116, 139, 0.15)" />
                      <text x={xToSvg(xTick) - 13} y="334" fontSize="11" fill="var(--muted)">
                        {xTickLabel(xTick)}
                      </text>
                    </g>
                  ))}
                  {[0, 1, 2, 3, 4].map((row) => {
                    const yValue = bounds.maxY - ((bounds.maxY - bounds.minY) * row) / 4;
                    return (
                      <g key={`h-${row}`}>
                        <line x1="40" y1={yToSvg(yValue)} x2="960" y2={yToSvg(yValue)} stroke="rgba(100, 116, 139, 0.18)" />
                        <text x="4" y={yToSvg(yValue) + 4} fontSize="11" fill="var(--muted)">
                          {yValue.toFixed(4)}
                        </text>
                      </g>
                    );
                  })}

                  {annotations.map((annotation) => {
                    const x = xToSvg(annotation.xStart);
                    const width = Math.max(2, xToSvg(annotation.xEnd) - x);
                    const colors = TAG_COLORS[annotation.tag] ?? TAG_COLORS.Other;
                    return <rect key={annotation.id} x={x} y={20} width={width} height={300} fill={colors.fill} stroke={colors.stroke} strokeWidth="1" />;
                  })}

                  {pendingStart !== null && pendingEnd !== null ? (
                    <rect
                      x={xToSvg(pendingStart)}
                      y={20}
                      width={Math.max(2, xToSvg(pendingEnd) - xToSvg(pendingStart))}
                      height={300}
                      fill="rgba(217, 119, 6, 0.22)"
                    />
                  ) : null}

                  {areaPath ? <path d={areaPath} fill="url(#curveArea)" /> : null}
                  <path d={path} fill="none" stroke="var(--text)" strokeWidth="1.8" />
                  {binHint
                    ? displayPoints.map((point, idx) => <circle key={`bin-${idx}`} cx={xToSvg(point.x)} cy={yToSvg(point.y)} r="1.2" fill="var(--brand)" />)
                    : null}
                  <text x="40" y="345" fontSize="12" fill="var(--muted)">
                    {xAxisLabel}
                  </text>
                  <text x="10" y="24" fontSize="12" fill="var(--muted)">
                    Flux
                  </text>
                </svg>
              ) : (
                <p className="muted">{loading ? "Loading daily anomaly..." : "No anomaly available for this date."}</p>
              )}
            </div>
          ) : (
            <div className="puzzle-media-wrap">
              <Image src={demoStage?.image ?? "/puzzles/puzzle-2.svg"} alt={demoStage?.title ?? "Demo minigame"} width={1300} height={760} className="puzzle-media" priority />
            </div>
          )}
        </article>

        <aside className="puzzle-sidebar panel">
          <div className="puzzle-toolbar">
            <button className="button puzzle-action-secondary" type="button" onClick={() => setShowTutorial((value) => !value)}>
              <span data-cy="puzzle-help-toggle">{showTutorial ? "Hide help" : "Help / Tutorial"}</span>
            </button>
          </div>

          {showTutorial ? (
            <aside className="puzzle-help" aria-live="polite">
              <p className="puzzle-help-title">Quick Guide</p>
              {isTransitStage ? (
                <>
                  <p className="puzzle-help-context">Context: real exoplanet candidates show recurring dips at a consistent period, not random one-off noise.</p>
                  <ol className="puzzle-help-compact-list">
                    <li>Draw suspected dip intervals.</li>
                    <li>Tag + confidence each interval.</li>
                    <li>Submit evidence to continue to minigame 2.</li>
                  </ol>
                  <p className="puzzle-help-hint">Strong evidence: repeatability, sharp dip profile, baseline recovery.</p>
                </>
              ) : (
                <ol className="puzzle-help-compact-list">
                  {(demoStage?.instructions ?? []).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ol>
              )}
            </aside>
          ) : null}

          {isTransitStage ? (
            <section className="puzzle-controls" aria-label="Puzzle controls">
              <div className="puzzle-control-group is-compact">
                <div className="puzzle-hints-head">
                  <p className="puzzle-control-label">Hints</p>
                  <span className="puzzle-hints-penalty">Reward x{rewardMultiplier.toFixed(2)}</span>
                </div>
                <div className="puzzle-hints-row">
                  <button
                    type="button"
                    className={`puzzle-hint-button${phaseFoldHint ? " is-active" : ""}`}
                    onClick={() => setPhaseFoldHint(true)}
                    disabled={phaseFoldHint}
                  >
                    <span className="puzzle-hint-button-title">{phaseFoldHint ? "Phase Fold Enabled" : "Use Phase Fold Hint"}</span>
                    <span className="puzzle-hint-button-sub">Aligns repeating dips by period • reward -20%</span>
                  </button>
                  <button type="button" className={`puzzle-hint-button${binHint ? " is-active" : ""}`} onClick={() => setBinHint(true)} disabled={binHint}>
                    <span className="puzzle-hint-button-title">{binHint ? "Binning Enabled" : "Use Bin Data Hint"}</span>
                    <span className="puzzle-hint-button-sub">Smooths noise by averaging points • reward -15%</span>
                  </button>
                </div>
                <label className="puzzle-period-row">
                  <span className="puzzle-period-label">Period candidate</span>
                  <select className="input" value={periodDays} onChange={(event) => setPeriodDays(Number(event.target.value))}>
                    <option value={0.75}>0.75 days</option>
                    <option value={1}>1.00 days</option>
                    <option value={1.5}>1.50 days</option>
                    <option value={2}>2.00 days</option>
                    <option value={3}>3.00 days</option>
                  </select>
                </label>
              </div>

              <div className="puzzle-controls-top">
                <div className="puzzle-control-group is-compact">
                  <p className="puzzle-control-label">Tag</p>
                  <div className="puzzle-chip-row">
                    {TAGS.map((item) => (
                      <button
                        key={item}
                        className={`puzzle-chip${tag === item ? " is-active" : ""}`}
                        type="button"
                        onClick={() => setTag(item)}
                        style={{
                          borderColor: TAG_COLORS[item]?.stroke,
                          background: tag === item ? TAG_COLORS[item]?.chip : undefined,
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="puzzle-control-group is-compact">
                  <div className="puzzle-confidence-head">
                    <p className="puzzle-control-label">Confidence</p>
                    <span className={`puzzle-confidence-badge is-${confidenceLevelClass}`}>
                      {confidence}% {confidenceLevel}
                    </span>
                  </div>
                  <div className="puzzle-range-row">
                    <input
                      className="puzzle-confidence-range"
                      data-cy="puzzle-confidence-range"
                      type="range"
                      min={0}
                      max={100}
                      value={confidence}
                      onChange={(event) => setConfidence(Number(event.target.value))}
                      style={{
                        background: `linear-gradient(90deg, var(--brand) 0%, var(--brand) ${confidence}%, color-mix(in oklab, var(--border) 84%, transparent) ${confidence}%, color-mix(in oklab, var(--border) 84%, transparent) 100%)`,
                      }}
                    />
                  </div>
                  <div className="puzzle-confidence-presets">
                    {[40, 70, 90].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`puzzle-confidence-preset${confidence === value ? " is-active" : ""}`}
                        onClick={() => setConfidence(value)}
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="puzzle-control-group">
                <p className="puzzle-control-label">Note (optional)</p>
                <textarea className="textarea puzzle-note" value={annotationNote} onChange={(event) => setAnnotationNote(event.target.value)} placeholder="Quick detail for next interval..." />
              </div>

              <div className="puzzle-control-group">
                <p className="puzzle-control-label">Final summary</p>
                <textarea
                  className="textarea puzzle-note"
                  data-cy="puzzle-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Why this is a planet candidate..."
                />
              </div>
            </section>
          ) : (
            <section className="puzzle-controls" aria-label="Demo puzzle controls">
              <div className="puzzle-control-group">
                <p className="puzzle-control-label">Demo mode</p>
                <p className="muted">
                  Minigame {demoStage?.id} is a placeholder for now. Continue to advance through the current demo flow.
                </p>
                <button className="button" type="button" onClick={() => setMinigameIndex(0)}>
                  Edit Minigame 1 Answer
                </button>
              </div>
            </section>
          )}

          {isTransitStage && annotations.length ? (
            <div className="puzzle-annotation-list">
              {annotations.map((annotation, idx) => (
                <div
                  key={annotation.id}
                  className="puzzle-annotation-item"
                  style={{ borderLeft: `4px solid ${(TAG_COLORS[annotation.tag] ?? TAG_COLORS.Other).stroke}` }}
                >
                  <p>
                    #{idx + 1} {annotation.tag} • {annotation.confidence}% • {annotation.xStart.toFixed(3)}-{annotation.xEnd.toFixed(3)}
                  </p>
                  {annotation.note ? <p className="puzzle-annotation-note">{annotation.note}</p> : null}
                  <button className="button puzzle-action-secondary" type="button" onClick={() => removeAnnotation(annotation.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="puzzle-next-row">
            {isTransitStage ? (
              <>
                <button
                  className="button puzzle-action-secondary"
                  data-cy="puzzle-clear-draft-button"
                  type="button"
                  onClick={clearDraft}
                  disabled={submitting || loading}
                >
                  Clear Draft
                </button>
                <button className="button button-primary puzzle-action-primary" type="button" onClick={() => void handleSubmitEvidenceAndContinue()} disabled={submitting || loading}>
                  <span data-cy="puzzle-finish-button">{submitting ? "Saving..." : "Submit Evidence & Continue"}</span>
                </button>
              </>
            ) : (
              <button
                className="button button-primary puzzle-action-primary"
                data-cy="puzzle-demo-next-button"
                type="button"
                onClick={() => void handleAdvanceDemo()}
                disabled={submitting || loading}
              >
                <span data-cy="puzzle-finish-button">
                  {submitting ? "Saving..." : minigameIndex === 1 ? "Continue to Minigame 3" : "Finish Daily Set"}
                </span>
              </button>
            )}
          </div>

          {feedback ? <p className="puzzle-feedback" data-cy="puzzle-feedback">{feedback}</p> : null}
        </aside>
      </div>
    </section>
  );
}
