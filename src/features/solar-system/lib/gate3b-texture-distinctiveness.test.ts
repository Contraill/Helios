import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { visualRegistryIds } from "./celestial-visual-registry";

interface TextureDistinctivenessArtifact {
  readonly schemaVersion: 1;
  readonly method: string;
  readonly bodies: readonly {
    readonly bodyId: string;
    readonly dHash: string;
    readonly nearestBodyId: string;
    readonly nearestHammingDistance: number;
  }[];
  readonly summary: {
    readonly total: number;
    readonly minimumNearestHammingDistance: number;
    readonly pairsBelowReviewThreshold: number;
  };
}

function artifact(): TextureDistinctivenessArtifact {
  return JSON.parse(
    readFileSync(
      join(
        process.cwd(),
        "test-artifacts",
        "gate3b-texture-distinctiveness.json",
      ),
      "utf8",
    ),
  ) as TextureDistinctivenessArtifact;
}

describe("Gate 3B procedural texture distinctiveness audit", () => {
  it("covers the exact visual registry without duplicate hashes", () => {
    const result = artifact();
    expect(result.schemaVersion).toBe(1);
    expect(result.summary.total).toBe(48);
    expect(result.bodies).toHaveLength(48);
    expect(new Set(result.bodies.map((body) => body.bodyId))).toEqual(
      new Set(visualRegistryIds),
    );
    expect(new Set(result.bodies.map((body) => body.dHash)).size).toBe(48);
  });

  it("rejects near-duplicate generated surfaces while retaining GPU review", () => {
    const result = artifact();
    expect(result.method).toMatch(/diagnostic only/i);
    expect(result.summary.minimumNearestHammingDistance).toBeGreaterThanOrEqual(
      24,
    );
    expect(result.summary.pairsBelowReviewThreshold).toBe(0);
    for (const body of result.bodies) {
      expect(body.nearestBodyId).not.toBe(body.bodyId);
      expect(body.nearestHammingDistance).toBeGreaterThanOrEqual(24);
    }
  });
});
