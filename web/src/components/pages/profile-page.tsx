import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/pocketbase/server";
import { getRobotAvatarDataUri } from "@/lib/avatar";
import { ProfileFollowList } from "@/components/profile-follow-list";
import { getEcosystemStatsForUser } from "@/lib/pocketbase/shared-stats";
import { PushOptIn } from "@/components/push-opt-in";

type ThreadRef = {
  puzzle_date: string;
  kind: "daily_live" | "ongoing";
  title: string;
};

type ForumPost = {
  id: string;
  body: string;
  created_at: string;
  thread_id: string;
};

export default async function ProfilePage() {
  const pocketbase = await createClient();
  const {
    data: { user },
  } = await pocketbase.auth.getUser();

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

  const [{ data: stats }, { data: badges }, { data: profile }, { data: posts }, { data: discoverUsers }, { data: followingRows }, followersCountRes, followingCountRes] = await Promise.all([
    pocketbase.from("user_stats").select("games_played,wins,current_streak,best_streak,total_score").eq("user_id", user.id).maybeSingle(),
    pocketbase
      .from("user_badges")
      .select("awarded_at,badges(name,description,slug)")
      .eq("user_id", user.id)
      .order("awarded_at", { ascending: false }),
    pocketbase.from("profiles").select("username").eq("shared_user_id", user.id).maybeSingle(),
    pocketbase
      .from("forum_posts")
      .select("id,body,created_at,thread_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    pocketbase.from("profiles").select("id,username").neq("shared_user_id", user.id).order("created_at", { ascending: false }).limit(20),
    pocketbase.from("user_follows").select("following_id").eq("follower_id", user.id),
    pocketbase.from("user_follows").select("follower_id", { count: "exact", head: true }).eq("following_id", user.id),
    pocketbase.from("user_follows").select("following_id", { count: "exact", head: true }).eq("follower_id", user.id),
  ]);

  const displayName = profile?.username ?? user.email ?? "player";
  const avatarUrl = getRobotAvatarDataUri(user.id, 96);
  const followersCount = followersCountRes.count ?? 0;
  const followingCount = followingCountRes.count ?? 0;
  const initialFollowingIds = (followingRows ?? []).map((row) => row.following_id);
  const forumPosts = (posts ?? []) as ForumPost[];

  const threadIds = [...new Set(forumPosts.map((post) => post.thread_id))];
  const { data: threads } =
    threadIds.length > 0
      ? await pocketbase.from("forum_threads").select("id,puzzle_date,kind,title").in("id", threadIds)
      : { data: [] as (ThreadRef & { id: string })[] };
  const threadById = new Map((threads ?? []).map((thread) => [thread.id, thread]));
  const ecosystemStats = await getEcosystemStatsForUser(user.id);

  return (
    <section className="grid gap-4">
      <div className="panel">
        <div className="profile-heading">
          <Image className="profile-heading-avatar" src={avatarUrl} alt="Profile avatar" width={64} height={64} unoptimized />
          <div>
            <h1>Profile</h1>
            <p className="muted">{displayName}</p>
            <p className="muted">
              {followersCount} follower{followersCount === 1 ? "" : "s"} • {followingCount} following
            </p>
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
      <div className="panel">
        <h2>Your Forum Posts</h2>
        {forumPosts.length > 0 ? (
          <div className="profile-post-list">
            {forumPosts.map((post) => {
              const thread = threadById.get(post.thread_id) ?? null;
              return (
                <article key={post.id} className="profile-post-item">
                  <p className="profile-post-body">{post.body}</p>
                  <p className="muted">
                    {new Date(post.created_at).toLocaleString()} • {thread?.title ?? "Forum thread"}
                  </p>
                  <Link href={`/discuss?date=${thread?.puzzle_date ?? ""}`} className="button">
                    Open in Discuss
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="muted">No forum posts yet.</p>
        )}
      </div>
      <div className="panel">
        <h2>Across the Star Sailors Ecosystem</h2>
        {ecosystemStats && (ecosystemStats.landnamBalance !== null || ecosystemStats.landnamMissions !== null) ? (
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
            {ecosystemStats.landnamMissions !== null && <p>Landnam missions: {ecosystemStats.landnamMissions}</p>}
            {ecosystemStats.landnamBalance !== null && <p>Landnam balance: {ecosystemStats.landnamBalance}</p>}
          </div>
        ) : (
          <p className="muted">No cross-game activity yet — play Landnam to see stats here.</p>
        )}
      </div>
      <div className="panel">
        <h2>Notifications</h2>
        <PushOptIn />
      </div>
      <div className="panel">
        <h2>Follow Players</h2>
        <ProfileFollowList users={discoverUsers ?? []} initialFollowingIds={initialFollowingIds} />
      </div>
    </section>
  );
}
