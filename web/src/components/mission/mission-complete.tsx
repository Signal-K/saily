"use client";

import { useState } from "react";
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
  postcardTitle?: string;
  postcardMessage?: string;
  endedEarly?: boolean;
  awardedChips?: number;
  referralCode?: string | null;
};

function StarRating({ score }: { score: number }) {
  const stars = Math.round((score / 100) * 5);
  return (
    <div className="mission-complete-stars" aria-label={`${stars} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden style={{ opacity: i < stars ? 1 : 0.2 }}>★</span>
      ))}
    </div>
  );
}

export function MissionComplete({
  character,
  chapter,
  score,
  isStorylineComplete,
  storylineTitle,
  postcardTitle = "Sailor's Postcard",
  postcardMessage = "Your data contribution has been logged to the network. A postcard has been added to your archive.",
  endedEarly = false,
  awardedChips = 0,
  referralCode = null,
}: Props) {
  const [copied, setCopied] = useState(false);
  const expression = endedEarly ? "sad" : chapter.resolutionExpression;
  const avatarSrc = getRobotAvatarDataUri(character.avatarSeed, 72, expression);

  return (
    <div className="mission-complete panel">
      {/* Success banner */}
      <div className="mission-complete-banner">
        <span className="mission-complete-trophy" aria-hidden>✓</span>
        <p className="eyebrow" style={{ margin: "0.5rem 0 0" }}>Research Logged</p>
        <h1 className="mission-complete-heading">Mission Complete</h1>
      </div>

      {/* Character + resolution quote */}
      <div className="mission-complete-header">
        <Image
          src={avatarSrc}
          alt={character.name}
          width={72}
          height={72}
          unoptimized
          className="mission-complete-avatar"
        />
        <div>
          <h2 className="mission-complete-title">{chapter.title}</h2>
          <p className="muted" style={{ margin: 0, fontSize: "0.8rem" }}>
            {character.name} &middot; {storylineTitle}
          </p>
        </div>
        <blockquote className="mission-complete-resolution" style={{ flex: 1, borderLeft: "1px solid var(--border)", paddingLeft: "1.25rem", margin: 0 }}>
          {endedEarly
            ? "No confirmed signals detected in this data set. Research logged with negative result."
            : chapter.resolution}
        </blockquote>
      </div>

      {/* Stat cards */}
      <div className="mission-complete-stat-cards">
        {/* Confidence rating */}
        <div className="mission-complete-stat-card">
          <p className="eyebrow" style={{ margin: "0 0 0.75rem" }}>Confidence Rating</p>
          <div className="mission-complete-score">
            <span className="mission-complete-score-value">{score}%</span>
          </div>
          <StarRating score={score} />
          <div style={{ height: "6px", background: "var(--surface-container-high)", marginTop: "0.75rem", display: "flex" }}>
            <div style={{ width: `${score}%`, background: "var(--primary)" }} />
          </div>
        </div>

        {/* Transmission / chips */}
        <div className="mission-complete-stat-card">
          {awardedChips > 0 && (
            <span className="mission-complete-chips-badge">+{awardedChips} Chips</span>
          )}
          <p className="mission-complete-transmission-title">
            <Image src="/assets/data-chip.svg" alt="" width={16} height={16} />
            Transmission Received
          </p>
          <p className="muted" style={{ fontSize: "0.8rem", lineHeight: 1.6, margin: "0 0 1rem" }}>
            {postcardMessage}
          </p>
          {isStorylineComplete && (
            <Link href="/postcards" className="button" style={{ fontSize: "0.7rem", padding: "0.4rem 0.75rem" }}>
              View Postcard
            </Link>
          )}
          {referralCode && (
            <div style={{ marginTop: "0.75rem" }}>
              <p className="eyebrow" style={{ margin: "0 0 0.3rem" }}>Secure Access Key</p>
              <code style={{ fontFamily: "var(--font-data)", fontSize: "1.2rem", fontWeight: 700, letterSpacing: "0.15em", color: "var(--primary)" }}>
                {referralCode}
              </code>
              <button
                className="button"
                style={{ marginTop: "0.5rem", fontSize: "0.7rem", padding: "0.4rem 0.75rem", display: "block", width: "100%" }}
                onClick={() => {
                  const url = `${window.location.origin}/auth/sign-up?ref=${referralCode}`;
                  navigator.clipboard.writeText(url).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
              >
                {copied ? "Log Copied" : "Copy Access Link"}
              </button>
            </div>
          )}
        </div>
      </div>

      {isStorylineComplete && !awardedChips && (
        <div className="mission-complete-arc-done">
          <strong>Research cycle complete ✦</strong> Data sets for {character.name}&apos;s current arc have been processed.
        </div>
      )}

      {/* Actions */}
      <div className="mission-complete-actions">
        <Link href="/" className="button">
          Return to Hub
        </Link>
        <Link href="/games/today" className="button button-primary">
          View Next Mission →
        </Link>
      </div>
    </div>
  );
}
