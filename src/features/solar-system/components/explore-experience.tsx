"use client";

import { useCallback, useEffect, useMemo } from "react";

import styles from "@/app/explore/explore.module.css";
import { createCelestialRegistry } from "@/features/solar-system/lib/celestial-registry";
import { currentNavigatorView } from "@/features/solar-system/lib/celestial-navigation-state";
import type { ExplorePlanetSummary } from "@/features/solar-system/lib/explore-planets";
import {
  isMoonId,
  MOON_BY_ID,
} from "@/features/solar-system/lib/moon-catalogue";
import type { ScenePlanet } from "@/features/solar-system/lib/scene-planets";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import type { CelestialBodyId } from "@/features/solar-system/types/celestial-body";
import { useHydrateExperienceSettings } from "@/hooks/use-hydrate-experience-settings";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";
import { uiStrings } from "@/lib/i18n/ui-strings";
import { useExplorationStore } from "@/stores/exploration-store";
import { useExploreSceneUiStore } from "@/stores/explore-scene-ui-store";

import { CelestialNavigator } from "./celestial-navigator";
import { useEphemerisController } from "./ephemeris-controller";
import { EphemerisPanel } from "./ephemeris-panel";
import { ExploreCanvasClient } from "./explore-canvas-client";
import { ExploreSceneDock } from "./explore-scene-dock";
import { SelectedBodySummary } from "./selected-body-summary";
import { ViewControls } from "./view-controls";

interface ExploreExperienceProps {
  planetSummaries: readonly ExplorePlanetSummary[];
  scenePlanets: readonly ScenePlanet[];
  sceneSun: SceneSun;
}

export function ExploreExperience({
  planetSummaries,
  scenePlanets,
  sceneSun,
}: ExploreExperienceProps) {
  const copy = uiStrings.pages.explore;
  const settingsHydrated = useHydrateExperienceSettings();
  const ephemerisController = useEphemerisController();
  const selectedBodyId = useExplorationStore((state) => state.selectedBodyId);
  const cameraMode = useExplorationStore((state) => state.cameraMode);
  const scaleMode = useExplorationStore((state) => state.scaleMode);
  const clearSelection = useExplorationStore((state) => state.clearSelection);
  const exitFreeCamera = useExplorationStore((state) => state.exitFreeCamera);
  const selectPlanet = useExplorationStore((state) => state.selectPlanet);
  const navigator = useExploreSceneUiStore((state) => state.navigator);
  const goBack = useExploreSceneUiStore((state) => state.goBack);
  const mobileDockOpen = useExploreSceneUiStore(
    (state) => state.mobileDockOpen,
  );
  const closeMobileDock = useExploreSceneUiStore(
    (state) => state.closeMobileDock,
  );
  const setActiveDockPanel = useExploreSceneUiStore(
    (state) => state.setActiveDockPanel,
  );
  const reducedMotion = useReducedMotionPreference();
  const currentView = currentNavigatorView(navigator);
  const registry = useMemo(
    () => createCelestialRegistry(planetSummaries, sceneSun),
    [planetSummaries, sceneSun],
  );

  const focusNavigatorButton = useCallback((bodyId: string) => {
    window.requestAnimationFrame(() => {
      const key = `body-${bodyId}`;
      const target = Array.from(
        document.querySelectorAll<HTMLElement>("[data-focus-key]"),
      ).find((element) => element.dataset.focusKey === key);
      target?.focus();
    });
  }, []);

  const closeSelection = useCallback(
    (bodyId: CelestialBodyId) => {
      clearSelection();
      setActiveDockPanel("navigator");
      focusNavigatorButton(bodyId);
    },
    [clearSelection, focusNavigatorButton, setActiveDockPanel],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (mobileDockOpen) {
        event.preventDefault();
        closeMobileDock();
        return;
      }
      if (cameraMode === "free") {
        event.preventDefault();
        exitFreeCamera();
        return;
      }
      if (selectedBodyId && isMoonId(selectedBodyId)) {
        event.preventDefault();
        const parent = MOON_BY_ID[selectedBodyId].parentPlanetId;
        selectPlanet(parent);
        setActiveDockPanel("selection");
        return;
      }
      if (selectedBodyId) {
        event.preventDefault();
        closeSelection(selectedBodyId);
        return;
      }
      if (currentView.kind !== "categories") {
        event.preventDefault();
        goBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    cameraMode,
    closeMobileDock,
    closeSelection,
    currentView.kind,
    exitFreeCamera,
    goBack,
    mobileDockOpen,
    selectPlanet,
    selectedBodyId,
    setActiveDockPanel,
  ]);

  const selectedName = selectedBodyId
    ? registry.get(selectedBodyId)?.displayName
    : undefined;
  const cameraStatus = copy.cameraStatus(selectedName, cameraMode);

  return (
    <>
      <section
        aria-describedby="experience-scale-description"
        aria-label={copy.sceneLabel(scaleMode, reducedMotion)}
        className={styles.scene}
      >
        {settingsHydrated ? (
          <ExploreCanvasClient
            scenePlanets={scenePlanets}
            sceneSun={sceneSun}
          />
        ) : (
          <div className="scene-loading" role="status">
            <span>{copy.loading}</span>
          </div>
        )}
      </section>

      <p className="sr-only" id="experience-scale-description">
        {copy.controls.scaleDescriptions[scaleMode]}
      </p>
      <p className="sr-only" role="status">
        {cameraStatus}
      </p>

      <ExploreSceneDock
        navigator={
          <CelestialNavigator
            planetSummaries={planetSummaries}
            sceneSun={sceneSun}
          />
        }
        scaleNotice={copy.scaleNotices[scaleMode]}
        selection={
          <SelectedBodySummary
            onCloseSelection={closeSelection}
            planetSummaries={planetSummaries}
            sceneSun={sceneSun}
          />
        }
        time={<EphemerisPanel controller={ephemerisController} />}
        view={<ViewControls />}
      />
    </>
  );
}
