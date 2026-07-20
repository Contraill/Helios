import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { ExplorePlanetSummary } from "@/features/solar-system/lib/explore-planets";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import {
  resetExplorationStore,
  useExplorationStore,
} from "@/stores/exploration-store";
import {
  resetSceneVisibilityStore,
  useSceneVisibilityStore,
} from "@/stores/scene-visibility-store";

import { SelectedBodySummary } from "./selected-body-summary";

const sceneSun: SceneSun = {
  id: "sun",
  name: "Sun",
  radiusSourceId: "test",
  scales: { exploration: 2.5, scientific: 0.01 },
};

const planetSummaries: readonly ExplorePlanetSummary[] = [];

describe("SelectedBodySummary", () => {
  beforeEach(() => {
    localStorage.clear();
    resetExplorationStore();
    resetSceneVisibilityStore();
  });

  it("keeps an extended body's editorial route available after selection", () => {
    useExplorationStore.getState().selectBody("ceres");
    render(
      <SelectedBodySummary
        planetSummaries={planetSummaries}
        sceneSun={sceneSun}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Open Ceres editorial page" }),
    ).toHaveAttribute("href", "/object/ceres");
  });

  it("keeps selection while explicit object visibility changes", () => {
    useExplorationStore.getState().selectBody("ceres");
    render(
      <SelectedBodySummary
        planetSummaries={planetSummaries}
        sceneSun={sceneSun}
      />,
    );

    const hideAction = screen.getByRole("button", { name: "Hide this object" });
    expect(hideAction).not.toHaveAttribute("aria-pressed");
    fireEvent.click(hideAction);
    expect(screen.getByRole("status")).toHaveTextContent("Hidden individually");
    const showAction = screen.getByRole("button", { name: "Show this object" });
    expect(showAction).toBeVisible();
    expect(showAction).not.toHaveAttribute("aria-pressed");
    expect(useExplorationStore.getState().selectedBodyId).toBe("ceres");

    fireEvent.click(screen.getByRole("button", { name: "Show this object" }));
    expect(screen.getByRole("status")).toHaveTextContent("Explicitly shown");
    expect(useExplorationStore.getState().selectedBodyId).toBe("ceres");
  });

  it("explains category-hidden state and only shows a body on an explicit action", () => {
    useSceneVisibilityStore
      .getState()
      .setCategoryVisibility("asteroids", false);
    useExplorationStore.getState().selectBody("ceres");
    render(
      <SelectedBodySummary
        planetSummaries={planetSummaries}
        sceneSun={sceneSun}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Hidden by category");
    fireEvent.click(screen.getByRole("button", { name: "Show this object" }));
    expect(useSceneVisibilityStore.getState().objectOverrides.ceres).toBe(
      "visible",
    );
    expect(screen.getByRole("status")).toHaveTextContent("Explicitly shown");
  });
});
