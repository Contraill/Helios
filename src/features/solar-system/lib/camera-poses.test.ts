import { describe, expect, it } from "vitest";

import {
  cameraPoseHasSettled,
  focusCameraOffset,
  illuminatedFocusCameraOffset,
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

  it("frames the complete scientific scale from much farther away", () => {
    const exploration = overviewCameraPosition(1440, 900, "exploration");
    const scientific = overviewCameraPosition(1440, 900, "scientific");
    expect(scientific[2]).toBeGreaterThan(exploration[2] * 7);
  });

  it("keeps the focus camera outside the selected planet", () => {
    const radius = 2;
    const offset = focusCameraOffset(radius, 16 / 9);
    const distance = Math.hypot(...offset);
    expect(distance).toBeGreaterThan(radius * 5);
  });

  it("frames a scientific body from its real scaled radius without an exploration minimum", () => {
    const radius = 0.000_511;
    const exploration = Math.hypot(
      ...focusCameraOffset(radius, 16 / 9, "exploration"),
    );
    const scientific = Math.hypot(
      ...focusCameraOffset(radius, 16 / 9, "scientific"),
    );

    expect(scientific).toBeCloseTo(
      radius * 5.4 * Math.hypot(0.48, 0.24, 1),
      12,
    );
    expect(exploration).toBeGreaterThan(scientific * 1_000);
  });

  it("starts a focus view on the lit hemisphere without aligning through the Sun", () => {
    const planetPosition = [18, 0.4, -5] as const;
    const offset = illuminatedFocusCameraOffset(planetPosition, 2, 16 / 9);
    const planetDistance = Math.hypot(...planetPosition);
    const offsetDistance = Math.hypot(...offset);
    const sunward = planetPosition.map(
      (coordinate) => -coordinate / planetDistance,
    );
    const litHemisphereAlignment =
      (offset[0] * sunward[0] +
        offset[1] * sunward[1] +
        offset[2] * sunward[2]) /
      offsetDistance;

    expect(litHemisphereAlignment).toBeGreaterThan(0.6);
    expect(
      Math.abs(offset[0] * planetPosition[2] - offset[2] * planetPosition[0]),
    ).toBeGreaterThan(1);
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
