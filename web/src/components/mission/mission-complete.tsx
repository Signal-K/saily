"use client";

import Image from "next/image";
import Link from "next/link";
import { getRobotAvatarDataUri } from "@/lib/avatar";
import type { Character } from "@/lib/characters";
import type { Chapter } from "@/lib/storylines";

type Props = {
  character: Character;
  chapter: Chapter;
  score: number;
  isStorylineComplete: boolean;
  storylineTitle: string;
  endedEarly?: boolean;
};

export function MissionComplete({ character, chapter, score, isStorylineComplete, storylineTitle, endedEarly = false }: Props) {
  const avatarSrc = getRobotAvatarDataUri(character.avatarSeed, 72);

  return (
    <div className="mission-complete panel">
      {/* Success banner */}
      <div className="mission-complete-banner">
        <span className="mission-complete-trophy" aria-hidden>🏆</span>
        <p className="eyebrow">Mission Complete</p>
      </div>

      <div className="mission-complete-header">
        <Image
          src={avatarSrc}
          alt={character.name}
          width={56}
          height={56}
          unoptimized
          className="mission-complete-avatar"
        />
        <div>
          <h1 className="mission-complete-title">{chapter.title}</h1>
          <p className="muted">{character.name} &middot; {storylineTitle}</p>
        </div>
      </div>

      <blockquote className="mission-complete-resolution">
        {endedEarly
          ? "You reported no confirmed planet signal today. Mission operations ended early, and your report has been logged."
          : chapter.resolution}
      </blockquote>

      <div className="mission-complete-score">
        <span className="mission-complete-score-label muted">Today&apos;s score</span>
        <span className="mission-complete-score-value">{score}</span>
      </div>

      {isStorylineComplete && (
        <div className="mission-complete-arc-done">
          <p>
            <strong>Arc complete ✦</strong> {character.name}&apos;s story continues next time this storyline comes around.
          </p>
        </div>
      )}

      <div className="cta-row">
        <Link href="/" className="button button-primary">
          Back to Home
        </Link>
        <Link href="/discuss" className="button">
          Discuss
        </Link>
      </div>
    </div>
  );
}
