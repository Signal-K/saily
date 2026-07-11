export const metadata = { title: "Imprint — The Daily Transit" };

export default function ImprintPage() {
  return (
    <main className="panel" style={{ maxWidth: "640px", margin: "2rem auto" }}>
      <p className="eyebrow">Legal</p>
      <h1>Imprint</h1>
      <p className="muted">
        The Daily Transit is developed as part of the Star Sailors project.
      </p>
      <p className="muted">
        For contact, source, and licensing information, see the project on{" "}
        <a href="https://github.com/signal-k" target="_blank" rel="noreferrer">
          GitHub
        </a>
        .
      </p>
    </main>
  );
}
