/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    signInAsE2EUser(): Chainable<void>;
  }
}
