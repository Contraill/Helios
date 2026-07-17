"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import Link from "next/link";

import styles from "@/app/explore/explore.module.css";
import type { ExplorePlanetSummary } from "@/features/solar-system/lib/explore-planets";
import type { ScenePlanet } from "@/features/solar-system/lib/scene-planets";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import { useHydrateExperienceSettings } from "@/hooks/use-hydrate-experience-settings";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";
import { formatOneDecimal } from "@/lib/i18n/formatters";
import { uiStrings } from "@/lib/i18n/ui-strings";
import type { PlanetId } from "@/lib/data/schemas/planet";
import { useExplorationStore } from "@/stores/exploration-store";
import { usePreferencesStore } from "@/stores/preferences-store";

import { ExploreCanvasClient } from "./explore-canvas-client";
import { SimulationControls } from "./simulation-controls";

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
  useHydrateExperienceSettings();
  const selectedPlanetId = useExplorationStore(
    (state) => state.selectedPlanetId,
  );
  const cameraMode = useExplorationStore((state) => state.cameraMode);
  const scaleMode = useExplorationStore((state) => state.scaleMode);
  const selectPlanet = useExplorationStore((state) => state.selectPlanet);
  const clearSelection = useExplorationStore((state) => state.clearSelection);
  const setHoveredPlanet = useExplorationStore(
    (state) => state.setHoveredPlanet,
  );
  const clearHoveredPlanet = useExplorationStore(
    (state) => state.clearHoveredPlanet,
  );
  const motionPreference = usePreferencesStore(
    (state) => state.motionPreference,
  );
  const reducedMotion = useReducedMotionPreference(motionPreference);
  const buttonRefs = useRef(new Map<PlanetId, HTMLButtonElement>());

  const selectedPlanet = useMemo(
    () =>
      selectedPlanetId
        ? planetSummaries.find(({ id }) => id === selectedPlanetId)
        : undefined,
    [planetSummaries, selectedPlanetId],
  );

  const returnToOverview = useCallback(
    (focusPlanetId?: PlanetId) => {
      clearSelection();
      if (focusPlanetId) {
        buttonRefs.current.get(focusPlanetId)?.focus();
      }
    },
    [clearSelection],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || selectedPlanetId === null) return;
      event.preventDefault();
      returnToOverview(selectedPlanetId);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [returnToOverview, selectedPlanetId]);

  const cameraStatus = copy.cameraStatus(selectedPlanet?.name, cameraMode);

  return (
    <>
      <section
        aria-describedby="experience-scale-description"
        aria-label={copy.sceneLabel(scaleMode, reducedMotion)}
        className={styles.scene}
      >
        <ExploreCanvasClient scenePlanets={scenePlanets} sceneSun={sceneSun} />
      </section>

      <p className="sr-only" role="status">
        {cameraStatus}
      </p>

      <div className={styles.interfaceStack}>
        {selectedPlanet ? (
          <section
            aria-labelledby="selected-planet-title"
            aria-live="polite"
            className={styles.summaryPanel}
            style={
              {
                "--planet-accent": selectedPlanet.accentColor,
              } as CSSProperties
            }
          >
            <div className={styles.summaryHeader}>
              <div>
                <p className={styles.summaryType}>
                  {copy.planetSummaryType(
                    selectedPlanet.kind,
                    selectedPlanet.orderFromSun,
                  )}
                </p>
                <h2 id="selected-planet-title">{selectedPlanet.name}</h2>
              </div>
              <button
                aria-label={copy.returnToOverviewLabel}
                className={styles.closeButton}
                onClick={() => returnToOverview(selectedPlanet.id)}
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <p className={styles.summaryTagline}>{selectedPlanet.tagline}</p>

            <dl className={styles.summaryMetrics}>
              <div>
                <dt>{copy.gravityLabel}</dt>
                <dd>
                  {copy.formatGravity(
                    formatOneDecimal(selectedPlanet.gravityMS2),
                  )}
                </dd>
              </div>
              <div>
                <dt>{copy.yearLabel}</dt>
                <dd>
                  {copy.formatEarthDays(
                    formatOneDecimal(selectedPlanet.orbitalPeriodEarthDays),
                  )}
                </dd>
              </div>
              <div>
                <dt>{copy.lightLabel}</dt>
                <dd>
                  {copy.formatMinutes(
                    formatOneDecimal(selectedPlanet.sunlightTravelMinutes),
                  )}
                </dd>
              </div>
            </dl>

            <Link
              className={styles.detailsLink}
              href={`/planet/${selectedPlanet.id}`}
            >
              {copy.openPlanetPage(selectedPlanet.name)}
            </Link>
          </section>
        ) : null}

        <SimulationControls />

        <aside aria-label={copy.planetListLabel} className={styles.navigator}>
          <div className={styles.navigatorHeader}>
            <p className={styles.navigatorLabel}>{copy.planetListLabel}</p>
            <button
              className={styles.overviewButton}
              disabled={selectedPlanetId === null}
              onClick={() => returnToOverview(selectedPlanetId ?? undefined)}
              type="button"
            >
              {copy.returnToOverview}
            </button>
          </div>
          <ol>
            {planetSummaries.map((planet) => {
              const selected = selectedPlanetId === planet.id;
              return (
                <li key={planet.id}>
                  <button
                    aria-label={planet.name}
                    aria-pressed={selected}
                    className={
                      selected ? styles.planetButtonSelected : undefined
                    }
                    onBlur={() => clearHoveredPlanet(planet.id)}
                    onClick={() => selectPlanet(planet.id)}
                    onFocus={() => setHoveredPlanet(planet.id)}
                    onMouseEnter={() => setHoveredPlanet(planet.id)}
                    onMouseLeave={() => clearHoveredPlanet(planet.id)}
                    ref={(node) => {
                      if (node) buttonRefs.current.set(planet.id, node);
                      else buttonRefs.current.delete(planet.id);
                    }}
                    style={
                      {
                        "--planet-accent": planet.accentColor,
                      } as CSSProperties
                    }
                    type="button"
                  >
                    <span>{planet.orderFromSun}</span>
                    {planet.name}
                  </button>
                </li>
              );
            })}
          </ol>
          <p className={styles.keyboardHint}>{copy.keyboardHint}</p>
        </aside>
      </div>
    </>
  );
}
