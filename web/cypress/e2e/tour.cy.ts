describe("Comprehensive Game Tour", () => {
  beforeEach(() => {
    // Start with a clean slate
    cy.clearLocalStorage();
    cy.clearCookies();

    // Mock initial data to ensure a consistent experience
    const today = new Date().toISOString().slice(0, 10);
    
    // Mock character/story progress
    cy.intercept("GET", "/api/story/progress*", {
      statusCode: 200,
      body: { chapterIndex: 0, characterId: "zix" },
    }).as("storyProgress");

    // Mock today's game data
    const anomalies = [
      {
        id: 101,
        ticId: "101",
        label: "Candidate Alpha",
        anomalyType: "planet",
        lightcurve: Array.from({ length: 50 }, (_, i) => ({ x: i / 49, y: 1 - (i > 20 && i < 25 ? 0.02 : 0) })),
      },
      {
        id: 102,
        ticId: "102",
        label: "Candidate Beta",
        anomalyType: "planet",
        lightcurve: Array.from({ length: 50 }, (_, i) => ({ x: i / 49, y: 1 - (i > 10 && i < 15 ? 0.015 : 0) })),
      },
      {
        id: 103,
        ticId: "103",
        label: "Candidate Gamma",
        anomalyType: "planet",
        lightcurve: Array.from({ length: 50 }, (_, i) => ({ x: i / 49, y: 1 - (i > 35 && i < 40 ? 0.025 : 0) })),
      },
    ];

    cy.intercept("GET", "/api/game/today*", {
      statusCode: 200,
      body: { date: today, anomalies },
    }).as("todayGame");

    cy.intercept("POST", "/api/anomaly/submit", {
      statusCode: 200,
      body: { ok: true, rewardMultiplier: 1.0 },
    }).as("submitAnomaly");

    cy.intercept("POST", "/api/game/complete", {
      statusCode: 200,
      body: { ok: true, score: 95 },
    }).as("completePlanetGame");

    cy.intercept("POST", "/api/story/progress", {
      statusCode: 200,
      body: { ok: true },
    }).as("advanceChapter");

    // Mock Mars game data
    cy.intercept("GET", "/api/mars/daily*", {
      statusCode: 200,
      body: {
        images: [
          { id: "m1", title: "Crater Rim", url: "https://images-assets.nasa.gov/image/PIA23240/PIA23240~thumb.jpg", credit: "NASA/JPL" }
        ],
        user: { id: "test-user" }
      }
    }).as("marsImages");

    cy.intercept("POST", "/api/mars/classify", {
      statusCode: 200,
      body: { ok: true, score: 88 }
    }).as("submitMars");

    // Mock Asteroid data
    cy.intercept("GET", "/api/asteroid/annotations*", {
      statusCode: 200,
      body: { draft: null }
    }).as("asteroidDraft");

    cy.intercept("POST", "/api/asteroid/submit", {
      statusCode: 200,
      body: { ok: true, score: 92 }
    }).as("submitAsteroid");

    // Capture console errors
    cy.on("window:before:load", (win) => {
      cy.spy(win.console, "error").as("consoleError");
      cy.spy(win.console, "warn").as("consoleWarn");
    });
  });

  it("completes a full tour of all game mechanics", () => {
    // 1. Home Page
    cy.visit("/");
    cy.screenshot("01-homepage");
    
    // Force a specific game order and character storyline for the tour to be deterministic
    // We visit /games/today directly with the parameters to ensure the test flow matches
    cy.visit("/games/today?gameOrder=planet,asteroid,mars");

    // 2. Mission Briefing
    cy.wait("@storyProgress");
    cy.screenshot("02-mission-briefing");
    cy.contains("button", "Initialize Mission").click();

    // 3. Planet Hunting (Game 1)
    cy.wait("@todayGame");
    cy.contains("h1", "Transit Signal Analysis").should("be.visible");
    cy.screenshot("03-planet-hunting-start");
    
    // Simulate drawing an annotation (3 signals total)
    for (let i = 0; i < 3; i++) {
        cy.get(".puzzle-lightcurve").trigger("pointerdown", 250, 100);
        cy.get(".puzzle-lightcurve").trigger("pointermove", 350, 100);
        cy.get(".puzzle-lightcurve").trigger("pointerup");
        cy.screenshot(`03-planet-hunting-step-${i+1}`);
        cy.getBySel("puzzle-finish-button").click();
        if (i < 2) cy.wait("@submitAnomaly");
    }
    cy.wait("@completePlanetGame");

    // 4. Narrative Transition 1
    cy.screenshot("04-narrative-beat-1");
    cy.contains("button", "Continue to Asteroid Survey").click();

    // 5. Asteroid Mapping (Game 2)
    cy.wait("@asteroidDraft");
    cy.contains("h1", "Water-Ice Mapping").should("be.visible");
    cy.get(".puzzle-canvas img").click(100, 100);
    cy.screenshot("05-asteroid-mapping");
    cy.contains("button", "Submit Survey").click();
    cy.wait("@submitAsteroid");

    // 6. Narrative Transition 2
    cy.screenshot("06-narrative-beat-2");
    cy.contains("button", "Continue to Surface Survey").click();

    // 7. Mars Classification (Game 3)
    cy.wait("@marsImages");
    cy.contains("h1", "Mars Surface Classification").should("be.visible");
    cy.get(".mars-annotation-wrapper img").click(200, 200);
    cy.screenshot("07-mars-classification");
    cy.contains("button", "Submit Survey").click();
    cy.wait("@submitMars");

    // 8. Mission Complete
    cy.screenshot("08-mission-complete");
    cy.contains("Mission Complete").should("be.visible");
    cy.contains("Return to Hub").click();

    // 9. Final check
    cy.location("pathname").should("eq", "/");
    cy.screenshot("09-final-home");

    // Verify no critical console errors were logged
    cy.get("@consoleError").then((spy: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (spy.called) {
        spy.getCalls().forEach((call: any, index: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          cy.log(`Console Error #${index + 1}: ${JSON.stringify(call.args)}`);
          console.log(`Console Error #${index + 1}:`, ...call.args);
        });
      }
    });
    cy.get("@consoleError").should("not.have.been.called");
  });
});
