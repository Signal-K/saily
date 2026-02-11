import Link from "next/link";

export default function Home() {
  return (
    <section className="grid gap-6">
      <div className="hero">
        <p className="eyebrow">Daily Puzzle Hub</p>
        <h1>One game a day. Keep your streak alive.</h1>
        <p>
          Minimal NYT-games-inspired app with daily play, stats, badges, comments, and Supabase auth.
        </p>
        <div className="cta-row">
          <Link href="/games/today" className="button button-primary">
            Play Today&apos;s Game
          </Link>
          <Link href="/profile" className="button">
            View Profile
          </Link>
        </div>
      </div>
      <div className="card-grid">
        <article className="card">
          <h2>Daily Anagram</h2>
          <p>Unscramble a 5-letter word chosen deterministically by date.</p>
        </article>
        <article className="card">
          <h2>Streaks + Stats</h2>
          <p>Track wins, total score, games played, and best streak.</p>
        </article>
        <article className="card">
          <h2>Community Layer</h2>
          <p>Post comments and unlock badges from milestones.</p>
        </article>
      </div>
    </section>
  );
}
