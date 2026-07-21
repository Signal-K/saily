import { Suspense } from "react";
import StandaloneGamePage from "@/components/pages/games/standalone-game-page";
import TransitSpotterGamePage from "@/components/pages/games/transit-spotter-game-page";

export const metadata = { title: "Transit Spotter - The Daily Transit" };

export default function TransitSpotterPage() {
  return (
    <main style={{ maxWidth: "760px", margin: "2rem auto", padding: "0 1rem" }}>
      <Suspense fallback={<p className="muted">Loading transit spotter…</p>}>
        <StandaloneGamePage game="dsmr" label="Transit Spotter" GameComponent={TransitSpotterGamePage} />
      </Suspense>
    </main>
  );
}
