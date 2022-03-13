describe("Daily puzzle flow", () => {
  it("submits minigame 1 evidence, runs demo minigames 2/3, then returns home", () => {
    const today = new Date().toISOString().slice(0, 10);
    const anomalyId = 238004786;

    cy.intercept("GET", "/api/game/today*", {
      statusCode: 200,
      body: {
        date: today,
        puzzle: null,
        anomaly: {
          id: anomalyId,
          ticId: "238004786",
          label: "TIC 238004786",
          anomalyType: "planet",
          anomalySet: "telescope-tess",
          lightcurve: Array.from({ length: 80 }, (_, i) => ({
            x: i / 79,
            y: 1 - (i > 20 && i < 26 ? 0.013 : 0) - (i > 55 && i < 62 ? 0.009 : 0),
          })),
        },
      },
    }).as("todayGame");

    cy.intercept("POST", "/api/anomaly/submit", {
      statusCode: 200,
      body: {
        ok: true,
        reviewState: "pending_admin_review",
        rewardMultiplier: 0.8,
      },
    }).as("submitEvidence");
    cy.intercept("GET", "/api/anomaly/submit*", {
      statusCode: 200,
      body: {
        submission: {
          annotations: [{ xStart: 0.22, xEnd: 0.3, confidence: 70, tag: "Transit dip" }],
          note: "",
          hint_flags: { phaseFold: false, bin: false },
          period_days: 2,
        },
      },
    }).as("loadSavedSubmission");

    cy.intercept("POST", "/api/game/complete", {
      statusCode: 200,
      body: {
        ok: true,
        score: 91,
        badgesAwarded: 1,
      },
    }).as("completeDailySet");

    cy.visit("/games/today");
    cy.wait("@todayGame");
    cy.wait("@loadSavedSubmission");

    cy.contains("h1", "Find the Transit Signal").should("be.visible");
    cy.contains(".puzzle-annotation-item", "#1", { timeout: 10000 }).should("be.visible");
    cy.getBySel("puzzle-note").type("Likely repeatable dip profile.");
    cy.contains("button", "Use Phase Fold Hint").click();

    cy.getBySel("puzzle-finish-button").click();
    cy.wait("@submitEvidence");
    cy.contains("h1", "Minigame 2 (Demo): Pattern Trace").should("be.visible");

    cy.getBySel("puzzle-demo-next-button").click();
    cy.contains("h1", "Minigame 3 (Demo): Final Recognition").should("be.visible");

    cy.getBySel("puzzle-demo-next-button").click();
    cy.wait("@completeDailySet");
    cy.location("pathname").should("eq", "/");
    cy.get("h1")
      .invoke("text")
      .should((text) => {
        expect(text).to.match(/One game a day\. Keep your streak alive\.|Your command center/);
      });
  });
});
