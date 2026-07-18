import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { planetTextureSources, textureVariantFor } from "./planet-textures";

describe("planet texture source manifest", () => {
  it("covers the Sun and every planet with traceable local variants", () => {
    const sources = Object.values(planetTextureSources);
    const paths = new Set<string>();

    expect(sources).toHaveLength(9);
    for (const source of sources) {
      expect(source.sourceId).not.toHaveLength(0);
      expect(source.sourceUrl).toMatch(/^https:\/\//);
      expect(source.attribution).not.toHaveLength(0);
      expect(source.license).toContain("NASA");

      for (const variant of Object.values(source.variants)) {
        expect(variant.decodedBytes).toBe(variant.width * variant.height * 4);
        expect(paths.has(variant.path)).toBe(false);
        expect(
          existsSync(join(process.cwd(), "public", variant.path.slice(1))),
        ).toBe(true);
        paths.add(variant.path);
      }
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
  });
});
