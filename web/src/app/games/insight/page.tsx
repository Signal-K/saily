import { Suspense } from "react";
import InSightGamePage from "@/components/pages/games/insight-game-page";

export default function Page() {
  return (
    <Suspense fallback={<p className="muted" style={{ padding: "1rem" }}>Loading…</p>}>
      <InSightGamePage />
    </Suspense>
  );
}
