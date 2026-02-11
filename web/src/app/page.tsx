import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type BadgeRef = {
  name: string;
  slug: string;
  description: string;
};

type CommentRow = {
  id: number;
  game_date: string;
  body: string;
  created_at: string;
  profiles: { username: string | null } | { username: string | null }[] | null;
};

function getUsername(value: CommentRow["profiles"]) {
  if (!value) return "player";
  if (Array.isArray(value)) return value[0]?.username ?? "player";
  return value.username ?? "player";
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [statsRes, badgesRes, playsRes, commentsRes] = await Promise.all([
    user
      ? supabase.from("user_stats").select("games_played,wins,current_streak,best_streak,total_score").eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("user_badges")
          .select("awarded_at,badges(name,slug,description)")
          .eq("user_id", user.id)
          .order("awarded_at", { ascending: false })
          .limit(6)
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from("daily_plays").select("game_date,won,score,attempts,played_at").eq("user_id", user.id).order("played_at", { ascending: false }).limit(8)
      : Promise.resolve({ data: [] }),
    supabase.from("comments").select("id,game_date,body,created_at,profiles(username)").order("created_at", { ascending: false }).limit(8),
  ]);

  const stats = statsRes.data;
  const badges = (badgesRes.data ?? []).map((row) => (Array.isArray(row.badges) ? row.badges[0] : row.badges)).filter(Boolean) as BadgeRef[];
  const plays = playsRes.data ?? [];
  const comments = (commentsRes.data ?? []) as CommentRow[];

  return (
    <section className="home-dashboard">
      <div className="hero">
        <p className="eyebrow">Daily Puzzle Hub</p>
        <h1>{user ? "Your command center" : "One game a day. Keep your streak alive."}</h1>
        <p>
          {user
            ? "Track your progress, check your inventory, review recent scores, and jump straight into today's challenge."
            : "Play daily puzzles, build streaks, and share progress with the community."}
        </p>
        <div className="cta-row">
          <Link href="/games/today" className="button button-primary">
            Play Today&apos;s Game
          </Link>
          <Link href={user ? "/profile" : "/auth/sign-in"} className="button">
            {user ? "View Profile" : "Sign in"}
          </Link>
        </div>
      </div>

      {user ? (
        <>
          <section className="home-section panel">
            <h2>Progress + Scores</h2>
            <div className="home-stats-grid">
              <article className="card">
                <h3>Games</h3>
                <p>{stats?.games_played ?? 0}</p>
              </article>
              <article className="card">
                <h3>Wins</h3>
                <p>{stats?.wins ?? 0}</p>
              </article>
              <article className="card">
                <h3>Streak</h3>
                <p>{stats?.current_streak ?? 0}</p>
              </article>
              <article className="card">
                <h3>Total Score</h3>
                <p>{stats?.total_score ?? 0}</p>
              </article>
            </div>
          </section>

          <section className="home-grid-two">
            <article className="panel home-section">
              <h2>Inventory</h2>
              {badges.length ? (
                <div className="home-badge-grid">
                  {badges.map((badge) => (
                    <div className="card" key={badge.slug}>
                      <h3>{badge.name}</h3>
                      <p>{badge.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted">No inventory items yet. Finish games and engage in discuss to unlock badges.</p>
              )}
            </article>

            <article className="panel home-section">
              <h2>Recent Results</h2>
              {plays.length ? (
                <ul className="home-list">
                  {plays.map((play) => (
                    <li key={`${play.game_date}-${play.played_at}`} className="home-list-item">
                      <span>{play.game_date}</span>
                      <span>{play.won ? "Won" : "Played"}</span>
                      <span>Score {play.score}</span>
                      <span>{play.attempts} attempts</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No game history yet.</p>
              )}
            </article>
          </section>
        </>
      ) : null}

      <section className="panel home-section">
        <h2>Community Feed</h2>
        {comments.length ? (
          <ul className="home-list">
            {comments.map((comment) => (
              <li key={comment.id} className="home-feed-item">
                <p>
                  <strong>@{getUsername(comment.profiles)}</strong> on {comment.game_date}
                </p>
                <p>{comment.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No feed activity yet.</p>
        )}
      </section>
    </section>
  );
}
