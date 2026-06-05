import { Kicker } from "@/components/landing/landing-shared";

const steps = [
  ["01", "You play", "Solve a puzzle built from real mission data."],
  ["02", "The crowd agrees", "Your answer joins other classifications to reduce noise."],
  ["03", "Science advances", "Strong candidates can be reviewed, shared, and followed up."],
] as const;

export function CitizenScienceSection() {
  return (
    <section id="citizen-science" className="tx-section">
      <div className="tx-section-head">
        <div>
          <Kicker>What is citizen science?</Kicker>
          <h2>Real research, done by readers like you.</h2>
          <p>There is more telescope and mission data than scientists can inspect alone. The Daily Transit turns a small piece of that work into a daily habit.</p>
        </div>
      </div>
      <div className="tx-citizen-grid">
        <div className="tx-citizen-copy">
          <p>
            You do not need a degree or a telescope. You inspect real data, make a careful call, and your answer joins the crowd. When enough readers agree, the result becomes a cleaner candidate for researchers to follow up.
          </p>
          <p>
            That is the promise of the paper: science that feels approachable, but still points back to real missions and real discovery.
          </p>
        </div>
        <div className="tx-step-grid">
          {steps.map(([num, title, body]) => (
            <article className="tx-step" key={num}>
              <span className="tx-step-num">{num}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
