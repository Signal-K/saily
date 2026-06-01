/// <reference types="cypress" />

function beginMission() {
  cy.visit("/games/today?gameOrder=planet,mars");
  cy.contains("button", "Initialize Mission", { timeout: 20000 }).click();
}

function submitPlanetSignal() {
  cy.contains("h1", "Transit Signal Analysis", { timeout: 20000 }).should("be.visible");
  cy.get("svg.puzzle-lightcurve", { timeout: 20000 }).then(($svg) => {
    const rect = $svg[0].getBoundingClientRect();
    const y = rect.top + rect.height * 0.5;
    const startX = rect.left + rect.width * 0.28;
    const endX = rect.left + rect.width * 0.43;

    cy.wrap($svg).trigger("pointerdown", {
      clientX: startX,
      clientY: y,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      buttons: 1,
      eventConstructor: "PointerEvent",
      force: true,
    });
    cy.wait(80);
    cy.wrap($svg).trigger("pointermove", {
      clientX: endX,
      clientY: y,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      buttons: 1,
      eventConstructor: "PointerEvent",
      force: true,
    });
    cy.wait(80);
    cy.wrap($svg).trigger("pointerup", {
      clientX: endX,
      clientY: y,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      buttons: 0,
      eventConstructor: "PointerEvent",
      force: true,
    });
  });
  cy.contains("Evidence Annotations", { timeout: 10000 }).should("be.visible");
  cy.contains("button", /Submit .*Evidence/).should("not.be.disabled").click();
}

function completePlanetGame() {
  submitPlanetSignal();
  cy.contains("Signal 2", { timeout: 20000 }).should("be.visible");
  submitPlanetSignal();
  cy.contains("Signal 3", { timeout: 20000 }).should("be.visible");
  submitPlanetSignal();
}

function completeMarsSurvey() {
  cy.contains("h1", "Mars Surface Classification", { timeout: 20000 }).should("be.visible");
  cy.get(".mars-annotation-wrapper img", { timeout: 20000 }).click("center");
  cy.contains("button", /^Next Image$/).click();
  cy.get(".mars-annotation-wrapper img", { timeout: 20000 }).click("center");
  cy.contains("button", /^Next Image$/).click();
  cy.get(".mars-annotation-wrapper img", { timeout: 20000 }).click("center");
  cy.contains("button", "Submit Survey").should("not.be.disabled").click();
}

describe("Saily mission minigames", () => {
  beforeEach(() => {
    cy.signInAsE2EUser();
  });

  it("covers auth, tutorial, planet, Mars, forum, and calendar", () => {
    beginMission();

    completePlanetGame();
    cy.contains("button", "Continue to Surface Survey", { timeout: 20000 }).click();

    completeMarsSurvey();
    cy.contains("h1", "Mission Complete", { timeout: 20000 }).should("be.visible");

    cy.visit("/discuss?e2eAuth=1");
    cy.contains("h1", "CONSENSUS", { timeout: 20000 }).should("be.visible");
    cy.contains("Daily Live", { timeout: 20000 }).should("be.visible");

    cy.visit("/calendar");
    cy.contains("h1", "Puzzle Calendar", { timeout: 20000 }).should("be.visible");
    cy.contains("a", /^\d+$/).should("be.visible");
  });
});
