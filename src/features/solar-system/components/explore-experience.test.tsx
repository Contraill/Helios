import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { planets } from "@/content/planets";
import { createExplorePlanetSummaries } from "@/features/solar-system/lib/explore-planets";
import { createScenePlanets } from "@/features/solar-system/lib/scene-planets";
import { resetExplorationStore } from "@/stores/exploration-store";
import { resetPreferencesStore } from "@/stores/preferences-store";
import { resetSimulationStore } from "@/stores/simulation-store";

import { ExploreExperience } from "./explore-experience";

vi.mock("./explore-canvas-client", () => ({
  ExploreCanvasClient: () => <div data-testid="solar-system-canvas" />,
}));

const props = {
  planetSummaries: createExplorePlanetSummaries(planets),
  scenePlanets: createScenePlanets(planets),
};

describe("ExploreExperience", () => {
  beforeEach(() => {
    localStorage.clear();
    resetExplorationStore();
    resetPreferencesStore();
    resetSimulationStore();
  });

  it("selects a planet from the semantic navigator", () => {
    render(<ExploreExperience {...props} />);

    const marsButton = screen.getByRole("button", { name: "Mars" });
    fireEvent.click(marsButton);

    expect(marsButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Mars" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open the Mars reference page" }),
    ).toHaveAttribute("href", "/planet/mars");
  });

  it("returns to overview with Escape and restores focus", async () => {
    render(<ExploreExperience {...props} />);

    const earthButton = screen.getByRole("button", { name: "Earth" });
    fireEvent.click(earthButton);
    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => expect(earthButton).toHaveFocus());
    expect(earthButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("heading", { name: "Earth" })).toBeNull();
  });

  it("exposes keyboard focus as a scene hover without selecting", () => {
    render(<ExploreExperience {...props} />);

    const venusButton = screen.getByRole("button", { name: "Venus" });
    fireEvent.focus(venusButton);

    expect(venusButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("heading", { name: "Venus" })).toBeNull();
  });
});
