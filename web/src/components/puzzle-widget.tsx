import Link from "next/link";

// Embedded within article body copy via a `{{puzzle}}` marker (see
// web/src/lib/markdown.ts). Per STS-304, this does not run its own puzzle
// instance inline — it points to the same daily mission at /games/today, so
// there is no separate progress state to reconcile: opening the full puzzle
// page always reflects the same game_date-keyed play/streak state.
export function PuzzleWidget() {
  return (
    <div className="panel puzzle-grain puzzle-widget" style={{ padding: "1.25rem", display: "grid", gap: "0.5rem" }}>
      <p className="eyebrow">The Daily Transit</p>
      <p style={{ margin: 0, fontWeight: 600 }}>We have puzzles today.</p>
      <p className="muted" style={{ margin: 0 }}>
        A real science crossword and a transit-spotting round, built from today&apos;s data.
      </p>
      <div>
        <Link href="/games/today" className="button button-primary">
          Play today&apos;s mission
        </Link>
      </div>
    </div>
  );
}
