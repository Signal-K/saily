"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getMelbourneDateKey, resolveMelbourneDateKey } from "@/lib/melbourne-date";
import { trackGameplayEvent } from "@/lib/analytics/events";

type CloudspottingSubject = {
  id: string;
  imageUrl: string;
  title: string;
  prompt: string;
  caption: string | null;
  seasonOrContext: string | null;
  sourceName: string;
  sourceUrl: string;
  sourceMission: string | null;
  projectUrl: string;
};

type CloudspottingMarsGamePageProps = {
  onMissionComplete?: (result: { score: number; terminatedEarly?: boolean }) => void;
  gameDate?: string;
};

export default function CloudspottingMarsGamePage({ onMissionComplete, gameDate: gameDateProp }: CloudspottingMarsGamePageProps = {}) {
  const gameDate = useMemo(
    () => resolveMelbourneDateKey(gameDateProp ?? getMelbourneDateKey()),
    [gameDateProp],
  );

  const [subject, setSubject] = useState<CloudspottingSubject | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const loadSubject = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/cloudspotting-mars/daily?date=${encodeURIComponent(gameDate)}`, { cache: "no-store" });
      const payload = (await res.json()) as { subject?: CloudspottingSubject; error?: string };
      if (!res.ok || !payload.subject) {
        setFeedback(payload.error ?? "No Cloudspotting on Mars subject available for this date.");
        setSubject(null);
      } else {
        setSubject(payload.subject);
      }
    } catch {
      setFeedback("Network error loading today's Cloudspotting on Mars subject.");
    } finally {
      setLoading(false);
    }
  }, [gameDate]);

  useEffect(() => {
    void loadSubject();
  }, [loadSubject]);

  function handleClassify(cloudsVisible: boolean) {
    trackGameplayEvent("cloudspotting_mars_classified", {
      game_date: gameDate,
      subject_id: subject?.id,
      clouds_visible: cloudsVisible,
    });
    setDone(true);
    onMissionComplete?.({ score: 100 });
  }

  if (loading) {
    return (
      <div className="panel" style={{ padding: "1.5rem", textAlign: "center" }}>
        <p className="muted">Loading today&apos;s Cloudspotting on Mars subject...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="panel puzzle-grain" style={{ padding: "1.5rem" }}>
        <p className="puzzle-feedback">{feedback ?? "No Cloudspotting on Mars subject available for this date."}</p>
      </div>
    );
  }

  return (
    <div className="panel puzzle-grain" style={{ padding: "1.5rem", display: "grid", gap: "1.25rem" }}>
      <div>
        <p className="eyebrow">Cloudspotting on Mars</p>
        <p className="muted">Real Mars surface imagery from {subject.sourceName}.</p>
      </div>

      {done ? (
        <p className="muted">Thanks for your classification — logged for {subject.title}.</p>
      ) : (
        <>
          <p>{subject.prompt}</p>
          <div style={{ position: "relative", width: "100%", maxWidth: "640px", aspectRatio: "16 / 9" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={subject.imageUrl}
              alt={subject.caption ?? subject.title}
              style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }}
            />
          </div>
          {subject.caption ? <p className="muted">{subject.caption}</p> : null}
          {subject.seasonOrContext ? <p className="muted">{subject.seasonOrContext}</p> : null}
          <div className="cta-row">
            <button type="button" className="button button-primary" onClick={() => handleClassify(true)}>
              Clouds visible
            </button>
            <button type="button" className="button" onClick={() => handleClassify(false)}>
              No clouds visible
            </button>
          </div>
          <a href={subject.sourceUrl} target="_blank" rel="noreferrer" className="muted">
            View on Zooniverse
          </a>
        </>
      )}

      {feedback ? <p className="puzzle-feedback">{feedback}</p> : null}
    </div>
  );
}
