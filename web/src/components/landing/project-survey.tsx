"use client";

import { FormEvent, useEffect, useState } from "react";
import posthog from "posthog-js";
import { InterestSuccessNote, Kicker } from "@/components/landing/landing-shared";
import { games } from "@/components/landing/landing-data";
import { submitInterest } from "@/components/landing/landing-interest";
import { CITIZEN_SCIENCE_VOTE_KEY as SURVEY_ID } from "@/lib/posthog/survey-ids";

const SPACE_PROJECTS = new Set(["Landnam", "Asteroid Hunters"]);

export function ProjectSurvey() {
  const [voted, setVoted] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [showPlay, setShowPlay] = useState(false);
  const [liveVotes, setLiveVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    fetch("/api/project-survey/results")
      .then((res) => res.json())
      .then((data: { votes?: Record<string, number> }) => {
        if (!cancelled && data.votes) setLiveVotes(data.votes);
      })
      .catch(() => {
        // Leave liveVotes empty — real zero, not a fabricated fallback.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleVote(projectTitle: string) {
    if (voted) return;
    setVoted(projectTitle);

    if (typeof window !== "undefined") {
      posthog.capture("survey sent", {
        $survey_id: SURVEY_ID,
        $survey_response: projectTitle,
      });
      posthog.capture("citizen_science_project_vote", {
        project: projectTitle,
        survey_id: SURVEY_ID,
      });
    }
  }

  async function handleInviteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteEmail.trim() || emailState === "sending") return;
    setEmailState("sending");
    try {
      await submitInterest({ kind: "notify", email: inviteEmail.trim(), puzzles: ["Landnam"] });
      setEmailState("sent");
      // Slight delay so the success state lands before the reveal fades in
      setTimeout(() => setShowPlay(true), 320);
    } catch {
      setEmailState("error");
    }
  }

  const votes = voted
    ? { ...liveVotes, [voted]: (liveVotes[voted] ?? 0) + 1 }
    : liveVotes;
  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);
  const showSpaceInvite = voted !== null && SPACE_PROJECTS.has(voted);

  return (
    <section id="survey" className="tx-section tx-survey">
      <div>
        <Kicker>Community Vote</Kicker>
        <h2>Which mission calls to you?</h2>
        <p style={{ margin: "0.5rem 0 1.5rem", color: "var(--fg-muted, #5b636f)", maxWidth: "58ch", lineHeight: "1.6" }}>
          Star Sailors turns real scientific data into games anyone can play — no telescope required. Vote for the project you&apos;d want to join first. Results help us prioritise what ships next.
        </p>
      </div>

      <div className="tx-survey-grid">
        {games.map((game) => {
          const voteCount = votes[game.title] ?? 0;
          const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isChosen = voted === game.title;

          return (
            <div key={game.title} className={`tx-question${isChosen ? " is-chosen" : ""}`}>
              <p className="tx-kicker" style={{ marginBottom: "0.35rem" }}>{game.status}</p>
              <h3>{game.title}</h3>
              <p>{game.body}</p>

              {voted ? (
                <div style={{ marginTop: "1rem" }}>
                  <div style={{ height: 5, background: "var(--rule, #d9dde3)", marginBottom: "0.5rem", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: isChosen ? "var(--primary, #0a82b3)" : "var(--fg-muted, #5b636f)",
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                  <span style={{
                    fontFamily: "var(--font-data, ui-monospace, monospace)",
                    fontSize: "0.68rem",
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: isChosen ? "var(--primary, #0a82b3)" : "var(--fg-muted, #5b636f)",
                  }}>
                    {pct}% &middot; {voteCount.toLocaleString()} votes
                  </span>
                </div>
              ) : (
                <button
                  className="button button-primary"
                  style={{ marginTop: "1rem", width: "100%" }}
                  onClick={() => handleVote(game.title)}
                >
                  Vote
                </button>
              )}
            </div>
          );
        })}
      </div>

      {voted && !showSpaceInvite && (
        <p style={{
          marginTop: "1.25rem",
          borderLeft: "3px solid var(--primary, #0a82b3)",
          paddingLeft: "0.75rem",
          color: "var(--fg-2, #2b2f36)",
          fontSize: "0.95rem",
          lineHeight: "1.6",
        }}>
          Thanks for voting. You&apos;re helping shape what we build next — watch your inbox for mission updates.
        </p>
      )}

      {showSpaceInvite && (
        <div className="tx-landnam-invite tx-fade-in">
          <div>
            <Kicker>Looks like you&apos;re a space explorer</Kicker>
            <h3 style={{ margin: "0.35rem 0 0.5rem", fontFamily: "var(--font-display, 'Turret Road', Georgia, serif)", fontSize: "clamp(1.4rem, 3vw, 2rem)", lineHeight: 1.1 }}>
              Try Landnam — the space program manager
            </h3>
            <p style={{ margin: 0, color: "var(--fg-muted, #5b636f)", maxWidth: "52ch", lineHeight: "1.6" }}>
              Hunt real exoplanet signals from TESS data, then manage the crew and resources needed to follow up on the best candidates. Built on live science.
            </p>
          </div>

          {emailState !== "sent" ? (
            <form onSubmit={handleInviteSubmit} style={{ marginTop: "1.25rem" }}>
              <div className="tx-form-row">
                <label className="tx-label">
                  Email
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="your@email"
                    required
                    disabled={emailState === "sending"}
                  />
                </label>
                <button className="button button-primary" type="submit" disabled={emailState === "sending"}>
                  {emailState === "sending" ? "Joining..." : "Get early access"}
                </button>
              </div>
              {emailState === "error" && (
                <p className="tx-form-note is-error" style={{ marginTop: "0.5rem" }}>
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          ) : (
            <InterestSuccessNote>Welcome aboard — we&apos;ll be in touch about Landnam.</InterestSuccessNote>
          )}
        </div>
      )}

      {showPlay && (
        <div className="tx-play-reveal tx-fade-in">
          <div className="tx-play-inner">
            <div>
              <Kicker>Available now</Kicker>
              <h3 style={{ margin: "0.35rem 0 0.5rem", fontFamily: "var(--font-display, 'Turret Road', Georgia, serif)", fontSize: "clamp(1.4rem, 3vw, 2rem)", lineHeight: 1.1 }}>
                The original Star <em>Sailors</em> is live
              </h3>
              <p style={{ margin: 0, color: "var(--fg-muted, #5b636f)", maxWidth: "52ch", lineHeight: "1.6" }}>
                The first generation of Star Sailors is already playable. Classify real telescope data, track discoveries, and shape the science alongside other players.
              </p>
            </div>
            <div style={{ marginTop: "1.25rem" }}>
              <a
                href="https://starsailors.space"
                target="_blank"
                rel="noreferrer"
                className="button button-primary"
              >
                Play Star Sailors now →
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
