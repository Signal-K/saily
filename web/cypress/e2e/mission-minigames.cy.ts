/**
 * E2E coverage for the Saily core minigame paths.
 * Tests Planet Hunting (/games/today) and Mars classification (/games/mars)
 * at the route/render level — no authentication required for these assertions.
 */

describe("Mission minigames", () => {
  describe("/games/today — mission flow (Planet Hunt + Mars)", () => {
    it("page responds with 200 or redirect", () => {
      cy.request({ url: "/games/today", failOnStatusCode: false })
        .its("status")
        .should("be.oneOf", [200, 307, 302]);
    });

    it("renders the page body", () => {
      cy.visit("/games/today");
      cy.get("body").should("exist");
    });

    it("does not crash with a fatal error boundary", () => {
      cy.visit("/games/today");
      // If Next.js renders a 500 error page it emits this heading
      cy.get("h2").should("not.contain", "Application error");
    });

    it("loads mission content or a loading/sign-in state", () => {
      cy.visit("/games/today");
      // The page must render at least one of: a button, heading, or paragraph —
      // proving the React tree mounted without a hard crash.
      cy.get("body").find("h1, h2, button, p").should("have.length.greaterThan", 0);
    });

    it("accepts an optional ?date query parameter without crashing", () => {
      cy.visit("/games/today?date=2026-06-01");
      cy.get("body").should("exist");
      cy.get("h2").should("not.contain", "Application error");
    });
  });

  describe("/games/mars — Mars rover-photo classification game", () => {
    it("page responds with 200 or redirect", () => {
      cy.request({ url: "/games/mars", failOnStatusCode: false })
        .its("status")
        .should("be.oneOf", [200, 307, 302]);
    });

    it("renders the page body", () => {
      cy.visit("/games/mars");
      cy.get("body").should("exist");
    });

    it("does not crash with a fatal error boundary", () => {
      cy.visit("/games/mars");
      cy.get("h2").should("not.contain", "Application error");
    });

    it("shows game content or a loading/sign-in state without a hard crash", () => {
      cy.visit("/games/mars");
      cy.get("body").find("h1, h2, button, p, img").should("have.length.greaterThan", 0);
    });

    it("accepts an optional ?date parameter without crashing", () => {
      cy.visit("/games/mars?date=2026-06-01");
      cy.get("body").should("exist");
      cy.get("h2").should("not.contain", "Application error");
    });
  });

  describe("Minigame routes — navigation links", () => {
    it("home page links to /games/today", () => {
      cy.visit("/");
      cy.get("a[href*='/games/today'], a[href*='games']")
        .should("exist");
    });
  });
});
