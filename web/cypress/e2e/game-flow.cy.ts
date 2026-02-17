describe("Daily puzzle flow", () => {
  it("submits three transit signals (easy/medium/hard) then returns home", () => {
    const today = new Date().toISOString().slice(0, 10);
    const anomalies = [238004786, 159238472, 402918337].map((id, idx) => ({
      id,
      ticId: String(id),
      label: `TIC ${id}`,
      anomalyType: "planet",
      anomalySet: "telescope-tess",
      lightcurve: Array.from({ length: 80 }, (_, i) => ({
        x: i / 79,
        y:
          1 -
          (i > 20 + idx * 2 && i < 26 + idx * 2 ? 0.013 - idx * 0.002 : 0) -
          (i > 55 && i < 62 ? 0.009 - idx * 0.0015 : 0) +
          ((i % 7) - 3) * 0.00008 * idx,
      })),
    }));

    cy.intercept("GET", "/api/game/today*", {
      statusCode: 200,
      body: {
        date: today,
        puzzle: null,
        anomaly: anomalies[0],
        anomalies,
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
    cy.contains("h1", "Find the Transit Signal").should("be.visible");
    cy.contains(".puzzle-context-pill", "Difficulty Medium").should("be.visible");

    cy.getBySel("puzzle-finish-button").click();
    cy.wait("@submitEvidence");
    cy.contains(".puzzle-context-pill", "Difficulty Hard").should("be.visible");

    cy.getBySel("puzzle-finish-button").click();
    cy.wait("@submitEvidence");
    cy.wait("@completeDailySet");
    cy.location("pathname").should("eq", "/");
    cy.get("h1")
      .invoke("text")
      .should((text) => {
        expect(text).to.match(/One game a day\. Keep your streak alive\.|Your command center/);
      });
  });
});
