import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/content/sources/planet-textures", () => ({
  blockingPrimaryTextureAssets: [],
}));

import {
  assetLoadingSnapshot,
  markRendererAvailable,
  markRendererUnavailable,
  resetAssetLoadingLifecycle,
} from "./asset-loading-lifecycle";

describe("asset loading renderer availability", () => {
  beforeEach(() => resetAssetLoadingLifecycle());

  it("releases the unavailable shortcut after a successful WebGL retry", () => {
    expect(assetLoadingSnapshot().blockingReady).toBe(false);

    markRendererUnavailable();
    expect(assetLoadingSnapshot().blockingReady).toBe(true);

    markRendererAvailable();
    expect(assetLoadingSnapshot().blockingReady).toBe(false);
  });

  it("keeps repeated availability updates idempotent", () => {
    markRendererUnavailable();
    markRendererUnavailable();
    expect(assetLoadingSnapshot().blockingReady).toBe(true);

    markRendererAvailable();
    markRendererAvailable();
    expect(assetLoadingSnapshot().blockingReady).toBe(false);
  });
});
