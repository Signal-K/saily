import { describe, expect, it } from "vitest";
import {
  getDailyMarsImages,
  MARS_FALLBACK_IMAGES,
  MARS_CLASSIFICATIONS,
  type MarsImage,
} from "../mars-images";

describe("MARS_FALLBACK_IMAGES", () => {
  it("contains exactly 15 images", () => {
    expect(MARS_FALLBACK_IMAGES).toHaveLength(15);
  });

  it("each image has required non-empty fields", () => {
    for (const img of MARS_FALLBACK_IMAGES) {
      expect(typeof img.id).toBe("string");
      expect(img.id.length).toBeGreaterThan(0);
      expect(typeof img.url).toBe("string");
      expect(img.url.length).toBeGreaterThan(0);
      expect(typeof img.title).toBe("string");
      expect(img.title.length).toBeGreaterThan(0);
      expect(typeof img.credit).toBe("string");
      expect(img.credit.length).toBeGreaterThan(0);
    }
  });

  it("all image URLs point to the NASA image library CDN", () => {
    for (const img of MARS_FALLBACK_IMAGES) {
      expect(img.url).toMatch(/^https:\/\/images-assets\.nasa\.gov\//);
    }
  });

  it("all image IDs are unique", () => {
    const ids = MARS_FALLBACK_IMAGES.map((img) => img.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("MARS_CLASSIFICATIONS", () => {
  it("contains exactly 5 classification types", () => {
    expect(MARS_CLASSIFICATIONS).toHaveLength(5);
  });

  it("includes expected categories", () => {
    expect(MARS_CLASSIFICATIONS).toContain("Rock field");
    expect(MARS_CLASSIFICATIONS).toContain("Crater");
    expect(MARS_CLASSIFICATIONS).toContain("Sky & horizon");
  });
});

describe("getDailyMarsImages", () => {
  it("returns exactly 3 images by default", () => {
    const imgs = getDailyMarsImages("2024-06-01");
    expect(imgs).toHaveLength(3);
  });

  it("is deterministic for the same date", () => {
    const a = getDailyMarsImages("2024-03-15");
    const b = getDailyMarsImages("2024-03-15");
    expect(a.map((i) => i.id)).toEqual(b.map((i) => i.id));
  });

  it("produces different selections for different dates", () => {
    const dates = ["2024-01-01", "2024-02-01", "2024-03-01", "2024-04-01"];
    const selections = dates.map((d) => getDailyMarsImages(d).map((i) => i.id).join(","));
    const unique = new Set(selections);
    expect(unique.size).toBeGreaterThan(1);
  });

  it("all returned images come from the default pool", () => {
    const imgs = getDailyMarsImages("2024-07-04");
    const poolIds = new Set(MARS_FALLBACK_IMAGES.map((i) => i.id));
    for (const img of imgs) {
      expect(poolIds.has(img.id)).toBe(true);
    }
  });

  it("uses a custom pool when provided", () => {
    const customPool: MarsImage[] = [
      { id: "A", url: "https://a.example.com/img.jpg", title: "A", credit: "Me" },
      { id: "B", url: "https://b.example.com/img.jpg", title: "B", credit: "Me" },
      { id: "C", url: "https://c.example.com/img.jpg", title: "C", credit: "Me" },
      { id: "D", url: "https://d.example.com/img.jpg", title: "D", credit: "Me" },
    ];
    const result = getDailyMarsImages("2024-01-01", customPool);
    expect(result).toHaveLength(3);
    for (const img of result) {
      expect(["A", "B", "C", "D"]).toContain(img.id);
    }
  });

  it("returns all images when pool has exactly 3 items", () => {
    const smallPool: MarsImage[] = [
      { id: "X", url: "https://x.example.com/x.jpg", title: "X", credit: "X" },
      { id: "Y", url: "https://y.example.com/y.jpg", title: "Y", credit: "Y" },
      { id: "Z", url: "https://z.example.com/z.jpg", title: "Z", credit: "Z" },
    ];
    const result = getDailyMarsImages("2024-01-01", smallPool);
    expect(result).toHaveLength(3);
  });

  it("falls back to today when date is null/undefined", () => {
    const result = getDailyMarsImages(undefined);
    expect(result).toHaveLength(3);
  });
});
