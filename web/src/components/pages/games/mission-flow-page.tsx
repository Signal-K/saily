"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getStorylineForDate, getCharacterForStoryline, getChapterForIndex, getMissionGameOrder, getGameOrderOverrideForDate, isStorylineComplete, type MissionGame, MISSION_GAMES } from "@/lib/mission";
import { MissionBriefing } from "@/components/mission/mission-briefing";
import { NarrativeBeat } from "@/components/mission/narrative-beat";
import { MissionComplete } from "@/components/mission/mission-complete";
import { MissionStatusBanner } from "@/components/mission/mission-status-banner";
import { MissionAmbience } from "@/components/mission/mission-ambience";
import TodayGamePage from "@/components/pages/games/today-game-page";
import AsteroidGamePage from "@/components/pages/games/asteroid-game-page";
import MarsGamePage from "@/components/pages/games/mars-game-page";
import { queueSurveyTrigger } from "@/lib/posthog/survey-queue";
import { trackGameplayEvent } from "@/lib/analytics/events";
import { unlockArchive } from "@/lib/economy";
import { dateKeyToUtcDate } from "@/lib/melbourne-date";
import { resolveGameDate } from "@/lib/game";

type Stage = "loading" | "briefing" | "game" | "beat" | "complete";
type MissionAccess = {
  date: string;
  isToday: boolean;
  allowed: boolean;
  signInRequired: boolean;
  requiresUnlock: boolean;
  completed: boolean;
  unlocked: boolean;
};

const DEFAULT_SCORES: Record<MissionGame, number> = {
  planet: 0,
  asteroid: 0,
  mars: 0,
};

function getContinueLabel(game: MissionGame | undefined) {
  if (game === "planet") return "Continue to Transit Analysis";
  if (game === "asteroid") return "Continue to Asteroid Survey";
  if (game === "mars") return "Continue to Surface Survey";
  return "Continue";
}

function isMissionGame(value: string): value is MissionGame {
  return value === "planet" || value === "asteroid" || value === "mars";
}

export default function MissionFlowPage() {
  const searchParams = useSearchParams();
  const missionDate = resolveGameDate(searchParams.get("date"));
  const storyline = getStorylineForDate(dateKeyToUtcDate(missionDate));
  const character = getCharacterForStoryline(storyline);

  const [stage, setStage] = useState<Stage>("loading");
  const [chapterIndex, setChapterIndex] = useState(0);
  const [gameCursor, setGameCursor] = useState(0);
  const [scores, setScores] = useState<Record<MissionGame, number>>(DEFAULT_SCORES);
  const [endedEarly, setEndedEarly] = useState(false);
  const [awardedChips, setAwardedChips] = useState(0);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [access, setAccess] = useState<MissionAccess | null>(null);
  const [unlockingArchive, setUnlockingArchive] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  // Fetch user's current chapter for this storyline.
  useEffect(() => {
    async function loadProgress() {
      try {
        const gameRes = await fetch(`/api/game/today?date=${encodeURIComponent(missionDate)}`, {
          cache: "no-store",
        });
        if (gameRes.ok) {
          const gamePayload = (await gameRes.json()) as { access?: MissionAccess };
          setAccess(gamePayload.access ?? null);
        } else {
          console.error("Failed to load mission access:", await gameRes.text());
        }

        const res = await fetch(`/api/story/progress?storylineId=${storyline.id}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const payload = (await res.json()) as { chapterIndex?: number };
          setChapterIndex(payload.chapterIndex ?? 0);
        } else {
          // If 401/unauthenticated, we just stay at chapter 0 silently.
          if (res.status !== 401) {
            console.error("Failed to load story progress:", await res.text());
          }
        }
      } catch (err) {
        console.error("Network error during mission initialization:", err);
      }
      setStage("briefing");
    }
    void loadProgress();
  }, [storyline.id, missionDate]);

  const chapter = getChapterForIndex(storyline, chapterIndex);
  const chapterNumber = Math.min(chapterIndex + 1, storyline.chapters.length);
  const totalChapters = storyline.chapters.length;
  const dateOverride = getGameOrderOverrideForDate(missionDate);
  const baseGameOrder = dateOverride ?? getMissionGameOrder(storyline.id, chapterIndex);
  const gameOrderOverride = searchParams
    .get("gameOrder")
    ?.split(",")
    .map((value) => value.trim())
    .filter(isMissionGame)
    .filter((g) => MISSION_GAMES.includes(g));
  // Allow e2e tests to pin the first game via ?firstGame=planet|asteroid|mars
  const firstGameParam = searchParams.get("firstGame");
  const firstGameOverride = firstGameParam && isMissionGame(firstGameParam) && MISSION_GAMES.includes(firstGameParam) ? firstGameParam : null;
  const gameOrder: MissionGame[] = firstGameOverride
    ? [firstGameOverride, ...baseGameOrder.filter((g) => g !== firstGameOverride)].slice(0, 3)
    : gameOrderOverride && new Set(gameOrderOverride).size === 3
      ? gameOrderOverride.slice(0, 3)
      : baseGameOrder;
  const activeGame = gameOrder[gameCursor];
  const totalScore = Object.values(scores).reduce((sum, value) => sum + value, 0);

  async function handleGameComplete(result: { score: number; terminatedEarly?: boolean }) {
    if (!activeGame) return;
    setScores((prev) => ({ ...prev, [activeGame]: result.score }));

    if (result.terminatedEarly) {
      setEndedEarly(true);
      setStage("complete");
      return;
    }

    if (gameCursor < gameOrder.length - 1) {
      setStage("beat");
      return;
    }

    if (access?.isToday ?? true) {
      try {
        // Record the daily play and update streak/stats for the full mission.
        const completedPuzzles = gameOrder.length;
        const res = await fetch("/api/game/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completedPuzzles, date: missionDate }),
        });
        if (!res.ok) {
          console.error("Failed to record daily game completion:", await res.text());
        }
      } catch (err) {
        console.error("Network error recording daily game completion:", err);
      }

      try {
        const res = await fetch("/api/story/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storylineId: storyline.id, action: "complete-chapter" }),
        });
        if (res.ok) {
          const payload = (await res.json()) as { awardedChips?: number; referralCode?: string };
          setAwardedChips(payload.awardedChips ?? 0);
          setReferralCode(payload.referralCode ?? null);
        } else {
          console.error("Failed to advance story progress:", await res.text());
        }
      } catch (err) {
        console.error("Network error advancing story progress:", err);
      }
    }

    queueSurveyTrigger({
      source: "narrative_flow",
      version: process.env.NEXT_PUBLIC_APP_VERSION?.trim() || "v1",
      score: result.score,
    });
    trackGameplayEvent("narrative_flow_completed", {
      storyline_id: storyline.id,
      chapter_index: chapterIndex,
      score: result.score,
    });
    setStage("complete");
  }

  function renderActiveGame() {
    if (activeGame === "planet") {
      return <TodayGamePage onMissionComplete={handleGameComplete} gameDate={missionDate} />;
    }
    if (activeGame === "asteroid") {
      return <AsteroidGamePage onMissionComplete={(score) => handleGameComplete({ score })} gameDate={missionDate} />;
    }
    if (activeGame === "mars") {
      return <MarsGamePage onMissionComplete={(score) => handleGameComplete({ score })} gameDate={missionDate} />;
    }
    return null;
  }

  if (stage === "loading") {
    return (
      <div className="mission-flow-shell">
        <MissionStatusBanner />
        <div className="panel" style={{ textAlign: "center", padding: "2rem" }}>
          <p className="muted">Preparing your mission...</p>
        </div>
      </div>
    );
  }

  async function handleArchiveUnlock() {
    setUnlockingArchive(true);
    setAccessError(null);
    try {
      await unlockArchive(missionDate);
      queueSurveyTrigger({
        source: "archive_unlock",
        version: process.env.NEXT_PUBLIC_APP_VERSION?.trim() || "v1",
        gameDate: missionDate,
      });
      setAccess((current) =>
        current
          ? {
              ...current,
              allowed: true,
              unlocked: true,
              requiresUnlock: false,
              signInRequired: false,
            }
          : null,
      );
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : "Could not unlock archive day.");
    } finally {
      setUnlockingArchive(false);
    }
  }

  if (access && !access.allowed) {
    return (
      <div className="mission-flow-shell">
        <MissionStatusBanner />
        <div className="panel" style={{ display: "grid", gap: "1rem" }}>
          <div>
            <p className="eyebrow">Archive Access</p>
            <h1 style={{ marginBottom: "0.5rem" }}>Unlock {missionDate} to replay it.</h1>
            <p className="muted">
              Past missions do not award score or advance the live storyline. Unlock this day with a Data Chip, or open a day you already completed.
            </p>
          </div>
          {access.signInRequired ? (
            <div className="cta-row">
              <Link href={`/auth/sign-in?next=${encodeURIComponent(`/games/today?date=${missionDate}`)}`} className="button button-primary">
                Sign in to unlock
              </Link>
              <Link href="/calendar" className="button">
                Back to calendar
              </Link>
            </div>
          ) : (
            <div className="cta-row">
              <button className="button button-primary" type="button" onClick={() => void handleArchiveUnlock()} disabled={unlockingArchive}>
                {unlockingArchive ? "Unlocking..." : "Unlock Archive Day (-1 Chip)"}
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

  let content: React.ReactNode;
  if (stage === "briefing") {
    content = (
      <MissionBriefing
        character={character}
        chapter={chapter}
        storylineTitle={storyline.title}
        chapterNumber={chapterNumber}
        totalChapters={totalChapters}
        onBegin={() => {
          setGameCursor(0);
          setScores(DEFAULT_SCORES);
          setEndedEarly(false);
          setStage("game");
        }}
      />
    );
  } else if (stage === "game") {
    content = renderActiveGame();
  } else if (stage === "beat" && gameCursor === 0) {
    content = (
        <NarrativeBeat
        character={character}
        text={chapter.beat1}
        expression={chapter.beat1Expression}
        continueLabel={getContinueLabel(gameOrder[1])}
        onContinue={() => {
          setGameCursor(1);
          setStage("game");
        }}
      />
    );
  } else if (stage === "beat") {
    content = (
        <NarrativeBeat
        character={character}
        text={chapter.beat2}
        expression={chapter.beat2Expression}
        continueLabel={getContinueLabel(gameOrder[2])}
        onContinue={() => {
          setGameCursor(2);
          setStage("game");
        }}
      />
    );
  } else {
    content = (
      <MissionComplete
        character={character}
        chapter={chapter}
        score={totalScore}
        isStorylineComplete={(access?.isToday ?? true) && isStorylineComplete(storyline, chapterIndex + 1)}
        storylineTitle={storyline.title}
        postcardTitle={storyline.postcardTitle}
        postcardMessage={storyline.postcardMessage}
        endedEarly={endedEarly}
        awardedChips={awardedChips}
        referralCode={referralCode}
      />
    );
  }

  return (
    <div className="mission-flow-shell">
      <MissionStatusBanner />
      <MissionAmbience type={chapter.ambience ?? "none"} />
      {content}
    </div>
  );
}
