import { describe, expect, it } from "vitest";

import { EXTENDED_BODY_BY_ID } from "./extended-system";
import { extendedBodySceneMetrics } from "./extended-body-scene-metrics";

function metrics(
  bodyId: keyof typeof EXTENDED_BODY_BY_ID,
  mode: "exploration" | "scientific",
) {
  return extendedBodySceneMetrics(EXTENDED_BODY_BY_ID[bodyId], mode);
}

describe("extended-body scene and camera metrics", () => {
  it("does not leak interaction hit-target floors into Scientific camera framing", () => {
    for (const bodyId of ["ceres", "pluto", "67p"] as const) {
      const result = metrics(bodyId, "scientific");
      expect(result.focusRadius).toBeGreaterThanOrEqual(result.geometryBounds);
      expect(result.focusRadius / result.geometryBounds).toBeLessThanOrEqual(4);
      expect(result.interactionRadius).toBeGreaterThan(result.focusRadius);
    }
  });

  it("frames dwarf parent systems from satellite orbits rather than interaction spheres", () => {
    for (const bodyId of [
      "pluto",
      "eris",
      "haumea",
      "makemake",
      "quaoar",
      "gonggong",
      "orcus",
    ] as const) {
      for (const mode of ["exploration", "scientific"] as const) {
        const result = metrics(bodyId, mode);
        expect(result.systemExtent).toBeGreaterThan(result.geometryBounds);
        expect(result.systemExtent).toBeGreaterThan(result.focusRadius);
      }
    }
  });

  it("includes the coma but excludes the long tail from comet focus bounds", () => {
    for (const bodyId of [
      "halley",
      "hale-bopp",
      "encke",
      "67p",
      "neowise",
      "tempel-1",
    ] as const) {
      for (const mode of ["exploration", "scientific"] as const) {
        const result = metrics(bodyId, mode);
        expect(result.comaExtent).toBeGreaterThan(0);
        expect(result.focusRadius).toBe(result.comaExtent);
        expect(result.systemExtent).toBe(result.focusRadius);
      }
    }
  });
});
