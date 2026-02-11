import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type QueryContext = {
  raw: string;
  lower: string;
  tokens: string[];
  isoDate: boolean;
  monthKey: boolean;
  yearKey: boolean;
};

type SearchSuggestion = {
  kind: string;
  title: string;
  subtitle: string;
  href: string;
  score: number;
};

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isMonthKey(value: string) {
  return /^\d{4}-\d{2}$/.test(value);
}

function isYearKey(value: string) {
  return /^\d{4}$/.test(value);
}

function getDateKey(value: string | null | undefined) {
  if (!value) return null;
  if (isIsoDate(value)) return value;
  const asDate = new Date(value);
  if (Number.isNaN(asDate.getTime())) return null;
  return asDate.toISOString().slice(0, 10);
}

function toQueryContext(query: string): QueryContext {
  const lower = query.toLowerCase();
  const tokens = lower
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  return {
    raw: query,
    lower,
    tokens,
    isoDate: isIsoDate(query),
    monthKey: isMonthKey(query),
    yearKey: isYearKey(query),
  };
}

function scoreTextMatch(text: string | null | undefined, ctx: QueryContext) {
  if (!text) return 0;
  const value = text.toLowerCase();

  let score = 0;
  if (value === ctx.lower) score += 220;
  if (value.startsWith(ctx.lower)) score += 120;
  if (value.includes(ctx.lower)) score += 70;

  for (const token of ctx.tokens) {
    if (value === token) score += 35;
    else if (value.startsWith(token)) score += 22;
    else if (value.includes(token)) score += 12;
  }

  return score;
}

function scoreDateRelevancy(dateValue: string | null | undefined, ctx: QueryContext, now: Date) {
  const key = getDateKey(dateValue);
  if (!key) return 0;

  let score = 0;
  if (ctx.isoDate && key === ctx.raw) score += 420;
  else if (ctx.monthKey && key.startsWith(`${ctx.raw}-`)) score += 240;
  else if (ctx.yearKey && key.startsWith(`${ctx.raw}-`)) score += 130;
  else if (key.includes(ctx.lower)) score += 70;

  const date = new Date(`${key}T00:00:00.000Z`);
  const daysDiff = Math.abs((now.getTime() - date.getTime()) / 86400000);
  if (daysDiff <= 2) score += 24;
  else if (daysDiff <= 7) score += 18;
  else if (daysDiff <= 30) score += 12;
  else if (daysDiff <= 90) score += 6;

  return score;
}

function scoreByFields(textFields: Array<string | null | undefined>, dateFields: Array<string | null | undefined>, ctx: QueryContext, now: Date) {
  const textScore = textFields.reduce((acc, field) => acc + scoreTextMatch(field, ctx), 0);
  const dateScore = dateFields.reduce((acc, field) => acc + scoreDateRelevancy(field, ctx, now), 0);
  return textScore + dateScore;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limitParam = Number(url.searchParams.get("limit") ?? "8");
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(limitParam, 20)) : 8;

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pattern = `%${q}%`;
  const fetchLimit = 20;
  const now = new Date();
  const ctx = toQueryContext(q);

  const [profilesRes, threadsRes, postsRes, commentsRes, gamesRes, badgesRes, anomaliesRes, playsRes] = await Promise.all([
    supabase.from("profiles").select("id,username,created_at").ilike("username", pattern).order("created_at", { ascending: false }).limit(fetchLimit),
    supabase.from("forum_threads").select("id,puzzle_date,kind,title,created_at").or(`title.ilike.${pattern},puzzle_date.ilike.${pattern}`).order("puzzle_date", { ascending: false }).limit(fetchLimit),
    supabase
      .from("forum_posts")
      .select("id,body,created_at,forum_threads!forum_posts_thread_id_fkey(puzzle_date,title)")
      .ilike("body", pattern)
      .order("created_at", { ascending: false })
      .limit(fetchLimit),
    supabase
      .from("comments")
      .select("id,body,game_date,created_at")
      .or(`body.ilike.${pattern},game_date.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(fetchLimit),
    supabase.from("daily_games").select("game_date,game_key,created_at").or(`game_key.ilike.${pattern},game_date.ilike.${pattern}`).order("game_date", { ascending: false }).limit(fetchLimit),
    supabase
      .from("badges")
      .select("id,name,description,kind,threshold")
      .or(`name.ilike.${pattern},description.ilike.${pattern},kind.ilike.${pattern}`)
      .limit(fetchLimit),
    supabase
      .from("anomalies")
      .select('id,content,ticId,anomalytype,created_at,"anomalySet"')
      .or(`content.ilike.${pattern},ticId.ilike.${pattern},anomalytype.ilike.${pattern},anomalySet.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(fetchLimit),
    user
      ? supabase
          .from("daily_plays")
          .select("id,game_date,won,score,attempts,played_at")
          .eq("user_id", user.id)
          .order("played_at", { ascending: false })
          .limit(120)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const suggestions: SearchSuggestion[] = [];

  (profilesRes.data ?? []).forEach((row) => {
    const score = scoreByFields([row.username], [row.created_at], ctx, now);
    if (score <= 0) return;
    suggestions.push({
      kind: "profile",
      title: `@${row.username ?? "anonymous"}`,
      subtitle: `Joined ${row.created_at.slice(0, 10)}`,
      href: "/profile",
      score,
    });
  });

  (threadsRes.data ?? []).forEach((row) => {
    const score = scoreByFields([row.title, row.kind], [row.puzzle_date, row.created_at], ctx, now);
    if (score <= 0) return;
    suggestions.push({
      kind: "thread",
      title: row.title,
      subtitle: `${row.kind === "daily_live" ? "Live" : "Ongoing"} • ${row.puzzle_date}`,
      href: `/discuss?date=${row.puzzle_date}`,
      score,
    });
  });

  (postsRes.data ?? []).forEach((row) => {
    const thread = Array.isArray(row.forum_threads) ? row.forum_threads[0] : row.forum_threads;
    const score = scoreByFields([row.body, thread?.title], [row.created_at, thread?.puzzle_date], ctx, now);
    if (score <= 0) return;
    suggestions.push({
      kind: "post",
      title: "Forum post",
      subtitle: `${row.body.slice(0, 72)}${row.body.length > 72 ? "..." : ""}`,
      href: thread?.puzzle_date ? `/discuss?date=${thread.puzzle_date}` : `/search?q=${encodeURIComponent(q)}`,
      score,
    });
  });

  (commentsRes.data ?? []).forEach((row) => {
    const score = scoreByFields([row.body], [row.game_date, row.created_at], ctx, now);
    if (score <= 0) return;
    suggestions.push({
      kind: "comment",
      title: `Comment • ${row.game_date}`,
      subtitle: `${row.body.slice(0, 72)}${row.body.length > 72 ? "..." : ""}`,
      href: `/discuss?date=${row.game_date}`,
      score,
    });
  });

  (gamesRes.data ?? []).forEach((row) => {
    const score = scoreByFields([row.game_key], [row.game_date, row.created_at], ctx, now);
    if (score <= 0) return;
    suggestions.push({
      kind: "game",
      title: row.game_key,
      subtitle: `Puzzle day ${row.game_date}`,
      href: `/games/today?date=${row.game_date}`,
      score,
    });
  });

  (badgesRes.data ?? []).forEach((row) => {
    const score = scoreByFields([row.name, row.description, row.kind, String(row.threshold)], [], ctx, now);
    if (score <= 0) return;
    suggestions.push({
      kind: "badge",
      title: row.name,
      subtitle: `${row.kind} • threshold ${row.threshold}`,
      href: `/search?q=${encodeURIComponent(q)}`,
      score,
    });
  });

  (anomaliesRes.data ?? []).forEach((row) => {
    const score = scoreByFields([row.content ?? "", row.ticId ?? "", row.anomalytype ?? "", row.anomalySet ?? ""], [row.created_at], ctx, now);
    if (score <= 0) return;
    suggestions.push({
      kind: "anomaly",
      title: `Anomaly #${row.id}`,
      subtitle: `${(row.content ?? row.anomalytype ?? "entry").slice(0, 72)}${(row.content ?? row.anomalytype ?? "").length > 72 ? "..." : ""}`,
      href: `/search?q=${encodeURIComponent(q)}`,
      score,
    });
  });

  (playsRes.data ?? []).forEach((row) => {
    const score = scoreByFields([String(row.id), String(row.score), String(row.attempts), row.won ? "won" : "lost"], [row.game_date, row.played_at], ctx, now);
    if (score <= 0) return;
    suggestions.push({
      kind: "play",
      title: `${row.game_date} • ${row.won ? "Won" : "Lost"}`,
      subtitle: `Score ${row.score}, attempts ${row.attempts}`,
      href: `/discuss?date=${row.game_date}`,
      score,
    });
  });

  const results = suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => ({ kind: item.kind, title: item.title, subtitle: item.subtitle, href: item.href }));

  return NextResponse.json({ results });
}
