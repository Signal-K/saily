import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";

const publicDir = path.resolve(__dirname, "../../public");

describe("PWA manifest", () => {
  it("has the installability fields used by mobile browsers", () => {
    const appManifest = manifest();

    expect(appManifest.name).toBe("The Daily Transit");
    expect(appManifest.short_name).toBe("Transit");
    expect(appManifest.start_url).toBe("/");
    expect(appManifest.scope).toBe("/");
    expect(appManifest.display).toBe("standalone");
    expect(appManifest.icons?.some((icon) => icon.sizes === "192x192" && icon.type === "image/png")).toBe(true);
    expect(appManifest.icons?.some((icon) => icon.sizes === "512x512" && icon.type === "image/png")).toBe(true);
    expect(appManifest.icons?.some((icon) => icon.purpose === "maskable")).toBe(true);
  });

  it("references icon files that exist in public assets", () => {
    const appManifest = manifest();

    for (const icon of appManifest.icons ?? []) {
      expect(existsSync(path.join(publicDir, icon.src))).toBe(true);
    }
  });
});

describe("service worker offline shell", () => {
  it("pre-caches the main mission shell and offline fallback", () => {
    const serviceWorker = readFileSync(path.join(publicDir, "sw.js"), "utf8");

    expect(serviceWorker).toContain('"/"');
    expect(serviceWorker).toContain('"/games/today"');
    expect(serviceWorker).toContain('"/offline"');
    expect(serviceWorker).toContain('"/manifest.webmanifest"');
    expect(serviceWorker).toContain('return caches.match("/offline")');
  });
});
