"use client";

import { FormEvent, useState } from "react";
import { submitInterest, toggleValue } from "@/components/landing/landing-interest";
import { Kicker } from "@/components/landing/landing-shared";
import { games } from "@/components/landing/landing-data";

export function NotifySection() {
  const [notifyEmail, setNotifyEmail] = useState("");
  const [interestedGames, setInterestedGames] = useState<string[]>([]);
  const [notifyState, setNotifyState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleNotifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!notifyEmail.trim() || notifyState === "sending") return;

    setNotifyState("sending");
    try {
      await submitInterest({
        kind: "notify",
        email: notifyEmail.trim(),
        puzzles: interestedGames, // Repurposing puzzles field for game interests
      });
      setNotifyState("sent");
    } catch (error) {
      console.error("[landing-interest] notify signup failed", error);
      setNotifyState("error");
    }
  }

  return (
    <section id="notify" className="tx-section tx-notify">
      <div>
        <Kicker>Join the mission</Kicker>
        <h2>Get a low-cost launch ping.</h2>
        <p className="tx-form-note" style={{ marginBottom: "1rem" }}>
          Join the launch list and we&apos;ll notify you when new Star Sailors games and updates are ready.
        </p>

        <p className="tx-label" style={{ marginBottom: "0.5rem" }}>Which games interest you?</p>
        <div className="tx-chip-row" style={{ marginBottom: "1.5rem" }}>
          {games.map((game) => (
            <button
              key={game.title}
              type="button"
              className={`tx-chip ${interestedGames.includes(game.title) ? "is-active" : ""}`}
              onClick={() => setInterestedGames(toggleValue(interestedGames, game.title))}
            >
              {game.title}
            </button>
          ))}
          <button
            type="button"
            className={`tx-chip ${interestedGames.includes("Everything") ? "is-active" : ""}`}
            onClick={() => setInterestedGames(toggleValue(interestedGames, "Everything"))}
          >
            Everything
          </button>
        </div>
      </div>
      <form onSubmit={handleNotifySubmit}>
        <div className="tx-form-row">
          <label className="tx-label">
            Email
            <input type="email" value={notifyEmail} onChange={(event) => setNotifyEmail(event.target.value)} placeholder="your@email" required />
          </label>
          <button className="button button-primary" type="submit" disabled={notifyState === "sending"}>
            {notifyState === "sending" ? "Joining..." : "Notify me"}
          </button>
        </div>
        {notifyState === "sent" && <p className="tx-form-note" style={{ marginTop: "1rem" }}>You are on the launch list. We&apos;ll be in touch.</p>}
        {notifyState === "error" && <p className="tx-form-note is-error" style={{ marginTop: "1rem" }}>Could not join the list. Please try again.</p>}
      </form>
    </section>
  );
}
