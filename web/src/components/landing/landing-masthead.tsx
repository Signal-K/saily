import Image from "next/image";
import { StatusPill } from "@/components/landing/landing-shared";

export function LandingMasthead() {
  return (
    <header className="tx-public-mast">
      <div className="tx-public-mast-inner">
        <a className="tx-brand-public" href="#top" aria-label="The Daily Transit home">
          <Image src="/logo-icon.png" alt="" width={40} height={40} />
          <span>
            <strong>
              The Daily <em>Transit</em>
            </strong>
            <span>A Star Sailors publication</span>
          </span>
        </a>
        <nav className="tx-public-nav" aria-label="Landing sections">
          <a href="#briefing">Briefing</a>
          <a href="#citizen-science">Citizen science</a>
          <a href="#newsroom">Newsroom</a>
          <a href="#games">Games</a>
          <a href="#team">Team</a>
        </nav>
        <StatusPill href="#notify">Launching soon</StatusPill>
      </div>
    </header>
  );
}
