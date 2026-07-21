describe("Auth and profile sanity", () => {
  it("renders current sign-in copy and stable selectors", () => {
    cy.visit("/auth/sign-in");

    cy.contains("h1", "Welcome back.").should("be.visible");
    cy.contains("Access your account and pick up your current streak.").should("be.visible");
    cy.get("[data-cy='auth-email']").should("have.attr", "type", "email");
    cy.get("[data-cy='auth-password']").should("have.attr", "type", "password");
    cy.get("[data-cy='auth-submit-text']").should("contain", "Access Terminal");
  });

  it("renders current sign-up copy and stable selectors", () => {
    cy.visit("/auth/sign-in?mode=sign-up");

    cy.contains("h1", "Join the grid.").should("be.visible");
    cy.contains("Create your account and save daily game progress.").should("be.visible");
    cy.get("[data-cy='auth-first-name']").should("exist");
    cy.get("[data-cy='auth-last-name']").should("exist");
    cy.get("[data-cy='auth-email']").should("exist");
    cy.get("[data-cy='auth-password']").should("have.attr", "autocomplete", "new-password");
    cy.get("[data-cy='auth-terms']").should("have.attr", "type", "checkbox");
    cy.get("[data-cy='auth-submit-text']").should("contain", "Create Account");
  });

  it("shows a clear unauthenticated profile handoff", () => {
    cy.clearCookie("ss_shared_pb_auth");
    cy.visit("/profile");

    cy.contains("h1", "Profile").should("be.visible");
    cy.contains("Sign in to see your streaks, stats, and badges.").should("be.visible");
    cy.contains("a", "Sign in").should("have.attr", "href", "/auth/sign-in");
    cy.get("body").should("not.contain", "Application error");
  });

  it("carries locked archive replay users into sign-in with a return path", () => {
    cy.intercept("GET", "/api/game/today?date=2026-06-01", {
      date: "2026-06-01",
      access: {
        date: "2026-06-01",
        isToday: false,
        allowed: false,
        signInRequired: true,
        requiresUnlock: true,
        completed: false,
        unlocked: false,
      },
      user: null,
      stats: null,
      completedGames: [],
      badges: [],
    }).as("lockedArchive");

    cy.visit("/games/today?date=2026-06-01");
    cy.wait("@lockedArchive");
    cy.contains("a", "Sign in to unlock")
      .should("have.attr", "href")
      .and("include", "/auth/sign-in?next=%2Fgames%2Ftoday%3Fdate%3D2026-06-01");
  });
});
