"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getMelbourneDateKey, resolveMelbourneDateKey } from "@/lib/melbourne-date";
import { trackGameplayEvent } from "@/lib/analytics/events";

type TransitSubject = {
  subjectId: string;
  imageUrl: string;
  caption: string | null;
  sourceName: string;
  sourceUrl: string | null;
  prompt: string;
};

type TransitSpotterGamePageProps = {
  onMissionComplete?: (result: { score: number; terminatedEarly?: boolean }) => void;
  gameDate?: string;
};

export default function TransitSpotterGamePage({ onMissionComplete, gameDate: gameDateProp }: TransitSpotterGamePageProps = {}) {
  const gameDate = useMemo(
    () => resolveMelbourneDateKey(gameDateProp ?? getMelbourneDateKey()),
    [gameDateProp],
  );

  const [subjects, setSubjects] = useState<TransitSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [classifiedCount, setClassifiedCount] = useState(0);
  const [done, setDone] = useState(false);

  const loadSubjects = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/dsmr/daily?date=${encodeURIComponent(gameDate)}`, { cache: "no-store" });
      const payload = (await res.json()) as { subjects?: TransitSubject[]; error?: string };
      if (!res.ok || !Array.isArray(payload.subjects) || payload.subjects.length === 0) {
        setFeedback(payload.error ?? "No transit-spotter subjects available for this date.");
        setSubjects([]);
      } else {
        setSubjects(payload.subjects);
      }
    } catch {
      setFeedback("Network error loading today's transit-spotter round.");
    } finally {
      setLoading(false);
    }
  }, [gameDate]);

  useEffect(() => {
    void loadSubjects();
  }, [loadSubjects]);

  function handleClassify() {
    const nextCount = classifiedCount + 1;
    setClassifiedCount(nextCount);
    trackGameplayEvent("transit_spotter_classified", { game_date: gameDate, subject_id: subjects[index]?.subjectId });

    if (index + 1 >= subjects.length) {
      const score = Math.round((nextCount / subjects.length) * 100);
      setDone(true);
      onMissionComplete?.({ score });
      return;
    }
    setIndex((prev) => prev + 1);
  }

  if (loading) {
    return (
      <div className="panel" style={{ padding: "1.5rem", textAlign: "center" }}>
        <p className="muted">Loading today&apos;s transit-spotter round...</p>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="panel puzzle-grain" style={{ padding: "1.5rem" }}>
        <p className="puzzle-feedback">{feedback ?? "No transit-spotter round available for this date."}</p>
      </div>
    );
  }

  const subject = subjects[index];

  return (
    <div className="panel puzzle-grain" style={{ padding: "1.5rem", display: "grid", gap: "1.25rem" }}>
      <div>
        <p className="eyebrow">Transit Spotter</p>
        <p className="muted">
          Real light curves from {subject.sourceName}. Round {index + 1} of {subjects.length}.
        </p>
      </div>

      {done ? (
        <p className="muted">Thanks for your classifications — recorded {classifiedCount} of {subjects.length}.</p>
      ) : (
        <>
          <p>{subject.prompt}</p>
          <div style={{ position: "relative", width: "100%", maxWidth: "640px", aspectRatio: "16 / 9" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={subject.imageUrl}
              alt={subject.caption ?? "TESS light curve"}
              style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }}
            />
          </div>
          {subject.caption ? <p className="muted">{subject.caption}</p> : null}
          <div className="cta-row">
            <button type="button" className="button button-primary" onClick={handleClassify}>
              Transit dip
            </button>
            <button type="button" className="button" onClick={handleClassify}>
              No dip
            </button>
          </div>
          {subject.sourceUrl ? (
            <a href={subject.sourceUrl} target="_blank" rel="noreferrer" className="muted">
              View on Zooniverse
            </a>
          ) : null}
        </>
      )}

      {feedback ? <p className="puzzle-feedback">{feedback}</p> : null}
    </div>
  );
}
