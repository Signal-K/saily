"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resolveGameDate } from "@/lib/game";
import { unlockArchive } from "@/lib/economy";
import { MissionStatusBanner } from "@/components/mission/mission-status-banner";
import type { MissionGame } from "@/lib/mission";

type GameResult = { score: number; terminatedEarly?: boolean };
type InnerGameProps = { onMissionComplete?: (result: GameResult) => void; gameDate?: string };
type GameAccess = { allowed: boolean; signInRequired: boolean; requiresUnlock: boolean };

type StandaloneGamePageProps = {
  game: MissionGame;
  label: string;
  GameComponent: ComponentType<InnerGameProps>;
};

// Every game (crossword, transit spotter, close approach ranker, Cloudspotting
// on Mars) is independent — this shell is the only thing shared between
// them: archive-day gating and recording the completion (which earns one
// Data Chip). There is no chained mission and no shared narrative anymore.
export default function StandaloneGamePage({ game, label, GameComponent }: StandaloneGamePageProps) {
  const searchParams = useSearchParams();
  const gameDate = resolveGameDate(searchParams.get("date"));

  const [access, setAccess] = useState<GameAccess | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [completion, setCompletion] = useState<{ score: number; awardedChips: number } | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadAccess() {
      try {
        const res = await fetch(`/api/game/today?date=${encodeURIComponent(gameDate)}`, { cache: "no-store" });
        const payload = (await res.json().catch(() => ({}))) as { access?: GameAccess };
        if (!cancelled) setAccess(payload.access ?? { allowed: true, signInRequired: false, requiresUnlock: false });
      } catch {
        if (!cancelled) setAccess({ allowed: true, signInRequired: false, requiresUnlock: false });
      }
    }
    void loadAccess();
    return () => {
      cancelled = true;
    };
  }, [gameDate]);

  const handleComplete = useCallback(
    async (result: GameResult) => {
      try {
        const res = await fetch("/api/game/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ game, date: gameDate, score: result.score }),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setCompleteError(payload?.error ?? "Could not record this game's completion.");
          return;
        }
        setCompletion({ score: payload.score ?? result.score, awardedChips: payload.awardedChips ?? 0 });
      } catch {
        setCompleteError("Network error recording this game's completion.");
      }
    },
    [game, gameDate],
  );

  async function handleUnlock() {
    setUnlocking(true);
    setAccessError(null);
    try {
      await unlockArchive(gameDate);
      setAccess((current) => (current ? { ...current, allowed: true, requiresUnlock: false, signInRequired: false } : current));
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : "Could not unlock this archive day.");
    } finally {
      setUnlocking(false);
    }
  }

  if (access && !access.allowed) {
    return (
      <div style={{ display: "grid", gap: "1rem" }}>
        <MissionStatusBanner />
        <div className="panel" style={{ display: "grid", gap: "1rem", padding: "1.5rem" }}>
          <div>
            <p className="eyebrow">Archive Access</p>
            <h1 style={{ marginBottom: "0.5rem" }}>Unlock {gameDate} to replay {label}.</h1>
            <p className="muted">
              Past days are replay-only: they do not earn a Data Chip. Unlock this day with a Data Chip, or play a day you
              already completed.
            </p>
          </div>
          {access.signInRequired ? (
            <div className="cta-row">
              <Link
                href={`/auth/sign-in?next=${encodeURIComponent(`/games/${game}?date=${gameDate}`)}`}
                className="button button-primary"
              >
                Sign in to unlock
              </Link>
              <Link href="/calendar" className="button">
                Back to calendar
              </Link>
            </div>
          ) : (
            <div className="cta-row">
              <button className="button button-primary" type="button" onClick={() => void handleUnlock()} disabled={unlocking}>
                {unlocking ? "Unlocking..." : "Unlock Archive Day (-1 Chip)"}
              </button>
              <Link href="/calendar" className="button">
                Back to calendar
              </Link>
            </div>
          )}
          {accessError ? <p className="puzzle-feedback">{accessError}</p> : null}
        </div>
      </div>
    );
  }

  if (completion) {
    return (
      <div style={{ display: "grid", gap: "1rem" }}>
        <MissionStatusBanner />
        <div className="panel puzzle-grain" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <p className="eyebrow">{label} complete</p>
          <h1>Nice work.</h1>
          <p className="muted">Score: {completion.score}%</p>
          {completion.awardedChips > 0 ? <p className="muted">+{completion.awardedChips} Data Chip earned.</p> : null}
          <div className="cta-row">
            <Link href="/games" className="button button-primary">
              Play another game
            </Link>
            <Link href={`/discuss?date=${encodeURIComponent(gameDate)}`} className="button">
              Discuss today&apos;s puzzle
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <MissionStatusBanner />
      {completeError ? <p className="puzzle-feedback">{completeError}</p> : null}
      <GameComponent onMissionComplete={handleComplete} gameDate={gameDate} />
    </div>
  );
}
