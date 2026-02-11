declare global {
  namespace Cypress {
    interface Chainable {
      getBySel(selector: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};
