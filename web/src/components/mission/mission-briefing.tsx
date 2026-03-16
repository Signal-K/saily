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
      {/* Chapter progress indicator */}
      <div className="mission-chapter-bar">
        {Array.from({ length: totalChapters }, (_, i) => (
          <span
            key={i}
            className={`mission-chapter-dot${i < chapterNumber ? " is-done" : i === chapterNumber - 1 ? " is-current" : ""}`}
            aria-hidden
          />
        ))}
        <span className="eyebrow" style={{ marginLeft: "auto" }}>
          Chapter {chapterNumber} / {totalChapters}
        </span>
      </div>

      <p className="eyebrow" style={{ marginTop: "0.75rem" }}>Today&apos;s Mission</p>
      <p className="mission-briefing-arc muted">{storylineTitle}</p>

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
          <h1 className="mission-briefing-name">{character.name}</h1>
          <p className="mission-briefing-occupation muted">{character.occupation}</p>
        </div>
      </div>

      <div className="mission-briefing-divider" />

      <h2 className="mission-briefing-chapter-title">{chapter.title}</h2>

      <blockquote className="mission-briefing-text">{chapter.briefing}</blockquote>

      <button type="button" className="button button-primary mission-briefing-cta" onClick={onBegin}>
        Begin Mission &rarr;
      </button>
    </div>
  );
}
