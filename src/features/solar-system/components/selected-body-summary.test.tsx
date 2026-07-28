import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { planets } from "@/content/planets";
import { sun } from "@/content/solar-system/sun";
import {
  CELESTIAL_DETAIL_SLUGS,
  celestialDetailHref,
} from "@/features/solar-system/lib/celestial-detail-routes";
import { createExplorePlanetSummaries } from "@/features/solar-system/lib/explore-planets";
import { createSceneSun } from "@/features/solar-system/lib/scene-sun";
import type { ExplorePlanetSummary } from "@/features/solar-system/lib/explore-planets";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import {
  resetExplorationStore,
  useExplorationStore,
} from "@/stores/exploration-store";
import { resetLocaleStore, useLocaleStore } from "@/stores/locale-store";
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
    resetLocaleStore();
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
    ).toHaveAttribute("href", "/body/ceres");
  });

  it("offers body detail routes for the Sun and featured satellites", () => {
    const { rerender } = render(
      <SelectedBodySummary
        planetSummaries={planetSummaries}
        sceneSun={sceneSun}
      />,
    );

    act(() => {
      useExplorationStore.getState().selectBody("sun");
    });
    rerender(
      <SelectedBodySummary
        planetSummaries={planetSummaries}
        sceneSun={sceneSun}
      />,
    );
    expect(
      screen.getByRole("link", { name: "Open Sun detail" }),
    ).toHaveAttribute("href", "/body/sun");

    act(() => {
      useExplorationStore.getState().selectBody("moon-jupiter-europa");
    });
    rerender(
      <SelectedBodySummary
        planetSummaries={planetSummaries}
        sceneSun={sceneSun}
      />,
    );
    expect(
      screen.getByRole("link", { name: "Open Europa detail" }),
    ).toHaveAttribute("href", "/body/moon-jupiter-europa");

    act(() => {
      useExplorationStore.getState().selectBody("dwarf-satellite-charon");
    });
    rerender(
      <SelectedBodySummary
        planetSummaries={planetSummaries}
        sceneSun={sceneSun}
      />,
    );
    expect(
      screen.getByRole("link", { name: "Open Charon detail" }),
    ).toHaveAttribute("href", "/body/dwarf-satellite-charon");
  });

  it("offers context pages for every regional selection", () => {
    const { rerender } = render(
      <SelectedBodySummary
        planetSummaries={planetSummaries}
        sceneSun={sceneSun}
      />,
    );

    for (const [id, name] of [
      ["asteroid-belt", "Asteroid belt"],
      ["kuiper-belt", "Kuiper belt"],
      ["oort-cloud", "Oort cloud"],
      ["heliosphere", "Heliosphere"],
    ] as const) {
      act(() => {
        useExplorationStore.getState().selectBody(id);
      });
      rerender(
        <SelectedBodySummary
          planetSummaries={planetSummaries}
          sceneSun={sceneSun}
        />,
      );
      expect(
        screen.getByRole("link", { name: `Open ${name} context page` }),
      ).toHaveAttribute("href", `/region/${id}`);
      expect(
        screen.getByRole("button", { name: "Hide this layer" }),
      ).toBeVisible();
    }
  });

  it("links every selectable registry entry to its canonical detail route", () => {
    const fullPlanetSummaries = createExplorePlanetSummaries(planets);
    const fullSceneSun = createSceneSun(sun);
    const { container, rerender } = render(
      <SelectedBodySummary
        planetSummaries={fullPlanetSummaries}
        sceneSun={fullSceneSun}
      />,
    );

    for (const id of CELESTIAL_DETAIL_SLUGS) {
      act(() => {
        useExplorationStore.getState().selectBody(id);
      });
      rerender(
        <SelectedBodySummary
          planetSummaries={fullPlanetSummaries}
          sceneSun={fullSceneSun}
        />,
      );

      expect(
        container.querySelector(`a[href="${celestialDetailHref(id)}"]`),
        id,
      ).not.toBeNull();
    }
  });

  it("localizes selected object and region categories in Turkish", () => {
    useLocaleStore.getState().setLocale("tr");
    useExplorationStore.getState().selectBody("ceres");
    const { rerender } = render(
      <SelectedBodySummary
        planetSummaries={planetSummaries}
        sceneSun={sceneSun}
      />,
    );

    expect(screen.getByText("Cüce gezegen")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Bu cismi gizle" }),
    ).toBeVisible();

    act(() => useExplorationStore.getState().selectBody("asteroid-belt"));
    rerender(
      <SelectedBodySummary
        planetSummaries={planetSummaries}
        sceneSun={sceneSun}
      />,
    );

    expect(screen.getByText("Bağlam katmanı")).toBeVisible();
    expect(screen.getByText("Ana asteroit kuşağı")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Bu katmanı gizle" }),
    ).toBeVisible();
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
