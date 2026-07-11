import Link from "next/link";
import { listDiscoveries } from "@/lib/discoveries";
import { getLandnamAppUrl } from "@/lib/pocketbase/config";
import { DiscoveryComments } from "@/components/discovery-comments";

export const metadata = { title: "Discoveries — The Daily Transit" };

export default async function DiscoveriesPage() {
  const discoveries = await listDiscoveries();
  const landnamUrl = getLandnamAppUrl();

  return (
    <main style={{ maxWidth: "640px", margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <p className="eyebrow">The Daily Transit</p>
        <h1>Discoveries</h1>
        <p className="muted" style={{ marginTop: "0.35rem" }}>
          Real results, confirmed by the citizen-science community — as they happen, across every Star Sailors
          mission.
        </p>
      </div>

      {discoveries.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", padding: "2rem" }}>
          <p>No discoveries confirmed yet — check back soon.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {discoveries.map((discovery) => (
            <div key={discovery.id} className="panel" style={{ padding: "1.25rem" }}>
              <p className="muted" style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {discovery.game}
              </p>
              <h2 style={{ margin: "0.25rem 0 0.5rem" }}>{discovery.headline}</h2>
              {discovery.summary && <p className="muted">{discovery.summary}</p>}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1rem", gap: "1rem" }}>
                {discovery.occurred_at && (
                  <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>
                    {new Date(discovery.occurred_at).toLocaleDateString()}
                  </p>
                )}
                <a href={landnamUrl} className="button" target="_blank" rel="noreferrer">
                  Log in to Landnam
                </a>
              </div>
              <DiscoveryComments discoveryId={discovery.id} />
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <Link href="/" className="button">Back to Home</Link>
      </div>
    </main>
  );
}
