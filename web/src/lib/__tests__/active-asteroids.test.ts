import { describe, expect, it } from "vitest";
import {
  getDailyActiveAsteroidsSubject,
  toActiveAsteroidsSubject,
  ACTIVE_ASTEROIDS_FALLBACK_SUBJECTS,
} from "../active-asteroids";

describe("active asteroids helpers", () => {
  it("returns a stable daily fallback subject for a given date", () => {
    const s1 = getDailyActiveAsteroidsSubject("2026-04-25");
    const s2 = getDailyActiveAsteroidsSubject("2026-04-25");
    const s3 = getDailyActiveAsteroidsSubject("2026-04-26");

    expect(s1.id).toBe(s2.id);
    // With only 1 fallback, s3 will be same, but the logic is there
    expect(ACTIVE_ASTEROIDS_FALLBACK_SUBJECTS.length).toBe(1);
    expect(s1.id).toBe(s3.id);
  });

  it("normalizes a cached row into a playable subject", () => {
    const row = {
      game_date: "2026-04-25",
      subject_id: "777",
      image_url: "https://example.com/asteroid.jpg",
      caption: "A very active asteroid",
      candidate_id: "C/777",
      epoch_label: "2026-Q1",
      source_metadata: { title: "Custom Title" },
    };
    const subject = toActiveAsteroidsSubject(row);
    expect(subject).not.toBeNull();
    expect(subject?.id).toBe("777");
    expect(subject?.title).toBe("Custom Title");
    expect(subject?.candidateId).toBe("C/777");
  });
});
