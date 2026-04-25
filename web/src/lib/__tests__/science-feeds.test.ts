import { describe, expect, it } from "vitest";
import { SCIENCE_FEEDS, SCIENCE_FEED_ORDER, getScienceFeedDefinition } from "../science-feeds";

describe("science feed registry", () => {
  it("defines the four planned post-TESS science feeds", () => {
    expect(Object.keys(SCIENCE_FEEDS).sort()).toEqual([
      "active_asteroids",
      "cloudspotting_mars",
      "gaia_variables",
      "rubin_comet_catchers",
    ]);
  });

  it("keeps the intake order stable", () => {
    expect(SCIENCE_FEED_ORDER.map((feed) => feed.id)).toEqual([
      "cloudspotting_mars",
      "active_asteroids",
      "rubin_comet_catchers",
      "gaia_variables",
    ]);
  });

  it("returns the canonical feed definition by id", () => {
    const feed = getScienceFeedDefinition("cloudspotting_mars");
    expect(feed.cacheTable).toBe("cloudspotting_mars_daily");
    expect(feed.kind).toBe("image_subject");
  });
});
