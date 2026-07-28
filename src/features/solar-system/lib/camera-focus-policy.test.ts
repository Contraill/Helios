import { describe, expect, it } from "vitest";

import { cameraFocusPolicy, clampCameraDistance } from "./camera-focus-policy";
import { extendedBodySceneMetrics } from "./extended-body-scene-metrics";
import { EXTENDED_BODIES } from "./extended-system";
import { isDwarfSystemParentId } from "../types/celestial-body";
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

  it("produces finite focus framing for every extended body in both scale modes", () => {
    const results = new Map<string, ReturnType<typeof cameraFocusPolicy>>();
    for (const mode of ["exploration", "scientific"] as const) {
      const profile = sceneProfileFor(mode);
      for (const aspect of [16 / 9, 9 / 16]) {
        for (const extendedBody of EXTENDED_BODIES) {
          const metrics = extendedBodySceneMetrics(extendedBody, mode);
          const result = cameraFocusPolicy({
            aspect,
            fovDegrees: 46,
            metadata: {
              bodyId: extendedBody.id,
              targetKind: isDwarfSystemParentId(extendedBody.id)
                ? "system"
                : "body",
              renderRadius: metrics.geometryBounds,
              collisionRadius: metrics.geometryBounds,
              focusRadius: metrics.focusRadius,
              ...(isDwarfSystemParentId(extendedBody.id)
                ? { systemExtent: metrics.systemExtent }
                : {}),
            },
            profile,
          });
          expect(Number.isFinite(result.minimumDistance)).toBe(true);
          expect(Number.isFinite(result.desiredDistance)).toBe(true);
          expect(result.minimumDistance).toBeGreaterThan(0);
          expect(result.desiredDistance).toBeGreaterThanOrEqual(
            result.minimumDistance,
          );
          expect(result.desiredDistance).toBeLessThanOrEqual(
            result.maximumDistance,
          );
          results.set(`${mode}:${aspect}:${extendedBody.id}`, result);
        }
      }
    }

    const scientificTempel = results.get(`scientific:${16 / 9}:tempel-1`);
    expect(scientificTempel?.desiredDistance).toBeLessThan(0.00001);
    expect(scientificTempel?.desiredDistance).toBeLessThan(
      results.get(`exploration:${16 / 9}:tempel-1`)?.desiredDistance ?? 0,
    );
  });

  it("clamps mode-switch distances and rejects invalid values safely", () => {
    expect(clampCameraDistance(8, 2, 10)).toBe(8);
    expect(clampCameraDistance(0.5, 2, 10)).toBe(2);
    expect(clampCameraDistance(18, 2, 10)).toBe(10);
    expect(clampCameraDistance(Number.NaN, 2, 10)).toBe(2);
  });
});
