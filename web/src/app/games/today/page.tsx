import { Suspense } from "react";
import MissionFlowPage from "@/components/pages/games/mission-flow-page";

export default function Page() {
  return (
    <Suspense fallback={<p className="muted" style={{ padding: "1rem" }}>Loading mission…</p>}>
      <MissionFlowPage />
    </Suspense>
  );
}
