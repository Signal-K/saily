import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type DayState = "done" | "partial" | "none";

type DayCell = {
  day: number;
  dateKey: string;
  state: DayState;
};

type SearchParams = {
  month?: string;
};

function parseMonthKey(value: string | undefined) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null;
  return { year, month };
}

function getCurrentMonthParts() {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

function getMonthLabel(year: number, month: number) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${monthNames[month - 1]} ${year}`;
}

function toMonthKey(year: number, month: number) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
}

function getMonthBounds(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  const startKey = start.toISOString().slice(0, 10);
  const endKey = end.toISOString().slice(0, 10);
  return { start, end, startKey, endKey };
}

function getPrevMonth(year: number, month: number) {
  const d = new Date(Date.UTC(year, month - 1, 1));
  d.setUTCMonth(d.getUTCMonth() - 1);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

function getNextMonth(year: number, month: number) {
  const d = new Date(Date.UTC(year, month - 1, 1));
  d.setUTCMonth(d.getUTCMonth() + 1);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

function buildCalendarCells(year: number, month: number, playedMap: Map<string, boolean>) {
  const { end } = getMonthBounds(year, month);
  const daysInMonth = end.getUTCDate();

  const cells: DayCell[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const won = playedMap.get(dateKey);
    const state: DayState = won === true ? "done" : won === false ? "partial" : "none";
    cells.push({ day, dateKey, state });
  }

  return cells;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const parsed = parseMonthKey(params.month);
  const fallback = getCurrentMonthParts();
  const year = parsed?.year ?? fallback.year;
  const month = parsed?.month ?? fallback.month;

  const monthLabel = getMonthLabel(year, month);
  const prev = getPrevMonth(year, month);
  const next = getNextMonth(year, month);
  const { start, startKey, endKey } = getMonthBounds(year, month);
  const firstDayIndex = start.getUTCDay();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section className="calendar-page-shell">
        <div className="panel">
          <h1>Puzzle Calendar</h1>
          <p className="muted">Sign in to view your real completion history.</p>
          <Link href="/auth/sign-in" className="button button-primary">
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  const { data: plays, error } = await supabase
    .from("daily_plays")
    .select("game_date,won")
    .eq("user_id", user.id)
    .gte("game_date", startKey)
    .lte("game_date", endKey)
    .order("game_date", { ascending: true });

  if (error) {
    return (
      <section className="calendar-page-shell">
        <div className="panel">
          <h1>Puzzle Calendar</h1>
          <p className="muted">Could not load calendar data: {error.message}</p>
        </div>
      </section>
    );
  }

  const playedMap = new Map<string, boolean>();
  (plays ?? []).forEach((row) => {
    playedMap.set(row.game_date, row.won);
  });

  const progress = buildCalendarCells(year, month, playedMap);

  return (
    <section className="calendar-page-shell">
      <header className="panel calendar-page-header">
        <div>
          <p className="eyebrow">Activity</p>
          <h1>Puzzle Calendar</h1>
          <p className="muted">Track real completion from Supabase and jump straight into any day&apos;s thread.</p>
        </div>
      </header>

      <article className="panel calendar-page-card">
        <div className="calendar-page-toolbar">
          <Link href={`/calendar?month=${toMonthKey(prev.year, prev.month)}`} className="calendar-page-nav-btn">
            ← Prev
          </Link>
          <p className="calendar-page-month">{monthLabel}</p>
          <div className="calendar-page-toolbar-right">
            <Link href="/calendar" className="calendar-page-nav-btn calendar-page-nav-subtle">
              Current
            </Link>
            <Link href={`/calendar?month=${toMonthKey(next.year, next.month)}`} className="calendar-page-nav-btn">
              Next →
            </Link>
          </div>
        </div>

        <div className="calendar-page-weekdays" aria-hidden>
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="calendar-page-grid" aria-label={`Puzzle progress for ${monthLabel}`}>
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <span key={`gap-${idx}`} className="calendar-page-cell is-empty" />
          ))}
          {progress.map(({ day, state, dateKey }) => (
            <Link
              key={day}
              href={`/discuss?date=${dateKey}`}
              className={`calendar-page-cell is-${state}`}
              title={`Open discuss for ${dateKey}`}
            >
              <span>{day}</span>
            </Link>
          ))}
        </div>

        <div className="calendar-page-legend">
          <span className="legend-item">
            <i className="dot done" />
            Solved
          </span>
          <span className="legend-item">
            <i className="dot partial" />
            Attempted
          </span>
          <span className="legend-item">
            <i className="dot none" />
            Not played
          </span>
        </div>
      </article>
    </section>
  );
}
