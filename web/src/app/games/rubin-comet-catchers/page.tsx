import { Suspense } from "react";
import RubinCometCatchersGamePage from "@/components/pages/games/rubin-comet-catchers-game-page";

export default function Page() {
  return (
    <Suspense fallback={<p className="muted" style={{ padding: "1rem" }}>Loading…</p>}>
      <RubinCometCatchersGamePage />
    </Suspense>
  );
}
