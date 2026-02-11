describe("Smoke", () => {
  it("loads core pages and primary header controls", () => {
    cy.visit("/");
    cy.getBySel("nav-today").should("be.visible");
    cy.contains("h1", "One game a day. Keep your streak alive.").should("be.visible");
    cy.getBySel("header-search-input").should("be.visible");
    cy.getBySel("theme-toggle").should("be.visible");

    cy.getBySel("nav-today").click();
    cy.location("pathname").should("eq", "/games/today");

    cy.getBySel("nav-calendar").click();
    cy.location("pathname").should("eq", "/calendar");

    cy.getBySel("nav-discuss").click();
    cy.location("pathname").should("eq", "/discuss");
  });
});
