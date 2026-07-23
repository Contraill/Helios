import { describe, expect, it } from "vitest";

import {
  FALLBACK_SURFACE_SCALE,
  shouldLoadCelestialTexture,
  visualGeometryCacheSize,
  visualGeometryPartsFor,
  visualGeometrySignatureFor,
} from "./celestial-visual-surface";

describe("Gate 3B visual geometry cache", () => {
  it("promotes selected or hovered secondary textures without waiting for the background scheduler", () => {
    expect(
      shouldLoadCelestialTexture({
        policy: "scheduled",
        promoted: true,
        readiness: "idle",
      }),
    ).toBe(true);
    expect(
      shouldLoadCelestialTexture({
        policy: "scheduled",
        promoted: false,
        readiness: "idle",
      }),
    ).toBe(false);
    expect(
      shouldLoadCelestialTexture({
        policy: "scheduled",
        promoted: false,
        readiness: "loading",
      }),
    ).toBe(true);
  });

  it("is deterministic and does not recreate cached irregular geometries", () => {
    const before = visualGeometryCacheSize();
    const first = visualGeometrySignatureFor("moon-mars-phobos");
    const afterFirst = visualGeometryCacheSize();
    const second = visualGeometrySignatureFor("moon-mars-phobos");
    const afterSecond = visualGeometryCacheSize();
    expect(second).toBe(first);
    expect(afterFirst).toBeGreaterThanOrEqual(before);
    expect(afterSecond).toBe(afterFirst);
  });

  it("keeps representative irregular silhouettes distinct", () => {
    const ids = [
      "moon-mars-phobos",
      "moon-mars-deimos",
      "moon-neptune-proteus",
      "moon-neptune-nereid",
      "vesta",
      "pallas",
      "encke",
      "tempel-1",
    ] as const;
    const signatures = ids.map(visualGeometrySignatureFor);
    expect(new Set(signatures).size).toBe(ids.length);
  });

  it("separates the fallback shell from the final surface during crossfade", () => {
    expect(FALLBACK_SURFACE_SCALE).toBeGreaterThan(0.998);
    expect(FALLBACK_SURFACE_SCALE).toBeLessThan(1);
    expect(1 - FALLBACK_SURFACE_SCALE).toBeLessThanOrEqual(0.001);
  });

  it("gives 67P two lobes plus a neck instead of a hard two-sphere join", () => {
    expect(visualGeometryPartsFor("67p")).toEqual([
      "large-lobe",
      "neck",
      "small-lobe",
    ]);
  });
});
