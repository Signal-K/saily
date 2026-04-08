import { createClient } from "@/lib/supabase/server";
import { STORYLINES } from "@/lib/storylines";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = { title: "Postcards — Saily" };

export default async function PostcardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=/postcards");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("completed_storylines, referral_code")
    .eq("id", user.id)
    .single();

  const completedIds: string[] = profile?.completed_storylines ?? [];
  const referralCode: string | null = profile?.referral_code ?? null;

  const earned = STORYLINES.filter((s) => completedIds.includes(s.id));

  return (
    <main style={{ maxWidth: "640px", margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <p className="eyebrow">Your Collection</p>
        <h1>Postcards</h1>
        <p className="muted">Earned by completing a full story arc.</p>
      </div>

      {earned.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "2rem" }}>
          <p>No postcards yet.</p>
          <p className="muted" style={{ marginTop: "0.5rem" }}>Complete a 5-chapter story arc to earn your first one.</p>
          <div style={{ marginTop: "1rem" }}>
            <Link href="/games/today" className="button button-primary">Start Today&apos;s Mission</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {earned.map((storyline) => (
            <PostcardCard
              key={storyline.id}
              title={storyline.postcardTitle}
              message={storyline.postcardMessage}
              storylineTitle={storyline.title}
              referralCode={referralCode}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <Link href="/" className="button">Back to Home</Link>
      </div>
    </main>
  );
}

function PostcardCard({
  title,
  message,
  storylineTitle,
  referralCode,
}: {
  title: string;
  message: string;
  storylineTitle: string;
  referralCode: string | null;
}) {
  return (
    <div
      style={{
        background: "#fff9f2",
        color: "#43302b",
        padding: "1.5rem",
        borderRadius: "0.5rem",
        border: "1px solid #e5d5c5",
        boxShadow: "2px 2px 0 #e5d5c5",
      }}
    >
      <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.7, marginBottom: "0.25rem" }}>
        {storylineTitle}
      </p>
      <h2 style={{ margin: "0 0 0.75rem", fontFamily: "var(--font-brand)", fontSize: "1.25rem" }}>{title}</h2>
      <p style={{ fontFamily: "var(--font-handwritten, cursive)", fontSize: "1.05rem", lineHeight: 1.5, margin: "0 0 1rem" }}>
        {message}
      </p>
      {referralCode && (
        <div style={{ background: "rgba(0,0,0,0.05)", padding: "0.75rem 1rem", borderRadius: "0.25rem" }}>
          <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.7, margin: "0 0 0.25rem" }}>
            Your Referral Code
          </p>
          <code style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "0.1em" }}>{referralCode}</code>
        </div>
      )}
    </div>
  );
}
