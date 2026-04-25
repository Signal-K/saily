import { describe, expect, it } from "vitest";
import { MARS_TEMPLATE_DICTIONARY } from "../mars-dictionary";

describe("MARS_TEMPLATE_DICTIONARY", () => {
  it("contains exactly 5 entries", () => {
    expect(MARS_TEMPLATE_DICTIONARY).toHaveLength(5);
  });

  it("each entry has all required fields as non-empty strings", () => {
    for (const template of MARS_TEMPLATE_DICTIONARY) {
      expect(typeof template.id).toBe("string");
      expect(template.id.length).toBeGreaterThan(0);

      expect(typeof template.label).toBe("string");
      expect(template.label.length).toBeGreaterThan(0);

      expect(typeof template.description).toBe("string");
      expect(template.description.length).toBeGreaterThan(0);

      expect(typeof template.imageUrl).toBe("string");
      expect(template.imageUrl.length).toBeGreaterThan(0);
    }
  });

  it("all ids are unique", () => {
    const ids = MARS_TEMPLATE_DICTIONARY.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all image URLs point to the NASA image library CDN", () => {
    for (const template of MARS_TEMPLATE_DICTIONARY) {
      expect(template.imageUrl).toMatch(/^https:\/\/images-assets\.nasa\.gov\//);
    }
  });

  it("includes known surface feature types", () => {
    const ids = MARS_TEMPLATE_DICTIONARY.map((t) => t.id);
    expect(ids).toContain("crater");
    expect(ids).toContain("dunes");
    expect(ids).toContain("sand-dust");
  });

  it("all labels are title-cased non-empty strings", () => {
    for (const template of MARS_TEMPLATE_DICTIONARY) {
      // Label should start with an uppercase letter
      expect(template.label[0]).toEqual(template.label[0].toUpperCase());
    }
  });
});
