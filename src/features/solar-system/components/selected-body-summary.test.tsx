import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { ExplorePlanetSummary } from "@/features/solar-system/lib/explore-planets";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import {
  resetExplorationStore,
  useExplorationStore,
} from "@/stores/exploration-store";

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
    resetExplorationStore();
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
});
