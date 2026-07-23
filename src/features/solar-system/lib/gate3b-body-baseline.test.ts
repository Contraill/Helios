import { describe, expect, it } from "vitest";

import baselineJson from "../../../../test-artifacts/gate3b-body-baseline.json";

import type { Gate3BBaselineArtifact } from "./gate3b-body-baseline";

const baseline = baselineJson as unknown as Gate3BBaselineArtifact;

describe("Gate 3B pre-change machine-readable baseline", () => {
  it("is anchored to the exact accepted base commit", () => {
    expect(baseline.baseCommit).toBe(
      "c6ae3380d8e4c18bcfd9f2e2142034587f9ccc61",
    );
    expect(baseline.schemaVersion).toBe(1);
    expect(baseline.bodies).toHaveLength(48);
  });

  it("classifies every accepted non-Sun/non-planet visual", () => {
    expect(baseline.summary).toEqual({
      total: 48,
      realMap: 0,
      derivedMap: 0,
      proceduralReconstruction: 48,
      fallbackOnly: 0,
      missing: 0,
      malformedMetadata: 0,
    });
    expect(
      baseline.bodies.every(({ classification }) =>
        [
          "real-map",
          "derived-map",
          "procedural-reconstruction",
          "fallback-only",
          "missing",
          "malformed-metadata",
        ].includes(classification),
      ),
    ).toBe(true);
  });

  it("keeps geometry, orientation, selection and focus fields finite", () => {
    for (const body of baseline.bodies) {
      expect(body.id).not.toBe("");
      expect(body.geometryScale).toHaveLength(3);
      expect(body.geometryScale.every(Number.isFinite)).toBe(true);
      expect(body.geometryScale.every((value) => value > 0)).toBe(true);
      expect(body.orientationSourceId).not.toBe("");
      expect(body.assetPath).toMatch(/^\/textures\/celestial\/.+\.webp$/);
      expect(body.textureDimensions).not.toBeNull();
      expect(body.textureDimensions?.[0]).toBeLessThanOrEqual(1024);
      expect(body.textureDimensions?.[1]).toBeLessThanOrEqual(512);
      expect(body.orbitMounted).toBe(true);
      expect(body.selectable).toBe(true);
      expect(Number.isFinite(body.focusRadius)).toBe(true);
      expect(body.focusRadius).toBeGreaterThan(0);
    }
  });
});
