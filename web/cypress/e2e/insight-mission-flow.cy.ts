describe("InSight mission flow", () => {
  it("runs InSight as a daily mission game and advances to the next narrative beat", () => {
    const today = new Date().toISOString().slice(0, 10);

    cy.intercept("GET", "/api/game/today*", {
      statusCode: 200,
      body: {
        date: today,
        access: {
          date: today,
          isToday: true,
          allowed: true,
          signInRequired: false,
          requiresUnlock: false,
          completed: false,
          unlocked: false,
        },
        puzzle: null,
        anomaly: null,
        anomalies: [],
      },
    }).as("todayAccess");

    cy.intercept("GET", "/api/story/progress*", {
      statusCode: 200,
      body: { chapterIndex: 0 },
    }).as("storyProgress");

    cy.intercept("GET", "/api/insight/daily*", {
      statusCode: 200,
      body: {
        source: "fallback",
        access: {
          allowed: true,
          signInRequired: false,
        },
        puzzle: {
          date: today,
          metric: "pressure",
          metricLabel: "pressure",
          prompt: "Which Sol looks most anomalous for pressure compared with the surrounding readings?",
          subtitle: "Compare the average readings and pick the day that most likely disrupted route planning.",
          sols: [
            { sol: "675", season: "fall", northernSeason: "early winter", southernSeason: "early summer", firstUtc: null, lastUtc: null, at: { av: -62.3, mn: -96.8, mx: -15.9 }, pre: { av: 750.6, mn: 722.1, mx: 768.8 }, hws: { av: 7.2, mn: 1.1, mx: 22.4 } },
            { sol: "676", season: "fall", northernSeason: "early winter", southernSeason: "early summer", firstUtc: null, lastUtc: null, at: { av: -62.8, mn: -96.9, mx: -16.5 }, pre: { av: 749.1, mn: 722.5, mx: 767.1 }, hws: { av: 8.5, mn: 1.1, mx: 26.9 } },
            { sol: "677", season: "fall", northernSeason: "mid winter", southernSeason: "mid summer", firstUtc: null, lastUtc: null, at: { av: -63.1, mn: -97.2, mx: -16.9 }, pre: { av: 748.7, mn: 720.6, mx: 767.4 }, hws: { av: 7.9, mn: 0.5, mx: 23.2 } },
            { sol: "678", season: "fall", northernSeason: "mid winter", southernSeason: "mid summer", firstUtc: null, lastUtc: null, at: { av: -62.6, mn: -97.7, mx: -9.1 }, pre: { av: 743.7, mn: 717.7, mx: 760.3 }, hws: { av: 5.2, mn: 0.2, mx: 18.4 } },
            { sol: "679", season: "fall", northernSeason: "mid winter", southernSeason: "mid summer", firstUtc: null, lastUtc: null, at: { av: -62.6, mn: -96.6, mx: -11.6 }, pre: { av: 744.5, mn: 719.4, mx: 763.3 }, hws: { av: 5.6, mn: 0.2, mx: 19.4 } },
          ],
        },
      },
    }).as("insightDaily");

    cy.intercept("POST", "/api/insight/submit", {
      statusCode: 200,
      body: {
        ok: true,
        correct: true,
        score: 90,
        answerSol: "675",
        metricLabel: "pressure",
        answerValue: 750.6,
        baseline: 747.3,
      },
    }).as("insightSubmit");

    cy.visit("/games/today?gameOrder=insight,asteroid,mars");
    cy.wait("@todayAccess");
    cy.wait("@storyProgress");
    cy.contains("button", "Begin Mission").click();
    cy.wait("@insightDaily");

    cy.contains("h1", "InSight Anomaly Watch").should("be.visible");
    cy.getBySel("insight-sol-675").click();
    cy.getBySel("insight-submit-button").click();
    cy.wait("@insightSubmit");

    cy.location("pathname").should("eq", "/games/today");
    cy.contains("button", "Continue to Asteroid Survey").should("be.visible");
  });
});
