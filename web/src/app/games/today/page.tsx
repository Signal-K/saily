import { Suspense } from "react";
import DailyGamesHubPage from "@/components/pages/games/daily-games-hub-page";

export default function Page() {
  return (
    <Suspense fallback={<p className="muted" style={{ padding: "1rem" }}>Loading today&apos;s games…</p>}>
      <DailyGamesHubPage />
    </Suspense>
  );
}
