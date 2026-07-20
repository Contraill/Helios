import { beforeEach, describe, expect, it } from "vitest";

import { planetIds } from "@/content/planets";
import {
  DWARF_SATELLITE_IDS,
  EXTENDED_BODY_IDS,
  FEATURED_MOON_IDS,
  SYSTEM_REGION_IDS,
  type CelestialBodyId,
} from "@/features/solar-system/types/celestial-body";
import {
  resetExploreSceneUiStore,
  useExploreSceneUiStore,
} from "@/stores/explore-scene-ui-store";
import {
  initialSceneVisibilityState,
  resetSceneVisibilityStore,
  useSceneVisibilityStore,
} from "@/stores/scene-visibility-store";

import {
  SCENE_VISIBILITY_CATEGORIES,
  effectiveBodyVisibility,
  sceneVisibilityCategoryForBody,
} from "./scene-visibility-policy";

const CURATED_BODY_IDS: readonly CelestialBodyId[] = [
  "sun",
  ...planetIds,
  ...FEATURED_MOON_IDS,
  ...DWARF_SATELLITE_IDS,
  ...EXTENDED_BODY_IDS,
  ...SYSTEM_REGION_IDS,
];

function visibleBodyIds(): readonly CelestialBodyId[] {
  const state = useSceneVisibilityStore.getState();
  return CURATED_BODY_IDS.filter((bodyId) =>
    effectiveBodyVisibility(bodyId, state),
  );
}

describe("scene visibility domain", () => {
  beforeEach(() => {
    localStorage.clear();
    resetSceneVisibilityStore();
    resetExploreSceneUiStore();
  });

  it("keeps fresh visibility complete and independent from Navigator browsing", () => {
    const initial = useSceneVisibilityStore.getState();
    expect(
      SCENE_VISIBILITY_CATEGORIES.every(
        (category) => initial.categories[category],
      ),
    ).toBe(true);
    expect(initial.orbitsVisible).toBe(true);
    expect(initial.labelsVisible).toBe(true);
    expect(visibleBodyIds()).toEqual(CURATED_BODY_IDS);

    const before = visibleBodyIds();
    useExploreSceneUiStore
      .getState()
      .openCategory("planetary-moons", "category:planetary-moons");
    useExploreSceneUiStore
      .getState()
      .openMoonParent("jupiter", "moon-parent:jupiter");
    expect(visibleBodyIds()).toEqual(before);
  });

  it("resolves category and object overrides deterministically", () => {
    const visibility = useSceneVisibilityStore.getState();
    visibility.setCategoryVisibility("moons", false);

    expect(sceneVisibilityCategoryForBody("moon-jupiter-europa")).toBe("moons");
    expect(
      effectiveBodyVisibility(
        "moon-jupiter-europa",
        useSceneVisibilityStore.getState(),
      ),
    ).toBe(false);
    expect(
      effectiveBodyVisibility(
        "dwarf-satellite-charon",
        useSceneVisibilityStore.getState(),
      ),
    ).toBe(false);
    expect(
      effectiveBodyVisibility("earth", useSceneVisibilityStore.getState()),
    ).toBe(true);

    visibility.showObject("moon-jupiter-europa");
    expect(
      effectiveBodyVisibility(
        "moon-jupiter-europa",
        useSceneVisibilityStore.getState(),
      ),
    ).toBe(true);

    visibility.setCategoryVisibility("planets", true);
    visibility.hideObject("earth");
    expect(
      effectiveBodyVisibility("earth", useSceneVisibilityStore.getState()),
    ).toBe(false);

    visibility.setCategoryVisibility("moons", true);
    expect(
      useSceneVisibilityStore.getState().objectOverrides["moon-jupiter-europa"],
    ).toBe("visible");
  });

  it("restores every category without touching Navigator state and keeps Sun special", () => {
    useExploreSceneUiStore.getState().openCategory("comets", "category:comets");
    const navigatorBefore = useExploreSceneUiStore.getState().navigator;
    const visibility = useSceneVisibilityStore.getState();
    visibility.setCategoryVisibility("regions", false);
    visibility.hideObject("sun");
    visibility.setOrbitsVisible(false);
    visibility.setLabelsVisible(false);

    expect(
      effectiveBodyVisibility("sun", useSceneVisibilityStore.getState()),
    ).toBe(false);
    expect(sceneVisibilityCategoryForBody("sun")).toBeNull();

    visibility.restoreAllVisibility();
    const restored = useSceneVisibilityStore.getState();
    expect(restored.categories).toEqual(initialSceneVisibilityState.categories);
    expect(restored.objectOverrides).toEqual({});
    expect(restored.orbitsVisible).toBe(true);
    expect(restored.labelsVisible).toBe(true);
    expect(effectiveBodyVisibility("sun", restored)).toBe(true);
    expect(useExploreSceneUiStore.getState().navigator).toEqual(
      navigatorBefore,
    );

    const persisted = JSON.parse(
      localStorage.getItem("helios-scene-visibility") ?? "null",
    ) as { state?: Record<string, unknown> } | null;
    expect(persisted?.state).toMatchObject({
      categories: initialSceneVisibilityState.categories,
      labelsVisible: true,
      objectOverrides: {},
      orbitsVisible: true,
    });
  });

  it("normalizes an older partial persisted visibility envelope safely", async () => {
    localStorage.setItem(
      "helios-scene-visibility",
      JSON.stringify({
        state: {
          categories: { moons: false, planets: "invalid" },
          objectOverrides: {
            earth: "hidden",
            halley: "visible",
            mars: "invalid",
            unknown: "hidden",
          },
          orbitsVisible: false,
          labelsVisible: "invalid",
        },
        version: 0,
      }),
    );

    await useSceneVisibilityStore.persist.rehydrate();
    const hydrated = useSceneVisibilityStore.getState();
    expect(hydrated.categories.moons).toBe(false);
    expect(hydrated.categories.planets).toBe(true);
    expect(hydrated.categories.regions).toBe(true);
    expect(hydrated.objectOverrides).toEqual({
      earth: "hidden",
      halley: "visible",
    });
    expect(hydrated.orbitsVisible).toBe(false);
    expect(hydrated.labelsVisible).toBe(true);
  });
});
