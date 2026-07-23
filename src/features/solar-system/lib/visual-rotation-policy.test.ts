import { describe, expect, it } from "vitest";

import {
  visualRotationAngleAt,
  visualRotationQuaternionAt,
  type VisualRotationProfile,
} from "./visual-rotation-policy";

const periodic: VisualRotationProfile = {
  kind: "periodic",
  periodHours: 10,
  retrograde: false,
  epochMs: 0,
  sourceId: "test-period",
};

describe("visual rotation policy", () => {
  it("returns the same angle and quaternion for the same timestamp", () => {
    expect(visualRotationAngleAt(periodic, 12_345_678)).toBe(
      visualRotationAngleAt(periodic, 12_345_678),
    );
    expect(visualRotationQuaternionAt(periodic, 12_345_678).toArray()).toEqual(
      visualRotationQuaternionAt(periodic, 12_345_678).toArray(),
    );
  });

  it("is independent of frame subdivision", () => {
    const direct = visualRotationAngleAt(periodic, 7_200_000);
    const frameSamples = Array.from({ length: 120 }, (_, index) =>
      visualRotationAngleAt(periodic, ((index + 1) / 120) * 7_200_000),
    );
    const afterManyFrames = frameSamples.at(-1);
    expect(afterManyFrames).toBe(direct);
  });

  it("reverses periodic direction for retrograde profiles", () => {
    const retrograde = { ...periodic, retrograde: true };
    expect(visualRotationAngleAt(retrograde, 3_600_000)).toBeCloseTo(
      -visualRotationAngleAt(periodic, 3_600_000),
      12,
    );
  });

  it("keeps unknown and tidally locked surfaces fixed for their owning evaluator", () => {
    expect(
      visualRotationAngleAt(
        {
          kind: "fixed-unknown",
          sourceId: "unknown",
          note: "No source-backed period.",
        },
        99_999_999,
      ),
    ).toBe(0);
    expect(
      visualRotationAngleAt(
        { kind: "tidally-locked", sourceId: "tidal-owner" },
        99_999_999,
      ),
    ).toBe(0);
  });
});
