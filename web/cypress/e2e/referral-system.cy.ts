describe("Referral System", () => {
  it("captures 'ref' param and passes it to sign-up", () => {
    cy.intercept("POST", "**/auth/v1/signup*", {
      statusCode: 200,
      body: {
        user: { id: "new-user-id", email: "test@example.com" },
        session: null
      }
    }).as("signUp");

    cy.visit("/auth/sign-in?mode=sign-up&ref=SAILY-CODE");
    
    cy.get("#first-name").type("Test");
    cy.get("#last-name").type("User");
    cy.get("#email").type("test@example.com");
    cy.get("#password").type("password123");
    cy.get('input[type="checkbox"]').check();
    
    cy.contains("button", "Create Account").click();

    cy.wait("@signUp").then((interception) => {
      const body = interception.request.body;
      expect(body.data.referral_code).to.eq("SAILY-CODE");
    });

    cy.contains("Account created. Check your email").should("be.visible");
  });
});
