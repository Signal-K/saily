describe("Streak Repair", () => {
  // Use cy.clock to ensure "today" is consistent between test and app
  const fixedDate = new Date("2026-03-27T12:00:00Z");
  const todayStr = "2026-03-27";
  const yesterdayStr = "2026-03-26";
  const dayBeforeStr = "2026-03-25";

  beforeEach(() => {
    cy.clock(fixedDate.getTime(), ["Date"]);
  });

  it("shows repair prompt when yesterday was missed but day before was played", () => {
    cy.intercept("GET", "/api/game/today*", {
      statusCode: 200,
      body: {
        date: todayStr,
        user: { id: "test-user" },
        access: { allowed: true, isToday: true },
        anomaly: { id: 1, ticId: "123", label: "Mock", lightcurve: [] },
        anomalies: [{ id: 1, ticId: "123", label: "Mock", lightcurve: [] }]
      }
    }).as("todayGame");

    // Mock daily_plays to show missed yesterday but played day before
    cy.intercept("GET", "**/rest/v1/daily_plays*", {
      statusCode: 200,
      body: [{ game_date: dayBeforeStr }]
    }).as("fetchPlays");

    // Mock profiles to show chip balance
    cy.intercept("GET", "**/rest/v1/profiles*", {
      statusCode: 200,
      body: [{ data_chips: 5 }]
    }).as("fetchProfile");

    cy.visit(`/games/today?date=${todayStr}`);
    cy.wait("@todayGame");
    cy.contains("button", "Begin Mission").click();

    // Wait for TodayGamePage to load its own data
    cy.contains("Loading daily anomaly...").should("not.exist");

    cy.contains("Streak Broken!", { timeout: 10000 }).should("be.visible");
    cy.contains("Balance: 5 Chips").should("be.visible");
    cy.contains("button", "Repair Streak (-1 Chip)").should("be.visible");
  });

  it("allows dismissing the repair prompt", () => {
    cy.intercept("GET", "/api/game/today*", {
        statusCode: 200,
        body: {
          date: todayStr,
          user: { id: "test-user" },
          access: { allowed: true, isToday: true },
          anomaly: { id: 1, ticId: "123", label: "Mock", lightcurve: [] },
          anomalies: [{ id: 1, ticId: "123", label: "Mock", lightcurve: [] }]
        }
      }).as("todayGameDismiss");

    cy.visit(`/games/today?date=${todayStr}`);
    cy.wait("@todayGameDismiss");
    cy.contains("button", "Begin Mission").click();
    cy.contains("button", "Skip", { timeout: 10000 }).click();
    cy.contains("Streak Broken!").should("not.exist");
  });

  it("shows out-of-chips message when balance is zero", () => {
    cy.intercept("GET", "/api/game/today*", {
        statusCode: 200,
        body: {
          date: todayStr,
          user: { id: "test-user" },
          access: { allowed: true, isToday: true },
          anomaly: { id: 1, ticId: "123", label: "Mock", lightcurve: [] },
          anomalies: [{ id: 1, ticId: "123", label: "Mock", lightcurve: [] }]
        }
      }).as("todayGameEmpty");

    cy.intercept("GET", "**/rest/v1/profiles*", {
      statusCode: 200,
      body: [{ data_chips: 0 }]
    }).as("fetchProfileEmpty");

    cy.visit(`/games/today?date=${todayStr}`);
    cy.wait("@todayGameEmpty");
    cy.contains("button", "Begin Mission").click();

    // Wait for TodayGamePage to load its own data
    cy.contains("Loading daily anomaly...").should("not.exist");

    cy.contains("Streak Broken!", { timeout: 10000 }).should("be.visible");
    cy.contains("You need 1 Data Chip to repair your streak, but you have 0").should("be.visible");
    cy.contains("button", "Repair Streak (-1 Chip)").should("not.exist");
  });
});
