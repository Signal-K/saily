import { Suspense } from "react";
import StandaloneGamePage from "@/components/pages/games/standalone-game-page";
import CloseApproachRankerGamePage from "@/components/pages/games/close-approach-ranker-game-page";

export const metadata = { title: "Close Approach Ranker - The Daily Transit" };

export default function CloseApproachesPage() {
  return (
    <div className="content-game">
      <Suspense fallback={<p className="muted">Loading close approach ranker…</p>}>
        <StandaloneGamePage game="close_approach" label="Close Approach Ranker" GameComponent={CloseApproachRankerGamePage} />
      </Suspense>
    </div>
  );
}
