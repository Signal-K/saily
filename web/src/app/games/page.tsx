import Link from "next/link";

export const metadata = { title: "Games — The Daily Transit" };

const MISSIONS = [
  {
    href: "/games/today",
    title: "Today's Mission",
    body: "Mark real transit signals in TESS light curves, Planet-Hunters-style — the daily rotating classification mission, a new real dataset every day.",
  },
  {
    href: "/games/mars",
    title: "Mars",
    body: "Spot surface features in real Mars imagery for the Cloudspotting on Mars project.",
  },
  {
    href: "/games/gaia-variables",
    title: "Gaia Variables",
    body: "Classify variable-star light curves from ESA's Gaia mission.",
  },
  {
    href: "/games/rubin-comet-catchers",
    title: "Rubin Comet Catchers",
    body: "Sweep Rubin Observatory survey frames for comets and other moving objects.",
  },
];

export default function GamesPage() {
  return (
    <main style={{ maxWidth: "640px", margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <p className="eyebrow">The Daily Transit</p>
        <h1>Games</h1>
        <p className="muted" style={{ marginTop: "0.35rem" }}>
          Simple minigames designed to get people coming back to the Star Sailors
          ecosystem — a mix of streaks, fun, learning, and discovery.
        </p>
      </div>

      <div className="panel" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <p className="muted">
          Beyond the daily rotation, this is also where we test the feasibility and
          interest of different citizen-science projects through very simple frontend
          minigames — no heavy graphics or narrative required. The most popular ones,
          voted on by the community, graduate into full minigames with graphics and
          narrative context of their own.
        </p>
        <p className="muted" style={{ marginTop: "0.75rem" }}>
          Whatever stage a project is at, it stays playable through the same
          simple, text-based interfaces on The Daily Transit — no client to
          install, no lore to learn first.
        </p>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {MISSIONS.map((mission) => (
          <Link
            key={mission.href}
            href={mission.href}
            className="panel"
            style={{ padding: "1.25rem", display: "block" }}
          >
            <h2 style={{ margin: "0 0 0.35rem" }}>{mission.title}</h2>
            <p className="muted" style={{ margin: 0 }}>{mission.body}</p>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <Link href="/" className="button">Back to Home</Link>
      </div>
    </main>
  );
}
