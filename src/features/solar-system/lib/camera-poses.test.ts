import { describe, expect, it } from "vitest";

import {
  cameraPoseHasSettled,
  focusCameraOffset,
  overviewCameraPosition,
  transitionAlpha,
} from "./camera-poses";

describe("camera poses", () => {
  it("moves the overview camera farther away on portrait screens", () => {
    const landscape = overviewCameraPosition(1440, 900);
    const portrait = overviewCameraPosition(390, 844);
    expect(portrait[2]).toBeGreaterThan(landscape[2]);
    expect(portrait[1]).toBeGreaterThan(landscape[1]);
  });

  it("keeps the focus camera outside the selected planet", () => {
    const radius = 2;
    const offset = focusCameraOffset(radius, 16 / 9);
    const distance = Math.hypot(...offset);
    expect(distance).toBeGreaterThan(radius * 5);
  });

  it("uses frame-rate independent interpolation", () => {
    const oneStep = transitionAlpha(1 / 30, false);
    const halfStep = transitionAlpha(1 / 60, false);
    const composed = 1 - (1 - halfStep) ** 2;
    expect(oneStep).toBeCloseTo(composed, 12);
  });

  it("snaps immediately when reduced motion is enabled", () => {
    expect(transitionAlpha(0, true)).toBe(1);
  });

  it("only settles inside both position and target thresholds", () => {
    expect(cameraPoseHasSettled(0.08, 0.04)).toBe(true);
    expect(cameraPoseHasSettled(0.2, 0.04)).toBe(false);
  });
});
