import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  earthCloudTextureSource,
  planetTextureSources,
  saturnRingTextureVariants,
  textureVariantFor,
} from "./planet-textures";

describe("planet texture source manifest", () => {
  it("covers the Sun and every planet with traceable local variants", () => {
    const sources = Object.values(planetTextureSources);
    const paths = new Set<string>();

    expect(sources).toHaveLength(9);
    for (const source of sources) {
      expect(source.sourceId).not.toHaveLength(0);
      expect(source.sourceUrl).toMatch(/^https:\/\//);
      expect(source.attribution).not.toHaveLength(0);
      expect(source.license).toMatch(/NASA|Creative Commons/);

      for (const variant of Object.values(source.variants)) {
        expect(variant.decodedBytes).toBe(variant.width * variant.height * 4);
        expect(paths.has(variant.path)).toBe(false);
        expect(
          existsSync(join(process.cwd(), "public", variant.path.slice(1))),
        ).toBe(true);
        paths.add(variant.path);
      }
    }

    for (const variant of Object.values(earthCloudTextureSource.variants)) {
      expect(
        existsSync(join(process.cwd(), "public", variant.path.slice(1))),
      ).toBe(true);
      expect(paths.has(variant.path)).toBe(false);
      paths.add(variant.path);
    }
  });

  it("keeps high overview bodies at medium and promotes only a selection", () => {
    expect(textureVariantFor("mars", "high").path).toContain("-medium.");
    expect(textureVariantFor("mars", "high", true).path).toContain("-high.");
    expect(textureVariantFor("earth", "medium", true).path).toContain(
      "-medium.",
    );
  });

  it("does not present reference-derived simulations as observations", () => {
    expect(planetTextureSources.sun.representation).toBe("simulation");
    expect(planetTextureSources.saturn.representation).toBe("simulation");
    expect(planetTextureSources.uranus.representation).toBe("simulation");
    expect(planetTextureSources.neptune.representation).toBe("simulation");
    expect(earthCloudTextureSource.representation).toBe("simulation");
  });

  it("gives focused high quality a real 2K minimum and a detailed ring profile", () => {
    for (const source of Object.values(planetTextureSources)) {
      expect(source.variants.medium.width).toBe(512);
      expect(source.variants.high.width).toBeGreaterThanOrEqual(2048);
    }
    expect(saturnRingTextureVariants.high.width).toBe(4096);
    expect(saturnRingTextureVariants.high.width).toBeGreaterThan(
      saturnRingTextureVariants.high.height,
    );
  });
});
