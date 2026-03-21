import "./commands";

// Block PostHog to prevent surveys/overlays from interfering with tests
Cypress.on("window:before:load", (win) => {
  Object.defineProperty(win, "posthog", {
    get: () => undefined,
    configurable: true,
  });
});

beforeEach(() => {
  cy.intercept("https://us.i.posthog.com/**", { statusCode: 200, body: {} }).as("posthog");
});
