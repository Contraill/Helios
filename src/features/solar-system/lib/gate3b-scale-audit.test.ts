import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { visualRegistryIds } from "./celestial-visual-registry";
import {
  GATE3B_SCALE_AUDIT,
  type Gate3BScaleAuditArtifact,
} from "./gate3b-scale-audit";

function rounded(value: unknown): unknown {
  if (typeof value === "number") return Number(value.toPrecision(12));
  if (Array.isArray(value)) return value.map(rounded);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, rounded(entry)]),
    );
  }
  return value;
}

describe("Gate 3B scale and framing audit", () => {
  it("covers every visual body exactly once", () => {
    expect(GATE3B_SCALE_AUDIT.bodies).toHaveLength(48);
    expect(
      new Set(GATE3B_SCALE_AUDIT.bodies.map((body) => body.bodyId)),
    ).toEqual(new Set(visualRegistryIds));
  });

  it("keeps all measured values finite and scientific radii unamplified", () => {
    for (const body of GATE3B_SCALE_AUDIT.bodies) {
      expect(body.physicalRadiusKm).toBeGreaterThan(0);
      expect(body.renderedRadiusExplore).toBeGreaterThan(0);
      expect(body.renderedRadiusScientific).toBeGreaterThan(0);
      expect(body.visualAmplification.scientific).toBeCloseTo(1, 10);
      expect(body.parentDistance.exploration).toBeGreaterThan(
        body.geometryBounds.exploration,
      );
      expect(body.parentDistance.scientific).toBeGreaterThan(
        body.geometryBounds.scientific,
      );
      expect(body.focusRadius.exploration).toBeGreaterThanOrEqual(
        body.geometryBounds.exploration,
      );
      expect(body.focusRadius.scientific).toBeGreaterThanOrEqual(
        body.geometryBounds.scientific,
      );
      expect(body.systemExtent.exploration).toBeGreaterThanOrEqual(
        body.geometryBounds.exploration,
      );
      expect(body.systemExtent.scientific).toBeGreaterThanOrEqual(
        body.geometryBounds.scientific,
      );
      expect(
        body.focusRadius.exploration / body.geometryBounds.exploration,
      ).toBeLessThanOrEqual(12);
      expect(
        body.focusRadius.scientific / body.geometryBounds.scientific,
      ).toBeLessThanOrEqual(12);
    }
    expect(GATE3B_SCALE_AUDIT.summary.fail).toBe(0);
  });

  it("frames dwarf parent systems from their actual satellite extent", () => {
    for (const parentId of [
      "pluto",
      "eris",
      "haumea",
      "makemake",
      "quaoar",
      "gonggong",
      "orcus",
    ] as const) {
      const row = GATE3B_SCALE_AUDIT.bodies.find(
        (body) => body.bodyId === parentId,
      );
      expect(row).toBeDefined();
      expect(row!.systemExtent.exploration).toBeGreaterThan(
        row!.geometryBounds.exploration,
      );
      expect(row!.systemExtent.scientific).toBeGreaterThan(
        row!.geometryBounds.scientific,
      );
    }
  });

  it("keeps the committed machine-readable artifact synchronized", () => {
    const artifact = JSON.parse(
      readFileSync(
        join(process.cwd(), "test-artifacts", "gate3b-scale-audit.json"),
        "utf8",
      ),
    ) as Gate3BScaleAuditArtifact;
    expect(rounded(artifact)).toEqual(rounded(GATE3B_SCALE_AUDIT));
  });
});
