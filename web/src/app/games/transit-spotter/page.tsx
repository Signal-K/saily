import { Suspense } from "react";
import StandaloneGamePage from "@/components/pages/games/standalone-game-page";
import TransitSpotterGamePage from "@/components/pages/games/transit-spotter-game-page";

export const metadata = { title: "Transit Spotter - The Daily Transit" };

export default function TransitSpotterPage() {
  return (
    <div className="content-game">
      <Suspense fallback={<p className="muted">Loading transit spotter…</p>}>
        <StandaloneGamePage game="dsmr" label="Transit Spotter" GameComponent={TransitSpotterGamePage} />
      </Suspense>
    </div>
  );
}
