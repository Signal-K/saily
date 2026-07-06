"use client";

import { useCallback, useState } from "react";
import posthog from "posthog-js";
import { VARIANT_OPTIONS, type VariantId } from "@/components/landing/design-vote-data";

export function VoteRanking() {
  const [ranking, setRanking] = useState<VariantId[]>(VARIANT_OPTIONS.map(v => v.id));
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const move = useCallback((index: number, dir: -1 | 1) => {
    setRanking(prev => {
      const next = [...prev];
      const swap = index + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[index], next[swap]] = [next[swap]!, next[index]!];
      return next;
    });
  }, []);

  async function handleSubmit() {
    if (submitState === "sending" || submitState === "sent") return;

    const positions: Record<string, number> = {};
    ranking.forEach((id, i) => { positions[id] = i + 1; });
    posthog.capture("landing_variant_ranked", { ranking, positions, active_variant: "editorial" });
    setSubmitState("sending");

    try {
      const response = await fetch("/api/landing-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ranking, positions, active_variant: "editorial" }),
      });

      if (!response.ok) {
        throw new Error(`Vote submit failed (${response.status})`);
      }

      setSubmitState("sent");
    } catch (error) {
      console.error("[landing-vote] submit failed", error);
      setSubmitState("error");
    }
  }

  return (
    <section className="panel" style={{ marginTop: "1rem" }} aria-label="Rank the landing page designs">
      <p className="muted" style={{ margin: "0 0 0.75rem", fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        Rank the styles — 1 = your favourite
      </p>

      <ol style={{ display: "grid", gap: "0.5rem", padding: 0, margin: 0, listStyle: "none" }}>
        {ranking.map((id, i) => {
          const v = VARIANT_OPTIONS.find(x => x.id === id)!;
          return (
            <li
              key={id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.5rem 0.75rem",
                border: "1px solid var(--border, #d8d8d8)",
                borderRadius: "6px",
              }}
            >
              <span className="muted" style={{ fontWeight: 800, width: "1.2rem" }}>{i + 1}</span>
              <span aria-hidden style={{ fontSize: "1.1rem" }}>{v.icon}</span>
              <div style={{ display: "grid", flex: 1 }}>
                <strong>{v.label}</strong>
                <span className="muted" style={{ fontSize: "0.8rem" }}>{v.tagline}</span>
              </div>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                <button type="button" className="button button-secondary" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${v.label} up`}>↑</button>
                <button type="button" className="button button-secondary" disabled={i === ranking.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${v.label} down`}>↓</button>
              </div>
            </li>
          );
        })}
      </ol>

      <div style={{ marginTop: "0.9rem" }}>
        {submitState === "sent" ? (
          <p className="muted">Thanks! Your ranking was recorded.</p>
        ) : submitState === "error" ? (
          <p className="muted">Could not submit. Try again in a moment.</p>
        ) : (
          <button type="button" className="button button-primary" onClick={handleSubmit} disabled={submitState === "sending"}>
            {submitState === "sending" ? "Submitting..." : "Submit my ranking →"}
          </button>
        )}
      </div>
    </section>
  );
}
