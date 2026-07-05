import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/pocketbase/server";
import { getStorylineForDate, getCharacterForStoryline } from "@/lib/mission";
import { getRobotAvatarDataUri } from "@/lib/avatar";
import { getMelbourneDateKey } from "@/lib/melbourne-date";
import LandingPage from "./landing-page";

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
  return `${text.slice(0, maxLength - 1)}...`;
}

function getMissionStatusLabel(streak: number | null | undefined, chips: number | null | undefined) {
  if ((streak ?? 0) >= 7) return "Stable";
  if ((chips ?? 0) > 0) return "Ready";
  return "Standby";
}

function Brackets() {
  return (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute -left-px -top-px h-3.5 w-3.5 border-l-2 border-t-2 border-[var(--primary)]" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -right-px h-3.5 w-3.5 border-b-2 border-r-2 border-[var(--primary)]" />
    </>
  );
}

const panelClass = "relative border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] shadow-none";
const dataLabelClass = "font-[var(--font-data)] text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]";
const navLinkClass = "font-[var(--font-data)] text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)] no-underline whitespace-nowrap hover:text-[var(--primary)]";

export default async function Home() {
  const pocketbase = await createClient();
  const today = getMelbourneDateKey();
  const todayDate = new Date();
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);

  const {
    data: { user },
  } = await pocketbase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  const todayStoryline = getStorylineForDate(todayDate);
  const todayCharacter = getCharacterForStoryline(todayStoryline);
  const todayAvatarSrc = getRobotAvatarDataUri(todayCharacter.avatarSeed, 64);

  const tomorrowStoryline = getStorylineForDate(tomorrowDate);
  const tomorrowCharacter = getCharacterForStoryline(tomorrowStoryline);
  const tomorrowAvatarSrc = getRobotAvatarDataUri(tomorrowCharacter.avatarSeed, 40);

  const [profileRes, statsRes, badgesRes, playsRes, commentsRes, todayPlayRes, storyProgressRes] = await Promise.all([
    pocketbase.from("profiles").select("data_chips").eq("id", user.id).maybeSingle(),
    pocketbase.from("user_stats").select("games_played,wins,current_streak,best_streak,total_score").eq("user_id", user.id).maybeSingle(),
    pocketbase
      .from("user_badges")
      .select("awarded_at,badges(name,slug,description)")
      .eq("user_id", user.id)
      .order("awarded_at", { ascending: false })
      .limit(4),
    pocketbase.from("daily_plays").select("game_date,won,score,attempts,played_at").eq("user_id", user.id).order("played_at", { ascending: false }).limit(5),
    pocketbase.from("comments").select("id,game_date,body,created_at,profiles(username)").order("created_at", { ascending: false }).limit(5),
    pocketbase.from("daily_plays").select("score,won").eq("user_id", user.id).eq("game_date", today).maybeSingle(),
    pocketbase.from("user_story_progress").select("chapter_index").eq("user_id", user.id).eq("storyline_id", todayStoryline.id).maybeSingle(),
  ]);

  const profile = profileRes.data;
  const stats = statsRes.data;
  const badges = (badgesRes.data ?? []).map((row) => (Array.isArray(row.badges) ? row.badges[0] : row.badges)).filter(Boolean) as BadgeRef[];
  const plays = playsRes.data ?? [];
  const comments = (commentsRes.data ?? []) as CommentRow[];
  const todayPlay = todayPlayRes.data;
  const chapterIndex = storyProgressRes.data?.chapter_index ?? 0;
  const chapterNumber = Math.min(chapterIndex + 1, todayStoryline.chapters.length);
  const playedToday = Boolean(todayPlay);
  const missionStatus = getMissionStatusLabel(stats?.current_streak, profile?.data_chips);
  const missionBars = [stats?.current_streak ?? 0, profile?.data_chips ?? 0, stats?.wins ?? 0, badges.length];
  const dateLabel = todayDate.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const leadActionLabel = playedToday ? "Review Findings" : "Initialize Mission";
  const activeChapter = todayStoryline.chapters[chapterNumber - 1];
  const objectives: Array<[boolean, string]> = [
    [playedToday, "Complete today's scan"],
    [(stats?.current_streak ?? 0) > 0, "Keep the signal streak alive"],
    [false, "Check the consensus desk"],
  ];

  return (
    <section className="mx-auto flex w-[min(var(--spacing-content-max),calc(100%_-_1rem))] flex-col gap-5 pb-8 md:w-[min(var(--spacing-content-max),calc(100%_-_2rem))]">
      <header className="border-b-4 border-[var(--on-surface)] bg-[color-mix(in_oklab,var(--surface-container-lowest)_92%,transparent)] pb-3 pt-5" aria-label="Daily Transit command edition">
        <div className="flex flex-col gap-2 border-b border-[var(--outline-variant)] pb-2 sm:flex-row sm:items-end sm:justify-between">
          <p className={dataLabelClass}>Vol. {todayDate.getFullYear()} &middot; No. {chapterNumber}-{stats?.games_played ?? 0}</p>
          <p className={dataLabelClass}>{dateLabel}</p>
        </div>
        <div className="py-3 font-[var(--font-brand)] text-[clamp(3.6rem,10vw,8.25rem)] font-bold uppercase leading-[0.9] text-[var(--on-surface)] md:text-center">
          The Daily Transit
        </div>
        <nav className="flex gap-[clamp(1rem,4vw,3rem)] overflow-x-auto border-y border-[var(--outline-variant)] py-2 md:justify-center" aria-label="Mission sections">
          <Link href="/games/today" className={navLinkClass}>Mission Control</Link>
          <Link href="/calendar" className={navLinkClass}>Archives</Link>
          <Link href="/postcards" className={navLinkClass}>Gallery</Link>
          <Link href="/discuss" className={navLinkClass}>Consensus</Link>
          <Link href="/profile" className={navLinkClass}>Fleet Log</Link>
        </nav>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(280px,1.4fr)_repeat(3,minmax(150px,1fr))]" aria-label="Your command status">
        <article className={`${panelClass} flex min-h-32 items-center gap-4 p-4 max-sm:flex-col max-sm:items-start`}>
          <Brackets />
          <Image src={todayAvatarSrc} alt={todayCharacter.name} width={64} height={64} unoptimized className="border-2 border-[var(--primary)] p-0.5" />
          <div>
            <p className="eyebrow">{todayCharacter.name}</p>
            <h2 className="m-0 text-[clamp(1.35rem,3vw,2rem)] leading-none text-[var(--primary)]">{missionStatus} signal</h2>
            <Link href="/games/today" className="mt-3 inline-flex font-[var(--font-data)] text-[0.68rem] font-extrabold uppercase tracking-[0.08em] underline underline-offset-4">
              {leadActionLabel}
            </Link>
          </div>
        </article>
        {[
          ["Data Chips", profile?.data_chips ?? 0],
          ["Current Streak", stats?.current_streak ?? 0],
          ["Total Score", stats?.total_score ?? 0],
        ].map(([label, value]) => (
          <article key={label} className={`${panelClass} flex min-h-32 flex-col justify-center gap-2 p-4`}>
            <Brackets />
            <span className={dataLabelClass}>{label}</span>
            <strong className="font-[var(--font-headlines)] text-[clamp(1.8rem,4vw,2.6rem)] leading-none text-[var(--primary)]">{value}</strong>
          </article>
        ))}
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.72fr)]">
        <main className="grid gap-5">
          <article className={`${panelClass} p-[clamp(1.2rem,3vw,2rem)]`}>
            <Brackets />
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">Active Mission</p>
              <span className={`home-console-status is-${missionStatus.toLowerCase()}`}>{playedToday ? "Filed" : missionStatus}</span>
            </div>
            <h1 className="my-3 max-w-[12ch] text-[clamp(2.65rem,7vw,5.7rem)] leading-[0.94] tracking-normal max-sm:max-w-none max-sm:text-[clamp(2.25rem,16vw,3.6rem)]">
              {todayStoryline.title}
            </h1>
            <p className={`${dataLabelClass} mb-5`}>
              Chapter {chapterNumber} of {todayStoryline.chapters.length} by {todayCharacter.name}, {todayCharacter.occupation}
            </p>
            <div
              className="relative min-h-[clamp(220px,32vw,380px)] overflow-hidden border border-[var(--outline-variant)] bg-[var(--surface-container-low)] [background-image:linear-gradient(90deg,color-mix(in_oklab,var(--primary)_10%,transparent)_1px,transparent_1px),linear-gradient(0deg,color-mix(in_oklab,var(--primary)_10%,transparent)_1px,transparent_1px)] [background-size:34px_34px]"
              aria-hidden="true"
            >
              <div className="absolute inset-[18%_8%] rotate-[-5deg] skew-x-[-18deg] border border-[color-mix(in_oklab,var(--primary)_45%,transparent)]" />
              <div className="absolute inset-[30%_18%] rotate-[-5deg] skew-x-[-18deg] border border-[color-mix(in_oklab,var(--primary)_28%,transparent)]" />
              <div className="absolute left-[42%] top-[42%] h-[18px] w-[18px] rotate-[-5deg] bg-[var(--primary)]" />
              <div className="absolute bottom-5 right-5 z-[1] flex h-[42%] w-[34%] items-end gap-2 opacity-80 max-sm:w-[48%]">
                {missionBars.map((value, idx) => (
                  <span key={`${value}-${idx}`} className="min-w-3 flex-1 bg-[color-mix(in_oklab,var(--primary)_68%,white)]" style={{ height: `${30 + Math.min(70, value * 7)}%` }} />
                ))}
              </div>
              <span className="absolute bottom-4 left-4 z-[2] border border-[var(--primary)] bg-[color-mix(in_oklab,var(--surface-container-lowest)_86%,transparent)] px-3 py-2 font-[var(--font-data)] text-[0.76rem] font-extrabold uppercase tracking-[0.08em] text-[var(--primary)]">
                {playedToday ? `Confidence filed at ${todayPlay?.score ?? 0}%` : "Awaiting player classification"}
              </span>
            </div>
            <p className="my-5 max-w-[72ch] text-[1.05rem] text-[var(--on-surface-variant)]">
              {playedToday
                ? "Your field report is in the archive. Review the evidence, compare the result, or brief the consensus desk."
                : activeChapter?.briefing ?? `Analyze real space data with ${todayCharacter.name} to advance today's research mission.`}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/games/today" className="inline-flex items-center justify-center border border-[var(--primary)] bg-[var(--primary)] px-6 py-3 font-[var(--font-headlines)] text-sm font-bold uppercase tracking-[0.05em] text-white no-underline hover:bg-[var(--secondary)]">
                {leadActionLabel}
              </Link>
              <Link href="/discuss" className="inline-flex items-center justify-center border border-[var(--outline)] bg-[var(--surface-container-lowest)] px-6 py-3 font-[var(--font-headlines)] text-sm font-bold uppercase tracking-[0.05em] no-underline hover:border-[var(--primary)] hover:bg-[var(--surface-container-low)]">
                Consensus Desk
              </Link>
            </div>
          </article>

          <section className="grid gap-5 md:grid-cols-2" aria-label="Recent field notes">
            <article className={`${panelClass} p-4`}>
              <Brackets />
              <h2 className="mb-4 border-b border-[var(--outline-variant)] pb-2 text-xl tracking-normal">Recent Dispatches</h2>
              {plays.length ? (
                <ul className="m-0 grid list-none gap-3 p-0">
                  {plays.slice(0, 3).map((play) => (
                    <li key={`${play.game_date}-${play.played_at}`} className="grid gap-1 border-b border-[var(--outline-variant)] pb-3">
                      <span className={dataLabelClass}>{play.game_date}</span>
                      <span className={`home-result-status ${play.won ? "is-win" : "is-played"}`}>{play.won ? "Won" : "Filed"}</span>
                      <span className="text-[var(--muted)]">
                        Score {play.score} &middot; {play.attempts} tries
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No field reports yet.</p>
              )}
            </article>

            <article className={`${panelClass} p-4`}>
              <Brackets />
              <h2 className="mb-4 border-b border-[var(--outline-variant)] pb-2 text-xl tracking-normal">Medals &amp; Marks</h2>
              {badges.length ? (
                <div className="grid gap-3">
                  {badges.slice(0, 2).map((badge) => (
                    <div className="border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3" key={badge.slug}>
                      <h3 className="mb-1 mt-0 text-[0.95rem] text-[var(--primary)]">{badge.name}</h3>
                      <p className="m-0 text-sm text-[var(--muted)]">{badge.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted">Complete missions to unlock badges.</p>
              )}
            </article>
          </section>
        </main>

        <aside className="grid gap-5" aria-label="Daily journal">
          <article className={`${panelClass} p-4`}>
            <Brackets />
            <h2 className="mb-4 border-b border-[var(--outline-variant)] pb-2 text-xl tracking-normal">Daily Objectives</h2>
            <ul className="m-0 grid list-none gap-3 p-0">
              {objectives.map(([complete, label]) => (
                <li key={label} className={`flex items-center gap-3 font-[var(--font-data)] text-[0.78rem] font-bold uppercase tracking-[0.08em] ${complete ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}>
                  <span aria-hidden="true">{complete ? "[x]" : "[ ]"}</span>
                  {label}
                </li>
              ))}
            </ul>
          </article>

          <article className={`${panelClass} p-4`}>
            <Brackets />
            <h2 className="mb-4 border-b border-[var(--outline-variant)] pb-2 text-xl tracking-normal">Tomorrow&apos;s Teaser</h2>
            <div className="flex items-center gap-3">
              <Image src={tomorrowAvatarSrc} alt={tomorrowCharacter.name} width={40} height={40} unoptimized className="border border-[color-mix(in_oklab,var(--primary)_24%,transparent)] bg-white" />
              <p className="m-0 grid gap-1">
                <strong>{tomorrowStoryline.title}</strong>
                <span className="text-sm text-[var(--muted)]">{tomorrowCharacter.name} takes the next watch.</span>
              </p>
            </div>
          </article>

          <article className={`${panelClass} p-4`}>
            <Brackets />
            <h2 className="mb-4 border-b border-[var(--outline-variant)] pb-2 text-xl tracking-normal">Consensus Feed</h2>
            {comments.length ? (
              <ul className="m-0 grid list-none gap-3 p-0">
                {comments.slice(0, 4).map((comment) => (
                  <li key={comment.id} className="border-b border-[var(--outline-variant)] pb-3">
                    <p className="m-0">
                      <strong>@{getUsername(comment.profiles)}</strong> <span className="muted">on {comment.game_date}</span>
                    </p>
                    <p className="m-0 text-[var(--muted)]">{truncateText(comment.body, 96)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No community activity yet.</p>
            )}
          </article>
        </aside>
      </div>
    </section>
  );
}
