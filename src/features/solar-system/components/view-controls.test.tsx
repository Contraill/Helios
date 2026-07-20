import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import {
  resetExplorationStore,
  useExplorationStore,
} from "@/stores/exploration-store";
import {
  resetSceneVisibilityStore,
  useSceneVisibilityStore,
} from "@/stores/scene-visibility-store";

import { ViewControls } from "./view-controls";

describe("ViewControls visibility section", () => {
  beforeEach(() => {
    localStorage.clear();
    resetExplorationStore();
    resetSceneVisibilityStore();
  });

  it("exposes compact semantic visibility controls and restores the default", () => {
    render(<ViewControls />);

    const planets = screen.getByRole("button", {
      name: "Planets: visible",
    });
    const longLabel = screen.getByRole("button", {
      name: "Dwarf & Kuiper worlds: visible",
    });
    const restore = screen.getByRole("button", {
      name: "Restore all visibility",
    });

    expect(planets).toHaveAttribute("aria-pressed", "true");
    expect(longLabel.tagName).toBe("BUTTON");
    expect(restore).toBeDisabled();

    planets.focus();
    fireEvent.click(planets);
    expect(planets).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Off")).toBeVisible();
    expect(restore).toBeEnabled();

    fireEvent.click(restore);
    expect(
      screen.getByRole("button", { name: "Planets: visible" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(restore).toBeDisabled();
  });

  it("does not couple visibility updates to simulation-facing exploration state", () => {
    useExplorationStore.getState().selectBody("earth");
    const selectionBefore = useExplorationStore.getState().selectedBodyId;
    render(<ViewControls />);

    fireEvent.click(screen.getByRole("button", { name: "Moons: visible" }));

    expect(useSceneVisibilityStore.getState().categories.moons).toBe(false);
    expect(useExplorationStore.getState().selectedBodyId).toBe(selectionBefore);
  });
});
