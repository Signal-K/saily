describe("Discuss mechanics", () => {
  it("covers locked thread handoff, posting, replying, voting, and reacting", () => {
    const openThreadPosts = [
      {
        id: 201,
        thread_id: 102,
        parent_post_id: null,
        user_id: "u1",
        body: "Ongoing strategy thread.",
        result_payload: null,
        created_at: "2026-02-11T01:00:00.000Z",
        updated_at: "2026-02-11T01:00:00.000Z",
        profiles: { username: "liam" },
        vote_count: 3,
        upvoted_by_me: false,
        reaction_counts: { "🔥": 1 },
        reacted_by_me: [],
      },
    ];

    let createdId = 500;

    cy.intercept("GET", "/api/forum/threads*", {
      statusCode: 200,
      body: {
        defaultThreadId: 101,
        threads: [
          {
            id: 101,
            puzzle_date: "2026-02-11",
            kind: "daily_live",
            title: "Live Thread - 2026-02-11",
            continue_thread_id: 102,
            is_locked: true,
          },
          {
            id: 102,
            puzzle_date: "2026-02-11",
            kind: "ongoing",
            title: "Ongoing Discussion - 2026-02-11",
            continue_thread_id: null,
            is_locked: false,
          },
        ],
      },
    }).as("getThreads");

    cy.intercept("GET", "/api/forum/posts?threadId=101", {
      statusCode: 200,
      body: {
        thread: {
          id: 101,
          kind: "daily_live",
          puzzle_date: "2026-02-11",
          continue_thread_id: 102,
          is_locked: true,
        },
        posts: [],
      },
    }).as("getLivePosts");

    cy.intercept("GET", "/api/forum/posts?threadId=102", {
      statusCode: 200,
      body: {
        thread: {
          id: 102,
          kind: "ongoing",
          puzzle_date: "2026-02-11",
          continue_thread_id: null,
          is_locked: false,
        },
        posts: openThreadPosts,
      },
    }).as("getOngoingPosts");

    cy.intercept("POST", "/api/forum/posts", (req) => {
      const body = req.body as { parentPostId?: number | null; body?: string; threadId?: number };
      createdId += 1;
      req.reply({
        statusCode: 200,
        body: {
          post: {
            id: createdId,
            thread_id: body.threadId ?? 102,
            parent_post_id: body.parentPostId ?? null,
            user_id: "u2",
            body: body.body ?? "",
            result_payload: null,
            created_at: "2026-02-11T03:00:00.000Z",
            updated_at: "2026-02-11T03:00:00.000Z",
            profiles: { username: "tester" },
            vote_count: 0,
            upvoted_by_me: false,
            reaction_counts: {},
            reacted_by_me: [],
          },
        },
      });
    }).as("postForumEntry");

    cy.intercept("POST", "/api/forum/vote", {
      statusCode: 200,
      body: {
        upvoted: true,
        voteCount: 4,
      },
    }).as("votePost");

    cy.intercept("POST", "/api/forum/reaction", {
      statusCode: 200,
      body: {
        reacted: true,
        emojiCount: 2,
      },
    }).as("reactPost");

    cy.visit("/discuss?e2eAuth=1");

    cy.wait("@getThreads");
    cy.wait("@getLivePosts");

    cy.contains("This thread is locked").should("be.visible");
    cy.contains("button", "Continue Discussion").click();

    cy.wait("@getOngoingPosts");
    cy.getBySel("forum-thread-tab-ongoing").should("have.class", "is-active");

    cy.getBySel("forum-composer-body").type("This puzzle pattern was easier than expected.");
    cy.getBySel("forum-composer-share").check();
    cy.getBySel("forum-post-submit").click();
    cy.wait("@postForumEntry");
    cy.contains("This puzzle pattern was easier than expected.").should("be.visible");

    cy.contains("article", "Ongoing strategy thread.").within(() => {
      cy.contains("button", "Reply").click();
      cy.get("textarea").type("Replying with a specific idea.");
      cy.contains("button", "Post reply").click();
    });
    cy.wait("@postForumEntry");
    cy.contains("Replying with a specific idea.").should("be.visible");

    cy.contains("article", "Ongoing strategy thread.").within(() => {
      cy.contains("button", "▲ 3").click();
    });
    cy.wait("@votePost");
    cy.contains("article", "Ongoing strategy thread.").contains("button", "▲ 4").should("be.visible");

    cy.contains("article", "Ongoing strategy thread.").within(() => {
      cy.contains("button", "🔥 1").click();
    });
    cy.wait("@reactPost");
    cy.contains("article", "Ongoing strategy thread.").contains("button", "🔥 2").should("be.visible");
  });
});
