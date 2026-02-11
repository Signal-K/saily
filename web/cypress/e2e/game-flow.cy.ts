describe("Daily puzzle flow", () => {
  it("moves through all 3 puzzles and submits completion", () => {
    cy.intercept("POST", "/api/game/complete", {
      statusCode: 200,
      body: {
        ok: true,
        score: 88,
        badgesAwarded: 1,
      },
    }).as("completeDailySet");

    cy.visit("/games/today");

    cy.contains("h1", "Puzzle 1:").should("be.visible");

    cy.getBySel("puzzle-help-toggle").click();
    cy.contains("Tutorial").should("be.visible");
    cy.getBySel("puzzle-help-toggle").click();

    cy.getBySel("puzzle-mode-boundary").click();
    cy.getBySel("puzzle-confidence-range").invoke("val", 80).trigger("input").trigger("change");
    cy.getBySel("puzzle-note").type("Suspicious geometry repeated near edge.");

    cy.getBySel("puzzle-next-button").click();
    cy.contains("h1", "Puzzle 2:").should("be.visible");

    cy.getBySel("puzzle-next-button").click();
    cy.contains("h1", "Puzzle 3:").should("be.visible");

    cy.getBySel("puzzle-finish-button").click();
    cy.wait("@completeDailySet");
    cy.getBySel("puzzle-feedback").should("contain", "Saved. Score 88. New badges: 1.");
  });
});
