"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  createCelestialRegistry,
  entriesForCategory,
} from "@/features/solar-system/lib/celestial-registry";
import { dwarfSatellitesFor } from "@/features/solar-system/lib/dwarf-satellite-catalogue";
import { currentNavigatorView } from "@/features/solar-system/lib/celestial-navigation-state";
import type { ExplorePlanetSummary } from "@/features/solar-system/lib/explore-planets";
import { featuredMoonsForPlanet } from "@/features/solar-system/lib/moon-catalogue";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import {
  DWARF_SYSTEM_PARENT_IDS,
  FEATURED_MOON_PARENT_IDS,
  type CelestialBodyId,
  type DwarfSystemParentId,
  type MoonParentPlanetId,
} from "@/features/solar-system/types/celestial-body";
import type {
  CelestialNavigatorCategory,
  NavigatorView,
} from "@/features/solar-system/types/celestial-navigation";
import { exploreSceneCopy } from "@/lib/i18n/explore-scene-copy";
import { useExplorationStore } from "@/stores/exploration-store";
import { useExploreSceneUiStore } from "@/stores/explore-scene-ui-store";
import { useExtendedSystemStore } from "@/stores/extended-system-store";

import gateStyles from "./explore-scene-gate.module.css";

interface CelestialNavigatorProps {
  planetSummaries: readonly ExplorePlanetSummary[];
  sceneSun: SceneSun;
}

const CATEGORY_ORDER = [
  "sun-planets",
  "planetary-moons",
  "main-belt",
  "dwarf-kuiper",
  "comets",
  "regions-context",
] as const satisfies readonly CelestialNavigatorCategory[];

function viewTitle(view: NavigatorView, parentName?: string): string {
  if (view.kind === "categories") return exploreSceneCopy.navigator.label;
  if (view.kind === "moon-parents") {
    return exploreSceneCopy.navigator.categories["planetary-moons"].label;
  }
  if (view.kind === "moons") {
    return `${parentName ?? view.parentPlanetId} · ${exploreSceneCopy.navigator.featuredMoons.toLowerCase()}`;
  }
  if (view.kind === "dwarf-parents") {
    return exploreSceneCopy.navigator.categories["dwarf-kuiper"].label;
  }
  if (view.kind === "dwarf-system") {
    return `${parentName ?? view.parentBodyId} · system`;
  }
  return exploreSceneCopy.navigator.categories[view.category].label;
}

function moveFocusWithinList(
  event: ReactKeyboardEvent<HTMLElement>,
  container: HTMLElement,
) {
  if (
    ![
      "ArrowDown",
      "ArrowUp",
      "ArrowRight",
      "ArrowLeft",
      "Home",
      "End",
    ].includes(event.key)
  ) {
    return;
  }
  const buttons = Array.from(
    container.querySelectorAll<HTMLButtonElement>(
      "button[data-navigator-item]:not(:disabled)",
    ),
  );
  if (buttons.length === 0) return;
  const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
  let next = current;
  if (event.key === "Home") next = 0;
  else if (event.key === "End") next = buttons.length - 1;
  else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
    next = current < 0 ? 0 : (current + 1) % buttons.length;
  } else {
    next =
      current < 0
        ? buttons.length - 1
        : (current - 1 + buttons.length) % buttons.length;
  }
  event.preventDefault();
  buttons[next]?.focus();
}

export function CelestialNavigator({
  planetSummaries,
  sceneSun,
}: CelestialNavigatorProps) {
  const rootRef = useRef<HTMLElement>(null);
  const selectedBodyId = useExplorationStore((state) => state.selectedBodyId);
  const selectSun = useExplorationStore((state) => state.selectSun);
  const selectPlanet = useExplorationStore((state) => state.selectPlanet);
  const selectBody = useExplorationStore((state) => state.selectBody);
  const navigator = useExploreSceneUiStore((state) => state.navigator);
  const setActiveDockPanel = useExploreSceneUiStore(
    (state) => state.setActiveDockPanel,
  );
  const openCategory = useExploreSceneUiStore((state) => state.openCategory);
  const openMoonParent = useExploreSceneUiStore(
    (state) => state.openMoonParent,
  );
  const openDwarfSystem = useExploreSceneUiStore(
    (state) => state.openDwarfSystem,
  );
  const goBack = useExploreSceneUiStore((state) => state.goBack);
  const consumeFocusRequest = useExploreSceneUiStore(
    (state) => state.consumeNavigatorFocusRequest,
  );
  const density = useExtendedSystemStore((state) => state.density);
  const representation = useExtendedSystemStore(
    (state) => state.representation,
  );
  const dustVisible = useExtendedSystemStore((state) => state.dustVisible);
  const setDensity = useExtendedSystemStore((state) => state.setDensity);
  const setRepresentation = useExtendedSystemStore(
    (state) => state.setRepresentation,
  );
  const toggleDust = useExtendedSystemStore((state) => state.toggleDust);
  const view = currentNavigatorView(navigator);
  const registry = useMemo(
    () => createCelestialRegistry(planetSummaries, sceneSun),
    [planetSummaries, sceneSun],
  );
  const planetById = useMemo(
    () =>
      new Map(planetSummaries.map((planet) => [planet.id, planet] as const)),
    [planetSummaries],
  );

  useEffect(() => {
    if (!navigator.focusRequestKey) return;
    const target = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>("[data-focus-key]") ?? [],
    ).find((element) => element.dataset.focusKey === navigator.focusRequestKey);
    target?.focus();
    consumeFocusRequest();
  }, [consumeFocusRequest, navigator.focusRequestKey]);

  const selectAndShow = (bodyId: CelestialBodyId) => {
    selectBody(bodyId);
    setActiveDockPanel("selection");
  };

  const openParent = (parentPlanetId: MoonParentPlanetId, key: string) => {
    selectPlanet(parentPlanetId);
    openMoonParent(parentPlanetId, key);
  };

  const openCategoryView = (
    category: CelestialNavigatorCategory,
    key: string,
  ) => {
    openCategory(category, key);
  };

  const handleBack = () => {
    if (view.kind === "moons") selectPlanet(view.parentPlanetId);
    if (view.kind === "dwarf-system") selectBody(view.parentBodyId);
    goBack();
  };

  const currentTitle = viewTitle(
    view,
    view.kind === "moons"
      ? planetById.get(view.parentPlanetId)?.name
      : view.kind === "dwarf-system"
        ? registry.get(view.parentBodyId)?.displayName
        : undefined,
  );

  const categoryEntries =
    view.kind === "category" ? entriesForCategory(registry, view.category) : [];
  const dwarfEntries = entriesForCategory(registry, "dwarf-kuiper");

  return (
    <nav
      aria-label={exploreSceneCopy.navigator.label}
      className={gateStyles.navigator}
      onKeyDown={(event) => {
        if (rootRef.current) moveFocusWithinList(event, rootRef.current);
      }}
      ref={rootRef}
    >
      <header className={gateStyles.navigatorHeader}>
        <div>
          <p className={gateStyles.eyebrow}>
            {exploreSceneCopy.navigator.eyebrow}
          </p>
          <h2>{currentTitle}</h2>
        </div>
        {view.kind !== "categories" ? (
          <button
            className={gateStyles.backButton}
            onClick={handleBack}
            type="button"
          >
            {exploreSceneCopy.navigator.back}
          </button>
        ) : null}
      </header>

      {view.kind === "categories" ? (
        <ul className={gateStyles.categoryList}>
          {CATEGORY_ORDER.map((category) => {
            const categoryCopy =
              exploreSceneCopy.navigator.categories[category];
            return (
              <li key={category}>
                <button
                  data-focus-key={`category-${category}`}
                  data-navigator-item
                  onClick={() =>
                    openCategoryView(category, `category-${category}`)
                  }
                  type="button"
                >
                  <strong>{categoryCopy.label}</strong>
                  <span>{categoryCopy.description}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {view.kind === "category" && view.category === "sun-planets" ? (
        <ul className={gateStyles.bodyList}>
          {categoryEntries.map((entry) => {
            const planet = planetById.get(
              entry.id as ExplorePlanetSummary["id"],
            );
            const isSun = entry.id === "sun";
            return (
              <li
                className={planet ? gateStyles.planetRow : undefined}
                key={entry.id}
              >
                <button
                  aria-current={
                    selectedBodyId === entry.id ? "true" : undefined
                  }
                  aria-pressed={selectedBodyId === entry.id}
                  data-focus-key={`body-${entry.id}`}
                  data-navigator-item
                  onClick={() => {
                    if (isSun) selectSun();
                    else if (planet) selectPlanet(planet.id);
                    setActiveDockPanel("selection");
                  }}
                  type="button"
                >
                  <span aria-hidden="true">
                    {isSun ? "☉" : planet?.orderFromSun}
                  </span>
                  <strong>{entry.displayName}</strong>
                </button>
                {planet &&
                FEATURED_MOON_PARENT_IDS.includes(
                  planet.id as MoonParentPlanetId,
                ) ? (
                  <button
                    aria-label={exploreSceneCopy.navigator.openMoons(
                      planet.name,
                    )}
                    className={gateStyles.moonShortcut}
                    data-navigator-item
                    onClick={() =>
                      openParent(
                        planet.id as MoonParentPlanetId,
                        `body-${planet.id}`,
                      )
                    }
                    type="button"
                  >
                    {exploreSceneCopy.navigator.moonShortcut}
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {view.kind === "moon-parents" ? (
        <ul className={gateStyles.categoryList}>
          {FEATURED_MOON_PARENT_IDS.map((parentId) => {
            const planet = planetById.get(parentId);
            const moonCount = featuredMoonsForPlanet(parentId).length;
            return (
              <li key={parentId}>
                <button
                  data-focus-key={`moon-parent-${parentId}`}
                  data-navigator-item
                  onClick={() =>
                    openParent(parentId, `moon-parent-${parentId}`)
                  }
                  type="button"
                >
                  <strong>{planet?.name ?? parentId}</strong>
                  <span>
                    {exploreSceneCopy.navigator.featuredMoonCount(moonCount)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {view.kind === "moons" ? (
        <ul className={gateStyles.bodyList}>
          {featuredMoonsForPlanet(view.parentPlanetId).map((moon) => (
            <li key={moon.id}>
              <button
                aria-current={selectedBodyId === moon.id ? "true" : undefined}
                aria-pressed={selectedBodyId === moon.id}
                data-focus-key={`body-${moon.id}`}
                data-navigator-item
                onClick={() => selectAndShow(moon.id)}
                type="button"
              >
                <span aria-hidden="true">◌</span>
                <strong>{moon.name}</strong>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {view.kind === "dwarf-parents" ? (
        <ul className={gateStyles.bodyList}>
          {dwarfEntries.map((entry) => {
            const parentId = entry.id as DwarfSystemParentId;
            const hasSystem = (
              DWARF_SYSTEM_PARENT_IDS as readonly string[]
            ).includes(entry.id);
            const moonCount = hasSystem
              ? dwarfSatellitesFor(parentId).length
              : 0;
            return (
              <li className={gateStyles.planetRow} key={entry.id}>
                <button
                  aria-current={
                    selectedBodyId === entry.id ? "true" : undefined
                  }
                  aria-pressed={selectedBodyId === entry.id}
                  data-focus-key={`dwarf-parent-${entry.id}`}
                  data-navigator-item
                  onClick={() => selectAndShow(entry.id)}
                  type="button"
                >
                  <span aria-hidden="true">◎</span>
                  <strong>{entry.displayName}</strong>
                </button>
                {hasSystem ? (
                  <button
                    aria-label={`Open ${entry.displayName} system (${moonCount} satellites)`}
                    className={gateStyles.moonShortcut}
                    data-navigator-item
                    onClick={() => {
                      selectBody(parentId);
                      openDwarfSystem(parentId, `dwarf-parent-${entry.id}`);
                    }}
                    type="button"
                  >
                    {moonCount} · system
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {view.kind === "dwarf-system" ? (
        <ul className={gateStyles.bodyList}>
          <li>
            <button
              aria-current={
                selectedBodyId === view.parentBodyId ? "true" : undefined
              }
              aria-pressed={selectedBodyId === view.parentBodyId}
              data-focus-key={`body-${view.parentBodyId}`}
              data-navigator-item
              onClick={() => selectAndShow(view.parentBodyId)}
              type="button"
            >
              <span aria-hidden="true">◎</span>
              <strong>
                {registry.get(view.parentBodyId)?.displayName ??
                  view.parentBodyId}
              </strong>
            </button>
          </li>
          {dwarfSatellitesFor(view.parentBodyId).map((moon) => (
            <li key={moon.id}>
              <button
                aria-current={selectedBodyId === moon.id ? "true" : undefined}
                aria-pressed={selectedBodyId === moon.id}
                data-focus-key={`body-${moon.id}`}
                data-navigator-item
                onClick={() => selectAndShow(moon.id)}
                type="button"
              >
                <span aria-hidden="true">◌</span>
                <strong>{moon.name}</strong>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {view.kind === "category" &&
      view.category !== "sun-planets" &&
      view.category !== "regions-context" ? (
        <ul className={gateStyles.bodyList}>
          {categoryEntries.map((entry) => (
            <li key={entry.id}>
              <button
                aria-current={selectedBodyId === entry.id ? "true" : undefined}
                aria-pressed={selectedBodyId === entry.id}
                data-focus-key={`body-${entry.id}`}
                data-navigator-item
                onClick={() => selectAndShow(entry.id)}
                type="button"
              >
                <span aria-hidden="true">
                  {entry.kind === "comet" ? "☄" : "◎"}
                </span>
                <strong>{entry.displayName}</strong>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {view.kind === "category" && view.category === "regions-context" ? (
        <>
          <ul className={gateStyles.bodyList}>
            {categoryEntries.map((entry) => (
              <li key={entry.id}>
                <button
                  aria-current={
                    selectedBodyId === entry.id ? "true" : undefined
                  }
                  aria-pressed={selectedBodyId === entry.id}
                  data-focus-key={`body-${entry.id}`}
                  data-navigator-item
                  onClick={() => selectAndShow(entry.id)}
                  type="button"
                >
                  <span aria-hidden="true">◎</span>
                  <strong>{entry.displayName}</strong>
                </button>
              </li>
            ))}
          </ul>
          <div className={gateStyles.contextControls}>
            <fieldset>
              <legend>{exploreSceneCopy.navigator.context.beltDensity}</legend>
              {(["sparse", "standard", "detailed"] as const).map((value) => (
                <button
                  aria-pressed={density === value}
                  data-navigator-item
                  key={value}
                  onClick={() => setDensity(value)}
                  type="button"
                >
                  {exploreSceneCopy.navigator.context.densityLabels[value]}
                </button>
              ))}
            </fieldset>
            <fieldset>
              <legend>
                {exploreSceneCopy.navigator.context.representation}
              </legend>
              {(["physical", "cinematic"] as const).map((value) => (
                <button
                  aria-pressed={representation === value}
                  data-navigator-item
                  key={value}
                  onClick={() => setRepresentation(value)}
                  type="button"
                >
                  {
                    exploreSceneCopy.navigator.context.representationLabels[
                      value
                    ]
                  }
                </button>
              ))}
            </fieldset>
            <button
              aria-pressed={dustVisible}
              data-navigator-item
              onClick={toggleDust}
              type="button"
            >
              {exploreSceneCopy.navigator.dustContext}
            </button>
          </div>
        </>
      ) : null}
    </nav>
  );
}
