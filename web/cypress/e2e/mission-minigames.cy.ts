/**
 * E2E coverage for the Saily standalone minigames. Each game (crossword,
 * transit spotter, close approach ranker, Cloudspotting on Mars) is
 * independent — no chained mission, no shared narrative. Completing any one
 * of them earns its own Data Chip. /games/today is a hub linking to all four.
 */

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
  ],
};

const closeApproachPayload = {
  available: true,
  date: missionDate,
  mode: "closest-distance",
  prompt: "Rank these close approaches from closest to farthest.",
  sourceName: "NASA/JPL SBDB Close Approach Data API",
  sourceSignatureVersion: "1.5",
  records: [
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
  ],
};

const cloudspottingPayload = {
  ok: true,
  date: missionDate,
  source: "fallback",
  subject: {
    id: "cloud-subject-1",
    imageUrl: "/assets/data-chip.svg",
    title: "Cloud Subject cloud-subject-1",
    prompt: "Review this Mars cloud subject and classify the dominant cloud structure.",
    caption: "A real archived Cloudspotting on Mars subject.",
    seasonOrContext: null,
    sourceName: "Zooniverse / Cloudspotting on Mars",
    sourceUrl: "https://example.test/cloudspotting-1",
    sourceMission: null,
    projectUrl: "https://www.zooniverse.org/projects/marek-slipski/cloudspotting-on-mars",
  },
  fallbackCount: 3,
  user: null,
};

function mockAllowedAccess(alias: string) {
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
    completedGames: [],
    badges: [],
  }).as(alias);
}

function mockCompletion(alias: string, game: string) {
  cy.intercept("POST", "/api/game/complete", {
    ok: true,
    stats: null,
    badgesAwarded: 0,
    awardedChips: 1,
    score: 100,
    gameDate: missionDate,
    game,
  }).as(alias);
}

describe("Standalone minigames", () => {
  describe("/games/today — daily games hub", () => {
    it("page responds with 200 or redirect", () => {
      cy.request({ url: "/games/today", failOnStatusCode: false })
        .its("status")
        .should("be.oneOf", [200, 307, 302]);
    });

    it("does not crash with a fatal error boundary", () => {
      cy.visit("/games/today");
      cy.get("body").should("not.contain", "Application error");
    });

    it("lists all four games with direct links", () => {
      cy.visit("/games/today");
      cy.contains("a", "Crossword").should("have.attr", "href").and("include", "/games/crossword");
      cy.contains("a", "Transit Spotter").should("have.attr", "href").and("include", "/games/transit-spotter");
      cy.contains("a", "Close Approach Ranker").should("have.attr", "href").and("include", "/games/close-approaches");
      cy.contains("a", "Cloudspotting on Mars").should("have.attr", "href").and("include", "/games/cloudspotting-mars");
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
        completedGames: [],
        badges: [],
      }).as("lockedArchive");

      cy.visit("/games/today?date=2026-06-01");
      cy.wait("@lockedArchive");
      cy.contains("h1", "Unlock 2026-06-01 to replay it.").should("be.visible");
      cy.contains("a", "Sign in to unlock")
        .should("have.attr", "href")
        .and("include", "/auth/sign-in");
      cy.get("body").should("not.contain", "Application error");
    });
  });

  describe("crossword — standalone", () => {
    it("can be played and completed independently", () => {
      mockAllowedAccess("todayAccess");
      cy.intercept("GET", "/api/crossword/daily?date=*", crosswordPayload).as("crosswordDaily");
      cy.intercept("POST", "/api/crossword/submit", {
        date: missionDate,
        correct: 1,
        total: 1,
        score: 100,
        allCorrect: true,
      }).as("crosswordSubmit");
      mockCompletion("gameComplete", "crossword");

      cy.visit(`/games/crossword?date=${missionDate}`);
      cy.wait("@todayAccess");
      cy.wait("@crosswordDaily");
      cy.contains(".eyebrow", "Today's Crossword").should("be.visible");
      cy.get("input").first().type("EARTH");
      cy.contains("button", "Check answers").click();
      cy.wait("@crosswordSubmit");
      cy.wait("@gameComplete");

      cy.contains("Crossword complete").should("be.visible");
      cy.contains("Score: 100%").should("be.visible");
      cy.contains("+1 Data Chip earned.").should("be.visible");
      cy.contains("a", "Discuss today's puzzle").should("have.attr", "href").and("include", "/discuss?date=");
    });
  });

  describe("transit spotter — standalone", () => {
    it("can be played and completed independently", () => {
      mockAllowedAccess("todayAccess");
      cy.intercept("GET", "/api/dsmr/daily?date=*", transitPayload).as("dsmrDaily");
      mockCompletion("gameComplete", "dsmr");

      cy.visit(`/games/transit-spotter?date=${missionDate}`);
      cy.wait("@todayAccess");
      cy.wait("@dsmrDaily");
      cy.contains(".eyebrow", "Transit Spotter").should("be.visible");
      cy.contains("button", "Transit dip").click();
      cy.wait("@gameComplete");

      cy.contains("Transit Spotter complete").should("be.visible");
      cy.contains("+1 Data Chip earned.").should("be.visible");
    });
  });

  describe("close approach ranker — standalone", () => {
    it("can be played and completed independently", () => {
      mockAllowedAccess("todayAccess");
      cy.intercept("GET", "/api/close-approaches/daily?date=*", closeApproachPayload).as("closeApproachDaily");
      cy.intercept("POST", "/api/close-approaches/submit", {
        date: missionDate,
        mode: "closest-distance",
        score: 100,
        exact: 1,
        near: 0,
        total: 1,
        closest: closeApproachPayload.records[0],
        evaluations: closeApproachPayload.records.map((record, index) => ({
          ...record,
          correctRank: index + 1,
          submittedRank: index + 1,
          status: "correct",
        })),
      }).as("closeApproachSubmit");
      mockCompletion("gameComplete", "close_approach");

      cy.visit(`/games/close-approaches?date=${missionDate}`);
      cy.wait("@todayAccess");
      cy.wait("@closeApproachDaily");
      cy.contains(".eyebrow", "Close Approach Ranker").should("be.visible");
      cy.contains("button", "Lock ranking").click();
      cy.wait("@closeApproachSubmit");
      cy.wait("@gameComplete");

      cy.contains("Close Approach Ranker complete").should("be.visible");
      cy.contains("+1 Data Chip earned.").should("be.visible");
    });
  });

  describe("Cloudspotting on Mars — standalone", () => {
    it("can be played and completed independently", () => {
      mockAllowedAccess("todayAccess");
      cy.intercept("GET", "/api/cloudspotting-mars/daily?date=*", cloudspottingPayload).as("cloudspottingDaily");
      mockCompletion("gameComplete", "cloudspotting_mars");

      cy.visit(`/games/cloudspotting-mars?date=${missionDate}`);
      cy.wait("@todayAccess");
      cy.wait("@cloudspottingDaily");
      cy.contains(".eyebrow", "Cloudspotting on Mars").should("be.visible");
      cy.contains("button", "Clouds visible").click();
      cy.wait("@gameComplete");

      cy.contains("Cloudspotting on Mars complete").should("be.visible");
      cy.contains("+1 Data Chip earned.").should("be.visible");
    });
  });

  describe("Minigame routes — navigation links", () => {
    it("home page links to /games/today", () => {
      cy.visit("/");
      cy.get("a[href*='/games/today'], a[href*='games']").should("exist");
    });
  });
});
