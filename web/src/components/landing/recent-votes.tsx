"use client";

import { useEffect, useState } from "react";
import { VARIANT_LABELS, type VariantId } from "@/components/landing/design-vote-data";

type Vote = {
  id: string;
  ranking: VariantId[];
  created: string;
};

export function RecentVotes() {
  const [votes, setVotes] = useState<Vote[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/landing-vote")
      .then(res => res.json())
      .then((data: { votes?: Vote[] }) => {
        if (!cancelled) setVotes(data.votes ?? []);
      })
      .catch(() => {
        if (!cancelled) setVotes([]);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <section className="panel" style={{ marginTop: "1rem" }} aria-label="Recent votes">
      <p className="muted" style={{ margin: "0 0 0.75rem", fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        Recent votes
      </p>

      {votes === null ? (
        <p className="muted">Loading…</p>
      ) : votes.length === 0 ? (
        <p className="muted">No votes yet — be the first!</p>
      ) : (
        <ol style={{ display: "grid", gap: "0.5rem", padding: 0, margin: 0, listStyle: "none" }}>
          {votes.map(vote => (
            <li key={vote.id} style={{ display: "grid", gap: "0.15rem" }}>
              <span>
                <strong>{VARIANT_LABELS[vote.ranking[0] ?? ""] ?? vote.ranking[0]}</strong>
                <span className="muted"> — {vote.ranking.map(id => VARIANT_LABELS[id] ?? id).join(" → ")}</span>
              </span>
              <span className="muted" style={{ fontSize: "0.75rem" }}>
                {new Date(vote.created).toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
