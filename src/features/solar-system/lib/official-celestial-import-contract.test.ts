import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import overridesJson from "../../../../scripts/data/celestial-official-runtime-overrides.json";

interface RuntimeOverride {
  readonly bodyId: string;
  readonly assetPath: string;
  readonly representation: "derived-map";
  readonly projection: "equirectangular";
  readonly sourceId: string;
  readonly orientationSourceId: string;
  readonly visualCalibrationNote: string;
}

const overrides = overridesJson as {
  readonly schemaVersion: 1;
  readonly assets: readonly RuntimeOverride[];
};

const importerSource = readFileSync(
  join(process.cwd(), "scripts", "import-official-celestial-assets.py"),
  "utf8",
);

describe("official celestial runtime importer contract", () => {
  it("keeps source masters outside public and writes only bounded derivatives", () => {
    expect(importerSource).toMatch(/\.cache\/celestial-official/);
    expect(importerSource).toMatch(/MAX_DOWNLOAD_BYTES/);
    expect(importerSource).toMatch(/near-2:1 global raster/);
    expect(importerSource).toMatch(/bounded-lanczos-resize/);
    expect(importerSource).toMatch(/write_json_atomic/);
    expect(importerSource).toMatch(/Source master cached outside public/i);
  });

  it("requires explicit apply and preserves manual GPU review", () => {
    expect(importerSource).toMatch(/--apply/);
    expect(importerSource).toMatch(/manualGpuReviewRequired/);
    expect(importerSource).toMatch(/--strict/);
  });

  it("keeps every committed override typed and source-backed", () => {
    expect(overrides.schemaVersion).toBe(1);
    for (const asset of overrides.assets) {
      expect(asset.assetPath).toMatch(/^\/textures\/celestial\/.+\.webp$/);
      expect(asset.representation).toBe("derived-map");
      expect(asset.projection).toBe("equirectangular");
      expect(asset.sourceId).toMatch(/^official-derived-/);
      expect(asset.orientationSourceId).toBe(asset.sourceId);
      expect(asset.visualCalibrationNote).toMatch(/manual GPU/i);
    }
  });
});
