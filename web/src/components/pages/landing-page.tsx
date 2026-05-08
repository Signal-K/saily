import Link from "next/link";
import Image from "next/image";
import { getStorylineForDate, getCharacterForStoryline } from "@/lib/mission";
import { getRobotAvatarDataUri } from "@/lib/avatar";
import { getMelbourneDateKey } from "@/lib/melbourne-date";

export default function LandingPage() {
  const today = getMelbourneDateKey();
  const todayDate = new Date();
  const storyline = getStorylineForDate(todayDate);
  const character = getCharacterForStoryline(storyline);
  const avatarSrc = getRobotAvatarDataUri(character.avatarSeed, 64);

  return (
    <div className="landing-page">
      {/* ── Hero Section: Mission Control ──────────────────────────────── */}
      <section className="home-console-shell hero hero-mission bracket-corners">
        <div className="home-console-grid">
          <div className="home-console-primary">
            <div className="home-console-kicker-row">
              <p className="eyebrow">Terminal Status: Active</p>
              <span className="home-console-status is-ready">Uplink Stable</span>
            </div>
            
            <div className="home-mission-header">
              <Image
                src={avatarSrc}
                alt={character.name}
                width={64}
                height={64}
                unoptimized
                className="home-mission-avatar"
              />
              <div>
                <p className="data-label" style={{ color: "var(--primary)", marginBottom: "0.25rem" }}>Current Objective</p>
                <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{storyline.title}</h1>
                <p className="muted">
                  Directed by {character.name} &middot; {character.occupation}
                </p>
              </div>
            </div>

            <p className="home-mission-desc" style={{ fontSize: "1.1rem", maxWidth: "600px", margin: "1.5rem 0 2rem" }}>
              Join the global network of citizen scientists. Analyze real telemetry from the TESS satellite and Mars orbiters to discover new worlds.
            </p>

            <div className="cta-row">
              <Link href="/auth/sign-in" className="button button-primary" style={{ paddingInline: "2.5rem" }}>
                Begin Personnel Onboarding
              </Link>
              <Link href="/discuss" className="button">
                View Public Logs
              </Link>
            </div>

            <div className="home-tomorrow-teaser" style={{ marginTop: "3rem" }}>
              <span className="data-label" style={{ opacity: 0.6 }}>Network Latency: 42ms &middot; Active Users: 1,284</span>
            </div>
          </div>

          <div className="home-console-side">
            <div className="home-console-panel">
              <div className="home-console-panel-head">
                <span>Signal Strength</span>
                <small>98.4%</small>
              </div>
              <div className="home-signal-bars" aria-hidden>
                <span style={{ height: "32px" }} />
                <span style={{ height: "48px" }} />
                <span style={{ height: "40px" }} />
                <span style={{ height: "52px" }} />
              </div>
              <div className="home-console-readout">
                <span>Buffer 0.4s</span>
                <span className="home-readout-chips">
                  <Image src="/assets/data-chip.svg" alt="" width={16} height={16} />
                  <span>Verified: 8,291</span>
                </span>
              </div>
            </div>

            <div className="home-console-panel" style={{ background: "var(--primary)", color: "white" }}>
              <div className="home-console-panel-head" style={{ color: "rgba(255,255,255,0.7)" }}>
                <span>System Protocol</span>
              </div>
              <p style={{ fontFamily: "var(--font-data)", fontSize: "0.75rem", margin: 0, lineHeight: 1.6 }}>
                UNAUTHORIZED ACCESS RESTRICTED. PLEASE AUTHENTICATE TO ACCESS TRANSIT SCANNER AND CLOUD-SPOTTING ARRAYS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Impact Stats ────────────────────────────────────────────── */}
      <section className="panel home-section" style={{ marginTop: "3rem" }}>
        <div className="home-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <article className="card shadow-glow">
            <p className="data-label">Total Findings</p>
            <p style={{ fontSize: "2rem", fontWeight: 900, color: "var(--primary)" }}>14,209</p>
            <p className="muted" style={{ fontSize: "0.8rem" }}>Exoplanet candidates identified since mission start.</p>
          </article>
          <article className="card shadow-glow">
            <p className="data-label">Classifications</p>
            <p style={{ fontSize: "2rem", fontWeight: 900, color: "var(--primary)" }}>4,281,093</p>
            <p className="muted" style={{ fontSize: "0.8rem" }}>Volunteer contributions to the scientific consensus.</p>
          </article>
          <article className="card shadow-glow">
            <p className="data-label">Research Papers</p>
            <p style={{ fontSize: "2rem", fontWeight: 900, color: "var(--primary)" }}>28</p>
            <p className="muted" style={{ fontSize: "0.8rem" }}>Peer-reviewed publications featuring Daily Sail data.</p>
          </article>
        </div>
      </section>

      {/* ── Feature Highlights ───────────────────────────────────────── */}
      <div className="home-grid-two" style={{ marginTop: "1.5rem" }}>
        <section className="panel bracket-corners">
          <p className="eyebrow">Project Alpha</p>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Exoplanet Hunting</h2>
          <p className="muted" style={{ marginBottom: "1.5rem" }}>
            Analyze lightcurves from the Transiting Exoplanet Survey Satellite (TESS). Look for the telltale dip in brightness that signals a planet passing in front of its host star.
          </p>
          <div style={{ height: "120px", background: "var(--surface-container-low)", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
             <div style={{ position: "absolute", inset: 0, opacity: 0.2, backgroundImage: "linear-gradient(90deg, var(--primary) 1px, transparent 1px), linear-gradient(0deg, var(--primary) 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
             <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
               <polyline points="0,50 50,52 100,48 150,50 180,85 220,85 250,50 300,52 350,48 400,50" fill="none" stroke="var(--primary)" strokeWidth="2" />
             </svg>
          </div>
        </section>

        <section className="panel bracket-corners">
          <p className="eyebrow">Project Beta</p>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Mars Cloudspotting</h2>
          <p className="muted" style={{ marginBottom: "1.5rem" }}>
            Identify carbon dioxide clouds in the Martian atmosphere using infrared data from the Mars Reconnaissance Orbiter (MRO). Help scientists understand the Red Planet&apos;s climate.
          </p>
          <div style={{ height: "120px", background: "var(--surface-container-low)", border: "1px solid var(--border)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ea580c)", opacity: 0.6 }}></div>
             <div style={{ position: "absolute", top: "20%", left: "30%", width: "40px", height: "10px", background: "white", borderRadius: "10px", opacity: 0.4, filter: "blur(4px)" }}></div>
             <div style={{ position: "absolute", top: "50%", left: "55%", width: "30px", height: "8px", background: "white", borderRadius: "10px", opacity: 0.4, filter: "blur(4px)" }}></div>
          </div>
        </section>
      </div>

      {/* ── Call to Action ─────────────────────────────────────────── */}
      <section className="panel" style={{ marginTop: "3rem", textAlign: "center", padding: "4rem 2rem", background: "var(--surface-container-low)" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "1rem" }}>Ready to join the crew?</h2>
        <p className="muted" style={{ maxWidth: "500px", margin: "0 auto 2.5rem" }}>
          Create your personnel file to start earning data chips, tracking your streak, and contributing to actual NASA research.
        </p>
        <Link href="/auth/sign-in" className="button button-primary" style={{ paddingInline: "4rem", fontSize: "1rem" }}>
          CREATE PERSONNEL FILE
        </Link>
      </section>
    </div>
  );
}
