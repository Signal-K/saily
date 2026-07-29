import Link from "next/link";

export const metadata = { title: "Games — The Daily Transit" };

const MISSIONS = [
  {
    href: "/games/crossword",
    title: "Crossword",
    body: "A new science crossword every day, clued from real sky events and discoveries. Play it any time — completing it earns a Data Chip.",
  },
  {
    href: "/games/transit-spotter",
    title: "Transit Spotter",
    body: "Spot real transit dips in genuine Planet Hunters TESS light curves. Play it any time — completing it earns a Data Chip.",
  },
  {
    href: "/games/close-approaches",
    title: "Close Approach Ranker",
    body: "Rank real NASA/JPL near-Earth flybys by closest approach. Play it any time — completing it earns a Data Chip.",
  },
  {
    href: "/games/cloudspotting-mars",
    title: "Cloudspotting on Mars",
    body: "Classify real Mars surface imagery from Zooniverse's Cloudspotting on Mars project. Play it any time — completing it earns a Data Chip.",
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

      <div className="panel" style={{ padding: "1.25rem", marginTop: "1rem" }}>
        <p className="eyebrow">Flagship &middot; Star Sailors</p>
        <h2 style={{ margin: "0 0 0.35rem" }}>Landnam</h2>
        <p className="muted" style={{ margin: "0 0 1rem" }}>
          Hunt real exoplanet signals from TESS data, then manage the crew
          and resources needed to follow up on the best candidates — the
          full Star Sailors flagship game, live now.
        </p>
        <a href="https://playlandnam.space" target="_blank" rel="noreferrer" className="button button-primary">
          Play Landnam now →
        </a>
      </div>

      <div className="panel" style={{ padding: "1.25rem", marginTop: "1rem" }}>
        <p className="eyebrow">Star Sailors</p>
        <h2 style={{ margin: "0 0 0.35rem" }}>Atlas</h2>
        <p className="muted" style={{ margin: "0 0 1rem" }}>
          Track real sky events and plan your own observations — the
          Star Sailors companion for going outside and looking up.
        </p>
        <a href="https://youratlas.cc" target="_blank" rel="noreferrer" className="button button-primary">
          Visit Atlas →
        </a>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <Link href="/" className="button">Back to Home</Link>
      </div>
    </main>
  );
}
