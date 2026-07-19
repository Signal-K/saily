"use client";

import Image from "next/image";
import { getRobotAvatarDataUri } from "@/lib/avatar";
import type { Character } from "@/lib/characters";
import type { Chapter } from "@/lib/storylines";

type Props = {
  character: Character;
  chapter: Chapter;
  storylineTitle: string;
  chapterNumber: number;
  totalChapters: number;
  onBegin: () => void;
};

export function MissionBriefing({ character, chapter, storylineTitle, chapterNumber, totalChapters, onBegin }: Props) {
  const avatarSrc = getRobotAvatarDataUri(character.avatarSeed, 96, chapter.briefingExpression);
  const briefingText = chapter.briefing
    .replace(
      "three different surveys — planet transits, asteroid images, and Mars surface data",
      "two active desks: today's science crossword and a real transit-spotting round",
    )
    .replace(
      "two active desks: planet transits and Mars surface data",
      "two active desks: today's science crossword and a real transit-spotting round",
    )
    .replace("Work through each one and I'll check in between.", "Work through the live pair and I'll check in between.");

  return (
    <>
      <style jsx global>{`
        .mission-briefing {
          width: min(100%, 1040px);
          margin-inline: auto;
          border: 1px solid var(--rule, #d9dde3);
          border-top: 3px double var(--ink, #16181c);
          background: var(--bg-surface, #fff);
          padding: clamp(1.1rem, 3vw, 1.75rem);
          box-shadow: var(--shadow-card, 0 1px 0 #d9dde3, 0 8px 24px -12px rgba(7, 41, 56, 0.18));
        }

        .mission-briefing-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          border-bottom: 1px solid var(--rule, #d9dde3);
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }

        .mission-chapter-bar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.35rem;
        }

        .mission-chapter-dot {
          width: 7px;
          height: 7px;
          border: 1px solid var(--rule, #d9dde3);
          background: var(--bg-surface-warm, #f4efe6);
        }

        .mission-chapter-dot.is-done,
        .mission-chapter-dot.is-current {
          border-color: var(--primary, #0a82b3);
          background: var(--primary, #0a82b3);
        }

        .mission-chapter-dot.is-current {
          width: 9px;
          height: 9px;
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary, #0a82b3) 18%, transparent);
        }

        .mission-active-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          border: 1px solid color-mix(in oklab, var(--primary, #0a82b3) 35%, var(--rule, #d9dde3));
          background: var(--bg-surface-cool, #eaf6fb);
          color: var(--primary, #0a82b3);
          padding: 0.35rem 0.55rem;
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .mission-active-badge-dot {
          width: 7px;
          height: 7px;
          background: currentColor;
          border-radius: 999px;
        }

        .mission-briefing-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.75fr);
          gap: clamp(1.25rem, 4vw, 2rem);
          align-items: stretch;
        }

        .mission-briefing-main {
          display: grid;
          align-content: start;
          gap: 1rem;
        }

        .mission-briefing-header {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 1rem;
          align-items: center;
        }

        .mission-briefing-avatar {
          border: 2px solid var(--primary, #0a82b3);
          background: var(--bg-surface, #fff);
          padding: 2px;
        }

        .mission-briefing-personnel-id {
          margin: 0 0 0.25rem;
          font-family: var(--font-serif, Georgia, serif);
          font-size: 1rem;
          color: var(--ink, #16181c);
        }

        .mission-briefing-name {
          margin: 0 0 0.25rem;
          font-family: var(--font-display, "Turret Road", Georgia, serif);
          font-size: clamp(2rem, 6vw, 3.2rem);
          line-height: 0.95;
        }

        .mission-briefing-meta p {
          margin: 0.25rem 0;
        }

        .mission-briefing-body {
          border-left: 3px solid var(--primary, #0a82b3);
          padding-left: 1rem;
        }

        .mission-briefing-chapter-title {
          margin: 0 0 0.55rem;
          font-family: var(--font-display, "Turret Road", Georgia, serif);
          font-size: clamp(2rem, 5vw, 3rem);
          line-height: 1;
        }

        .mission-briefing-text {
          margin: 0;
          color: var(--fg-2, #2b2f36);
          font-size: clamp(1rem, 2vw, 1.18rem);
          line-height: 1.55;
        }

        .mission-briefing-footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .mission-briefing-hud {
          margin: 0;
          color: var(--fg-muted, #5b636f);
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .mission-briefing-console {
          display: grid;
          gap: 1rem;
          border: 1px solid var(--rule, #d9dde3);
          background: var(--bg-surface-warm, #f4efe6);
          padding: 1rem;
        }

        .mission-briefing-visual {
          position: relative;
          min-height: 190px;
          border: 1px solid var(--rule, #d9dde3);
          background:
            linear-gradient(90deg, color-mix(in oklab, var(--primary, #0a82b3) 16%, transparent) 1px, transparent 1px),
            linear-gradient(0deg, color-mix(in oklab, var(--primary, #0a82b3) 16%, transparent) 1px, transparent 1px),
            var(--bg-surface-cool, #eaf6fb);
          background-size: 32px 32px;
          overflow: hidden;
        }

        .mission-briefing-visual::before,
        .mission-briefing-visual::after {
          content: "";
          position: absolute;
          border: 1px solid color-mix(in oklab, var(--primary, #0a82b3) 45%, transparent);
          transform: skewX(-16deg) rotate(-5deg);
        }

        .mission-briefing-visual::before {
          inset: 18% 10%;
        }

        .mission-briefing-visual::after {
          inset: 32% 20%;
          opacity: 0.7;
        }

        .mission-signal-bars {
          position: absolute;
          right: 1rem;
          bottom: 1rem;
          left: 40%;
          display: flex;
          align-items: end;
          gap: 0.45rem;
          height: 46%;
        }

        .mission-signal-bars span {
          flex: 1;
          min-width: 0.7rem;
          background: var(--primary, #0a82b3);
        }

        .mission-briefing-missions {
          display: grid;
          gap: 0.75rem;
        }

        .mission-briefing-mission {
          border: 1px solid var(--rule, #d9dde3);
          background: var(--bg-surface, #fff);
          padding: 0.85rem;
        }

        .mission-briefing-mission strong {
          display: block;
          color: var(--primary, #0a82b3);
          font-family: var(--font-data, ui-monospace, monospace);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .mission-briefing-mission span {
          display: block;
          margin-top: 0.35rem;
          color: var(--fg-muted, #5b636f);
          line-height: 1.4;
        }

        .mission-briefing-mission.is-dsmr strong {
          color: var(--color-rust-400, #d76131);
        }

        @media (max-width: 860px) {
          .mission-briefing-grid,
          .mission-briefing-header {
            grid-template-columns: 1fr;
          }

          .mission-briefing-top {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
      <div className="mission-briefing panel">
        <div className="mission-briefing-top">
          <div className="mission-chapter-bar">
            {Array.from({ length: totalChapters }, (_, i) => (
              <span
                key={i}
                className={`mission-chapter-dot${i < chapterNumber - 1 ? " is-done" : i === chapterNumber - 1 ? " is-current" : ""}`}
                aria-hidden
              />
            ))}
            <span className="eyebrow" style={{ marginLeft: "0.75rem" }}>
              Log {chapterNumber} of {totalChapters}
            </span>
          </div>
          <span className="mission-active-badge">
            <span className="mission-active-badge-dot" aria-hidden />
            Active Research
          </span>
        </div>

        <div className="mission-briefing-grid">
          <div className="mission-briefing-main">
            <div className="mission-briefing-header">
              <Image
                src={avatarSrc}
                alt={character.name}
                width={80}
                height={80}
                unoptimized
                className="mission-briefing-avatar"
              />
              <div className="mission-briefing-meta">
                <p className="mission-briefing-personnel-id">Personnel ID: {character.avatarSeed.toUpperCase().slice(0, 8)}</p>
                <h1 className="mission-briefing-name">{character.name}</h1>
                <p className="mission-briefing-occupation muted">
                  <strong style={{ color: "var(--primary)", fontFamily: "var(--font-data)", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Role:</strong>{" "}
                  {character.occupation}
                </p>
                <p className="muted" style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  <strong style={{ color: "var(--primary)", fontFamily: "var(--font-data)", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Current Arc:</strong>{" "}
                  {storylineTitle}
                </p>
              </div>
            </div>

            <div className="mission-briefing-body">
              <h2 className="mission-briefing-chapter-title">{chapter.title.replace("Three Datasets", "Two Live Datasets")}</h2>
              <blockquote className="mission-briefing-text">{briefingText}</blockquote>
            </div>

            <div className="mission-briefing-footer">
              <button type="button" className="button button-primary" onClick={onBegin} style={{ padding: "1rem 2rem", fontSize: "0.75rem", letterSpacing: "0.15em" }}>
                Initialize Mission →
              </button>
              <p className="mission-briefing-hud">SYS.RDY // 99.9% // T-MINUS 00:00</p>
            </div>
          </div>

          <aside className="mission-briefing-console" aria-label="Mission briefing console">
            <div className="mission-briefing-visual" aria-hidden>
              <div className="mission-signal-bars">
                <span style={{ height: "46%" }} />
                <span style={{ height: "68%" }} />
                <span style={{ height: "54%" }} />
                <span style={{ height: "76%" }} />
              </div>
            </div>
            <div className="mission-briefing-missions">
              <div className="mission-briefing-mission">
                <strong>Science Crossword</strong>
                <span>real night-sky events &amp; today&apos;s discoveries · clue solving</span>
              </div>
              <div className="mission-briefing-mission is-dsmr">
                <strong>Transit Spotter</strong>
                <span>Planet Hunters TESS lightcurve · dip spotting</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
