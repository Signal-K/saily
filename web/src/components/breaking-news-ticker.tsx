import Link from "next/link";
import { listDiscoveries } from "@/lib/discoveries";

type TickerItem = {
  key: string;
  label: string;
  text: string;
  href: string;
  timestamp: string;
};

// Secondary top-layer bar surfacing breaking news (STS-152). Content source
// is explicitly decided (recorded on the ticket, 2026-07-11): real
// cross-game classification discoveries only — not curated editorial and
// not a separate automated science feed. An earlier draft of this
// component also mixed in the latest published article; that's been
// removed to match the final decision.
export async function BreakingNewsTicker() {
  const discoveries = await listDiscoveries();

  const items: TickerItem[] = discoveries.slice(0, 5).map((discovery) => ({
    key: `discovery-${discovery.id}`,
    label: discovery.game,
    text: discovery.headline,
    href: discovery.cta_href || "/discoveries",
    timestamp: discovery.occurred_at,
  }));

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="dt-breaking-news">
      {items.map((item) => (
        <Link key={item.key} href={item.href} className="discovery-headline dt-breaking-news-item">
          <span className="discovery-headline-label">{item.label}</span>
          <span className="discovery-headline-text">{item.text}</span>
        </Link>
      ))}
    </div>
  );
}
