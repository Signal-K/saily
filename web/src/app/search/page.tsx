import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type SearchParams = {
  q?: string;
};

type ForumPostResult = {
  id: number;
  thread_id: number;
  body: string;
  created_at: string;
  profiles: { username: string | null } | { username: string | null }[] | null;
  forum_threads:
    | {
        puzzle_date: string;
        kind: "daily_live" | "ongoing";
        title: string;
      }
    | {
        puzzle_date: string;
        kind: "daily_live" | "ongoing";
        title: string;
      }[]
    | null;
};

type BadgeRef = {
  slug: string;
  name: string;
  description: string;
  kind: string;
  threshold: number;
};

type UserBadgeResult = {
  awarded_at: string;
  badges: BadgeRef | BadgeRef[] | null;
};

type CommentResult = {
  id: number;
  game_date: string;
  body: string;
  created_at: string;
  profiles: { username: string | null } | { username: string | null }[] | null;
};

type DailyGameRow = {
  game_date: string;
  game_key: string;
  created_at: string;
};

type DailyPlayRow = {
  id: number;
  game_date: string;
  attempts: number;
  won: boolean;
  score: number;
  played_at: string;
};

type UserStatsRow = {
  games_played: number;
  wins: number;
  current_streak: number;
  best_streak: number;
  total_score: number;
  updated_at: string;
};

type QueryContext = {
  raw: string;
  lower: string;
  tokens: string[];
  isoDate: boolean;
  monthKey: boolean;
  yearKey: boolean;
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

function truncate(text: string, max = 140) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}...`;
}

function fmtDate(value: string | null | undefined) {
  if (!value) return "-";
  return value.slice(0, 10);
}

function getDateKey(value: string | null | undefined) {
  if (!value) return null;
  if (isIsoDate(value)) return value;
  const asDate = new Date(value);
  if (Number.isNaN(asDate.getTime())) return null;
  return asDate.toISOString().slice(0, 10);
}

function getSingleBadge(value: UserBadgeResult["badges"]): BadgeRef | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function getForumUsername(value: ForumPostResult["profiles"]) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0]?.username ?? null) : value.username;
}

function getForumThread(value: ForumPostResult["forum_threads"]) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function getCommentUsername(value: CommentResult["profiles"]) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0]?.username ?? null) : value.username;
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
    if (value === token) {
      score += 35;
    } else if (value.startsWith(token)) {
      score += 22;
    } else if (value.includes(token)) {
      score += 12;
    }
  }

  return score;
}

function scoreDateRelevancy(dateValue: string | null | undefined, ctx: QueryContext, now: Date) {
  const key = getDateKey(dateValue);
  if (!key) return 0;

  let score = 0;

  if (ctx.isoDate && key === ctx.raw) {
    score += 420;
  } else if (ctx.monthKey && key.startsWith(`${ctx.raw}-`)) {
    score += 240;
  } else if (ctx.yearKey && key.startsWith(`${ctx.raw}-`)) {
    score += 130;
  } else if (key.includes(ctx.lower)) {
    score += 70;
  }

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

function rankRows<T>(rows: T[], score: (item: T) => number, limit: number) {
  return rows
    .map((item) => ({ item, score: score(item) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.item);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  if (!query) {
    return (
      <section className="search-page-shell">
        <header className="panel search-page-header">
          <p className="eyebrow">Global Search</p>
          <h1>Search Everything</h1>
          <p className="muted">Search profiles, puzzle records, forum threads, posts, comments, badges, and anomaly entries.</p>
        </header>

        <article className="panel search-empty-state">
          <p className="muted">Use the header search to run a query.</p>
        </article>
      </section>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ctx = toQueryContext(query);
  const pattern = `%${query}%`;
  const fetchLimit = 40;
  const displayLimit = 10;
  const now = new Date();

  const [
    profilesRes,
    commentsRes,
    commentsByDateRes,
    threadsRes,
    threadsByDateRes,
    postsRes,
    badgesRes,
    anomaliesRes,
    gamesByKeyRes,
    gamesByDateRes,
    playsRes,
    statsRes,
    userBadgesRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id,username,created_at").ilike("username", pattern).order("created_at", { ascending: false }).limit(fetchLimit),
    supabase
      .from("comments")
      .select("id,game_date,body,created_at,profiles(username)")
      .ilike("body", pattern)
      .order("created_at", { ascending: false })
      .limit(fetchLimit),
    ctx.isoDate
      ? supabase
          .from("comments")
          .select("id,game_date,body,created_at,profiles(username)")
          .eq("game_date", query)
          .order("created_at", { ascending: false })
          .limit(fetchLimit)
      : Promise.resolve({ data: [] as CommentResult[], error: null }),
    supabase
      .from("forum_threads")
      .select("id,puzzle_date,kind,title,created_at")
      .ilike("title", pattern)
      .order("puzzle_date", { ascending: false })
      .limit(fetchLimit),
    ctx.isoDate
      ? supabase
          .from("forum_threads")
          .select("id,puzzle_date,kind,title,created_at")
          .eq("puzzle_date", query)
          .order("puzzle_date", { ascending: false })
          .limit(fetchLimit)
      : Promise.resolve({ data: [] as { id: number; puzzle_date: string; kind: "daily_live" | "ongoing"; title: string; created_at: string }[], error: null }),
    supabase
      .from("forum_posts")
      .select(
        "id,thread_id,body,created_at,profiles!forum_posts_user_id_fkey(username),forum_threads!forum_posts_thread_id_fkey(puzzle_date,kind,title)",
      )
      .ilike("body", pattern)
      .order("created_at", { ascending: false })
      .limit(fetchLimit),
    supabase
      .from("badges")
      .select("id,slug,name,description,kind,threshold")
      .or(`slug.ilike.${pattern},name.ilike.${pattern},description.ilike.${pattern}`)
      .order("id", { ascending: true })
      .limit(fetchLimit),
    supabase
      .from("anomalies")
      .select('id,content,ticId,anomalytype,created_at,"anomalySet"')
      .or(`content.ilike.${pattern},ticId.ilike.${pattern},anomalytype.ilike.${pattern},anomalySet.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(fetchLimit),
    supabase.from("daily_games").select("game_date,game_key,created_at").ilike("game_key", pattern).order("game_date", { ascending: false }).limit(fetchLimit),
    ctx.isoDate
      ? supabase.from("daily_games").select("game_date,game_key,created_at").eq("game_date", query).limit(fetchLimit)
      : ctx.monthKey
        ? supabase
            .from("daily_games")
            .select("game_date,game_key,created_at")
            .gte("game_date", `${ctx.raw}-01`)
            .lte("game_date", `${ctx.raw}-31`)
            .limit(fetchLimit)
        : ctx.yearKey
          ? supabase
              .from("daily_games")
              .select("game_date,game_key,created_at")
              .gte("game_date", `${ctx.raw}-01-01`)
              .lte("game_date", `${ctx.raw}-12-31`)
              .limit(fetchLimit)
          : Promise.resolve({ data: [] as DailyGameRow[], error: null }),
    user
      ? supabase.from("daily_plays").select("id,game_date,attempts,won,score,played_at").eq("user_id", user.id).order("played_at", { ascending: false }).limit(250)
      : Promise.resolve({ data: [] as DailyPlayRow[], error: null }),
    user
      ? supabase.from("user_stats").select("games_played,wins,current_streak,best_streak,total_score,updated_at").eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null as UserStatsRow | null, error: null }),
    user
      ? supabase
          .from("user_badges")
          .select("awarded_at,badges(slug,name,description,kind,threshold)")
          .eq("user_id", user.id)
          .order("awarded_at", { ascending: false })
          .limit(180)
      : Promise.resolve({ data: [] as UserBadgeResult[], error: null }),
  ]);

  const allGameRowsMap = new Map<string, DailyGameRow>();
  [...(gamesByKeyRes.data ?? []), ...(gamesByDateRes.data ?? [])].forEach((row) => allGameRowsMap.set(row.game_date, row));

  const commentsMap = new Map<number, CommentResult>();
  [...((commentsRes.data ?? []) as CommentResult[]), ...((commentsByDateRes.data ?? []) as CommentResult[])].forEach((row) => commentsMap.set(row.id, row));

  const threadsMap = new Map<number, { id: number; puzzle_date: string; kind: "daily_live" | "ongoing"; title: string; created_at: string }>();
  [...(threadsRes.data ?? []), ...(threadsByDateRes.data ?? [])].forEach((row) => threadsMap.set(row.id, row));

  const forumPostsRaw = (postsRes.data ?? []) as ForumPostResult[];
  const commentRowsRaw = [...commentsMap.values()];
  const threadRowsRaw = [...threadsMap.values()];
  const gameRowsRaw = [...allGameRowsMap.values()];
  const playRowsRaw = (playsRes.data ?? []) as DailyPlayRow[];

  const profileRows = rankRows(
    profilesRes.data ?? [],
    (profile) => scoreByFields([profile.username], [profile.created_at], ctx, now),
    displayLimit,
  );

  const threadRows = rankRows(
    threadRowsRaw,
    (thread) => scoreByFields([thread.title, thread.kind], [thread.puzzle_date, thread.created_at], ctx, now),
    displayLimit,
  );

  const forumPosts = rankRows(
    forumPostsRaw,
    (post) => {
      const thread = getForumThread(post.forum_threads);
      const username = getForumUsername(post.profiles);
      return scoreByFields([post.body, username, thread?.title, thread?.kind], [post.created_at, thread?.puzzle_date], ctx, now);
    },
    displayLimit,
  );

  const commentRows = rankRows(
    commentRowsRaw,
    (comment) => {
      const username = getCommentUsername(comment.profiles);
      return scoreByFields([comment.body, username], [comment.game_date, comment.created_at], ctx, now);
    },
    displayLimit,
  );

  const gameRows = rankRows(
    gameRowsRaw,
    (game) => scoreByFields([game.game_key], [game.game_date, game.created_at], ctx, now),
    displayLimit,
  );

  const playRows = rankRows(
    playRowsRaw,
    (play) =>
      scoreByFields(
        [String(play.id), String(play.score), String(play.attempts), play.won ? "won" : "lost"],
        [play.game_date, play.played_at],
        ctx,
        now,
      ),
    12,
  );

  const badgeRows = rankRows(
    (badgesRes.data ?? []).map((badge) => ({ ...badge, __kind: "catalog" as const })),
    (badge) => scoreByFields([badge.slug, badge.name, badge.description, badge.kind, String(badge.threshold)], [], ctx, now),
    displayLimit,
  );

  const myBadgeRows = rankRows(
    (userBadgesRes.data ?? []).map((row, idx) => ({ idx, row })),
    ({ row }) => {
      const badge = getSingleBadge(row.badges);
      if (!badge) return 0;
      return scoreByFields([badge.slug, badge.name, badge.description, badge.kind, String(badge.threshold)], [row.awarded_at], ctx, now);
    },
    displayLimit,
  );

  const anomalyRows = rankRows(
    anomaliesRes.data ?? [],
    (anomaly) =>
      scoreByFields(
        [anomaly.content ?? "", anomaly.ticId ?? "", anomaly.anomalytype ?? "", anomaly.anomalySet ?? "", String(anomaly.id)],
        [anomaly.created_at],
        ctx,
        now,
      ),
    displayLimit,
  );

  const statsRow = statsRes.data;
  const statsScore = statsRow
    ? scoreByFields(
        [
          String(statsRow.games_played),
          String(statsRow.wins),
          String(statsRow.current_streak),
          String(statsRow.best_streak),
          String(statsRow.total_score),
          "games played wins current streak best streak total score",
        ],
        [statsRow.updated_at],
        ctx,
        now,
      )
    : 0;

  const errorMessages = [
    profilesRes.error?.message,
    commentsRes.error?.message,
    commentsByDateRes.error?.message,
    threadsRes.error?.message,
    threadsByDateRes.error?.message,
    postsRes.error?.message,
    badgesRes.error?.message,
    anomaliesRes.error?.message,
    gamesByKeyRes.error?.message,
    gamesByDateRes.error?.message,
    playsRes.error?.message,
    statsRes.error?.message,
    userBadgesRes.error?.message,
  ].filter(Boolean) as string[];

  const hasResults =
    profileRows.length > 0 ||
    commentRows.length > 0 ||
    threadRows.length > 0 ||
    forumPosts.length > 0 ||
    badgeRows.length > 0 ||
    myBadgeRows.length > 0 ||
    anomalyRows.length > 0 ||
    gameRows.length > 0 ||
    playRows.length > 0 ||
    statsScore > 0;

  const totalMatches =
    profileRows.length +
    threadRows.length +
    forumPosts.length +
    commentRows.length +
    gameRows.length +
    playRows.length +
    badgeRows.length +
    myBadgeRows.length +
    anomalyRows.length +
    (statsScore > 0 ? 1 : 0);

  return (
    <section className="search-page-shell">
      <header className="panel search-page-header">
        <p className="eyebrow">Global Search</p>
        <h1>Results for &ldquo;{query}&rdquo;</h1>
        <p className="muted">Ranked by text relevance and date relevance across profiles, comments, forum, game history, badges, stats, and anomaly entries.</p>
      </header>

      {hasResults ? (
        <div className="search-meta-row">
          <div className="search-meta-pill">
            <span>Total matches</span>
            <strong>{totalMatches}</strong>
          </div>
          <div className="search-meta-pill">
            <span>Forum</span>
            <strong>{threadRows.length + forumPosts.length + commentRows.length}</strong>
          </div>
          <div className="search-meta-pill">
            <span>Puzzle history</span>
            <strong>{gameRows.length + playRows.length}</strong>
          </div>
          <div className="search-meta-pill">
            <span>Profiles + badges</span>
            <strong>{profileRows.length + badgeRows.length + myBadgeRows.length}</strong>
          </div>
        </div>
      ) : null}

      {errorMessages.length > 0 ? (
        <article className="panel search-error-panel">
          <p className="search-section-title">Some sources could not be searched</p>
          <p className="muted">{errorMessages[0]}</p>
        </article>
      ) : null}

      {!hasResults ? (
        <article className="panel search-empty-state">
          <p className="muted">No matches found. Try a username, date (`YYYY-MM-DD`), keyword, or score value.</p>
        </article>
      ) : null}

      {profileRows.length > 0 ? (
        <article className="panel search-section">
          <h2 className="search-section-title">Profiles</h2>
          <ul className="search-list">
            {profileRows.map((profile) => (
              <li key={profile.id} className="search-item">
                <div>
                  <p className="search-item-title">@{profile.username ?? "anonymous"}</p>
                  <p className="muted">Joined {fmtDate(profile.created_at)}</p>
                </div>
                <Link href="/profile" className="button">
                  View profile
                </Link>
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {threadRows.length > 0 ? (
        <article className="panel search-section">
          <h2 className="search-section-title">Forum Threads</h2>
          <ul className="search-list">
            {threadRows.map((thread) => (
              <li key={thread.id} className="search-item search-item-stack">
                <p className="search-item-title">{thread.title}</p>
                <p className="muted">
                  {thread.kind === "daily_live" ? "Live" : "Ongoing"} thread for {thread.puzzle_date}
                </p>
                <div className="search-item-links">
                  <Link href={`/discuss?date=${thread.puzzle_date}`} className="button">
                    Open thread
                  </Link>
                  <Link href={`/games/today?date=${thread.puzzle_date}`} className="button">
                    View puzzle
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {forumPosts.length > 0 ? (
        <article className="panel search-section">
          <h2 className="search-section-title">Forum Posts</h2>
          <ul className="search-list">
            {forumPosts.map((post) => {
              const username = getForumUsername(post.profiles);
              const thread = getForumThread(post.forum_threads);
              const puzzleDate = thread?.puzzle_date ?? "";
              return (
                <li key={post.id} className="search-item search-item-stack">
                  <p className="search-item-title">{username ? `@${username}` : "Forum user"}</p>
                  <p>{truncate(post.body)}</p>
                  <p className="muted">
                    {thread?.title ?? "Thread"} • {fmtDate(post.created_at)}
                  </p>
                  <div className="search-item-links">
                    <Link href={`/discuss?date=${puzzleDate}`} className="button">
                      Open discussion
                    </Link>
                    {puzzleDate ? (
                      <Link href={`/games/today?date=${puzzleDate}`} className="button">
                        View puzzle
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </article>
      ) : null}

      {commentRows.length > 0 ? (
        <article className="panel search-section">
          <h2 className="search-section-title">Game Comments</h2>
          <ul className="search-list">
            {commentRows.map((comment) => {
              const username = getCommentUsername(comment.profiles);
              return (
                <li key={comment.id} className="search-item search-item-stack">
                  <p className="search-item-title">{username ? `@${username}` : "Comment"}</p>
                  <p>{truncate(comment.body)}</p>
                  <p className="muted">Puzzle date {comment.game_date}</p>
                  <div className="search-item-links">
                    <Link href={`/discuss?date=${comment.game_date}`} className="button">
                      Open discussion
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </article>
      ) : null}

      {gameRows.length > 0 ? (
        <article className="panel search-section">
          <h2 className="search-section-title">Daily Games</h2>
          <ul className="search-list">
            {gameRows.map((game) => (
              <li key={game.game_date} className="search-item">
                <div>
                  <p className="search-item-title">{game.game_key}</p>
                  <p className="muted">Date {game.game_date}</p>
                </div>
                <div className="search-item-links">
                  <Link href={`/discuss?date=${game.game_date}`} className="button">
                    Discuss
                  </Link>
                  <Link href={`/games/today?date=${game.game_date}`} className="button">
                    View puzzle
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {playRows.length > 0 ? (
        <article className="panel search-section">
          <h2 className="search-section-title">My Plays</h2>
          <ul className="search-list">
            {playRows.map((play) => (
              <li key={play.id} className="search-item">
                <div>
                  <p className="search-item-title">{play.game_date}</p>
                  <p className="muted">
                    {play.won ? "Won" : "Lost"} • Score {play.score} • Attempts {play.attempts}
                  </p>
                </div>
                <Link href={`/discuss?date=${play.game_date}`} className="button">
                  Open day
                </Link>
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      {(badgeRows.length > 0 || myBadgeRows.length > 0) ? (
        <article className="panel search-section">
          <h2 className="search-section-title">Badges</h2>
          <ul className="search-list">
            {badgeRows.map((badge) => (
              <li key={`badge-${badge.id}`} className="search-item search-item-stack">
                <p className="search-item-title">{badge.name}</p>
                <p>{truncate(badge.description, 200)}</p>
                <p className="muted">
                  {badge.kind} • threshold {badge.threshold}
                </p>
              </li>
            ))}
            {myBadgeRows.map(({ idx, row }) => {
              const badge = getSingleBadge(row.badges);
              if (!badge) return null;
              return (
                <li key={`my-badge-${idx}`} className="search-item search-item-stack">
                  <p className="search-item-title">{badge.name}</p>
                  <p>{truncate(badge.description)}</p>
                  <p className="muted">Awarded {fmtDate(row.awarded_at)}</p>
                </li>
              );
            })}
          </ul>
        </article>
      ) : null}

      {statsScore > 0 ? (
        <article className="panel search-section">
          <h2 className="search-section-title">My Stats</h2>
          <div className="search-stats-grid">
            <div className="card">
              <h3>Games played</h3>
              <p>{statsRow?.games_played ?? 0}</p>
            </div>
            <div className="card">
              <h3>Wins</h3>
              <p>{statsRow?.wins ?? 0}</p>
            </div>
            <div className="card">
              <h3>Current streak</h3>
              <p>{statsRow?.current_streak ?? 0}</p>
            </div>
            <div className="card">
              <h3>Best streak</h3>
              <p>{statsRow?.best_streak ?? 0}</p>
            </div>
            <div className="card">
              <h3>Total score</h3>
              <p>{statsRow?.total_score ?? 0}</p>
            </div>
          </div>
        </article>
      ) : null}

      {anomalyRows.length > 0 ? (
        <article className="panel search-section">
          <h2 className="search-section-title">Anomaly Entries</h2>
          <ul className="search-list">
            {anomalyRows.map((anomaly) => (
              <li key={anomaly.id} className="search-item search-item-stack">
                <p className="search-item-title">Anomaly #{anomaly.id}</p>
                <p>{truncate(anomaly.content ?? "(no content)", 180)}</p>
                <p className="muted">
                  Type {anomaly.anomalytype ?? "-"} • Set {anomaly.anomalySet ?? "-"} • {fmtDate(anomaly.created_at)}
                </p>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </section>
  );
}
