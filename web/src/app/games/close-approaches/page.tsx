import CloseApproachRankerGamePage from "@/components/pages/games/close-approach-ranker-game-page";

export const metadata = { title: "Close Approach Ranker - The Daily Transit" };

export default function CloseApproachesPage() {
  return (
    <main style={{ maxWidth: "760px", margin: "2rem auto", padding: "0 1rem" }}>
      <CloseApproachRankerGamePage />
    </main>
  );
}
