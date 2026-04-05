"use client";

import { useEffect, useState } from "react";
import { queueSurveyTrigger } from "@/lib/posthog/survey-queue";
import { trackGameplayEvent } from "@/lib/analytics/events";
import { getMelbourneDateKey, resolveMelbourneDateKey } from "@/lib/melbourne-date";

type DayAccess = {
  allowed: boolean;
  signInRequired: boolean;
};

type InsightSol = {
  sol: string;
  season: string | null;
  at: { av: number | null; mn: number | null; mx: number | null };
  pre: { av: number | null; mn: number | null; mx: number | null };
  hws: { av: number | null; mn: number | null; mx: number | null };
};

type InsightPuzzle = {
  date: string;
  prompt: string;
  subtitle: string;
  sols: InsightSol[];
};

type InsightSolRisk = {
  sol: string;
  riskScore: number;
  windRisk: number;
  pressureRisk: number;
  tempRisk: number;
};

type InsightWindow = {
  solA: string;
  solB: string;
  windowRisk: number;
  rank: number;
};

type SubmitResult = {
  score: number;
  isOptimal: boolean;
  selectedRank: number | null;
  selectedWindowRisk: number | null;
  optimalWindow: InsightWindow;
  allWindows: InsightWindow[];
  solRisks: InsightSolRisk[];
};

type InSightGamePageProps = {
  onMissionComplete?: (result: { score: number }) => void;
  gameDate?: string;
};

function fmt(value: number | null, suffix: string, decimals = 1) {
  if (typeof value !== "number") return "—";
  return `${value.toFixed(decimals)}${suffix}`;
}

function RiskBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="insight-risk-bar-row">
      <span className="insight-risk-bar-label">{label}</span>
      <div className="insight-risk-bar-track">
        <div className="insight-risk-bar-fill" style={{ width: `${Math.round(value)}%` }} />
      </div>
      <span className="insight-risk-bar-value">{Math.round(value)}</span>
    </div>
  );
}

export default function InSightGamePage({ onMissionComplete, gameDate }: InSightGamePageProps = {}) {
  const date = resolveMelbourneDateKey(gameDate ?? getMelbourneDateKey());
  const [loading, setLoading] = useState(true);
  const [puzzle, setPuzzle] = useState<InsightPuzzle | null>(null);
  const [source, setSource] = useState<"live" | "fallback" | null>(null);
  const [access, setAccess] = useState<DayAccess | null>(null);

  // Selection: user picks an anchor sol, then a second adjacent sol to form a window
  const [anchorSol, setAnchorSol] = useState<string | null>(null);
  const [selectedWindow, setSelectedWindow] = useState<{ solA: string; solB: string } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPuzzle() {
      setLoading(true);
      const response = await fetch(`/api/insight/daily?date=${encodeURIComponent(date)}`, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as {
        puzzle?: InsightPuzzle | null;
        source?: "live" | "fallback" | null;
        access?: DayAccess;
      };

      if (cancelled) return;
      setPuzzle(payload.puzzle ?? null);
      setSource(payload.source ?? null);
      setAccess(payload.access ?? null);
      setLoading(false);
    }

    void loadPuzzle();
    return () => {
      cancelled = true;
    };
  }, [date]);

  function handleSolClick(sol: string) {
    if (result) return;

    if (!anchorSol) {
      setAnchorSol(sol);
      setSelectedWindow(null);
      setStatus(null);
      return;
    }

    if (anchorSol === sol) {
      // Deselect
      setAnchorSol(null);
      setSelectedWindow(null);
      return;
    }

    const sols = puzzle?.sols ?? [];
    const anchorIdx = sols.findIndex((s) => s.sol === anchorSol);
    const clickedIdx = sols.findIndex((s) => s.sol === sol);

    if (Math.abs(anchorIdx - clickedIdx) === 1) {
      const solA = anchorIdx < clickedIdx ? anchorSol : sol;
      const solB = anchorIdx < clickedIdx ? sol : anchorSol;
      setSelectedWindow({ solA, solB });
      setStatus(null);
    } else {
      // Not adjacent — reset anchor to the new click
      setAnchorSol(sol);
      setSelectedWindow(null);
      setStatus("Sols must be consecutive. Select a new starting Sol.");
    }
  }

  async function handleSubmit() {
    if (!selectedWindow) {
      setStatus("Select two consecutive Sols to form a transit window.");
      return;
    }

    setSubmitting(true);
    setStatus(null);

    const response = await fetch("/api/insight/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, selectedSolA: selectedWindow.solA, selectedSolB: selectedWindow.solB }),
    });
    const payload = (await response.json().catch(() => ({}))) as Partial<SubmitResult> & { error?: string };

    if (!response.ok) {
      setStatus(payload.error ?? "Could not score this transit window.");
      setSubmitting(false);
      return;
    }

    const finalResult: SubmitResult = {
      score: payload.score ?? 0,
      isOptimal: Boolean(payload.isOptimal),
      selectedRank: payload.selectedRank ?? null,
      selectedWindowRisk: payload.selectedWindowRisk ?? null,
      optimalWindow: payload.optimalWindow!,
      allWindows: payload.allWindows ?? [],
      solRisks: payload.solRisks ?? [],
    };

    queueSurveyTrigger({
      source: "insight_weather",
      version: process.env.NEXT_PUBLIC_APP_VERSION?.trim() || "v1",
      gameDate: date,
      score: finalResult.score,
    });
    trackGameplayEvent("insight_weather_completed", {
      game_date: date,
      score: finalResult.score,
      is_optimal: finalResult.isOptimal,
      selected_rank: finalResult.selectedRank ?? undefined,
      selected_sol_a: selectedWindow.solA,
      selected_sol_b: selectedWindow.solB,
    });

    if (onMissionComplete) {
      onMissionComplete({ score: finalResult.score });
      setSubmitting(false);
      return;
    }

    setResult(finalResult);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <section className="puzzle-screen">
        <header className="puzzle-header panel">
          <p className="eyebrow">Surface Operations</p>
          <h1>Loading telemetry…</h1>
        </header>
      </section>
    );
  }

  if (access && !access.allowed) {
    return (
      <section className="puzzle-screen">
        <header className="puzzle-header panel">
          <p className="eyebrow">Surface Operations</p>
          <h1>Archive lock active</h1>
          <p className="muted puzzle-header-summary">
            Unlock this date from the main archive flow before opening surface ops.
          </p>
        </header>
      </section>
    );
  }

  if (!puzzle) {
    return (
      <section className="puzzle-screen">
        <header className="puzzle-header panel">
          <p className="eyebrow">Surface Operations</p>
          <h1>No telemetry available</h1>
          <p className="muted puzzle-header-summary">Surface ops could not prepare a mission window for this date.</p>
        </header>
      </section>
    );
  }

  const sols = puzzle.sols;

  return (
    <section className="puzzle-screen">
      <header className="puzzle-header panel">
        <p className="eyebrow">Surface Operations</p>
        <div className="puzzle-header-row">
          <div>
            <h1>Route Clearance</h1>
            <p className="muted puzzle-header-summary">{puzzle.subtitle}</p>
            <div className="puzzle-context-row">
              <span className="puzzle-context-pill">Date {puzzle.date}</span>
              <span className="puzzle-context-pill">{sols.length} Sols</span>
              <span className="puzzle-context-pill">Source {source === "live" ? "NASA live feed" : "cached fallback"}</span>
            </div>
          </div>
          <span className="puzzle-progress">Telemetry</span>
        </div>
      </header>

      <div className="puzzle-workspace">
        <article className="puzzle-canvas panel">
          <div className="insight-intro">
            <h2>{puzzle.prompt}</h2>
            <p className="muted">Click a Sol to anchor, then click an adjacent Sol to complete the window.</p>
          </div>

          <div className="insight-sol-strip">
            {sols.map((sol, idx) => {
              const isAnchor = !selectedWindow && anchorSol === sol.sol;
              const inWindow = selectedWindow
                ? sol.sol === selectedWindow.solA || sol.sol === selectedWindow.solB
                : false;
              const isOptimalA = result?.optimalWindow.solA === sol.sol;
              const isOptimalB = result?.optimalWindow.solB === sol.sol;
              const isOptimalWindow = isOptimalA || isOptimalB;
              const solRisk = result?.solRisks.find((r) => r.sol === sol.sol);
              const prevSol = idx > 0 ? sols[idx - 1] : null;
              const windowHere = result?.allWindows.find((w) => prevSol && w.solA === prevSol.sol && w.solB === sol.sol);

              return (
                <div key={sol.sol} className="insight-sol-col">
                  {windowHere ? (
                    <div
                      className={`insight-window-badge${windowHere.rank === 1 ? " is-optimal" : ""}${
                        selectedWindow?.solA === windowHere.solA && selectedWindow?.solB === windowHere.solB
                          ? " is-selected"
                          : ""
                      }`}
                    >
                      #{windowHere.rank}
                    </div>
                  ) : (
                    <div className="insight-window-badge-spacer" />
                  )}

                  <button
                    type="button"
                    className={[
                      "insight-sol-card",
                      isAnchor ? "is-anchor" : "",
                      inWindow ? "in-window" : "",
                      result && isOptimalWindow ? "is-optimal" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleSolClick(sol.sol)}
                    disabled={Boolean(result)}
                    data-cy={`insight-sol-${sol.sol}`}
                  >
                    <div className="insight-sol-head">
                      <strong>Sol {sol.sol}</strong>
                      <span className="muted">{sol.season ?? ""}</span>
                    </div>

                    <dl className="insight-reading-grid">
                      <div>
                        <dt>Wind peak</dt>
                        <dd>{fmt(sol.hws.mx, " m/s")}</dd>
                      </div>
                      <div>
                        <dt>Avg wind</dt>
                        <dd>{fmt(sol.hws.av, " m/s")}</dd>
                      </div>
                      <div>
                        <dt>Pressure Δ</dt>
                        <dd>
                          {typeof sol.pre.mx === "number" && typeof sol.pre.mn === "number"
                            ? `${(sol.pre.mx - sol.pre.mn).toFixed(1)} Pa`
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt>Temp min</dt>
                        <dd>{fmt(sol.at.mn, "°C")}</dd>
                      </div>
                    </dl>

                    {solRisk ? (
                      <div className="insight-risk-breakdown">
                        <RiskBar value={solRisk.windRisk} label="Wind" />
                        <RiskBar value={solRisk.pressureRisk} label="Press" />
                        <RiskBar value={solRisk.tempRisk} label="Temp" />
                        <div className="insight-risk-total">
                          Risk <strong>{solRisk.riskScore.toFixed(0)}</strong>
                        </div>
                      </div>
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>
        </article>

        <aside className="puzzle-sidebar panel">
          <div className="puzzle-controls">
            <div className="puzzle-control-group is-compact">
              <p className="puzzle-control-label">Mission brief</p>
              <p className="muted">
                The surface unit needs a 2-Sol window with manageable wind, stable pressure, and a survivable temperature
                floor. Select the safest consecutive pair.
              </p>
            </div>

            <div className="puzzle-control-group is-compact">
              <p className="puzzle-control-label">Selection</p>
              {selectedWindow ? (
                <p className="muted">
                  Window: Sol {selectedWindow.solA} → Sol {selectedWindow.solB}
                </p>
              ) : anchorSol ? (
                <p className="muted">Sol {anchorSol} anchored — select an adjacent Sol.</p>
              ) : (
                <p className="muted">No window selected.</p>
              )}
            </div>
          </div>

          {status ? <p className="puzzle-feedback">{status}</p> : null}

          {result ? (
            <div className="panel insight-result-panel">
              <p className="eyebrow">{result.isOptimal ? "Optimal clearance" : "Window assessed"}</p>
              <h3>
                {result.isOptimal
                  ? "Safest window confirmed"
                  : `Ranked #${result.selectedRank ?? "?"} of ${result.allWindows.length}`}
              </h3>
              <p className="muted">
                {result.isOptimal
                  ? "The surface unit has the best possible conditions."
                  : `Optimal window was Sol ${result.optimalWindow.solA} → Sol ${result.optimalWindow.solB} (risk ${result.optimalWindow.windowRisk.toFixed(1)}).`}
              </p>
              <div className="mission-complete-score" style={{ marginTop: "1rem" }}>
                <span className="mission-complete-score-label muted">Score</span>
                <span className="mission-complete-score-value">{result.score}</span>
              </div>
            </div>
          ) : (
            <div className="puzzle-next-row mission-sticky-actions">
              <button
                className="button button-primary puzzle-action-primary"
                type="button"
                data-cy="insight-submit-button"
                onClick={() => void handleSubmit()}
                disabled={submitting || !selectedWindow}
              >
                <span data-cy="insight-submit-label">{submitting ? "Assessing…" : "Clear for Transit"}</span>
              </button>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
