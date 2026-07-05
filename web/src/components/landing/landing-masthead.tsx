import Image from "next/image";
import Link from "next/link";
import { StatusPill } from "@/components/landing/landing-shared";

export function LandingMasthead() {
  return (
    <header id="top" className="tx-public-mast">
      <div className="tx-public-title-row">
        <a className="tx-brand-public" href="#top" aria-label="The Daily Transit home">
          <Image src="/logo-icon.png" alt="" width={40} height={40} />
          <span>
            <strong>
              The Daily <em>Transit</em>
            </strong>
            <span>A Star Sailors publication</span>
          </span>
        </a>
        <StatusPill href="#top">Launching soon</StatusPill>
      </div>

      <div className="tx-public-nav-row">
        <nav className="tx-public-nav tx-public-nav-primary" aria-label="Primary menu">
          <a href="#daily">Today</a>
          <Link href="/archive">Archive</Link>
          <Link href="/articles">Articles</Link>
          <Link href="/discoveries">Discoveries</Link>
          <Link href="/games/today">Play</Link>
        </nav>
        <nav className="tx-public-nav tx-public-nav-secondary" aria-label="Secondary menu">
          <Link href="/calendar">Calendar</Link>
          <Link href="/discuss">Discuss</Link>
          <Link href="/search">Search</Link>
        </nav>
      </div>

      <div className="tx-update-ribbon" aria-label="Latest updates">
        <span>Updates</span>
        <a href="#daily">APOD image live</a>
        <Link href="/archive">Daily archive opening</Link>
      </div>
    </header>
  );
}
