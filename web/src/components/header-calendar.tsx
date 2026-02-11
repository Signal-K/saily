"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DayState = "done" | "partial" | "none";

type DayCell = {
  day: number;
  state: DayState;
};

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

function getDaysInMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month + 1, 0).getDate();
}

function buildMockProgress(daysInMonth: number): DayCell[] {
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    if (day % 5 === 0 || day % 7 === 0) return { day, state: "done" };
    if (day % 3 === 0) return { day, state: "partial" };
    return { day, state: "none" };
  });
}

export function HeaderCalendar() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const today = useMemo(() => new Date(), []);
  const monthLabel = useMemo(() => getMonthLabel(today), [today]);
  const daysInMonth = useMemo(() => getDaysInMonth(today), [today]);
  const firstDayIndex = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1).getDay(), [today]);
  const progress = useMemo(() => buildMockProgress(daysInMonth), [daysInMonth]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setOpen(false);
    }

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="calendar-menu" ref={rootRef}>
      <button
        type="button"
        className="header-nav-link calendar-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        Calendar
      </button>

      {open ? (
        <div className="calendar-popover" role="dialog" aria-label="Puzzle completion calendar">
          <p className="calendar-title">{monthLabel}</p>
          <div className="calendar-grid" aria-hidden>
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <span key={`gap-${idx}`} className="calendar-cell is-empty" />
            ))}
            {progress.map(({ day, state }) => (
              <span key={day} className={`calendar-cell is-${state}`}>
                {day}
              </span>
            ))}
          </div>
          <div className="calendar-legend">
            <span className="legend-item"><i className="dot done" />Done</span>
            <span className="legend-item"><i className="dot partial" />Partial</span>
            <span className="legend-item"><i className="dot none" />Not played</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
