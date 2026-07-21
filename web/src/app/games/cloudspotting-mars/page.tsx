import { Suspense } from "react";
import StandaloneGamePage from "@/components/pages/games/standalone-game-page";
import CloudspottingMarsGamePage from "@/components/pages/games/cloudspotting-mars-game-page";

export const metadata = { title: "Cloudspotting on Mars - The Daily Transit" };

export default function CloudspottingMarsPage() {
  return (
    <main style={{ maxWidth: "760px", margin: "2rem auto", padding: "0 1rem" }}>
      <Suspense fallback={<p className="muted">Loading Cloudspotting on Mars…</p>}>
        <StandaloneGamePage game="cloudspotting_mars" label="Cloudspotting on Mars" GameComponent={CloudspottingMarsGamePage} />
      </Suspense>
    </main>
  );
}
