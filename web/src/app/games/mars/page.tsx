import { Suspense } from "react";
import MarsGamePage from "@/components/pages/games/mars-game-page";

export default function Page() {
  return (
    <Suspense fallback={<p className="muted" style={{ padding: "1rem" }}>Loading…</p>}>
      <MarsGamePage />
    </Suspense>
  );
}
