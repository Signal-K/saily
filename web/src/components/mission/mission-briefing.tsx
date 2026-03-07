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
  const avatarSrc = getRobotAvatarDataUri(character.avatarSeed, 96);

  return (
    <div className="mission-briefing panel">
      <p className="eyebrow">Today&apos;s Mission</p>

      <div className="mission-briefing-header">
        <Image
          src={avatarSrc}
          alt={character.name}
          width={72}
          height={72}
          unoptimized
          className="mission-briefing-avatar"
        />
        <div className="mission-briefing-meta">
          <h1 className="mission-briefing-name">{character.name}</h1>
          <p className="mission-briefing-occupation muted">{character.occupation}</p>
          <p className="mission-briefing-arc muted">
            {storylineTitle} &middot; Chapter {chapterNumber} of {totalChapters}
          </p>
        </div>
      </div>

      <div className="mission-briefing-divider" />

      <h2 className="mission-briefing-chapter-title">{chapter.title}</h2>

      <blockquote className="mission-briefing-text">{chapter.briefing}</blockquote>

      <button type="button" className="button button-primary mission-briefing-cta" onClick={onBegin}>
        Begin Mission
      </button>
    </div>
  );
}
