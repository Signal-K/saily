import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getRobotAvatarDataUri } from "@/lib/avatar";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section className="panel">
        <h1>Profile</h1>
        <p className="muted">Sign in to see your streaks, stats, and badges.</p>
        <Link href="/auth/sign-in" className="button button-primary">
          Sign in
        </Link>
      </section>
    );
  }

  const [{ data: stats }, { data: badges }, { data: profile }] = await Promise.all([
    supabase.from("user_stats").select("games_played,wins,current_streak,best_streak,total_score").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("user_badges")
      .select("awarded_at,badges(name,description,slug)")
      .eq("user_id", user.id)
      .order("awarded_at", { ascending: false }),
    supabase.from("profiles").select("username").eq("id", user.id).maybeSingle(),
  ]);
  const displayName = profile?.username ?? user.email ?? "player";
  const avatarUrl = getRobotAvatarDataUri(displayName, 96);

  return (
    <section className="grid gap-4">
      <div className="panel">
        <div className="profile-heading">
          <Image className="profile-heading-avatar" src={avatarUrl} alt="Profile avatar" width={64} height={64} unoptimized />
          <div>
            <h1>Profile</h1>
            <p className="muted">{displayName}</p>
          </div>
        </div>
      </div>
      <div className="panel">
        <h2>Stats</h2>
        {stats ? (
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
            <p>Games played: {stats.games_played}</p>
            <p>Wins: {stats.wins}</p>
            <p>Current streak: {stats.current_streak}</p>
            <p>Best streak: {stats.best_streak}</p>
            <p>Total score: {stats.total_score}</p>
          </div>
        ) : (
          <p className="muted">No stats yet.</p>
        )}
      </div>
      <div className="panel">
        <h2>Badges</h2>
        {badges && badges.length > 0 ? (
          <div className="grid gap-2">
            {badges.map((row, idx) => {
              const badge = Array.isArray(row.badges) ? row.badges[0] : row.badges;
              return (
                <div className="card" key={`${badge?.slug ?? "badge"}-${idx}`}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{badge?.name ?? "Badge"}</p>
                  <p className="muted" style={{ margin: "0.3rem 0 0" }}>
                    {badge?.description ?? "Milestone achieved"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="muted">No badges unlocked yet.</p>
        )}
      </div>
    </section>
  );
}
