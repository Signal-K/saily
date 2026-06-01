import { newsroom } from "@/components/landing/landing-data";
import { Kicker } from "@/components/landing/landing-shared";

export function NewsroomSection() {
  return (
    <section id="newsroom" className="tx-section">
      <div className="tx-section-head">
        <div>
          <Kicker>Newsroom &middot; Reels and headlines</Kicker>
          <h2>The front page is being set.</h2>
          <p>Real content lands later. For now, the page shows the structure: one lead, short visual dispatches, puzzle notes, and a daily discovery teaser.</p>
        </div>
      </div>
      <div className="tx-news-grid" style={{ marginTop: "1rem" }}>
        {newsroom.map((item) => (
          <article className="tx-news-card" key={item.title}>
            <Kicker>{item.kicker}</Kicker>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
