describe("Calendar and search page layout", () => {
  it("renders calendar navigation and modern search sections", () => {
    cy.visit("/calendar");
    cy.contains("Puzzle Calendar").should("be.visible");
    cy.contains("a", "Next →").click();
    cy.location("pathname").should("eq", "/calendar");
    cy.location("search").should("contain", "month=");

    cy.visit("/search?q=2026-02-11");
    cy.contains("Results for").should("be.visible");
    cy.get(".search-meta-row").should("exist");
  });
});
