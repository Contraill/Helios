import { describe, expect, it } from "vitest";

import { planetIdSchema } from "@/lib/data/schemas/planet";

import { PLANET_VISUAL_PROFILES } from "./planet-visual-profiles";

describe("planet visual profiles", () => {
  it("defines every planet and omits Mercury's atmosphere", () => {
    expect(Object.keys(PLANET_VISUAL_PROFILES)).toEqual(planetIdSchema.options);
    expect(PLANET_VISUAL_PROFILES.mercury.atmosphere).toBeNull();
  });

  it("keeps rocky and giant atmosphere identities distinct", () => {
    const colors = [
      PLANET_VISUAL_PROFILES.venus.atmosphere?.color,
      PLANET_VISUAL_PROFILES.earth.atmosphere?.color,
      PLANET_VISUAL_PROFILES.mars.atmosphere?.color,
      PLANET_VISUAL_PROFILES.jupiter.atmosphere?.color,
      PLANET_VISUAL_PROFILES.uranus.atmosphere?.color,
      PLANET_VISUAL_PROFILES.neptune.atmosphere?.color,
    ];
    expect(new Set(colors).size).toBe(colors.length);
    expect(PLANET_VISUAL_PROFILES.mars.atmosphere?.opacity).toBeLessThan(
      PLANET_VISUAL_PROFILES.earth.atmosphere?.opacity ?? 0,
    );
  });
});
