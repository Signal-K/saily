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
      <form className="tx-briefing-panel" onSubmit={handleBriefingSubmit}>
        <div className="tx-briefing-head">
          <div>
            <Kicker>Shape the next build</Kicker>
            <h2>Tune the daily mix</h2>
            <p>Quick signals only. Pick what should show up more often in The Daily Transit.</p>
          </div>
          <StatusPill>{totalAnswers} signals</StatusPill>
        </div>

        <div className="tx-briefing-rows">
          <BriefingQuestion
            kicker="Q1"
            title="Puzzles"
            options={puzzleOptions}
            selected={puzzles}
            onToggle={(option) => setPuzzles(toggleValue(puzzles, option))}
          />
          <BriefingQuestion
            kicker="Q2"
            title="Story hooks"
            options={storyOptions}
            selected={storyHooks}
            onToggle={(option) => setStoryHooks(toggleValue(storyHooks, option))}
          />
          <BriefingQuestion
            kicker="Q3"
            title="Return loops"
            options={returnOptions}
            selected={returnDrivers}
            onToggle={(option) => setReturnDrivers(toggleValue(returnDrivers, option))}
          />
        </div>

        <div className="tx-briefing-submit">
          <label className="tx-label tx-briefing-note">
            Note
            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Anything missing from today's mix?" />
          </label>
          <div className="tx-briefing-actions">
            <label className="tx-label">
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="optional@email" />
            </label>
            <button className="button button-primary" type="submit" disabled={!canSendBriefing || briefingState === "sending"}>
              {briefingState === "sending" ? "Saving..." : "Save signals"}
            </button>
          </div>
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
    <div className="tx-question tx-briefing-question">
      <div className="tx-briefing-question-head">
        <Kicker>{kicker}</Kicker>
        <h3>{title}</h3>
      </div>
      <div className="tx-chip-row">
        {options.map((option) => (
          <Chip key={option} label={option} active={selected.includes(option)} onClick={() => onToggle(option)} />
        ))}
      </div>
    </div>
  );
}
