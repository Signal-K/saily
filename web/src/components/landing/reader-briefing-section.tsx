"use client";

import { FormEvent, useState } from "react";
import { puzzleOptions, returnOptions, storyOptions } from "@/components/landing/landing-data";
import { generateCallsign, submitInterest, toggleValue } from "@/components/landing/landing-interest";
import { Chip, InterestSuccessNote, Kicker, StatusPill } from "@/components/landing/landing-shared";

export function ReaderBriefingSection() {
  const [puzzles, setPuzzles] = useState<string[]>([]);
  const [storyHooks, setStoryHooks] = useState<string[]>([]);
  const [returnDrivers, setReturnDrivers] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("");
  const [callsign, setCallsign] = useState("PV-0000");
  const [briefingState, setBriefingState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const totalAnswers = puzzles.length + storyHooks.length + returnDrivers.length;
  const canSendBriefing = totalAnswers > 0 || note.trim().length > 0 || email.trim().length > 0;

  async function handleBriefingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSendBriefing || briefingState === "sending") return;

    setBriefingState("sending");
    try {
      await submitInterest({
        kind: "briefing",
        email: email.trim() || undefined,
        puzzles,
        storyHooks,
        returnDrivers,
        note: note.trim() || undefined,
      });
      setCallsign(generateCallsign());
      setBriefingState("sent");
    } catch {
      setBriefingState("error");
    }
  }

  return (
    <section id="briefing" className="tx-section" aria-label="Reader briefing survey">
      <form className="tx-survey" onSubmit={handleBriefingSubmit}>
        <div className="tx-section-head">
          <div>
            <Kicker>Reader briefing &middot; Shape the first edition</Kicker>
            <h2>What should The Daily Transit become?</h2>
            <p>Pick anything that fits. Your answers help shape the first edition and the daily puzzle mix.</p>
          </div>
          <StatusPill>{totalAnswers} signals</StatusPill>
        </div>

        <div className="tx-survey-grid">
          <BriefingQuestion
            kicker="Q1"
            title="Which puzzles should we run first?"
            options={puzzleOptions}
            selected={puzzles}
            onToggle={(option) => setPuzzles(toggleValue(puzzles, option))}
          />
          <BriefingQuestion
            kicker="Q2"
            title="What pulls you into a space story?"
            options={storyOptions}
            selected={storyHooks}
            onToggle={(option) => setStoryHooks(toggleValue(storyHooks, option))}
          />
          <BriefingQuestion
            kicker="Q3"
            title="What would bring you back each day?"
            options={returnOptions}
            selected={returnDrivers}
            onToggle={(option) => setReturnDrivers(toggleValue(returnDrivers, option))}
          />
        </div>

        <label className="tx-label">
          Anything specific you are hoping to see?
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="A column on exoplanet atmospheres, a weekly asteroid tournament, beginner explainers..." />
        </label>

        <div className="tx-form-row">
          <label className="tx-label">
            Notify me when it launches
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your@email" />
          </label>
          <button className="button button-primary" type="submit" disabled={!canSendBriefing || briefingState === "sending"}>
            {briefingState === "sending" ? "Transmitting..." : "Transmit briefing"}
          </button>
        </div>
        {briefingState === "sent" && <InterestSuccessNote>Callsign {callsign} logged.</InterestSuccessNote>}
        {briefingState === "error" && <p className="tx-form-note is-error">The signal did not send. Please try again.</p>}
      </form>
    </section>
  );
}

function BriefingQuestion({
  kicker,
  title,
  options,
  selected,
  onToggle,
}: {
  kicker: string;
  title: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}) {
  return (
    <div className="tx-question">
      <Kicker>{kicker}</Kicker>
      <h3>{title}</h3>
      <div className="tx-chip-row">
        {options.map((option) => (
          <Chip key={option} label={option} active={selected.includes(option)} onClick={() => onToggle(option)} />
        ))}
      </div>
    </div>
  );
}
