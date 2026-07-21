"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { trackGameplayEvent } from "@/lib/analytics/events";
import { getMelbourneDateKey, resolveMelbourneDateKey } from "@/lib/melbourne-date";
import type {
  CloseApproachSubmitResult,
  PublicCloseApproachRecord,
  PublicCloseApproachRound,
} from "@/lib/close-approaches";

type CloseApproachRankerGamePageProps = {
  onMissionComplete?: (result: { score: number; terminatedEarly?: boolean }) => void;
  gameDate?: string;
};

function formatNumber(value: number, digits = 3) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: digits }).format(value);
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const copy = [...items];
  const [item] = copy.splice(index, 1);
  copy.splice(nextIndex, 0, item);
  return copy;
}

function statusLabel(status: CloseApproachSubmitResult["evaluations"][number]["status"]) {
  if (status === "correct") return "Correct";
  if (status === "near") return "Near";
  return "Moved";
}

export default function CloseApproachRankerGamePage({
  onMissionComplete,
  gameDate: gameDateProp,
}: CloseApproachRankerGamePageProps = {}) {
  const gameDate = useMemo(
    () => resolveMelbourneDateKey(gameDateProp ?? getMelbourneDateKey()),
    [gameDateProp],
  );

  const [records, setRecords] = useState<PublicCloseApproachRecord[]>([]);
  const [prompt, setPrompt] = useState("Rank these close approaches from closest to farthest.");
  const [sourceName, setSourceName] = useState("NASA/JPL SBDB Close Approach Data API");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [result, setResult] = useState<CloseApproachSubmitResult | null>(null);

  const loadRound = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/close-approaches/daily?date=${encodeURIComponent(gameDate)}`, { cache: "no-store" });
      const payload = (await res.json()) as PublicCloseApproachRound & { error?: string };
      if (!res.ok) {
        setFeedback(payload.error ?? "Could not load the close-approach desk.");
        setRecords([]);
      } else if (!payload.available) {
        setFeedback(payload.message);
        setRecords([]);
      } else {
        setPrompt(payload.prompt);
        setSourceName(payload.sourceName);
        setRecords(payload.records);
      }
    } catch {
      setFeedback("Network error loading the close-approach desk.");
    } finally {
      setLoading(false);
    }
  }, [gameDate]);

  useEffect(() => {
    void loadRound();
  }, [loadRound]);

  async function handleSubmit() {
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/close-approaches/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: gameDate, orderedRecordIds: records.map((record) => record.id) }),
      });
      const payload = (await res.json()) as CloseApproachSubmitResult & { error?: string };
      if (!res.ok) {
        setFeedback(payload.error ?? "Could not score this ranking.");
        return;
      }

      setResult(payload);
      trackGameplayEvent("close_approach_ranker_submitted", { game_date: gameDate, score: payload.score });
      onMissionComplete?.({ score: payload.score });
    } catch {
      setFeedback("Network error scoring this ranking.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="panel" style={{ padding: "1.5rem", textAlign: "center" }}>
        <p className="muted">Loading the close-approach desk...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="panel puzzle-grain" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <p className="puzzle-feedback">{feedback ?? "No close-approach desk is cached for this date yet."}</p>
        <div className="cta-row">
          <Link href="/games/today" className="button button-primary">Play today&apos;s games</Link>
          <Link href="/games" className="button">Back to games</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="panel puzzle-grain" style={{ padding: "1.5rem", display: "grid", gap: "1.25rem" }}>
      <div>
        <p className="eyebrow">Close Approach Ranker</p>
        <h1 style={{ margin: "0.15rem 0 0.5rem" }}>{prompt}</h1>
        <p className="muted">
          Sort real near-Earth flybys by nominal Earth distance. LD means lunar distance; au means astronomical unit.
        </p>
      </div>

      <ol style={{ display: "grid", gap: "0.75rem", paddingLeft: 0, listStyle: "none" }}>
        {records.map((record, index) => {
          const evaluation = result?.evaluations.find((row) => row.id === record.id);
          return (
            <li
              key={record.id}
              style={{
                display: "grid",
                gridTemplateColumns: "auto minmax(0, 1fr) auto",
                gap: "0.75rem",
                alignItems: "center",
                padding: "0.85rem",
                border: "1px solid var(--color-border)",
                background: "color-mix(in oklab, var(--color-paper) 92%, var(--color-newsprint))",
              }}
            >
              <strong aria-label={`Current rank ${index + 1}`}>{index + 1}</strong>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>{record.displayName}</p>
                <p className="muted" style={{ margin: "0.25rem 0 0" }}>
                  {record.closeApproachTime} · {formatNumber(record.distanceLd)} LD · {formatNumber(record.relativeVelocityKmS, 2)} km/s
                </p>
                {evaluation ? (
                  <p className="muted" style={{ margin: "0.25rem 0 0" }}>
                    {statusLabel(evaluation.status)}: you placed #{evaluation.submittedRank}; correct rank #{evaluation.correctRank}.
                  </p>
                ) : null}
              </div>
              <div style={{ display: "grid", gap: "0.35rem" }}>
                <button
                  type="button"
                  className="button"
                  onClick={() => setRecords((prev) => moveItem(prev, index, -1))}
                  disabled={Boolean(result) || index === 0}
                  aria-label={`Move ${record.displayName} up`}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={() => setRecords((prev) => moveItem(prev, index, 1))}
                  disabled={Boolean(result) || index === records.length - 1}
                  aria-label={`Move ${record.displayName} down`}
                >
                  Down
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      {feedback ? <p className="puzzle-feedback">{feedback}</p> : null}

      {result ? (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <p className="muted">
            Score {result.score}. {result.exact} exact, {result.near} near, {result.total} ranked.
          </p>
          <p className="muted">
            Closest approach: {result.closest.displayName} at {formatNumber(result.closest.distanceLd)} lunar distances on {result.closest.closeApproachTime}.
          </p>
          <p className="muted">
            Source: {sourceName}. Distances are nominal approach distances; uncertainty range is shown where available.
          </p>
        </div>
      ) : (
        <button type="button" className="button button-primary" onClick={() => void handleSubmit()} disabled={submitting}>
          {submitting ? "Locking..." : "Lock ranking"}
        </button>
      )}
    </div>
  );
}
