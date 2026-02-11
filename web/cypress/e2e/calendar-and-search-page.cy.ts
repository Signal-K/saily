describe("Calendar and search page layout", () => {
  it("renders calendar and modern search sections", () => {
    cy.visit("/calendar");
    cy.contains("Puzzle Calendar").should("be.visible");

    cy.get("body").then(($body) => {
      const isLoggedOutCalendar = $body.text().includes("Sign in to view your real completion history.");

      if (isLoggedOutCalendar) {
        cy.contains("a", "Sign in").should("have.attr", "href", "/auth/sign-in");
      } else {
        cy.contains("a", /Next/).click();
        cy.location("pathname").should("eq", "/calendar");
        cy.location("search").should("contain", "month=");
      }
    });

    cy.visit("/search?q=2026-02-11");
    cy.contains("Results for").should("be.visible");
    cy.get(".search-meta-row").should("exist");
  });
});
