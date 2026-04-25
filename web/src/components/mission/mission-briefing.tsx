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

  return (
    <div className="mission-briefing panel">
      {/* Top row: chapter progress + active badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--border)" }}>
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

      {/* Character identity */}
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

      <div className="mission-briefing-divider" />

      {/* Briefing content with left accent */}
      <div className="mission-briefing-body">
        <h2 className="mission-briefing-chapter-title">{chapter.title}</h2>
        <blockquote className="mission-briefing-text">{chapter.briefing}</blockquote>
      </div>

      <div className="mission-briefing-footer">
        <button type="button" className="button button-primary" onClick={onBegin} style={{ padding: "1rem 2rem", fontSize: "0.75rem", letterSpacing: "0.15em" }}>
          Initialize Mission →
        </button>
      </div>

      <p className="mission-briefing-hud">SYS.RDY // 99.9% // T-MINUS 00:00</p>
    </div>
  );
}
