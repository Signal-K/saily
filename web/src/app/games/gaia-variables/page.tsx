import { Suspense } from "react";
import GaiaVariablesGamePage from "@/components/pages/games/gaia-variables-game-page";

export default function Page() {
  return (
    <Suspense fallback={<p className="muted" style={{ padding: "1rem" }}>Loading…</p>}>
      <GaiaVariablesGamePage />
    </Suspense>
  );
}
