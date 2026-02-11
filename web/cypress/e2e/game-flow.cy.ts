describe("Daily puzzle flow", () => {
  it("submits minigame 1 evidence, runs demo minigames 2/3, then returns home", () => {
    cy.intercept("GET", "/api/game/today*", {
      statusCode: 200,
      body: {
        date: "2026-02-11",
        puzzle: null,
        anomaly: {
          id: 238004786,
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

    cy.contains("h1", "Find the Transit Signal").should("be.visible");

    cy.get("svg.puzzle-lightcurve").then(($svg) => {
      const rect = $svg[0].getBoundingClientRect();
      const startX = rect.left + rect.width * 0.22;
      const endX = rect.left + rect.width * 0.3;
      const y = rect.top + rect.height * 0.35;

      cy.wrap($svg)
        .trigger("pointerdown", { clientX: startX, clientY: y, pointerId: 1, pointerType: "mouse", force: true })
        .trigger("pointermove", { clientX: endX, clientY: y, pointerId: 1, pointerType: "mouse", force: true })
        .trigger("pointerup", { clientX: endX, clientY: y, pointerId: 1, pointerType: "mouse", force: true });
    });

    cy.contains("#1").should("be.visible");
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
    cy.contains("h1", "One game a day. Keep your streak alive.").should("be.visible");
  });
});
