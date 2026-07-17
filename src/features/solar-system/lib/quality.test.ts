import { describe, expect, it } from "vitest";

import { SCENE_QUALITY } from "./quality";

describe("scene quality", () => {
  it("reduces measurable render work at low quality", () => {
    expect(SCENE_QUALITY.low.starCount).toBeLessThan(
      SCENE_QUALITY.medium.starCount,
    );
    expect(SCENE_QUALITY.medium.starCount).toBeLessThan(
      SCENE_QUALITY.high.starCount,
    );
    expect(SCENE_QUALITY.low.planetSegments[0]).toBeLessThan(
      SCENE_QUALITY.high.planetSegments[0],
    );
    expect(SCENE_QUALITY.low.dpr[1]).toBeLessThan(SCENE_QUALITY.high.dpr[1]);
  });
});
