import Link from "next/link";
import { createClient } from "@/lib/pocketbase/server";
import { getMelbourneDateKey } from "@/lib/melbourne-date";
import { redirect } from "next/navigation";

export const metadata = { title: "Stamps - The Daily Transit" };

type PlayRow = {
  game_date: string;
  game: string | null;
  won: boolean;
  score: number | null;
  played_at: string | null;
};

const GAME_LABELS: Record<string, string> = {
  crossword: "Crossword",
  dsmr: "Transit Spotter",
  close_approach: "Close Approach Ranker",
  cloudspotting_mars: "Cloudspotting on Mars",
};

type Stamp = {
  gameDate: string;
  games: string[];
};

export default async function StampsPage() {
  const pocketbase = await createClient();
  const {
    data: { user },
  } = await pocketbase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=/postcards");
  }

  const [{ data: profile }, { data: plays }] = await Promise.all([
    pocketbase.from("profiles").select("referral_code").eq("shared_user_id", user.id).maybeSingle(),
    pocketbase
      .from("daily_plays")
      .select("game_date,game,won,score,played_at")
      .eq("user_id", user.id)
      .order("game_date", { ascending: false })
      .limit(120),
  ]);

  const referralCode: string | null = profile?.referral_code ?? null;
  const rows = ((plays ?? []) as PlayRow[]).filter((play) => play.game_date);

  // Each day with at least one completed game is a stamp — collect which
  // games were finished on each of those days.
  const stampsByDate = new Map<string, Set<string>>();
  for (const row of rows) {
    if (!row.game) continue;
    const existing = stampsByDate.get(row.game_date) ?? new Set<string>();
    existing.add(row.game);
    stampsByDate.set(row.game_date, existing);
  }
  const stamps: Stamp[] = Array.from(stampsByDate.entries())
    .map(([gameDate, games]) => ({ gameDate, games: Array.from(games) }))
    .sort((a, b) => (a.gameDate < b.gameDate ? 1 : -1));

  const today = getMelbourneDateKey();
  const playedToday = stampsByDate.has(today);

  return (
    <main className="gallery-page">
      <header className="gallery-hero panel">
        <div>
          <p className="eyebrow">Your Collection</p>
          <h1>Stamps</h1>
          <p className="muted">
            One stamp per day — showing which games you completed that day. Reopen an archived day, or keep today&apos;s
            streak going.
          </p>
        </div>
        <div className="gallery-hero-actions">
          <Link href="/games/today" className="button button-primary">
            {playedToday ? "Play Another Game" : "Play Today's Games"}
          </Link>
          <Link href="/calendar" className="button">
            Open Archive
          </Link>
        </div>
      </header>

      <section className="gallery-grid" aria-label="Stamps summary">
        <article className="gallery-stat panel">
          <span className="eyebrow">Stamps</span>
          <strong>{stamps.length}</strong>
          <p className="muted">Days with at least one completed game.</p>
        </article>
        <article className="gallery-stat panel">
          <span className="eyebrow">Games logged</span>
          <strong>{rows.filter((row) => row.game).length}</strong>
          <p className="muted">Total individual game completions.</p>
        </article>
        <article className="gallery-stat panel">
          <span className="eyebrow">Access Key</span>
          <strong>{referralCode ?? "None"}</strong>
          <p className="muted">Share code shown after eligible days.</p>
        </article>
      </section>

      <section className="gallery-section">
        <div className="gallery-section-head">
          <div>
            <p className="eyebrow">History</p>
            <h2>Your stamps</h2>
          </div>
          <Link href="/calendar" className="button">
            Browse all dates
          </Link>
        </div>

        {stamps.length === 0 ? (
          <div className="panel gallery-empty">
            <p>No stamps yet.</p>
            <p className="muted">Complete a game to earn today&apos;s stamp.</p>
            <Link href="/games/today" className="button button-primary">
              Play Today&apos;s Games
            </Link>
          </div>
        ) : (
          <div className="postcard-grid">
            {stamps.map((stamp) => (
              <Link
                key={stamp.gameDate}
                href={`/games/today?date=${encodeURIComponent(stamp.gameDate)}&returnTo=${encodeURIComponent("/postcards")}`}
                className="postcard-card"
              >
                <p className="eyebrow">{stamp.gameDate}</p>
                <h3>
                  {stamp.games.length} of {Object.keys(GAME_LABELS).length} games
                </h3>
                <p>{stamp.games.map((game) => GAME_LABELS[game] ?? game).join(", ")}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
