import Image from "next/image";
import { teamCards } from "@/components/landing/landing-data";
import { Kicker } from "@/components/landing/landing-shared";

export function TeamSection() {
  const coreTeam = teamCards.filter((person) => person.group === "Team");
  const thanks = teamCards.filter((person) => person.group === "With thanks");

  return (
    <section id="team" className="tx-section">
      <div className="tx-section-head">
        <div>
          <Kicker>Team and information desk</Kicker>
          <h2>The crew behind the first edition.</h2>
          <p>The Daily Transit is a Star Sailors publication built around lightweight citizen-science play, clear editorial framing, and fast public feedback.</p>
        </div>
      </div>
      <div className="tx-team-grid" style={{ marginTop: "1rem" }}>
        {coreTeam.map((person) => (
          <article className="tx-team-card" key={person.name}>
            <Image className="tx-team-avatar" src={person.icon} alt="" width={64} height={64} />
            <Kicker>{person.group}</Kicker>
            <h3>{person.name}</h3>
            <p>{person.role}</p>
          </article>
        ))}
      </div>
      <div className="tx-thanks-list" aria-label="With thanks">
        <Kicker>With thanks</Kicker>
        <div className="tx-thanks-grid">
          {thanks.map((person) => (
            <article className="tx-thanks-card" key={person.name}>
              <Image className="tx-team-avatar tx-team-avatar-small" src={person.icon} alt="" width={48} height={48} />
              <div>
                <h3>{person.name}</h3>
                <p>{person.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
