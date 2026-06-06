import Image from "next/image";
import { games } from "@/components/landing/landing-data";
import { Kicker } from "@/components/landing/landing-shared";

export function GamesSection() {
  return (
    <section id="games" className="tx-section">
      <div className="tx-section-head">
        <div>
          <Kicker>Games &middot; Powered by Star Sailors</Kicker>
          <h2>Play the universe.</h2>
          <p>The Star Sailors ecosystem is expanding. Explore our flagship and upcoming games that turn real data into interactive experiences.</p>
        </div>
      </div>
      <div className="tx-games-grid" style={{ marginTop: "1rem" }}>
        {games.map((game) => (
          <a className="tx-game-card" href={game.href} target={game.href === "#" ? undefined : "_blank"} rel="noreferrer" key={game.title}>
            <div className="tx-game-image">
              <Image src={game.image} alt="" width={92} height={64} />
            </div>
            <Kicker>{game.status}</Kicker>
            <h3>{game.title}</h3>
            <p>{game.body}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
