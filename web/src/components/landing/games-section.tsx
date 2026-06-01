import Image from "next/image";
import Link from "next/link";
import { games } from "@/components/landing/landing-data";
import { Kicker } from "@/components/landing/landing-shared";

export function GamesSection() {
  return (
    <section id="games" className="tx-section">
      <div className="tx-section-head">
        <div>
          <Kicker>Games &middot; Powered by Star Sailors</Kicker>
          <h2>Play the universe while you read.</h2>
          <p>The paper is the front page. The Star Sailors games are where the discoveries become interactive.</p>
        </div>
        <Link className="button" href="/games/today">Open current puzzles</Link>
      </div>
      <div className="tx-games-grid" style={{ marginTop: "1rem" }}>
        {games.map((game) => (
          <a className="tx-game-card" href={game.href} target="_blank" rel="noreferrer" key={game.title}>
            <div className="tx-game-image">
              <Image src={game.image} alt="" width={92} height={64} />
            </div>
            <Kicker>{game.status}</Kicker>
            <h3>{game.title}</h3>
            <p>{game.body}</p>
          </a>
        ))}
        <Link className="tx-game-card" href="/games/today">
          <div className="tx-game-image">
            <Image src="/puzzles/lightcurve-analysis.svg" alt="" width={92} height={64} />
          </div>
          <Kicker>Daily in the paper</Kicker>
          <h3>Transit Spotting and Mars Ice</h3>
          <p>Current Saily minigames remain available while the publication layer gets ready.</p>
        </Link>
      </div>
    </section>
  );
}
