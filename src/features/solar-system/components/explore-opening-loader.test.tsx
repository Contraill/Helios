import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AssetLoadingSnapshot } from "@/features/solar-system/lib/asset-loading-lifecycle";

const { useAssetLoadingSnapshot } = vi.hoisted(() => ({
  useAssetLoadingSnapshot: vi.fn(),
}));

vi.mock("@/features/solar-system/lib/asset-loading-lifecycle", () => ({
  useAssetLoadingSnapshot,
}));

import { ExploreOpeningLoader } from "./explore-opening-loader";

function loadingSnapshot(
  overrides: Partial<AssetLoadingSnapshot> = {},
): AssetLoadingSnapshot {
  return {
    blockingReady: false,
    degradedOwners: [],
    firstCompleteFrame: false,
    planetReadyCount: 2,
    planetTotal: 8,
    primarySettled: 3,
    primaryTotal: 9,
    rendererReady: true,
    secondaryStageStarted: false,
    statusByPath: {
      "/textures/planets/sun.webp": "ready",
    },
    ...overrides,
  };
}

describe("ExploreOpeningLoader", () => {
  beforeEach(() => {
    useAssetLoadingSnapshot.mockReset();
    delete document.documentElement.dataset.exploreSceneReady;
  });

  it("names the progressbar, reports meaningful progress and unmounts when ready", () => {
    useAssetLoadingSnapshot.mockReturnValue(loadingSnapshot());
    const { rerender } = render(<ExploreOpeningLoader />);

    const progressbar = screen.getByRole("progressbar", {
      name: "Solar System loading progress",
    });
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "8");
    expect(progressbar).toHaveAttribute("aria-valuenow", "2");
    expect(progressbar).toHaveAttribute(
      "aria-valuetext",
      "Preparing the planets. 2 of 8 planets ready.",
    );
    expect(document.documentElement).toHaveAttribute(
      "data-explore-scene-ready",
      "false",
    );

    useAssetLoadingSnapshot.mockReturnValue(
      loadingSnapshot({
        blockingReady: true,
        firstCompleteFrame: true,
        planetReadyCount: 8,
        primarySettled: 9,
      }),
    );
    rerender(<ExploreOpeningLoader />);

    expect(
      screen.queryByTestId("explore-opening-loader"),
    ).not.toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute(
      "data-explore-scene-ready",
      "true",
    );
  });
});
