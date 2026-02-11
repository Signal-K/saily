/// <reference types="cypress" />

Cypress.Commands.add("getBySel", (selector: string) => {
  return cy.get(`[data-cy="${selector}"]`);
});
