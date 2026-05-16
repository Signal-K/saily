import Image from "next/image";
import Link from "next/link";
import { getRobotAvatarDataUri } from "@/lib/avatar";
import { getCharacterForStoryline, getStorylineForDate } from "@/lib/mission";

const DAILY_MISSION_COUNT = 3;

export default function LandingPage() {
  const storyline = getStorylineForDate(new Date());
  const character = getCharacterForStoryline(storyline);
  const avatarSrc = getRobotAvatarDataUri(character.avatarSeed, 64);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(110,180,224,0.16),transparent_22%),linear-gradient(180deg,#f8fbfd_0%,#edf3f7_100%)] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex min-h-[60px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:min-h-[76px] sm:gap-6 sm:px-6">
          <Link
            href="/"
            aria-label="The Daily Sail home"
            className="font-[Iowan_Old_Style,Palatino_Linotype,Book_Antiqua,Georgia,serif] text-2xl font-bold leading-none tracking-[-0.05em] text-slate-900 sm:text-4xl lg:text-5xl"
          >
            THE DAILY SAIL
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="hidden items-center gap-4 sm:flex sm:gap-6">
              <Link href="/games/today" className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 hover:text-sky-700">
                Play
              </Link>
              <Link href="/discuss" className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 hover:text-sky-700">
                Community
              </Link>
              <Link href="/postcards" className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 hover:text-sky-700">
                Postcards
              </Link>
            </nav>

            <Link
              href="/games/today"
              className="inline-flex h-10 items-center justify-center bg-sky-800 px-4 text-xs font-bold uppercase tracking-[0.08em] text-white hover:bg-sky-900 sm:hidden"
            >
              Play
            </Link>

            <Link
              href="/auth/sign-in?mode=sign-up"
              className="hidden h-12 items-center justify-center border border-slate-400 px-6 text-sm font-bold uppercase tracking-[0.08em] text-slate-900 hover:bg-slate-50 sm:inline-flex lg:h-14 lg:px-8"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 sm:py-6">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5 shadow-[0_18px_48px_rgba(20,38,48,0.06)] sm:rounded-[2rem] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_24rem] lg:items-start">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className="rounded-full bg-sky-100 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-800">
                  Daily space science game
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  {DAILY_MISSION_COUNT} guided missions. Real astronomy data.
                </span>
              </div>

              <div className="max-w-3xl">
                <h1 className="max-w-[12ch] font-[Iowan_Old_Style,Palatino_Linotype,Book_Antiqua,Georgia,serif] text-[clamp(1.75rem,5vw,5.2rem)] leading-[0.92] font-bold tracking-[-0.04em] uppercase text-slate-900">
                  A daily game where your answers help real space research.
                </h1>
              </div>

              <p className="max-w-3xl text-xl leading-8 text-slate-700">
                Review star brightness charts, spot moving asteroids, and tag Mars imagery in short beginner-friendly missions.
                Play in minutes. Learn as you go. Create an account only if you want to save streaks and progress.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/games/today"
                  className="inline-flex h-15 items-center justify-center bg-sky-800 px-8 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-sky-900"
                >
                  Play Today&apos;s Mission
                </Link>
                <Link
                  href="/auth/sign-in?mode=sign-up"
                  className="inline-flex h-15 items-center justify-center border border-slate-400 bg-white px-8 text-sm font-bold uppercase tracking-[0.08em] text-slate-900 hover:bg-slate-50"
                >
                  Save Progress
                </Link>
                <Link href="/auth/sign-in" className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 hover:text-sky-700">
                  Sign in
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Time</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">About 5 minutes</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Experience</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">No science background needed</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Today&apos;s set</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{storyline.title}</p>
                </div>
              </div>
            </div>

            <aside className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/90 p-6">
              <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-4">
                <Image src={avatarSrc} alt={character.name} width={64} height={64} unoptimized className="rounded-2xl border border-slate-200 bg-white" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Today&apos;s guide</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{character.name}</p>
                  <p className="text-sm text-slate-600">{character.occupation}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-800">1. Planet Hunt</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Look for repeating dips in a star&apos;s light that could indicate a planet passing in front of it.
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-800">2. Asteroid Scan</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Mark moving objects in image sets and flag the strongest asteroid candidates.
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-800">3. Mars Tags</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Label surface features in Mars imagery so larger datasets can be sorted faster.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3" aria-label="Why people play">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white/85 px-6 py-6 shadow-[0_18px_48px_rgba(20,38,48,0.04)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Play instantly</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-900">No account required to start</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Open today&apos;s mission and begin immediately. Sign up later if you want streaks, rewards, and saved history.
            </p>
          </article>
          <article className="rounded-[1.75rem] border border-slate-200 bg-white/85 px-6 py-6 shadow-[0_18px_48px_rgba(20,38,48,0.04)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Learn fast</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-900">Each mission teaches the pattern first</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              The game explains what to look for before you answer, so first-time players aren&apos;t dropped into unexplained jargon.
            </p>
          </article>
          <article className="rounded-[1.75rem] border border-slate-200 bg-white/85 px-6 py-6 shadow-[0_18px_48px_rgba(20,38,48,0.04)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Contribute something real</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-900">Your answers are more than cosmetic</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              The missions are based on real astronomy workflows, packaged into a format that feels approachable instead of academic.
            </p>
          </article>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white/85 px-6 py-6 shadow-[0_18px_48px_rgba(20,38,48,0.04)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="font-[Iowan_Old_Style,Palatino_Linotype,Book_Antiqua,Georgia,serif] text-5xl font-bold tracking-[-0.05em] text-slate-900">
              How it works
            </h2>
            <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              <span>Fresh every day</span>
              <Link href="/games/today" className="text-sky-800 hover:text-sky-900">
                Open today&apos;s mission
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <article className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Step 1</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">Read the clue</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Each puzzle starts with a plain-language explanation of the signal or surface feature you&apos;re trying to spot.
              </p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">Step 2</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">Make your call</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Annotate the chart or image, submit your answer, and move through the mission set without getting lost in setup screens.
              </p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">Step 3</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">Come back tomorrow</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Fresh daily missions keep the loop tight. Accounts unlock saved progress, badges, and discussion after you submit.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
