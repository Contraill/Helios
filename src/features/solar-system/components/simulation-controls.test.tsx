import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { SECONDS_PER_JULIAN_YEAR } from "@/features/solar-system/types/experience-settings";
import {
  resetExplorationStore,
  useExplorationStore,
} from "@/stores/exploration-store";
import {
  resetPreferencesStore,
  usePreferencesStore,
} from "@/stores/preferences-store";
import {
  resetSimulationStore,
  useSimulationStore,
} from "@/stores/simulation-store";

import { SimulationControls } from "./simulation-controls";

describe("SimulationControls", () => {
  beforeEach(() => {
    localStorage.clear();
    resetExplorationStore();
    resetPreferencesStore();
    resetSimulationStore();
  });

  it("pauses, changes calendar speed and resets the simulation to real time", () => {
    render(<SimulationControls />);

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(useSimulationStore.getState().isPaused).toBe(true);
    expect(screen.getByRole("button", { name: "Resume" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: "1 day / sec" }));
    expect(useSimulationStore.getState().timeScale).toBe(86_400);

    fireEvent.click(screen.getByRole("button", { name: "1 year / sec" }));
    expect(useSimulationStore.getState().timeScale).toBe(
      SECONDS_PER_JULIAN_YEAR,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(useSimulationStore.getState().isPaused).toBe(false);
    expect(useSimulationStore.getState().timeScale).toBe(1);
  });

  it("switches scale and exposes an honest explanation", () => {
    render(<SimulationControls />);

    fireEvent.click(screen.getByRole("button", { name: "Scientific" }));

    expect(useExplorationStore.getState().scaleMode).toBe("scientific");
    expect(
      screen.getByText(/one shared ratio for radii and distance/i),
    ).toBeInTheDocument();
  });

  it("changes scene layers, quality and motion preference", () => {
    render(<SimulationControls />);

    fireEvent.click(screen.getByRole("button", { name: "Orbit paths" }));
    fireEvent.click(screen.getByRole("button", { name: "Planet labels" }));
    fireEvent.click(screen.getByRole("button", { name: "Low" }));
    fireEvent.click(screen.getByRole("button", { name: "Reduced" }));

    expect(useExplorationStore.getState().orbitsVisible).toBe(false);
    expect(useExplorationStore.getState().labelsVisible).toBe(false);
    expect(usePreferencesStore.getState().qualityLevel).toBe("low");
    expect(usePreferencesStore.getState().motionPreference).toBe("reduced");
  });
  it("collapses into a meaningful status dock and reopens", () => {
    render(<SimulationControls />);

    fireEvent.click(
      screen.getByRole("button", { name: "Collapse simulation controls" }),
    );

    const openButton = screen.getByRole("button", { name: /Open controls/i });
    expect(openButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(/Real time · Explore/)).toBeVisible();
    expect(usePreferencesStore.getState().controlDeckExpanded).toBe(false);

    fireEvent.click(openButton);
    expect(
      screen.getByRole("button", { name: "Collapse simulation controls" }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});
