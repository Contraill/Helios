import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { ExplorePlanetSummary } from "@/features/solar-system/lib/explore-planets";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import {
  resetExplorationStore,
  useExplorationStore,
} from "@/stores/exploration-store";
import { resetExploreSceneUiStore } from "@/stores/explore-scene-ui-store";

import { CelestialNavigator } from "./celestial-navigator";

const sun: SceneSun = {
  id: "sun",
  name: "Sun",
  radiusSourceId: "test",
  scales: { exploration: 2.5, scientific: 0.01 },
};

const planets: readonly ExplorePlanetSummary[] = [
  {
    accentColor: "#4e88cf",
    gravityMS2: 9.81,
    id: "earth",
    kind: "terrestrial",
    moonCount: 1,
    moonCountAsOf: "2026-07-17",
    name: "Earth",
    orbitalPeriodEarthDays: 365.25,
    orderFromSun: 3,
    sunlightTravelMinutes: 8.3,
    tagline: "The reference world.",
  },
  {
    accentColor: "#c39875",
    gravityMS2: 24.79,
    id: "jupiter",
    kind: "gas-giant",
    moonCount: 95,
    moonCountAsOf: "2026-07-17",
    name: "Jupiter",
    orbitalPeriodEarthDays: 4332.59,
    orderFromSun: 5,
    sunlightTravelMinutes: 43.3,
    tagline: "A giant world.",
  },
  {
    accentColor: "#d4bd83",
    gravityMS2: 10.44,
    id: "saturn",
    kind: "gas-giant",
    moonCount: 146,
    moonCountAsOf: "2026-07-17",
    name: "Saturn",
    orbitalPeriodEarthDays: 10759,
    orderFromSun: 6,
    sunlightTravelMinutes: 79.4,
    tagline: "A ringed giant.",
  },
];

describe("CelestialNavigator", () => {
  beforeEach(() => {
    resetExplorationStore();
    resetExploreSceneUiStore();
  });

  it("keeps non-active category items out of the DOM and restores category focus on Back", () => {
    render(<CelestialNavigator planetSummaries={planets} sceneSun={sun} />);
    const category = screen.getByRole("button", { name: /Sun & planets/i });
    expect(screen.queryByRole("button", { name: "Earth" })).toBeNull();

    fireEvent.click(category);
    expect(screen.getByRole("button", { name: "Earth" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Back/i }));

    expect(screen.queryByRole("button", { name: "Earth" })).toBeNull();
    expect(
      screen.getByRole("button", { name: /Sun & planets/i }),
    ).toHaveFocus();
  });

  it("drills through Jupiter before exposing only the Galilean featured set", () => {
    render(<CelestialNavigator planetSummaries={planets} sceneSun={sun} />);
    fireEvent.click(screen.getByRole("button", { name: /Planetary moons/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /Jupiter.*4 featured/i }),
    );

    expect(screen.getByRole("button", { name: "Io" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Europa" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Ganymede" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Callisto" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Titan" })).toBeNull();
  });

  it("supports arrow-key movement inside the current drill-down list", () => {
    render(<CelestialNavigator planetSummaries={planets} sceneSun={sun} />);
    const first = screen.getByRole("button", { name: /Sun & planets/i });
    const second = screen.getByRole("button", { name: /Planetary moons/i });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(second).toHaveFocus();
  });

  it("keeps the selected extended body while browsing another category", () => {
    render(<CelestialNavigator planetSummaries={planets} sceneSun={sun} />);
    fireEvent.click(screen.getByRole("button", { name: /Main-belt worlds/i }));
    fireEvent.click(screen.getByRole("button", { name: "Ceres" }));
    expect(useExplorationStore.getState().selectedBodyId).toBe("ceres");

    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    fireEvent.click(screen.getByRole("button", { name: /Regions & context/i }));

    expect(useExplorationStore.getState().selectedBodyId).toBe("ceres");
  });

  it("shows only the four Regions & context navigation targets", () => {
    render(<CelestialNavigator planetSummaries={planets} sceneSun={sun} />);
    fireEvent.click(screen.getByRole("button", { name: /Regions & context/i }));

    expect(screen.getByRole("button", { name: "Asteroid belt" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Kuiper belt" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Oort cloud" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Heliosphere" })).toBeVisible();

    for (const retiredCopy of [
      "Zodiacal dust & meteor context",
      "Belt density",
      "Sparse",
      "Standard",
      "Detailed",
      "Representation",
      "Physical",
      "Cinematic",
    ]) {
      expect(screen.queryByText(retiredCopy)).toBeNull();
    }

    expect(screen.getAllByRole("button")).toHaveLength(5);
  });
});
