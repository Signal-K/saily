"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function SourceLightcurvePage() {
  const searchParams = useSearchParams();
  const anomalyId = Number(searchParams.get("anomalyId"));
  const ticId = searchParams.get("ticId") ?? "";
  const label = searchParams.get("label") ?? "";
  const sourceName = searchParams.get("sourceName") ?? "MAST / TESS";
  const sourceUrl = searchParams.get("sourceUrl") ?? "";
  const mission = searchParams.get("mission") ?? "";
  const sector = searchParams.get("sector") ?? "";
  const date = searchParams.get("date") ?? "";
  const synthetic = searchParams.get("synthetic") === "1";

  const imageSrc = useMemo(() => {
    if (!Number.isFinite(anomalyId) || anomalyId <= 0) return "";
    const params = new URLSearchParams({
      anomalyId: String(anomalyId),
      label,
    });
    return `/api/game/lightcurve-image?${params.toString()}`;
  }, [anomalyId, label]);

  if (!imageSrc) {
    return (
      <section className="panel source-page">
        <h1>Light Curve Source</h1>
        <p className="muted">Missing or invalid anomaly identifier.</p>
        <Link href="/games/today" className="button">
          Back to Today&apos;s Puzzle
        </Link>
      </section>
    );
  }

  return (
    <section className="panel source-page">
      <header className="source-page-header">
        <p className="eyebrow">Light Curve Source</p>
        <h1>{label || `TIC ${ticId}`}</h1>
        <p className="muted">Rendered from the same underlying anomaly curve used in the puzzle chart.</p>
      </header>

      <div className="source-meta-row">
        <span className="puzzle-context-pill">TIC {ticId || "-"}</span>
        <span className="puzzle-context-pill">Dataset {sourceName}</span>
        {mission ? <span className="puzzle-context-pill">Mission {mission}</span> : null}
        {sector ? <span className="puzzle-context-pill">Sector {sector}</span> : null}
        {date ? <span className="puzzle-context-pill">Puzzle date {date}</span> : null}
        {synthetic ? <span className="puzzle-context-pill">Synthetic local curve</span> : null}
      </div>

      <div className="source-image-wrap">
        <img src={imageSrc} alt={label || `TIC ${ticId} light curve`} className="source-lightcurve-image" />
      </div>

      <div className="source-actions">
        {sourceUrl ? (
          <a href={sourceUrl} target="_blank" rel="noreferrer" className="button button-primary">
            Open Original Source Record
          </a>
        ) : null}
        <Link href="/games/today" className="button">
          Back to Today&apos;s Puzzle
        </Link>
      </div>
    </section>
  );
}
