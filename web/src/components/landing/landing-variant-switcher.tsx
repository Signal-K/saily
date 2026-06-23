"use client";

import { useState, useCallback } from "react";
import posthog from "posthog-js";
import { VARIANTS, useVariant, type VariantId } from "@/components/landing/landing-variant-context";

const VARIANT_ICONS: Record<VariantId, string> = {
  editorial: "📰",
  "deep-space": "🌌",
  terminal: "⌨️",
  solar: "☀️",
  minimal: "◻",
};

export function LandingVariantSwitcher() {
  const { variant, setVariant } = useVariant();
  const [rankOpen, setRankOpen] = useState(false);
  const [ranking, setRanking] = useState<VariantId[]>(VARIANTS.map(v => v.id));
  const [submitted, setSubmitted] = useState(false);

  const move = useCallback((index: number, dir: -1 | 1) => {
    setRanking(prev => {
      const next = [...prev];
      const swap = index + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[index], next[swap]] = [next[swap]!, next[index]!];
      return next;
    });
  }, []);

  function handleSwitch(id: VariantId) {
    if (id === variant) return;
    posthog.capture("landing_variant_switched", { to: id, from: variant });
    setVariant(id);
  }

  function handleSubmit() {
    const positions: Record<string, number> = {};
    ranking.forEach((id, i) => { positions[id] = i + 1; });
    posthog.capture("landing_variant_ranked", { ranking, positions, active_variant: variant });
    setSubmitted(true);
    fetch("/api/landing-vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ranking, positions, active_variant: variant }),
    }).catch(() => {});
  }

  return (
    <>
      {/* Slide-up ranking panel */}
      {rankOpen && (
        <div
          className="tx-rank-overlay"
          onClick={e => { if (e.target === e.currentTarget) setRankOpen(false); }}
          role="dialog"
          aria-modal
          aria-label="Rate landing page styles"
        >
          <div className="tx-rank-sheet tx-fade-in">
            <div className="tx-rank-sheet-head">
              <p className="tx-rank-sheet-title">Rate the styles</p>
              <button
                type="button"
                className="tx-rank-close"
                onClick={() => setRankOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="tx-rank-sheet-sub">Move items to order — 1 = your favourite</p>

            <ol className="tx-rank-list">
              {ranking.map((id, i) => {
                const v = VARIANTS.find(x => x.id === id)!;
                return (
                  <li key={id} className={`tx-rank-item${id === variant ? " is-viewing" : ""}`}>
                    <span className="tx-rank-pos">{i + 1}</span>
                    <span className="tx-rank-icon">{VARIANT_ICONS[id]}</span>
                    <div className="tx-rank-meta">
                      <strong>{v.label}</strong>
                      <span>{v.tagline}</span>
                    </div>
                    <div className="tx-rank-arrows">
                      <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${v.label} up`}>↑</button>
                      <button type="button" disabled={i === ranking.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${v.label} down`}>↓</button>
                    </div>
                    <button
                      type="button"
                      className={`tx-rank-preview-btn${id === variant ? " is-active" : ""}`}
                      onClick={() => { handleSwitch(id); setRankOpen(false); }}
                    >
                      {id === variant ? "Viewing" : "Preview"}
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="tx-rank-sheet-foot">
              {submitted ? (
                <p className="tx-rank-thanks">Thanks! Recorded via PostHog.</p>
              ) : (
                <button type="button" className="tx-rank-submit-btn" onClick={handleSubmit}>
                  Submit my ranking →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky bottom tab bar */}
      <div className="tx-tab-bar" role="navigation" aria-label="Style switcher">
        <div className="tx-tab-bar-inner">
          <div className="tx-tab-bar-label">Style Lab</div>
          <div className="tx-tab-bar-tabs">
            {VARIANTS.map(v => (
              <button
                key={v.id}
                type="button"
                className={`tx-tab${variant === v.id ? " is-active" : ""}`}
                onClick={() => handleSwitch(v.id)}
                aria-pressed={variant === v.id}
                title={v.tagline}
              >
                <span className="tx-tab-icon">{VARIANT_ICONS[v.id]}</span>
                <span className="tx-tab-label">{v.label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="tx-tab-rate-btn"
            onClick={() => setRankOpen(o => !o)}
            aria-expanded={rankOpen}
          >
            Rate ↑
          </button>
        </div>
      </div>
    </>
  );
}
