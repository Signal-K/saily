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

export function MissionComplete({
  character,
  chapter,
  score,
  isStorylineComplete,
  storylineTitle,
  postcardTitle = "Sailor's Postcard",
  postcardMessage = "You've completed this arc! Share your discovery with others.",
  endedEarly = false,
  awardedChips = 0,
  referralCode = null
}: Props) {
  const [copied, setCopied] = useState(false);
  const expression = endedEarly ? "sad" : chapter.resolutionExpression;
  const avatarSrc = getRobotAvatarDataUri(character.avatarSeed, 72, expression);

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

      <div className="mission-complete-stats-row">
        <div className="mission-complete-score">
          <span className="mission-complete-score-label muted">Today&apos;s score</span>
          <span className="mission-complete-score-value">{score}</span>
        </div>
        
        {awardedChips > 0 && (
          <div className="mission-complete-reward-pill">
            <Image src="/assets/data-chip.svg" alt="" width={20} height={20} className="reward-chip-icon" />
            <span>+{awardedChips} Data Chips</span>
          </div>
        )}
      </div>

      {isStorylineComplete && (
        <div className="mission-complete-postcard">
          <div className="postcard-header">
            <div className="postcard-icon-wrap">
              <Image src="/assets/postcard.svg" alt="" width={32} height={24} />
            </div>
            <h3>{postcardTitle}</h3>
          </div>
          <p className="postcard-msg">{postcardMessage}</p>
          {referralCode && (
            <>
              <div className="postcard-referral">
                <span className="referral-label">Your Referral Code:</span>
                <code className="referral-code">{referralCode}</code>
              </div>
              <button
                className="button button-secondary button-sm"
                onClick={() => {
                  const url = `${window.location.origin}/auth/sign-up?ref=${referralCode}`;
                  navigator.clipboard.writeText(url).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
              >
                {copied ? "Copied!" : "Copy Referral Link"}
              </button>
            </>
          )}
        </div>
      )}

      {isStorylineComplete && !awardedChips && (
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
      <style jsx>{`
        .mission-complete-stats-row {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }
        .mission-complete-reward-pill {
          background: var(--surface-2);
          border: 1px solid var(--border);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-weight: 600;
          color: var(--brand);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .reward-chip-icon {
          filter: drop-shadow(0 0 4px color-mix(in oklab, var(--brand) 30%, transparent));
        }
        .mission-complete-postcard {
          background: #fff9f2;
          color: #43302b;
          padding: 1.5rem;
          border-radius: 0.5rem;
          border: 1px solid #e5d5c5;
          margin-bottom: 1.5rem;
          box-shadow: 2px 2px 0 #e5d5c5;
          position: relative;
        }
        [data-theme='dark'] .mission-complete-postcard {
          background: #1a1512;
          color: #e5d5c5;
          border-color: #43302b;
          box-shadow: 2px 2px 0 #43302b;
        }
        .postcard-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .postcard-icon-wrap {
          flex-shrink: 0;
          filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.1));
        }
        .postcard-header h3 {
          margin: 0;
          font-family: var(--font-brand);
          font-size: 1.25rem;
        }
        .postcard-msg {
          margin: 0.5rem 0 1rem 0;
          font-family: var(--font-handwritten, cursive);
          font-size: 1.1rem;
          line-height: 1.4;
          opacity: 0.9;
        }
        .postcard-referral {
          background: rgba(0,0,0,0.05);
          padding: 1rem;
          border-radius: 0.25rem;
          margin: 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .referral-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.8;
        }
        .referral-code {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 0.1em;
        }
      `}</style>
    </div>
  );
}
