import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  blockingPrimaryTextureAssets,
  earthCityLightsTextureSource,
  earthCloudTextureSource,
  planetTextureSources,
  saturnRingTextureSource,
} from "./planet-textures";

describe("runtime celestial texture manifest", () => {
  it("owns one canonical runtime asset for the Sun and every planet", () => {
    const sources = Object.values(planetTextureSources);
    const paths = new Set<string>();

    expect(sources).toHaveLength(9);
    for (const source of sources) {
      expect(source.sourceId).not.toHaveLength(0);
      expect(source.sourceUrl).toMatch(/^https:\/\//);
      expect(source.attribution).not.toHaveLength(0);
      expect(source.license).toMatch(/NASA|Creative Commons/);
      expect(source.asset.width).toBeLessThanOrEqual(2048);
      expect(source.asset.height).toBeLessThanOrEqual(1024);
      expect(source.asset.decodedBytes).toBe(
        source.asset.width * source.asset.height * 4,
      );
      expect(paths.has(source.asset.path)).toBe(false);
      const localPath = join(
        process.cwd(),
        "public",
        source.asset.path.slice(1),
      );
      expect(existsSync(localPath)).toBe(true);
      expect(statSync(localPath).size).toBeGreaterThan(0);
      paths.add(source.asset.path);
    }
  });

  it("keeps primary special layers within the fixed runtime ceiling", () => {
    for (const source of [
      earthCloudTextureSource,
      earthCityLightsTextureSource,
    ]) {
      expect(source.asset.width).toBeLessThanOrEqual(2048);
      expect(source.asset.height).toBeLessThanOrEqual(1024);
      expect(source.asset.width).toBeGreaterThan(source.asset.height);
      expect(
        existsSync(join(process.cwd(), "public", source.asset.path.slice(1))),
      ).toBe(true);
    }
    expect(saturnRingTextureSource.width).toBeLessThanOrEqual(2048);
    expect(saturnRingTextureSource.height).toBeLessThanOrEqual(256);
    expect(saturnRingTextureSource.width).toBeGreaterThan(
      saturnRingTextureSource.height,
    );
    expect(
      existsSync(
        join(process.cwd(), "public", saturnRingTextureSource.path.slice(1)),
      ),
    ).toBe(true);
  });

  it("defines the complete blocking primary stage without duplicate owners", () => {
    expect(blockingPrimaryTextureAssets).toHaveLength(12);
    expect(
      new Set(blockingPrimaryTextureAssets.map(({ owner }) => owner)).size,
    ).toBe(12);
    expect(
      new Set(blockingPrimaryTextureAssets.map(({ path }) => path)).size,
    ).toBe(12);
  });

  it("does not present reference-derived simulations as observations", () => {
    expect(planetTextureSources.sun.representation).toBe("simulation");
    expect(planetTextureSources.saturn.representation).toBe("simulation");
    expect(planetTextureSources.uranus.representation).toBe("simulation");
    expect(planetTextureSources.neptune.representation).toBe("simulation");
    expect(earthCloudTextureSource.representation).toBe("simulation");
    expect(earthCityLightsTextureSource.representation).toBe("simulation");
  });
});
