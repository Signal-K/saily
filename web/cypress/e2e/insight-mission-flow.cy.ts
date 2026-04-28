describe("mission flow", () => {
  it("runs asteroid survey as a daily mission game and advances to the next narrative beat", () => {
    const today = new Date().toISOString().slice(0, 10);

    cy.intercept("GET", "/api/game/today*", {
      statusCode: 200,
      body: {
        date: today,
        access: {
          date: today,
          isToday: true,
          allowed: true,
          signInRequired: false,
          requiresUnlock: false,
          completed: false,
          unlocked: false,
        },
        user: { id: "test-user" },
        puzzle: null,
        anomaly: null,
        anomalies: [],
      },
    }).as("todayAccess");

    cy.intercept("GET", "/api/story/progress*", {
      statusCode: 200,
      body: { chapterIndex: 0 },
    }).as("storyProgress");

    cy.intercept("GET", "/api/asteroid/annotations*", {
      statusCode: 200,
      body: { annotations: [], submitted: false },
    }).as("asteroidAnnotations");

    cy.intercept("POST", "/api/asteroid/annotations", {
      statusCode: 200,
      body: { ok: true, savedCount: 1 },
    }).as("asteroidDraftSave");

    cy.intercept("POST", "/api/asteroid/submit", {
      statusCode: 200,
      body: {
        ok: true,
        score: 90,
      },
    }).as("asteroidSubmit");

    cy.visit("/games/today?gameOrder=asteroid,planet,mars");
    cy.wait("@todayAccess");
    cy.wait("@storyProgress");
    cy.contains("button", "Initialize Mission").click();
    cy.wait("@asteroidAnnotations");

    cy.contains("h1", "Water-Ice Mapping").should("be.visible");
    cy.get('input[placeholder="Possible water-ice region"]').type("Primary deposit");
    cy.get(".puzzle-canvas img").click(20, 20);
    cy.contains("button", "Submit Survey").click();
    cy.wait("@asteroidDraftSave");
    cy.wait("@asteroidSubmit");

    cy.location("pathname").should("eq", "/games/today");
    cy.contains("button", "Continue to Transit Analysis").should("be.visible");
  });
});
