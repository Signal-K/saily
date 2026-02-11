describe("Auth form mechanics", () => {
  it("switches modes and validates required fields", () => {
    cy.visit("/auth/sign-in");

    cy.getBySel("auth-mode-signup").click();
    cy.get("h1").should("contain", "Join the grid.");

    cy.getBySel("auth-email").type("player@example.com");
    cy.getBySel("auth-password").type("password123");
    cy.contains("button", "Create account").click();
    cy.contains("Please accept the terms before creating an account.").should("be.visible");

    cy.getBySel("auth-mode-signin").click();
    cy.get("h1").should("contain", "Welcome back.");

    cy.getBySel("auth-email").clear();
    cy.getBySel("auth-password").clear();
    cy.contains("button", "Enter account").click();
    cy.contains("Email and password are required.").should("be.visible");
  });
});
