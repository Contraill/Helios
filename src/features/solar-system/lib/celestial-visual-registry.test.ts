import { describe, expect, it } from "vitest";

import {
  DWARF_SATELLITE_IDS,
  EXTENDED_BODY_IDS,
  FEATURED_MOON_IDS,
} from "@/features/solar-system/types/celestial-body";

import {
  visualProfileFor,
  visualRegistryIds,
} from "./celestial-visual-registry";

describe("Celestial visual registry", () => {
  it("covers all featured moons, accepted extended bodies and dwarf-system satellites", () => {
    const expected = [
      ...FEATURED_MOON_IDS,
      ...EXTENDED_BODY_IDS,
      ...DWARF_SATELLITE_IDS,
    ];
    expect(new Set(visualRegistryIds)).toEqual(new Set(expected));
    for (const id of expected) {
      const profile = visualProfileFor(id);
      expect(profile.id).toBe(id);
      expect(profile.surface.assetPath).toMatch(
        /^\/textures\/celestial\/.+\.webp$/,
      );
      expect(profile.orientation.primeMeridianVerified).toBe(false);
      expect(profile.surface.representation).toBe("procedural-reconstruction");
    }
  });

  it("gives representative bodies distinct geometry/material dependencies", () => {
    const ids = [
      "moon-jupiter-europa",
      "moon-saturn-titan",
      "moon-saturn-iapetus",
      "haumea",
      "vesta",
      "67p",
    ] as const;
    const identities = ids.map((id) => {
      const profile = visualProfileFor(id);
      return JSON.stringify({
        geometry: profile.geometry,
        path: profile.surface.assetPath,
        atmosphere: profile.atmosphere ?? null,
        ring: profile.ring ?? null,
        comet: profile.comet ?? null,
      });
    });
    expect(new Set(identities).size).toBe(ids.length);
  });

  it("keeps every runtime surface at or below the 2K hard ceiling", async () => {
    const manifest =
      await import("../../../../scripts/data/texture-runtime-manifest.json");
    for (const asset of manifest.default.assets) {
      expect(asset.width).toBeLessThanOrEqual(2048);
      expect(asset.height).toBeLessThanOrEqual(1024);
      expect(asset.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(asset.license.trim()).not.toBe("");
      expect(asset.license).not.toMatch(/^(?:unknown|tbd|n\/a)$/i);
    }
  });
});
