import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  AU_TO_LUNAR_DISTANCE,
  buildCadApiUrl,
  normalizeCadPayload,
  toPocketBaseRows,
} from "./normalizer.mjs";

async function loadFixture() {
  return JSON.parse(await readFile(new URL("../fixtures/cad-close-approaches.sample.json", import.meta.url), "utf8"));
}

const OPTIONS = {
  dateMin: "2028-06-26",
  dateMax: "2029-11-11",
  gameDate: "2028-06-26",
  limit: 5,
  ingestedAt: "2026-07-19T00:00:00.000Z",
};

describe("close approach CAD normalizer", () => {
  it("builds a bounded NASA/JPL CAD request URL", () => {
    const url = new URL(buildCadApiUrl(OPTIONS));

    expect(url.origin + url.pathname).toBe("https://ssd-api.jpl.nasa.gov/cad.api");
    expect(url.searchParams.get("body")).toBe("Earth");
    expect(url.searchParams.get("neo")).toBe("true");
    expect(url.searchParams.get("diameter")).toBe("true");
    expect(url.searchParams.get("fullname")).toBe("true");
    expect(url.searchParams.get("sort")).toBe("dist");
    expect(url.searchParams.get("date-min")).toBe("2028-06-26");
    expect(url.searchParams.get("date-max")).toBe("2029-11-11");
  });

  it("normalizes records and solves closest-distance order deterministically", async () => {
    const round = normalizeCadPayload(await loadFixture(), OPTIONS);

    expect(round.available).toBe(true);
    expect(round.records.map((record) => record.designation)).toEqual([
      "99942",
      "153814",
      "2026 AB",
      "2001 AV43",
      "2026 AA",
    ]);
    expect(round.orderedRecordIds).toEqual(round.records.map((record) => record.sourceRecordId));
    expect(round.records[0]).toMatchObject({
      designation: "99942",
      displayName: "99942 Apophis (2004 MN4)",
      distanceAu: 0.000254099098170977,
      relativeVelocityKmS: 7.42249308586014,
      absoluteMagnitudeH: 19.7,
      diameterKm: 0.34,
    });
    expect(round.records[0].distanceLd).toBe(Number((round.records[0].distanceAu * AU_TO_LUNAR_DISTANCE).toFixed(3)));
  });

  it("maps normalized records into idempotent PocketBase cache rows", async () => {
    const round = normalizeCadPayload(await loadFixture(), OPTIONS);
    const rows = toPocketBaseRows(round);

    expect(rows).toHaveLength(5);
    expect(rows[0]).toMatchObject({
      game_date: "2028-06-26",
      mode: "closest-distance",
      designation: "99942",
      solution_rank: 1,
      source_url: expect.stringContaining("cad.api"),
    });
    expect(rows[0].source_metadata.sourceSignatureVersion).toBe("1.5");
    expect(rows[0].source_metadata.rawFields).toContain("diameter");
  });

  it("fails loudly on signature version mismatch", async () => {
    const payload = await loadFixture();
    payload.signature.version = "1.6";

    expect(() => normalizeCadPayload(payload, OPTIONS)).toThrow("Unsupported NASA/JPL CAD API signature version");
  });

  it("returns an insufficient-source-records state below the publishable floor", async () => {
    const payload = await loadFixture();
    payload.data = payload.data.slice(0, 3);

    const round = normalizeCadPayload(payload, OPTIONS);

    expect(round.available).toBe(false);
    expect(round.reason).toBe("insufficient-source-records");
  });
});
