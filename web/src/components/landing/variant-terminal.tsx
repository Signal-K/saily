"use client";

import { useState, FormEvent, useEffect } from "react";
import { submitInterest } from "@/components/landing/landing-interest";

const BOOT_LINES = [
  "STAR_SAILORS_OS v2.4.1",
  "Copyright (c) 2026 Star Sailors. All rights reserved.",
  "",
  "Checking memory.............................. OK",
  "Loading mission database..................... OK",
  "Connecting to TESS data feed................. OK",
  "Exoplanet catalog: 5502 confirmed............ OK",
  "Citizen science queue: OPEN",
  "Classification engine: READY",
  "",
  "Welcome, Operator. Use the mission controls below to review the launch board.",
];

export function VariantTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [bootDone, setBootDone] = useState(false);
  const [activeCmd, setActiveCmd] = useState<"missions" | "crew" | "status" | null>(null);
  const [email, setEmail] = useState("");
  const [enrolState, setEnrolState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= BOOT_LINES.length) {
        clearInterval(id);
        setTimeout(() => setBootDone(true), 400);
      }
    }, 110);
    return () => clearInterval(id);
  }, []);

  async function handleEnrol(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || enrolState === "sending") return;
    setEnrolState("sending");
    try {
      await submitInterest({ kind: "notify", email: email.trim() });
      setEnrolState("sent");
      setEmail("");
    } catch {
      setEnrolState("error");
    }
  }

  function cmd(c: "missions" | "crew" | "status") {
    setActiveCmd(prev => prev === c ? null : c);
  }

  return (
    <div className="tx-term">
      <div className="tx-term-window">
        {/* Window chrome */}
        <div className="tx-term-bar">
          <span className="tx-term-dot" style={{ background: "#ff5f57" }} />
          <span className="tx-term-dot" style={{ background: "#ffbd2e" }} />
          <span className="tx-term-dot" style={{ background: "#28c840" }} />
          <span className="tx-term-title-text">star-sailors — mission-control — 132×48</span>
        </div>

        <div className="tx-term-body">
          {/* ASCII logo */}
          <pre className="tx-term-logo" aria-label="Star Sailors">{`
 _____ _____ _____ ____     _____ _____ _____ __    _____ _____ _____
|   __|_   _|  _  |  _ \\   |   __|  _  |     |  |  |     | __  |   __|
|__   | | | |     |    /   |__   |     |  |  |  |__|  |  |    -|__   |
|_____| |_| |__|__|__|_\\   |_____|__|__|__|__|_____|_____|__|__|_____|

`}</pre>

          {/* Boot sequence */}
          <div className="tx-term-boot">
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <div key={i} className="tx-term-line">{line || <>&nbsp;</>}</div>
            ))}
            {!bootDone && <span className="tx-term-cursor">█</span>}
          </div>

          {/* Interactive shell */}
          {bootDone && (
            <div className="tx-fade-in">
              <div className="tx-term-divider">────────────────────────────────────────────────────────────────────</div>

              <p className="tx-term-section-label">Mission controls</p>
              <div className="tx-term-prompt-line">
                <span className="tx-term-ps1">navigation</span>
                <div className="tx-term-cmds">
                  <button className={`tx-term-cmd-btn${activeCmd === "missions" ? " is-active" : ""}`} onClick={() => cmd("missions")}>View missions</button>
                  <button className={`tx-term-cmd-btn${activeCmd === "status" ? " is-active" : ""}`} onClick={() => cmd("status")}>Live status</button>
                  <button className={`tx-term-cmd-btn${activeCmd === "crew" ? " is-active" : ""}`} onClick={() => cmd("crew")}>Crew roster</button>
                </div>
              </div>

              {activeCmd === "missions" && (
                <div className="tx-term-output tx-fade-in">
                  <div className="tx-term-out-row">
                    <span className="tx-term-file">LND-001/</span>
                    <span>Landnam — Exoplanet transit hunt + crew narrative. STATUS: LIVE</span>
                  </div>
                  <div className="tx-term-out-row">
                    <span className="tx-term-file">CRL-001/</span>
                    <span>Coral Clicker — Reef species ID from survey imagery. STATUS: STAGING</span>
                  </div>
                  <div className="tx-term-out-row">
                    <span className="tx-term-file">AST-001/</span>
                    <span>Asteroid Hunters — Moving-object sweep in survey frames. STATUS: PLANNED</span>
                  </div>
                  <div className="tx-term-out-row" style={{ marginTop: "0.5rem" }}>
                    <span style={{ color: "#86efac" }}>3 missions found. 1 open. Enter LND-001 at starsailors.space</span>
                  </div>
                </div>
              )}

              {activeCmd === "status" && (
                <div className="tx-term-output tx-fade-in">
                  <div className="tx-term-out-row"><span className="tx-term-status-key">TESS data feed:</span><span>LIVE ● sector 7-G active</span></div>
                  <div className="tx-term-out-row"><span className="tx-term-status-key">Classification queue:</span><span>OPEN ● 5,502 candidates indexed</span></div>
                  <div className="tx-term-out-row"><span className="tx-term-status-key">Citizen science relay:</span><span>READY ● consensus threshold: 3 observers</span></div>
                  <div className="tx-term-out-row"><span className="tx-term-status-key">Next dispatch:</span><span>SCHEDULED ● pending launch</span></div>
                </div>
              )}

              {activeCmd === "crew" && (
                <div className="tx-term-output tx-fade-in">
                  <div className="tx-term-out-row">CALLSIGN: LM-01  NAME: Liam Martin    ROLE: Commander, Game Design</div>
                  <div className="tx-term-out-row">CALLSIGN: RC-02  NAME: Rhys Campbell  ROLE: Data Officer, ML</div>
                  <div className="tx-term-out-row">CALLSIGN: FB-03  NAME: Fred Bruce      ROLE: Comms, Audio &amp; Visual</div>
                </div>
              )}

              {/* Enrol prompt */}
              <div className="tx-term-divider" style={{ marginTop: "1.5rem" }}>────────────────────────────────────────────────────────────────────</div>
              <p className="tx-term-section-label">Launch signup</p>
              <div className="tx-term-prompt-line">
                <span className="tx-term-ps1">notify</span>
                <span className="tx-term-static-cmd">Receive the first briefing and early mission access</span>
              </div>

              {enrolState === "sent" ? (
                <div className="tx-term-output tx-fade-in">
                  <div style={{ color: "#86efac" }}>[OK] Operator registered. Briefing transmission scheduled.</div>
                  <div style={{ color: "#4ade80" }}>Awaiting launch... █</div>
                </div>
              ) : (
                <div className="tx-term-output">
                  <div>Enter email to receive mission briefings on launch:</div>
                  <form onSubmit={handleEnrol} className="tx-term-enrol-form">
                    <span className="tx-term-ps1">&gt;</span>
                    <input
                      type="email"
                      className="tx-term-email-input"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="operator@email.com"
                      required
                      disabled={enrolState === "sending"}
                    />
                    <button type="submit" className="tx-term-enrol-btn" disabled={enrolState === "sending"}>
                      {enrolState === "sending" ? "[SENDING…]" : "[ENROLL]"}
                    </button>
                  </form>
                  {enrolState === "error" && (
                    <div style={{ color: "#f87171" }}>[ERR] Transmission failed. Retry.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
