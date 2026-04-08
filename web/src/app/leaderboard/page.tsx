import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "Leaderboard — Saily" };

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("user_stats")
    .select("user_id, total_score, current_streak, wins, profiles(username)")
    .order("total_score", { ascending: false })
    .limit(50);

  const entries = (rows ?? []).map((row, i) => ({
    rank: i + 1,
    userId: row.user_id,
    score: row.total_score ?? 0,
    streak: row.current_streak ?? 0,
    wins: row.wins ?? 0,
    username: Array.isArray(row.profiles)
      ? (row.profiles[0]?.username ?? "player")
      : ((row.profiles as { username: string | null } | null)?.username ?? "player"),
  }));

  return (
    <main className="panel" style={{ maxWidth: "640px", margin: "2rem auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <p className="eyebrow">Global Rankings</p>
        <h1>Leaderboard</h1>
      </div>

      {entries.length === 0 ? (
        <p className="muted">No scores yet. Be the first to play!</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "0.5rem 0.75rem", width: "3rem" }}>#</th>
              <th style={{ padding: "0.5rem 0.75rem" }}>Player</th>
              <th style={{ padding: "0.5rem 0.75rem", textAlign: "right" }}>Score</th>
              <th style={{ padding: "0.5rem 0.75rem", textAlign: "right" }}>Streak</th>
              <th style={{ padding: "0.5rem 0.75rem", textAlign: "right" }}>Wins</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const isMe = user?.id === entry.userId;
              return (
                <tr
                  key={entry.userId}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: isMe ? "var(--surface-2)" : undefined,
                    fontWeight: isMe ? 600 : undefined,
                  }}
                >
                  <td style={{ padding: "0.6rem 0.75rem", color: "var(--muted)" }}>{entry.rank}</td>
                  <td style={{ padding: "0.6rem 0.75rem" }}>
                    {entry.username}
                    {isMe && <span style={{ marginLeft: "0.4rem", fontSize: "0.75rem", color: "var(--brand)" }}>you</span>}
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem", textAlign: "right" }}>{entry.score.toLocaleString()}</td>
                  <td style={{ padding: "0.6rem 0.75rem", textAlign: "right" }}>{entry.streak}</td>
                  <td style={{ padding: "0.6rem 0.75rem", textAlign: "right" }}>{entry.wins}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <Link href="/" className="button">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
