"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resolveGameDate } from "@/lib/game";
import { unlockArchive } from "@/lib/economy";
import { MissionStatusBanner } from "@/components/mission/mission-status-banner";
import type { MissionGame } from "@/lib/mission";

type GameAccess = { allowed: boolean; signInRequired: boolean; requiresUnlock: boolean };
type CompletedGame = { game: string; score: number };

const GAME_CARDS: { game: MissionGame; href: string; title: string }[] = [
  { game: "crossword", href: "/games/crossword", title: "Crossword" },
  { game: "dsmr", href: "/games/transit-spotter", title: "Transit Spotter" },
  { game: "close_approach", href: "/games/close-approaches", title: "Close Approach Ranker" },
  { game: "cloudspotting_mars", href: "/games/cloudspotting-mars", title: "Cloudspotting on Mars" },
];

// Games are independent — this hub just shows which of today's (or an
// archived day's) games are done and links to each one directly. There is
// no chained mission and no shared narrative; every game earns its own Data
// Chip on completion.
export default function DailyGamesHubPage() {
  const searchParams = useSearchParams();
  const gameDate = resolveGameDate(searchParams.get("date"));

  const [access, setAccess] = useState<GameAccess | null>(null);
  const [completedGames, setCompletedGames] = useState<CompletedGame[]>([]);
  const [unlocking, setUnlocking] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/game/today?date=${encodeURIComponent(gameDate)}`, { cache: "no-store" });
        const payload = (await res.json().catch(() => ({}))) as { access?: GameAccess; completedGames?: CompletedGame[] };
        if (cancelled) return;
        setAccess(payload.access ?? { allowed: true, signInRequired: false, requiresUnlock: false });
        setCompletedGames(payload.completedGames ?? []);
      } catch {
        if (!cancelled) setAccess({ allowed: true, signInRequired: false, requiresUnlock: false });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [gameDate]);

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
      <div className="mission-flow-shell">
        <MissionStatusBanner />
        <div className="panel" style={{ display: "grid", gap: "1rem", padding: "1.5rem" }}>
          <div>
            <p className="eyebrow">Archive Access</p>
            <h1 style={{ marginBottom: "0.5rem" }}>Unlock {gameDate} to replay it.</h1>
            <p className="muted">
              Past days are replay-only: they do not earn Data Chips. Unlock this day with a Data Chip, or open a day you
              already completed.
            </p>
          </div>
          {access.signInRequired ? (
            <div className="cta-row">
              <Link href={`/auth/sign-in?next=${encodeURIComponent(`/games/today?date=${gameDate}`)}`} className="button button-primary">
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

  const completedGameIds = new Set(completedGames.map((row) => row.game));

  return (
    <div className="mission-flow-shell">
      <MissionStatusBanner />
      <div className="panel" style={{ padding: "1.5rem", display: "grid", gap: "1.25rem" }}>
        <div>
          <p className="eyebrow">{gameDate}</p>
          <h1 style={{ margin: "0 0 0.5rem" }}>Today&apos;s games</h1>
          <p className="muted">
            Each game is independent — play any of them, in any order. Completing one earns a Data Chip.
          </p>
        </div>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          {GAME_CARDS.map((card) => {
            const isDone = completedGameIds.has(card.game);
            return (
              <Link
                key={card.game}
                href={`${card.href}?date=${encodeURIComponent(gameDate)}`}
                className="panel"
                style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span>{card.title}</span>
                <span className="muted">{isDone ? "Done ✓" : "Play →"}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
