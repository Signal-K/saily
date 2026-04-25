import { describe, expect, it } from "vitest";
import {
  CLOUDSPOTTING_MARS_FALLBACK_SUBJECTS,
  getDailyCloudspottingMarsSubject,
  toCloudspottingMarsSubject,
} from "../cloudspotting-mars";

describe("cloudspotting mars helpers", () => {
  it("returns a stable daily fallback subject for a given date", () => {
    const first = getDailyCloudspottingMarsSubject("2026-04-25");
    const second = getDailyCloudspottingMarsSubject("2026-04-25");

    expect(first.id).toBe(second.id);
    expect(CLOUDSPOTTING_MARS_FALLBACK_SUBJECTS.map((subject) => subject.id)).toContain(first.id);
  });

  it("normalizes a cached row into a playable subject", () => {
    const subject = toCloudspottingMarsSubject({
      game_date: "2026-04-25",
      subject_id: "cloud-123",
      image_url: "https://example.com/cloud-123.png",
      caption: "High thin cloud over Mars",
      season_or_context: "Early northern winter",
      workflow_version: "1.2",
      source_metadata: {
        title: "Cloud 123",
        prompt: "Classify the visible cloud arc.",
        sourceName: "Zooniverse",
        sourceUrl: "https://www.zooniverse.org/projects/marek-slipski/cloudspotting-on-mars",
        sourceMission: "MRO / Mars Climate Sounder",
      },
    });

    expect(subject).not.toBeNull();
    expect(subject?.id).toBe("cloud-123");
    expect(subject?.title).toBe("Cloud 123");
    expect(subject?.seasonOrContext).toBe("Early northern winter");
  });

  it("drops invalid cached rows without subject id or image", () => {
    expect(
      toCloudspottingMarsSubject({
        game_date: "2026-04-25",
        subject_id: null,
        image_url: null,
        caption: null,
        season_or_context: null,
        workflow_version: null,
        source_metadata: null,
      }),
    ).toBeNull();
  });
});
