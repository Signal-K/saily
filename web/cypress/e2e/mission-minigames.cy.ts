/**
 * E2E coverage for the Saily core minigame paths.
 * Tests the daily mission flow (/games/today — crossword + transit spotter)
 * at the route/render level — no authentication required for these assertions.
 */

describe("Mission minigames", () => {
  describe("/games/today — mission flow (crossword + transit spotter)", () => {
    const missionDate = "2026-07-19";
    const crosswordPayload = {
      date: missionDate,
      width: 5,
      height: 5,
      cells: ["0,0", "0,1", "0,2", "0,3", "0,4"],
      clues: [
        {
          number: 1,
          direction: "across",
          row: 0,
          col: 0,
          length: 5,
          clue: "Home world in today's observing notes",
          sourceUrl: "https://example.test/source",
        },
      ],
    };
    const transitPayload = {
      date: missionDate,
      subjects: [
        {
          subjectId: "subject-1",
          imageUrl: "/assets/data-chip.svg",
          caption: "A real archived TESS light curve.",
          sourceName: "Zooniverse / Planet Hunters TESS",
          sourceUrl: "https://example.test/subject-1",
          prompt: "Does this real TESS light curve show a transit dip?",
        },
        {
          subjectId: "subject-2",
          imageUrl: "/assets/data-chip.svg",
          caption: "A second archived TESS light curve.",
          sourceName: "Zooniverse / Planet Hunters TESS",
          sourceUrl: "https://example.test/subject-2",
          prompt: "Does this real TESS light curve show a transit dip?",
        },
      ],
    };

    it("page responds with 200 or redirect", () => {
      cy.request({ url: "/games/today", failOnStatusCode: false })
        .its("status")
        .should("be.oneOf", [200, 307, 302]);
    });

    it("renders the page body", () => {
      cy.visit("/games/today");
      cy.get("body").should("exist");
    });

    it("does not crash with a fatal error boundary", () => {
      cy.visit("/games/today");
      // If Next.js renders a 500 error page it emits this heading
      cy.get("body").should("not.contain", "Application error");
    });

    it("loads mission content or a loading/sign-in state", () => {
      cy.visit("/games/today");
      // The page must render at least one of: a button, heading, or paragraph —
      // proving the React tree mounted without a hard crash.
      cy.get("body").find("h1, h2, button, p").should("have.length.greaterThan", 0);
    });

    it("accepts an optional ?date query parameter without crashing", () => {
      cy.visit("/games/today?date=2026-06-01");
      cy.get("body").should("exist");
      cy.get("body").should("not.contain", "Application error");
    });

    it("shows a deliberate archive access state for locked past dates", () => {
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
        play: null,
        badges: [],
      }).as("lockedArchive");
      cy.intercept("GET", "/api/story/progress?storylineId=*", {
        statusCode: 401,
        body: { error: "Sign in required" },
      }).as("storyProgress");

      cy.visit("/games/today?date=2026-06-01");
      cy.wait("@lockedArchive");
      cy.contains("h1", "Unlock 2026-06-01 to replay it.").should("be.visible");
      cy.contains("a", "Sign in to unlock")
        .should("have.attr", "href")
        .and("include", "/auth/sign-in");
      cy.contains("a", "Back to calendar").should("have.attr", "href", "/calendar");
      cy.get("body").should("not.contain", "Application error");
    });

    it("can complete the current mission path through both live games", () => {
      cy.intercept("GET", "/api/game/today?date=*", {
        date: missionDate,
        access: {
          date: missionDate,
          isToday: true,
          allowed: true,
          signInRequired: false,
          requiresUnlock: false,
          completed: false,
          unlocked: true,
        },
        user: { id: "user-e2e", email: "e2e@saily.test" },
        stats: null,
        play: null,
        badges: [],
      }).as("todayAccess");
      cy.intercept("GET", "/api/story/progress?storylineId=*", {
        chapterIndex: 0,
      }).as("storyProgress");
      cy.intercept("GET", "/api/crossword/daily?date=*", crosswordPayload).as("crosswordDaily");
      cy.intercept("POST", "/api/crossword/submit", {
        date: missionDate,
        correct: 1,
        total: 1,
        score: 100,
        allCorrect: true,
      }).as("crosswordSubmit");
      cy.intercept("GET", "/api/dsmr/daily?date=*", transitPayload).as("dsmrDaily");
      cy.intercept("POST", "/api/game/complete", {
        ok: true,
        stats: null,
        badgesAwarded: 0,
        score: 100,
        xpMultiplier: 1,
        gameDate: missionDate,
      }).as("gameComplete");
      cy.intercept("POST", "/api/story/progress", {
        awardedChips: 1,
        referralCode: "SAIL-E2E",
      }).as("storyAdvance");

      cy.visit("/games/today?date=2026-07-19&firstGame=crossword");
      cy.wait("@todayAccess");
      cy.contains("button", "Initialize Mission").click();

      cy.wait("@crosswordDaily");
      cy.contains(".eyebrow", "Today's Crossword").should("be.visible");
      cy.get("input").first().type("EARTH");
      cy.contains("button", "Check answers").click();
      cy.wait("@crosswordSubmit");

      cy.contains("button", "Continue to Transit Spotter").click();
      cy.wait("@dsmrDaily");
      cy.contains(".eyebrow", "Transit Spotter").should("be.visible");
      cy.contains("button", "Transit dip").click();
      cy.contains("button", "No dip").click();
      cy.wait("@gameComplete");
      cy.wait("@storyAdvance");

      cy.contains("h1", "Mission Complete").should("be.visible");
      cy.contains(".mission-complete-score-value", "100%").should("be.visible");
      cy.contains("Discuss Today's Puzzle").should("have.attr", "href").and("include", "/discuss?date=");
    });

    it("can deliberately select close approach ranker as the first mission game", () => {
      const closeApproachPayload = {
        available: true,
        date: missionDate,
        mode: "closest-distance",
        prompt: "Rank these close approaches from closest to farthest.",
        sourceName: "NASA/JPL SBDB Close Approach Data API",
        sourceSignatureVersion: "1.5",
        records: [
          {
            id: "record-3",
            designation: "2026 CC",
            displayName: "(2026 CC)",
            closeApproachTime: "2028-Jun-26 03:00",
            distanceAu: 0.003,
            distanceLd: 1.168,
            distanceMinAu: null,
            distanceMaxAu: null,
            relativeVelocityKmS: 9,
            absoluteMagnitudeH: null,
            diameterKm: null,
            sourceUrl: "https://ssd-api.jpl.nasa.gov/cad.api",
          },
          {
            id: "record-1",
            designation: "2026 AA",
            displayName: "(2026 AA)",
            closeApproachTime: "2028-Jun-26 01:00",
            distanceAu: 0.001,
            distanceLd: 0.389,
            distanceMinAu: null,
            distanceMaxAu: null,
            relativeVelocityKmS: 7,
            absoluteMagnitudeH: null,
            diameterKm: null,
            sourceUrl: "https://ssd-api.jpl.nasa.gov/cad.api",
          },
          {
            id: "record-2",
            designation: "2026 BB",
            displayName: "(2026 BB)",
            closeApproachTime: "2028-Jun-26 02:00",
            distanceAu: 0.002,
            distanceLd: 0.778,
            distanceMinAu: null,
            distanceMaxAu: null,
            relativeVelocityKmS: 8,
            absoluteMagnitudeH: null,
            diameterKm: null,
            sourceUrl: "https://ssd-api.jpl.nasa.gov/cad.api",
          },
          {
            id: "record-4",
            designation: "2026 DD",
            displayName: "(2026 DD)",
            closeApproachTime: "2028-Jun-26 04:00",
            distanceAu: 0.004,
            distanceLd: 1.557,
            distanceMinAu: null,
            distanceMaxAu: null,
            relativeVelocityKmS: 12,
            absoluteMagnitudeH: null,
            diameterKm: null,
            sourceUrl: "https://ssd-api.jpl.nasa.gov/cad.api",
          },
        ],
      };
      const closeApproachResult = {
        date: missionDate,
        mode: "closest-distance",
        score: 100,
        exact: 4,
        near: 0,
        total: 4,
        closest: closeApproachPayload.records[1],
        sourceName: "NASA/JPL SBDB Close Approach Data API",
        sourceSignatureVersion: "1.5",
        evaluations: closeApproachPayload.records.map((record, index) => ({
          ...record,
          correctRank: index + 1,
          submittedRank: index + 1,
          status: "correct",
        })),
      };

      cy.intercept("GET", "/api/game/today?date=*", {
        date: missionDate,
        access: {
          date: missionDate,
          isToday: true,
          allowed: true,
          signInRequired: false,
          requiresUnlock: false,
          completed: false,
          unlocked: true,
        },
        user: { id: "user-e2e", email: "e2e@saily.test" },
        stats: null,
        play: null,
        badges: [],
      }).as("todayAccess");
      cy.intercept("GET", "/api/story/progress?storylineId=*", {
        chapterIndex: 0,
      }).as("storyProgress");
      cy.intercept("GET", "/api/close-approaches/daily?date=*", closeApproachPayload).as("closeApproachDaily");
      cy.intercept("POST", "/api/close-approaches/submit", closeApproachResult).as("closeApproachSubmit");
      cy.intercept("GET", "/api/crossword/daily?date=*", crosswordPayload).as("crosswordDaily");
      cy.intercept("POST", "/api/crossword/submit", {
        date: missionDate,
        correct: 1,
        total: 1,
        score: 100,
        allCorrect: true,
      }).as("crosswordSubmit");
      cy.intercept("POST", "/api/game/complete", {
        ok: true,
        stats: null,
        badgesAwarded: 0,
        score: 100,
        xpMultiplier: 1,
        gameDate: missionDate,
      }).as("gameComplete");
      cy.intercept("POST", "/api/story/progress", {
        awardedChips: 1,
        referralCode: "SAIL-E2E",
      }).as("storyAdvance");

      cy.visit("/games/today?date=2026-07-19&firstGame=close_approach");
      cy.wait("@todayAccess");
      cy.contains("button", "Initialize Mission").click();

      cy.wait("@closeApproachDaily");
      cy.contains(".eyebrow", "Close Approach Ranker").should("be.visible");
      cy.contains("button", "Lock ranking").click();
      cy.wait("@closeApproachSubmit");
      cy.contains("button", "Continue to Crossword").click();

      cy.wait("@crosswordDaily");
      cy.contains(".eyebrow", "Today's Crossword").should("be.visible");
      cy.get("input").first().type("EARTH");
      cy.contains("button", "Check answers").click();
      cy.wait("@crosswordSubmit");
      cy.wait("@gameComplete");
      cy.wait("@storyAdvance");

      cy.contains("h1", "Mission Complete").should("be.visible");
      cy.contains(".mission-complete-score-value", "100%").should("be.visible");
    });
  });

  describe("Minigame routes — navigation links", () => {
    it("home page links to /games/today", () => {
      cy.visit("/");
      cy.get("a[href*='/games/today'], a[href*='games']")
        .should("exist");
    });
  });
});
