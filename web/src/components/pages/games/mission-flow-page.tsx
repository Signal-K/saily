"use client";

import { useEffect, useState } from "react";
import { getStorylineForDate, getCharacterForStoryline, getChapterForIndex, isStorylineComplete } from "@/lib/mission";
import { MissionBriefing } from "@/components/mission/mission-briefing";
import { NarrativeBeat } from "@/components/mission/narrative-beat";
import { MissionComplete } from "@/components/mission/mission-complete";
import TodayGamePage from "@/components/pages/games/today-game-page";
import AsteroidGamePage from "@/components/pages/games/asteroid-game-page";
import MarsGamePage from "@/components/pages/games/mars-game-page";

type Stage =
  | "loading"
  | "briefing"
  | "game-1"
  | "beat-1"
  | "game-2"
  | "beat-2"
  | "game-3"
  | "complete";

export default function MissionFlowPage() {
  const storyline = getStorylineForDate(new Date());
  const character = getCharacterForStoryline(storyline);

  const [stage, setStage] = useState<Stage>("loading");
  const [chapterIndex, setChapterIndex] = useState(0);
  const [scores, setScores] = useState({ game1: 0, game2: 0, game3: 0 });

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
  const totalScore = scores.game1 + scores.game2 + scores.game3;

  function handleGame1Complete(score: number) {
    setScores((prev) => ({ ...prev, game1: score }));
    setStage("beat-1");
  }

  function handleGame2Complete(score: number) {
    setScores((prev) => ({ ...prev, game2: score }));
    setStage("beat-2");
  }

  async function handleGame3Complete(score: number) {
    setScores((prev) => ({ ...prev, game3: score }));

    // Increment chapter progress.
    try {
      await fetch("/api/story/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storylineId: storyline.id, action: "complete-chapter" }),
      });
    } catch {
      // Non-fatal — progress still shows complete UI.
    }

    setStage("complete");
  }

  if (stage === "loading") {
    return (
      <div className="panel" style={{ textAlign: "center", padding: "2rem" }}>
        <p className="muted">Preparing your mission…</p>
      </div>
    );
  }

  if (stage === "briefing") {
    return (
      <MissionBriefing
        character={character}
        chapter={chapter}
        storylineTitle={storyline.title}
        chapterNumber={chapterNumber}
        totalChapters={totalChapters}
        onBegin={() => setStage("game-1")}
      />
    );
  }

  if (stage === "game-1") {
    return <TodayGamePage onMissionComplete={handleGame1Complete} />;
  }

  if (stage === "beat-1") {
    return (
      <NarrativeBeat
        character={character}
        text={chapter.beat1}
        gameLabel="Planet Hunters"
        nextGameLabel="Asteroid Survey"
        onContinue={() => setStage("game-2")}
      />
    );
  }

  if (stage === "game-2") {
    return <AsteroidGamePage onMissionComplete={handleGame2Complete} />;
  }

  if (stage === "beat-2") {
    return (
      <NarrativeBeat
        character={character}
        text={chapter.beat2}
        gameLabel="Asteroid Survey"
        nextGameLabel="Surface Classification"
        onContinue={() => setStage("game-3")}
      />
    );
  }

  if (stage === "game-3") {
    return <MarsGamePage onMissionComplete={(s) => void handleGame3Complete(s)} />;
  }

  // complete
  return (
    <MissionComplete
      character={character}
      chapter={chapter}
      score={totalScore}
      isStorylineComplete={isStorylineComplete(storyline, chapterIndex + 1)}
      storylineTitle={storyline.title}
    />
  );
}
