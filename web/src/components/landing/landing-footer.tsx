import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="tx-footer">
      <div className="tx-footer-brand">
        <Image src="/logo-icon.png" alt="" width={40} height={40} />
        <span>
          <strong>
            Star <em>Sailors</em>
          </strong>
          <span>The Universe in Play</span>
        </span>
      </div>
      <nav className="tx-footer-links" aria-label="Footer links">
        <Link href="/archive">Archive</Link>
        <Link href="/articles">Articles</Link>
        <Link href="/discoveries">Discoveries</Link>
        <Link href="/calendar">Calendar</Link>
        <a href="https://starsailors.space" target="_blank" rel="noreferrer">Star Sailors Space</a>
      </nav>
    </footer>
  );
}
