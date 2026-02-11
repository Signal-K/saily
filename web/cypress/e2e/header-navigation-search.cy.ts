describe("Header, theme, and live search", () => {
  it("navigates across top-level pages, toggles theme, and shows realtime suggestions", () => {
    cy.intercept("GET", "/api/search*", {
      statusCode: 200,
      body: {
        results: [
          {
            kind: "thread",
            title: "Live Thread - 2026-02-11",
            subtitle: "Live • 2026-02-11",
            href: "/discuss?date=2026-02-11",
          },
          {
            kind: "game",
            title: "Pattern Ladder",
            subtitle: "Puzzle day 2026-02-11",
            href: "/games/today?date=2026-02-11",
          },
        ],
      },
    }).as("liveSearch");

    cy.visit("/");

    cy.getBySel("theme-toggle").should("exist");
    cy.get("html").invoke("attr", "data-theme").then((before) => {
      cy.getBySel("theme-toggle").click();
      cy.get("html").invoke("attr", "data-theme").should("not.eq", before);
    });

    cy.getBySel("nav-today").click();
    cy.location("pathname").should("eq", "/games/today");

    cy.getBySel("nav-calendar").click();
    cy.location("pathname").should("eq", "/calendar");

    cy.getBySel("nav-discuss").click();
    cy.location("pathname").should("eq", "/discuss");

    cy.getBySel("header-search-input").clear().type("live");
    cy.wait("@liveSearch");
    cy.getBySel("header-search-dropdown").should("be.visible");
    cy.getBySel("header-search-result").should("have.length.at.least", 1);
    cy.contains("button", "Live Thread - 2026-02-11").click();
    cy.location("pathname").should("eq", "/discuss");
    cy.location("search").should("contain", "date=2026-02-11");

    cy.getBySel("header-search-input").clear().type("pattern");
    cy.wait("@liveSearch");
    cy.getBySel("header-search-submit").click();
    cy.location("pathname").should("eq", "/search");
    cy.location("search").should("contain", "q=pattern");
    cy.contains("Results for").should("be.visible");
  });
});
