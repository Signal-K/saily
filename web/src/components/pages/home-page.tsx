import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getStorylineForDate, getCharacterForStoryline } from "@/lib/mission";
import { getRobotAvatarDataUri } from "@/lib/avatar";

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

function truncateText(text: string, maxLength = 120) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function getMissionStatusLabel(streak: number | null | undefined, chips: number | null | undefined) {
  if ((streak ?? 0) >= 7) return "Stable";
  if ((chips ?? 0) > 0) return "Ready";
  return "Standby";
}

export default async function Home() {
  const supabase = await createClient();
  const todayStoryline = getStorylineForDate(new Date());
  const todayCharacter = getCharacterForStoryline(todayStoryline);
  const todayAvatarSrc = getRobotAvatarDataUri(todayCharacter.avatarSeed, 64);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profileRes, statsRes, badgesRes, playsRes, commentsRes] = await Promise.all([
    user
      ? supabase.from("profiles").select("data_chips").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase.from("user_stats").select("games_played,wins,current_streak,best_streak,total_score").eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("user_badges")
          .select("awarded_at,badges(name,slug,description)")
          .eq("user_id", user.id)
          .order("awarded_at", { ascending: false })
          .limit(4)
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from("daily_plays").select("game_date,won,score,attempts,played_at").eq("user_id", user.id).order("played_at", { ascending: false }).limit(5)
      : Promise.resolve({ data: [] }),
    supabase.from("comments").select("id,game_date,body,created_at,profiles(username)").order("created_at", { ascending: false }).limit(5),
  ]);

  const profile = profileRes.data;
  const stats = statsRes.data;
  const badges = (badgesRes.data ?? []).map((row) => (Array.isArray(row.badges) ? row.badges[0] : row.badges)).filter(Boolean) as BadgeRef[];
  const plays = playsRes.data ?? [];
  const comments = (commentsRes.data ?? []) as CommentRow[];
  const missionStatus = getMissionStatusLabel(stats?.current_streak, profile?.data_chips);
  const missionBars = [stats?.current_streak ?? 0, profile?.data_chips ?? 0, stats?.wins ?? 0, badges.length];

  return (
    <section className="home-dashboard">
      <section className="home-console-shell hero hero-mission">
        <div className="home-console-grid">
          <div className="home-console-primary">
            <div className="home-console-kicker-row">
              <p className="eyebrow">Orbital Console</p>
              <span className={`home-console-status is-${missionStatus.toLowerCase()}`}>{missionStatus}</span>
            </div>
            <div className="home-mission-header">
              <Image
                src={todayAvatarSrc}
                alt={todayCharacter.name}
                width={56}
                height={56}
                unoptimized
                className="home-mission-avatar"
              />
              <div>
                <h1>{todayStoryline.title}</h1>
                <p className="muted">{todayCharacter.name} &middot; {todayCharacter.occupation}</p>
              </div>
            </div>
            <p className="home-mission-desc">Help {todayCharacter.name} solve today&apos;s mystery by classifying real space data.</p>
            <div className="cta-row">
              <Link href="/games/today" className="button button-primary button-full">
                Start Today&apos;s Mission
              </Link>
              <Link href="/calendar" className="button">
                Archive
              </Link>
              <Link href="/discuss" className="button">
                Discuss
              </Link>
            </div>
          </div>

          <div className="home-console-side">
            <div className="home-console-panel">
              <div className="home-console-panel-head">
                <span>Signal Board</span>
                <small>live</small>
              </div>
              <div className="home-signal-bars" aria-hidden>
                {missionBars.map((value, idx) => (
                  <span key={`${value}-${idx}`} style={{ height: `${24 + Math.min(44, value * 6)}px` }} />
                ))}
              </div>
              <div className="home-console-readout">
                <span>Streak {stats?.current_streak ?? 0}</span>
                <span className="home-readout-chips">
                  <Image src="/assets/data-chip.svg" alt="" width={16} height={16} />
                  <span>Chips {profile?.data_chips ?? 0}</span>
                </span>
              </div>
            </div>
            <div className="home-console-panel">
              <div className="home-console-panel-head">
                <span>Mission Links</span>
                <small>quick</small>
              </div>
              <div className="home-console-links">
                <Link href={user ? "/profile" : "/auth/sign-in"} className="home-console-link">
                  {user ? "Profile" : "Sign in"}
                </Link>
                <Link href="/search" className="home-console-link">
                  Search
                </Link>
                <Link href="/games/asteroids" className="home-console-link">
                  Asteroids
                </Link>
                <Link href="/games/mars" className="home-console-link">
                  Mars
                </Link>
                <Link href="/games/insight" className="home-console-link">
                  Weather Desk
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="home-games-row">
        <Link href="/games/today" className="home-game-card">
          <span className="home-game-icon" aria-hidden>◌</span>
          <span className="home-game-label">Transit Scan</span>
        </Link>
        <Link href="/games/asteroids" className="home-game-card">
          <span className="home-game-icon" aria-hidden>◫</span>
          <span className="home-game-label">Ice Mapping</span>
        </Link>
        <Link href="/games/mars" className="home-game-card">
          <span className="home-game-icon" aria-hidden>◎</span>
          <span className="home-game-label">Surface Tags</span>
        </Link>
        <Link href="/games/insight" className="home-game-card">
          <span className="home-game-icon" aria-hidden>≋</span>
          <span className="home-game-label">Weather Desk</span>
        </Link>
      </div>

      {/* ── Signed-in user sections ─────────────────────────────────── */}
      {user ? (
        <>
          {/* Stats */}
          <section className="panel home-section" aria-label="Your stats">
            <h2>Stats</h2>
            <div className="home-stats-grid">
              <article className="card">
                <h3>Chips</h3>
                <p>{profile?.data_chips ?? 0}</p>
              </article>
              <article className="card">
                <h3>Streak</h3>
                <p>{stats?.current_streak ?? 0}</p>
              </article>
              <article className="card">
                <h3>Score</h3>
                <p>{stats?.total_score ?? 0}</p>
              </article>
              <article className="card">
                <h3>Wins</h3>
                <p>{stats?.wins ?? 0}</p>
              </article>
            </div>
          </section>

          {/* Badges + recent results side by side */}
          <div className="home-grid-two">
            <article className="panel home-section" aria-label="Badges">
              <h2>Badges</h2>
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
                <p className="muted">Complete missions to unlock badges.</p>
              )}
            </article>

            <article className="panel home-section" aria-label="Recent games">
              <h2>Recent</h2>
              {plays.length ? (
                <ul className="home-list">
                  {plays.map((play) => (
                    <li key={`${play.game_date}-${play.played_at}`} className="home-list-item">
                      <span className="home-result-date">{play.game_date}</span>
                      <span className={`home-result-status ${play.won ? "is-win" : "is-played"}`}>{play.won ? "Won" : "Played"}</span>
                      <span className="home-result-meta">
                        Score {play.score} &middot; {play.attempts} tries
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No games yet.</p>
              )}
            </article>
          </div>
        </>
      ) : null}

      {/* ── Community feed ──────────────────────────────────────────── */}
      <section className="panel home-section" aria-label="Community feed">
        <h2>Community</h2>
        {comments.length ? (
          <ul className="home-list">
            {comments.map((comment) => (
              <li key={comment.id} className="home-feed-item">
                <p>
                  <strong>@{getUsername(comment.profiles)}</strong>{" "}
                  <span className="muted">on {comment.game_date}</span>
                </p>
                <p>{truncateText(comment.body)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No community activity yet.</p>
        )}
      </section>
    </section>
  );
}
