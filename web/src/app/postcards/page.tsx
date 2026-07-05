import Link from "next/link";
import { createClient } from "@/lib/pocketbase/server";
import { STORYLINES } from "@/lib/storylines";
import { getMelbourneDateKey } from "@/lib/melbourne-date";
import { redirect } from "next/navigation";

export const metadata = { title: "Gallery - The Daily Transit" };

type PlayRow = {
  game_date: string;
  won: boolean;
  score: number | null;
  attempts: number | null;
  played_at: string | null;
};

export default async function PostcardsPage() {
  const pocketbase = await createClient();
  const {
    data: { user },
  } = await pocketbase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=/postcards");
  }

  const [{ data: profile }, { data: plays }] = await Promise.all([
    pocketbase
      .from("profiles")
      .select("completed_storylines, referral_code")
      .eq("id", user.id)
      .single(),
    pocketbase
      .from("daily_plays")
      .select("game_date,won,score,attempts,played_at")
      .eq("user_id", user.id)
      .order("game_date", { ascending: false })
      .limit(18),
  ]);

  const completedIds: string[] = profile?.completed_storylines ?? [];
  const referralCode: string | null = profile?.referral_code ?? null;
  const earned = STORYLINES.filter((storyline) => completedIds.includes(storyline.id));
  const fieldReports = ((plays ?? []) as PlayRow[]).filter((play) => play.game_date);
  const today = getMelbourneDateKey();

  return (
    <main className="gallery-page">
      <header className="gallery-hero panel">
        <div>
          <p className="eyebrow">Your Collection</p>
          <h1>Gallery &amp; History</h1>
          <p className="muted">
            Review completed Daily Transit field reports, reopen archived missions, and keep any earned postcards in one place.
          </p>
        </div>
        <div className="gallery-hero-actions">
          <Link href="/games/today" className="button button-primary">
            {fieldReports.some((play) => play.game_date === today) ? "Review Today" : "Start Today"}
          </Link>
          <Link href="/calendar" className="button">
            Open Archive
          </Link>
        </div>
      </header>

      <section className="gallery-grid" aria-label="Gallery summary">
        <article className="gallery-stat panel">
          <span className="eyebrow">Reports</span>
          <strong>{fieldReports.length}</strong>
          <p className="muted">Recent field reports in your history.</p>
        </article>
        <article className="gallery-stat panel">
          <span className="eyebrow">Postcards</span>
          <strong>{earned.length}</strong>
          <p className="muted">Milestone keepsakes collected so far.</p>
        </article>
        <article className="gallery-stat panel">
          <span className="eyebrow">Access Key</span>
          <strong>{referralCode ?? "None"}</strong>
          <p className="muted">Share code shown after eligible missions.</p>
        </article>
      </section>

      <section className="gallery-section">
        <div className="gallery-section-head">
          <div>
            <p className="eyebrow">History</p>
            <h2>Recent field reports</h2>
          </div>
          <Link href="/calendar" className="button">
            Browse all dates
          </Link>
        </div>

        {fieldReports.length === 0 ? (
          <div className="panel gallery-empty">
            <p>No field reports yet.</p>
            <p className="muted">Complete today&apos;s mission to start building your history.</p>
            <Link href="/games/today" className="button button-primary">
              Start Today&apos;s Mission
            </Link>
          </div>
        ) : (
          <div className="gallery-report-list">
            {fieldReports.map((play) => (
              <Link
                key={`${play.game_date}-${play.played_at ?? "report"}`}
                href={`/games/today?date=${encodeURIComponent(play.game_date)}&returnTo=${encodeURIComponent("/postcards")}`}
                className="gallery-report-card panel"
              >
                <span className="eyebrow">{play.won ? "Filed" : "Attempted"}</span>
                <strong>{play.game_date}</strong>
                <span className="muted">Score {play.score ?? 0} &middot; {play.attempts ?? 1} attempt{play.attempts === 1 ? "" : "s"}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="gallery-section">
        <div className="gallery-section-head">
          <div>
            <p className="eyebrow">Postcards</p>
            <h2>Milestone keepsakes</h2>
          </div>
        </div>

        {earned.length === 0 ? (
          <div className="panel gallery-empty">
            <p>No postcards yet.</p>
            <p className="muted">Postcards appear here after major mission milestones.</p>
          </div>
        ) : (
          <div className="postcard-grid">
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
      </section>
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
    <article className="postcard-card">
      <p className="eyebrow">{storylineTitle}</p>
      <h3>{title}</h3>
      <p>{message}</p>
      {referralCode ? (
        <div className="postcard-code">
          <span className="eyebrow">Access Key</span>
          <code>{referralCode}</code>
        </div>
      ) : null}
    </article>
  );
}
