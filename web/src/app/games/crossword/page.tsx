import { Suspense } from "react";
import StandaloneGamePage from "@/components/pages/games/standalone-game-page";
import CrosswordGamePage from "@/components/pages/games/crossword-game-page";

export const metadata = { title: "Crossword - The Daily Transit" };

export default function CrosswordPage() {
  return (
    <main style={{ maxWidth: "760px", margin: "2rem auto", padding: "0 1rem" }}>
      <Suspense fallback={<p className="muted">Loading crossword…</p>}>
        <StandaloneGamePage game="crossword" label="Crossword" GameComponent={CrosswordGamePage} />
      </Suspense>
    </main>
  );
}
