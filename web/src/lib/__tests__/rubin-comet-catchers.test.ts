import { describe, expect, it } from "vitest";
import {
  getDailyRubinCometCatchersSubject,
  toRubinCometCatchersSubject,
  RUBIN_COMET_CATCHERS_FALLBACK_SUBJECTS,
} from "../rubin-comet-catchers";

describe("rubin comet catchers helpers", () => {
  it("returns a stable daily fallback subject for a given date", () => {
    const s1 = getDailyRubinCometCatchersSubject("2026-04-25");
    const s2 = getDailyRubinCometCatchersSubject("2026-04-25");
    expect(s1.id).toBe(s2.id);
  });

  it("normalizes a cached row into a playable subject", () => {
    const row = {
      game_date: "2026-04-25",
      subject_id: "R-999",
      image_urls: ["https://example.com/1.jpg", "https://example.com/2.jpg"],
      activity_prompt: "Spot the tail",
      object_label: "Comet 999",
      known_training_flag: true,
      source_metadata: { title: "Rubin Find" },
    };
    const subject = toRubinCometCatchersSubject(row);
    expect(subject).not.toBeNull();
    expect(subject?.id).toBe("R-999");
    expect(subject?.imageUrls).toHaveLength(2);
    expect(subject?.knownTrainingFlag).toBe(true);
  });
});
