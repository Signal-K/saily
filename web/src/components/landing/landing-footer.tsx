import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="tx-footer">
      <div className="tx-footer-brand">
        <Image src="/logo-icon.png" alt="" width={40} height={40} />
        <span>
          <strong>
            The Daily <em>Transit</em>
          </strong>
          <span>Pre-launch &middot; Coming soon</span>
        </span>
      </div>
      <nav className="tx-footer-links" aria-label="Footer links">
        <Link href="/games/today">Current puzzles</Link>
        <Link href="/discuss">Consensus desk</Link>
        <Link href="/calendar">Archive</Link>
      </nav>
    </footer>
  );
}
