import { beforeEach, describe, expect, it } from "vitest";

import { blockingPrimaryTextureAssets } from "@/content/sources/planet-textures";

import {
  assetLoadingSnapshot,
  markCompleteFrameRendered,
  markMaterialApplied,
  markPrimaryAssetStatus,
  markRendererReady,
  markSecondaryStageStarted,
  resetAssetLoadingLifecycle,
} from "./asset-loading-lifecycle";

describe("blocking primary asset lifecycle", () => {
  beforeEach(() => resetAssetLoadingLifecycle());

  it("opens only after independent settlement, mounted material application and a complete frame", () => {
    markRendererReady();
    const failed = blockingPrimaryTextureAssets.find(({ owner }) =>
      owner.includes("mars"),
    )!;

    for (const entry of blockingPrimaryTextureAssets) {
      const degraded = entry === failed;
      markPrimaryAssetStatus(entry.path, degraded ? "error" : "ready");
      markMaterialApplied(entry.owner, degraded);
    }

    expect(assetLoadingSnapshot()).toMatchObject({
      blockingReady: false,
      degradedOwners: [failed.owner],
      firstCompleteFrame: false,
      planetReadyCount: 7,
      planetTotal: 8,
      primarySettled: blockingPrimaryTextureAssets.length,
      rendererReady: true,
    });

    markCompleteFrameRendered();
    expect(assetLoadingSnapshot().blockingReady).toBe(true);
    markSecondaryStageStarted();
    expect(assetLoadingSnapshot().secondaryStageStarted).toBe(true);
  });
});
