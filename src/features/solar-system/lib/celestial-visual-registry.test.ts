import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DWARF_SATELLITE_IDS,
  DWARF_SYSTEM_PARENT_IDS,
  EXTENDED_BODY_IDS,
  FEATURED_MOON_IDS,
} from "@/features/solar-system/types/celestial-body";

import { MOON_BY_ID } from "./moon-catalogue";

import {
  visualProfileFor,
  visualRegistryIds,
  type VisualBodyId,
} from "./celestial-visual-registry";
import { visualRotationSourceFor } from "./visual-rotation-sources";

const categoryIds = (
  category: ReturnType<typeof visualProfileFor>["category"],
) =>
  visualRegistryIds.filter((id) => visualProfileFor(id).category === category);

function geometrySignature(id: VisualBodyId): string {
  const geometry = visualProfileFor(id).geometry;
  return `${geometry.kind}:${geometry.seed}:${geometry.scale.join(",")}`;
}

describe("Celestial visual registry", () => {
  it("covers the exact Gate 3B visual catalogue without duplicate IDs", () => {
    const expected = [
      ...FEATURED_MOON_IDS,
      ...EXTENDED_BODY_IDS,
      ...DWARF_SATELLITE_IDS,
    ];
    expect(new Set(visualRegistryIds)).toEqual(new Set(expected));
    expect(new Set(visualRegistryIds).size).toBe(visualRegistryIds.length);
    expect(categoryIds("featured-moon")).toHaveLength(22);
    expect(categoryIds("asteroid")).toHaveLength(4);
    expect(categoryIds("dwarf-kuiper")).toHaveLength(8);
    expect(categoryIds("comet")).toHaveLength(6);
    expect(
      categoryIds("dwarf-system-satellite").length +
        DWARF_SYSTEM_PARENT_IDS.length,
    ).toBe(15);
  });

  it("keeps every profile typed, finite, sourced and fallback-safe", async () => {
    const manifest =
      await import("../../../../scripts/data/texture-runtime-manifest.json");
    const manifestPaths = new Set(
      manifest.default.assets.map((asset) => asset.path as string),
    );
    for (const id of visualRegistryIds) {
      const profile = visualProfileFor(id);
      expect(profile.id).toBe(id);
      expect(profile.surface.assetPath).toMatch(
        /^\/textures\/celestial\/.+\.webp$/,
      );
      expect(manifestPaths).toContain(profile.surface.assetPath);
      expect(
        existsSync(
          join(
            process.cwd(),
            "public",
            profile.surface.assetPath.replace(/^\//, ""),
          ),
        ),
      ).toBe(true);
      expect(profile.surface.fallbackColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(profile.geometry.scale).toHaveLength(3);
      expect(
        profile.geometry.scale.every(
          (value) => Number.isFinite(value) && value > 0,
        ),
      ).toBe(true);
      expect(profile.sourceId.trim()).not.toBe("");
      expect(profile.orientation.orientationSourceId.trim()).not.toBe("");
      expect(profile.orientation.northPoleConvention.trim()).not.toBe("");
      expect(profile.loadingPriority).toBeGreaterThanOrEqual(0);
      expect(profile.loadingPriority).toBeLessThanOrEqual(100);
      expect(profile.rotation.sourceId.trim()).not.toBe("");
      if (profile.rotation.kind === "periodic") {
        expect(
          visualRotationSourceFor(profile.rotation.sourceId),
        ).not.toBeNull();
      }
      if (profile.rotation.kind === "fixed-unknown") {
        expect(profile.rotation.note.trim()).not.toBe("");
        expect(profile.orientation.rotationSense).toBe("unknown");
      }
    }
  });

  it("derives featured-moon rotation metadata from the moon catalogue", () => {
    for (const id of FEATURED_MOON_IDS) {
      const catalogueRotation = MOON_BY_ID[id].rotation;
      const visualRotation = visualProfileFor(id).rotation;
      if (catalogueRotation.kind === "tidally-locked") {
        expect(visualRotation.kind).toBe("tidally-locked");
      } else {
        expect(visualRotation.kind).toBe("fixed-unknown");
      }
      expect(visualRotation.sourceId).toBe(
        catalogueRotation.orientationSourceId,
      );
    }

    expect(MOON_BY_ID["moon-neptune-nereid"].rotation.kind).toBe("unknown");
    expect(visualProfileFor("moon-neptune-nereid").rotation.kind).toBe(
      "fixed-unknown",
    );
    expect(
      visualProfileFor("moon-neptune-nereid").orientation.rotationSense,
    ).toBe("unknown");
  });

  it("gives irregular bodies deterministic and distinct geometry signatures", () => {
    const irregular = visualRegistryIds.filter((id) => {
      const kind = visualProfileFor(id).geometry.kind;
      return kind === "irregular" || kind === "bilobed";
    });
    const signatures = irregular.map(geometrySignature);
    expect(new Set(signatures).size).toBe(signatures.length);
    expect(irregular.map(geometrySignature)).toEqual(signatures);
  });

  it("preserves the required silhouette and context identities", () => {
    expect(visualProfileFor("67p").geometry.kind).toBe("bilobed");
    expect(visualProfileFor("haumea").geometry.scale[0]).toBeGreaterThan(
      visualProfileFor("haumea").geometry.scale[1] * 1.8,
    );
    expect(visualProfileFor("ceres").geometry.kind).toBe("sphere");
    expect(visualProfileFor("hygiea").geometry.kind).toBe("ellipsoid");
    expect(visualProfileFor("vesta").geometry.kind).toBe("irregular");
    expect(visualProfileFor("moon-mars-phobos").geometry).not.toEqual(
      visualProfileFor("moon-mars-deimos").geometry,
    );
    expect(visualProfileFor("moon-neptune-proteus").geometry).not.toEqual(
      visualProfileFor("moon-neptune-nereid").geometry,
    );
    for (const id of ["haumea", "quaoar"] as const) {
      const ring = visualProfileFor(id).ring;
      expect(ring).toBeDefined();
      expect(ring!.outerRadius).toBeGreaterThan(ring!.innerRadius);
      expect(ring!.innerRadius).toBeGreaterThan(1);
    }
  });

  it("keeps every runtime texture inside the accepted ceiling", async () => {
    const manifest =
      await import("../../../../scripts/data/texture-runtime-manifest.json");
    const assets = manifest.default.assets as readonly {
      attribution: string;
      byteSize: number;
      height: number;
      license: string;
      northPoleConvention?: string;
      path: string;
      primeMeridianVerified?: boolean;
      projection?: string;
      provider?: string;
      representationType?: string;
      sha256: string;
      sourceId?: string;
      width: number;
    }[];

    for (const asset of assets) {
      expect(asset.width).toBeLessThanOrEqual(2048);
      expect(asset.height).toBeLessThanOrEqual(1024);
      expect(asset.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(asset.license.trim()).not.toBe("");
      expect(asset.license).not.toMatch(/^(?:unknown|tbd|n\/a)$/i);
      expect(asset.attribution.trim()).not.toBe("");
      expect(asset.byteSize).toBeGreaterThan(512);

      if (asset.path.startsWith("/textures/celestial/")) {
        expect(asset.provider?.trim()).not.toBe("");
        expect(asset.sourceId?.trim()).not.toBe("");
        expect(["procedural-reconstruction", "derived-map"]).toContain(
          asset.representationType,
        );
        expect(["procedural-equirectangular", "equirectangular"]).toContain(
          asset.projection,
        );
        if (asset.representationType === "derived-map") {
          expect(asset.projection).toBe("equirectangular");
        }
        expect(asset.northPoleConvention?.trim()).not.toBe("");
        expect(asset.primeMeridianVerified).toBe(false);
        expect(asset.width).toBeLessThanOrEqual(1024);
        expect(asset.height).toBeLessThanOrEqual(512);
      }
    }
  });
});
