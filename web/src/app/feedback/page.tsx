import { FeedbackDesk } from "@/components/pages/feedback/feedback-desk";

export const metadata = { title: "Suggestions Desk — The Daily Transit" };

export default function FeedbackPage() {
  return (
    <main className="panel" style={{ maxWidth: "1180px", margin: "2rem auto", padding: "0 1rem" }}>
      <FeedbackDesk />
    </main>
  );
}
