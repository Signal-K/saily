describe("Authenticated real backend flow", function () {
  const email = Cypress.env("E2E_TEST_EMAIL") as string | undefined;
  const password = Cypress.env("E2E_TEST_PASSWORD") as string | undefined;
  const runTag = (Cypress.env("E2E_TEST_RUN_TAG") as string | undefined) ?? "e2e-run";
  const supabaseUrl = Cypress.env("NEXT_PUBLIC_SUPABASE_URL") as string | undefined
    ?? "http://127.0.0.1:54321";
  const supabaseAnonKey = Cypress.env("NEXT_PUBLIC_SUPABASE_ANON_KEY") as string | undefined ?? "";

  before(function () {
    if (!email || !password) {
      this.skip();
      return;
    }

    // Pre-check that the test user exists in this environment before running UI flow
    cy.request({
      method: "POST",
      url: `${supabaseUrl}/auth/v1/token?grant_type=password`,
      headers: { apikey: supabaseAnonKey, "Content-Type": "application/json" },
      body: { email, password },
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status !== 200) {
        cy.log(`Skipping: test user auth failed (${response.status}) — user may not exist in this environment`);
        this.skip();
      }
    });
  });

  it("signs in with CI-created user, posts in discuss, and finds it via search", function () {
    cy.visit("/auth/sign-in");
    cy.getBySel("auth-mode-signin").click();
    cy.getBySel("auth-email").clear().type(email!);
    cy.getBySel("auth-password").clear().type(password!);
    cy.contains("button", "Access Terminal").click();

    cy.location("pathname", { timeout: 20000 }).should("eq", "/profile");
    cy.contains("h1", "Profile").should("be.visible");

    const message = `${runTag} forum post`;

    cy.visit("/discuss");
    cy.get('[data-cy="forum-thread-tab-ongoing"]', { timeout: 20000 }).click();
    cy.get('[data-cy="forum-composer-body"]', { timeout: 20000 }).clear().type(message);
    cy.getBySel("forum-post-submit").click();
    cy.contains(message, { timeout: 20000 }).should("be.visible");

    cy.getBySel("header-search-input").clear().type(runTag);
    cy.getBySel("header-search-submit").click();
    cy.location("pathname").should("eq", "/search");
    cy.contains("Results for").should("be.visible");
    cy.contains(runTag, { timeout: 20000 }).should("be.visible");

    cy.getBySel("profile-trigger").click();
    cy.getBySel("profile-menu-signout").click();
    cy.location("pathname", { timeout: 20000 }).should("eq", "/auth/sign-in");
  });
});
