import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { planets } from "@/content/planets";
import { sun } from "@/content/solar-system/sun";
import { createExplorePlanetSummaries } from "@/features/solar-system/lib/explore-planets";
import { createScenePlanets } from "@/features/solar-system/lib/scene-planets";
import { createSceneSun } from "@/features/solar-system/lib/scene-sun";
import {
  resetExplorationStore,
  useExplorationStore,
} from "@/stores/exploration-store";
import { resetExploreSceneUiStore } from "@/stores/explore-scene-ui-store";
import { resetSimulationStore } from "@/stores/simulation-store";

import { ExploreExperience } from "./explore-experience";

vi.mock("@/hooks/use-hydrate-experience-settings", () => ({
  useHydrateExperienceSettings: () => true,
}));
vi.mock("./explore-canvas-client", () => ({
  ExploreCanvasClient: () => <div data-testid="solar-system-canvas" />,
}));
vi.mock("./ephemeris-controller", () => ({
  useEphemerisController: () => ({
    beginEdit: vi.fn(),
    commitScrub: vi.fn(),
    copyLink: vi.fn(),
    discardDraft: vi.fn(),
    goNow: vi.fn(),
    navigateTo: vi.fn(),
    previewScrub: vi.fn(),
    refreshView: vi.fn(),
    setPendingValue: vi.fn(),
    stepByDays: vi.fn(),
    stepByYears: vi.fn(),
  }),
}));
vi.mock("./ephemeris-panel", () => ({
  EphemerisPanel: () => <div>Embedded time panel</div>,
}));

const props = {
  planetSummaries: createExplorePlanetSummaries(planets),
  scenePlanets: createScenePlanets(planets),
  sceneSun: createSceneSun(sun),
};

describe("ExploreExperience integration shell", () => {
  beforeEach(() => {
    localStorage.clear();
    resetExplorationStore();
    resetExploreSceneUiStore();
    resetSimulationStore();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      getPropertyValue: (name: string) =>
        name === "--explore-shell-mode" ? "desktop" : "",
    } as CSSStyleDeclaration);
  });

  it("describes the shared scene profile while retaining one dock owner", () => {
    const { rerender } = render(<ExploreExperience {...props} />);
    expect(screen.getByTestId("solar-system-canvas")).toBeVisible();
    expect(
      screen.getByRole("complementary", { name: "Explore scene controls" }),
    ).toBeVisible();

    useExplorationStore.getState().setScaleMode("scientific");
    rerender(<ExploreExperience {...props} />);
    expect(
      screen.getByRole("region", {
        name: "Animated scientific-scale model of the Sun and the eight planets",
      }),
    ).toBeVisible();
  });

  it("drills to a planet through the semantic category navigator", () => {
    render(<ExploreExperience {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /Sun & planets/i }));
    fireEvent.click(screen.getByRole("button", { name: "Mars" }));
    expect(useExplorationStore.getState().selectedBodyId).toBe("mars");
    expect(screen.getByRole("tab", { name: "Selection" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("heading", { name: "Mars" })).toBeVisible();
  });

  it("announces and closes an extended body using registry metadata", async () => {
    render(<ExploreExperience {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /Comets/i }));
    fireEvent.click(screen.getByRole("button", { name: "Halley" }));
    expect(screen.getByRole("heading", { name: "Halley" })).toBeVisible();
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() =>
      expect(useExplorationStore.getState().selectedBodyId).toBeNull(),
    );
  });
});
