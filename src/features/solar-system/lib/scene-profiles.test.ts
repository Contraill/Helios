import { describe, expect, it } from "vitest";

import { HIGH_VISUAL_CONTRACT } from "./quality";
import { SCENE_PROFILES } from "./scene-profiles";

describe("single scene with typed Explore and Scientific profiles", () => {
  it("changes only scale and cinematic intensity while retaining one high contract", () => {
    expect(HIGH_VISUAL_CONTRACT.dpr[1]).toBeGreaterThanOrEqual(1.5);
    expect(HIGH_VISUAL_CONTRACT.planetSegments[0]).toBeGreaterThanOrEqual(64);
    expect(SCENE_PROFILES.exploration.scale).toMatchObject({
      bodyProfile: "readable",
      distanceProfile: "compressed",
      strategy: { id: "exploration" },
    });
    expect(SCENE_PROFILES.scientific.scale).toMatchObject({
      bodyProfile: "physical-ratio",
      distanceProfile: "shared-ratio",
      strategy: { id: "scientific" },
    });
    expect(SCENE_PROFILES.exploration.effects.bloomStrength).toBeGreaterThan(0);
    expect(SCENE_PROFILES.scientific.effects.bloomStrength).toBeGreaterThan(
      SCENE_PROFILES.exploration.effects.bloomStrength,
    );
  });
});
