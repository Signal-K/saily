/// <reference types="cypress" />

// Block PostHog to prevent surveys/overlays from interfering with tests.
Cypress.on("window:before:load", (win) => {
  Object.defineProperty(win, "posthog", {
    get: () => undefined,
    configurable: true,
  });
});

beforeEach(() => {
  cy.intercept("https://us.i.posthog.com/**", { statusCode: 200, body: {} }).as("posthog");
});

Cypress.Commands.add("signInAsE2EUser", () => {
  const email = Cypress.env("E2E_TEST_EMAIL");
  const password = Cypress.env("E2E_TEST_PASSWORD");

  if (!email || !password) {
    throw new Error("Missing CYPRESS_E2E_TEST_EMAIL or CYPRESS_E2E_TEST_PASSWORD.");
  }

  cy.session([email, password], () => {
    cy.visit("/auth/sign-in");
    cy.get("[data-cy=auth-email]").clear().type(email);
    cy.get("[data-cy=auth-password]").clear().type(password, { log: false });
    cy.get("[data-cy=auth-submit-text]").click();
    cy.location("pathname", { timeout: 15000 }).should("eq", "/profile");
  });
});
