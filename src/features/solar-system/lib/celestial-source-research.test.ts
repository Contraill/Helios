import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import officialRuntimeOverrides from "../../../../scripts/data/celestial-official-runtime-overrides.json";
import runtimeManifest from "../../../../scripts/data/texture-runtime-manifest.json";

import {
  visualProfileFor,
  visualRegistryIds,
  type VisualBodyId,
} from "./celestial-visual-registry";

interface SourceResearchArtifact {
  readonly schemaVersion: 2;
  readonly policy: string;
  readonly candidates: readonly {
    readonly bodyId: string;
    readonly provider: string;
    readonly sourceUrl: string;
    readonly productType: string;
    readonly runtimeStatus:
      | "candidate-reviewed-not-integrated"
      | "integrated-derived-map"
      | "procedural-reconstruction-retained";
    readonly projection: string | null;
    readonly longitudeDirection: string | null;
    readonly longitudeDomain: string | null;
    readonly coverage: string;
    readonly integrationState:
      | "blocked-source-not-imported"
      | "runtime-derived-imported"
      | "procedural-retained-no-suitable-global-product";
    readonly integrationNote: string;
    readonly importPolicy: "automatic-derived-map" | "reference-only";
    readonly downloadStrategy:
      "configured-direct" | "discover-product-page-raster" | "none";
    readonly targetRepresentation: "derived-map" | "procedural-reconstruction";
    readonly preferredRuntimeDownloadUrl: string | null;
    readonly flipHorizontal: boolean;
    readonly seamShiftDeg: number;
    readonly blackNoDataThreshold: number;
    readonly manualGpuReviewRequired: true;
  }[];
}

const GATE3B_BODY_IDS = visualRegistryIds;

function artifact(): SourceResearchArtifact {
  return JSON.parse(
    readFileSync(
      join(process.cwd(), "docs", "data", "celestial-source-research.json"),
      "utf8",
    ),
  ) as SourceResearchArtifact;
}

describe("Gate 3B official-source research and import ledger", () => {
  it("covers the complete Gate 3B visual registry with an official-domain candidate or explicit retained fallback", () => {
    const result = artifact();
    expect(result.schemaVersion).toBe(2);
    expect(result.policy).toMatch(/not classified/i);
    expect(
      new Set(result.candidates.map((candidate) => candidate.bodyId)),
    ).toEqual(new Set(GATE3B_BODY_IDS));

    for (const candidate of result.candidates) {
      const hostname = new URL(candidate.sourceUrl).hostname;
      expect(
        hostname.endsWith("nasa.gov") ||
          hostname.endsWith("usgs.gov") ||
          hostname.endsWith("esa.int"),
      ).toBe(true);
      expect(candidate.provider.trim()).not.toBe("");
      expect(candidate.manualGpuReviewRequired).toBe(true);
    }

    expect(
      result.candidates.filter(
        (candidate) => candidate.importPolicy === "automatic-derived-map",
      ).length,
    ).toBeGreaterThanOrEqual(18);
  });

  it("records import-critical cartographic metadata for every global raster candidate", () => {
    const result = artifact();

    for (const candidate of result.candidates) {
      expect(candidate.coverage.trim()).not.toBe("");
      expect(candidate.integrationNote.trim()).not.toBe("");

      if (candidate.productType === "global-raster-map") {
        expect(candidate.projection).toMatch(/cylindrical|equirectangular/i);
        expect(candidate.longitudeDirection).toMatch(/^Positive (East|West)$/);
        expect(candidate.longitudeDomain).toMatch(/^(?:-180 to 180|0 to 360)$/);
        expect(candidate.importPolicy).toBe("automatic-derived-map");
        expect(candidate.targetRepresentation).toBe("derived-map");
        expect(candidate.downloadStrategy).not.toBe("none");
        expect(candidate.seamShiftDeg).toBe(
          candidate.longitudeDomain === "0 to 360" ? 180 : 0,
        );
        expect(candidate.flipHorizontal).toBe(
          candidate.longitudeDirection === "Positive West",
        );
      } else {
        expect(candidate.projection).toBeNull();
        expect(candidate.longitudeDirection).toBeNull();
        expect(candidate.longitudeDomain).toBeNull();
        expect(candidate.importPolicy).toBe("reference-only");
        expect(candidate.targetRepresentation).toBe(
          "procedural-reconstruction",
        );
      }
    }
  });

  it("keeps runtime claims synchronized with imported source pixels", () => {
    const result = artifact();
    const overrides = officialRuntimeOverrides.assets as readonly {
      readonly bodyId: string;
    }[];
    const overrideIds = new Set<string>(overrides.map(({ bodyId }) => bodyId));
    const manifestByBodyId = new Map(
      runtimeManifest.assets.map((asset) => [asset.bodyId, asset]),
    );

    for (const candidate of result.candidates) {
      const imported =
        candidate.integrationState === "runtime-derived-imported";
      expect(overrideIds.has(candidate.bodyId)).toBe(imported);
      const profile = visualProfileFor(candidate.bodyId as VisualBodyId);
      const manifestAsset = manifestByBodyId.get(candidate.bodyId);
      expect(manifestAsset).toBeDefined();
      if (imported) {
        expect(candidate.runtimeStatus).toBe("integrated-derived-map");
        expect(profile.surface.representation).toBe("derived-map");
        expect(manifestAsset?.representationType).toBe("derived-map");
        expect(profile.orientation.projection).toBe("equirectangular");
      } else {
        expect(profile.surface.representation).toBe(
          "procedural-reconstruction",
        );
        expect(manifestAsset?.representationType).toBe(
          "procedural-reconstruction",
        );
      }
    }
  });
});
