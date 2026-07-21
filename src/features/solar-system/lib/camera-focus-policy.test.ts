import { describe, expect, it } from "vitest";

import { cameraFocusPolicy, clampCameraDistance } from "./camera-focus-policy";
import { sceneProfileFor } from "./scene-profiles";

const body = {
  bodyId: "earth" as const,
  targetKind: "body" as const,
  renderRadius: 1,
  collisionRadius: 1,
  focusRadius: 1.1,
};

describe("camera focus policy", () => {
  it("frames bodies, ring systems, comets and regions with safe finite distances", () => {
    const exploration = sceneProfileFor("exploration");
    const scientific = sceneProfileFor("scientific");
    const normal = cameraFocusPolicy({
      aspect: 16 / 9,
      fovDegrees: 46,
      metadata: body,
      profile: exploration,
    });
    const saturn = cameraFocusPolicy({
      aspect: 16 / 9,
      fovDegrees: 46,
      metadata: { ...body, bodyId: "saturn", focusRadius: 2.27 },
      profile: exploration,
    });
    const comet = cameraFocusPolicy({
      aspect: 16 / 9,
      fovDegrees: 46,
      metadata: { ...body, bodyId: "halley", focusRadius: 0.4 },
      profile: exploration,
    });
    const oort = cameraFocusPolicy({
      aspect: 16 / 9,
      fovDegrees: 46,
      metadata: {
        bodyId: "oort-cloud",
        targetKind: "region",
        renderRadius: 1,
        collisionRadius: 42,
        focusRadius: 42,
        systemExtent: 165,
      },
      profile: exploration,
    });
    const tinyScientific = cameraFocusPolicy({
      aspect: 9 / 16,
      fovDegrees: 46,
      metadata: {
        bodyId: "moon-jupiter-europa",
        targetKind: "body",
        renderRadius: 0.001,
        collisionRadius: 0.001,
        focusRadius: 0.015,
      },
      profile: scientific,
    });

    expect(normal.minimumDistance).toBeGreaterThan(1);
    expect(saturn.desiredDistance).toBeGreaterThan(normal.desiredDistance);
    expect(comet.desiredDistance).toBeLessThan(normal.desiredDistance);
    expect(oort.desiredDistance).toBeGreaterThan(saturn.desiredDistance);
    expect(tinyScientific.minimumDistance).toBeLessThan(0.1);
    for (const result of [normal, saturn, comet, oort, tinyScientific]) {
      expect(Number.isFinite(result.desiredDistance)).toBe(true);
      expect(result.desiredDistance).toBeGreaterThanOrEqual(
        result.minimumDistance,
      );
      expect(result.desiredDistance).toBeLessThanOrEqual(
        result.maximumDistance,
      );
    }
  });

  it("clamps mode-switch distances and rejects invalid values safely", () => {
    expect(clampCameraDistance(8, 2, 10)).toBe(8);
    expect(clampCameraDistance(0.5, 2, 10)).toBe(2);
    expect(clampCameraDistance(18, 2, 10)).toBe(10);
    expect(clampCameraDistance(Number.NaN, 2, 10)).toBe(2);
  });
});
