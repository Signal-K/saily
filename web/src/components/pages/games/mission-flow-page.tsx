"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getStorylineForDate, getCharacterForStoryline, getChapterForIndex, getMissionGameOrder, isStorylineComplete, type MissionGame } from "@/lib/mission";
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

type Stage = "loading" | "briefing" | "game" | "beat" | "complete";

export default function MissionFlowPage() {
  const storyline = getStorylineForDate(new Date());
  const character = getCharacterForStoryline(storyline);
  const searchParams = useSearchParams();

  const [stage, setStage] = useState<Stage>("loading");
  const [chapterIndex, setChapterIndex] = useState(0);
  const [gameCursor, setGameCursor] = useState(0);
  const [scores, setScores] = useState<Record<MissionGame, number>>({
    planet: 0,
    asteroid: 0,
    mars: 0,
  });
  const [endedEarly, setEndedEarly] = useState(false);
  const [awardedChips, setAwardedChips] = useState(0);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Fetch user's current chapter for this storyline.
  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch(`/api/story/progress?storylineId=${storyline.id}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const payload = (await res.json()) as { chapterIndex?: number };
          setChapterIndex(payload.chapterIndex ?? 0);
        }
      } catch {
        // Unauthenticated or network error — start at chapter 0.
      }
      setStage("briefing");
    }
    void loadProgress();
  }, [storyline.id]);

  const chapter = getChapterForIndex(storyline, chapterIndex);
  const chapterNumber = Math.min(chapterIndex + 1, storyline.chapters.length);
  const totalChapters = storyline.chapters.length;
  const baseGameOrder = getMissionGameOrder(storyline.id, chapterIndex);
  // Allow e2e tests to pin the first game via ?firstGame=planet|asteroid|mars
  const firstGameOverride = searchParams.get("firstGame") as MissionGame | null;
  const gameOrder: MissionGame[] = firstGameOverride
    ? [firstGameOverride, ...baseGameOrder.filter((g) => g !== firstGameOverride)]
    : baseGameOrder;
  const activeGame = gameOrder[gameCursor];
  const totalScore = Object.values(scores).reduce((sum, value) => sum + value, 0);

  async function handleGameComplete(score: number) {
    if (!activeGame) return;
    setScores((prev) => ({ ...prev, [activeGame]: score }));

    if (gameCursor < 2) {
      setStage("beat");
      return;
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
      }
    } catch {
      // Non-fatal — progress still shows complete UI.
    }

    queueSurveyTrigger({
      source: "narrative_flow",
      version: process.env.NEXT_PUBLIC_APP_VERSION?.trim() || "v1",
      score,
    });
    trackGameplayEvent("narrative_flow_completed", {
      storyline_id: storyline.id,
      chapter_index: chapterIndex,
      score,
    });
    setStage("complete");
  }

  function handlePlanetComplete(result: { score: number; terminatedEarly?: boolean }) {
    setScores((prev) => ({ ...prev, planet: result.score }));
    if (result.terminatedEarly) {
      setEndedEarly(true);
      setStage("complete");
      return;
    }
    setEndedEarly(false);
    setStage("beat");
  }

  function renderActiveGame() {
    if (activeGame === "planet") {
      return <TodayGamePage onMissionComplete={handlePlanetComplete} />;
    }
    if (activeGame === "asteroid") {
      return <AsteroidGamePage onMissionComplete={handleGameComplete} />;
    }
    return <MarsGamePage onMissionComplete={handleGameComplete} />;
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
          setScores({ planet: 0, asteroid: 0, mars: 0 });
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
        continueLabel="Continue to Asteroid Survey"
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
        isStorylineComplete={isStorylineComplete(storyline, chapterIndex + 1)}
        storylineTitle={storyline.title}
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
