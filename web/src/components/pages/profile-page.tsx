import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getRobotAvatarDataUri } from "@/lib/avatar";
import { ProfileFollowList } from "@/components/profile-follow-list";

type ThreadRef = {
  puzzle_date: string;
  kind: "daily_live" | "ongoing";
  title: string;
};

type ForumPost = {
  id: number;
  body: string;
  created_at: string;
  forum_threads: ThreadRef | ThreadRef[] | null;
};

function getThreadRef(value: ForumPost["forum_threads"]) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

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

  const [{ data: stats }, { data: badges }, { data: profile }, { data: posts }, { data: discoverUsers }, { data: followingRows }, followersCountRes, followingCountRes] = await Promise.all([
    supabase.from("user_stats").select("games_played,wins,current_streak,best_streak,total_score").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("user_badges")
      .select("awarded_at,badges(name,description,slug)")
      .eq("user_id", user.id)
      .order("awarded_at", { ascending: false }),
    supabase.from("profiles").select("username").eq("id", user.id).maybeSingle(),
    supabase
      .from("forum_posts")
      .select("id,body,created_at,forum_threads!forum_posts_thread_id_fkey(puzzle_date,kind,title)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("profiles").select("id,username").neq("id", user.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("user_follows").select("following_id").eq("follower_id", user.id),
    supabase.from("user_follows").select("follower_id", { count: "exact", head: true }).eq("following_id", user.id),
    supabase.from("user_follows").select("following_id", { count: "exact", head: true }).eq("follower_id", user.id),
  ]);

  const displayName = profile?.username ?? user.email ?? "player";
  const avatarUrl = getRobotAvatarDataUri(displayName, 96);
  const followersCount = followersCountRes.count ?? 0;
  const followingCount = followingCountRes.count ?? 0;
  const initialFollowingIds = (followingRows ?? []).map((row) => row.following_id);
  const forumPosts = (posts ?? []) as ForumPost[];

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
              const thread = getThreadRef(post.forum_threads);
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
        <h2>Follow Players</h2>
        <ProfileFollowList users={discoverUsers ?? []} initialFollowingIds={initialFollowingIds} />
      </div>
    </section>
  );
}
