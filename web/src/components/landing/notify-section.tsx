"use client";

import { FormEvent, useState } from "react";
import { submitInterest } from "@/components/landing/landing-interest";
import { Kicker } from "@/components/landing/landing-shared";

export function NotifySection() {
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyState, setNotifyState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleNotifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!notifyEmail.trim() || notifyState === "sending") return;

    setNotifyState("sending");
    try {
      await submitInterest({ kind: "notify", email: notifyEmail.trim() });
      setNotifyState("sent");
    } catch {
      setNotifyState("error");
    }
  }

  return (
    <section id="notify" className="tx-section tx-notify">
      <div>
        <Kicker>First edition</Kicker>
        <h2>Get a low-cost launch ping.</h2>
        <p className="tx-form-note">Join the launch list and we&apos;ll send the first edition when the paper is ready.</p>
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
        {notifyState === "sent" && <p className="tx-form-note">You are on the launch list.</p>}
        {notifyState === "error" && <p className="tx-form-note is-error">Could not join the list. Please try again.</p>}
      </form>
    </section>
  );
}
