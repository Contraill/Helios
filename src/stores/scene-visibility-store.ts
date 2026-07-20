"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  DEFAULT_SCENE_VISIBILITY_CATEGORIES,
  SCENE_VISIBILITY_CATEGORIES,
  effectiveBodyVisibility,
  type ObjectVisibilityOverride,
  type SceneVisibilityCategory,
  type SceneVisibilityCategoryState,
} from "@/features/solar-system/lib/scene-visibility-policy";
import {
  isCelestialBodyIdValue,
  type CelestialBodyId,
} from "@/features/solar-system/types/celestial-body";

export const SCENE_VISIBILITY_STORAGE_KEY = "helios-scene-visibility";
export const SCENE_VISIBILITY_STORAGE_VERSION = 1;

export interface SceneVisibilityState {
  categories: SceneVisibilityCategoryState;
  objectOverrides: Partial<Record<CelestialBodyId, ObjectVisibilityOverride>>;
  orbitsVisible: boolean;
  labelsVisible: boolean;
  setCategoryVisibility: (
    category: SceneVisibilityCategory,
    visible: boolean,
  ) => void;
  toggleCategoryVisibility: (category: SceneVisibilityCategory) => void;
  hideObject: (bodyId: CelestialBodyId) => void;
  showObject: (bodyId: CelestialBodyId) => void;
  clearObjectVisibilityOverride: (bodyId: CelestialBodyId) => void;
  setOrbitsVisible: (visible: boolean) => void;
  toggleOrbits: () => void;
  setLabelsVisible: (visible: boolean) => void;
  toggleLabels: () => void;
  restoreAllVisibility: () => void;
  isBodyVisible: (bodyId: CelestialBodyId) => boolean;
}

export const initialSceneVisibilityState = {
  categories: DEFAULT_SCENE_VISIBILITY_CATEGORIES,
  objectOverrides: {},
  orbitsVisible: true,
  labelsVisible: true,
};

function normalizedCategories(value: unknown): SceneVisibilityCategoryState {
  if (!value || typeof value !== "object") {
    return DEFAULT_SCENE_VISIBILITY_CATEGORIES;
  }
  const source = value as Record<string, unknown>;
  return Object.freeze(
    Object.fromEntries(
      SCENE_VISIBILITY_CATEGORIES.map((category) => [
        category,
        typeof source[category] === "boolean" ? source[category] : true,
      ]),
    ) as Record<SceneVisibilityCategory, boolean>,
  );
}

function normalizedOverrides(
  value: unknown,
): Partial<Record<CelestialBodyId, ObjectVisibilityOverride>> {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      ([bodyId, override]) =>
        isCelestialBodyIdValue(bodyId) &&
        (override === "visible" || override === "hidden"),
    ),
  ) as Partial<Record<CelestialBodyId, ObjectVisibilityOverride>>;
}

function migratePersistedVisibility(
  value: unknown,
): typeof initialSceneVisibilityState {
  const source = value && typeof value === "object" ? value : {};
  const record = source as Record<string, unknown>;
  return {
    categories: normalizedCategories(record.categories),
    objectOverrides: normalizedOverrides(record.objectOverrides),
    orbitsVisible:
      typeof record.orbitsVisible === "boolean" ? record.orbitsVisible : true,
    labelsVisible:
      typeof record.labelsVisible === "boolean" ? record.labelsVisible : true,
  };
}

export const useSceneVisibilityStore = create<SceneVisibilityState>()(
  persist(
    (set, get) => ({
      ...initialSceneVisibilityState,
      setCategoryVisibility: (category, visible) =>
        set((state) =>
          state.categories[category] === visible
            ? state
            : { categories: { ...state.categories, [category]: visible } },
        ),
      toggleCategoryVisibility: (category) =>
        set((state) => ({
          categories: {
            ...state.categories,
            [category]: !state.categories[category],
          },
        })),
      hideObject: (bodyId) =>
        set((state) => ({
          objectOverrides: { ...state.objectOverrides, [bodyId]: "hidden" },
        })),
      showObject: (bodyId) =>
        set((state) => ({
          objectOverrides: { ...state.objectOverrides, [bodyId]: "visible" },
        })),
      clearObjectVisibilityOverride: (bodyId) =>
        set((state) => {
          if (!(bodyId in state.objectOverrides)) return state;
          const objectOverrides = { ...state.objectOverrides };
          delete objectOverrides[bodyId];
          return { objectOverrides };
        }),
      setOrbitsVisible: (orbitsVisible) => set({ orbitsVisible }),
      toggleOrbits: () =>
        set((state) => ({ orbitsVisible: !state.orbitsVisible })),
      setLabelsVisible: (labelsVisible) => set({ labelsVisible }),
      toggleLabels: () =>
        set((state) => ({ labelsVisible: !state.labelsVisible })),
      restoreAllVisibility: () => set({ ...initialSceneVisibilityState }),
      isBodyVisible: (bodyId) => effectiveBodyVisibility(bodyId, get()),
    }),
    {
      name: SCENE_VISIBILITY_STORAGE_KEY,
      version: SCENE_VISIBILITY_STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({
        categories,
        labelsVisible,
        objectOverrides,
        orbitsVisible,
      }) => ({ categories, labelsVisible, objectOverrides, orbitsVisible }),
      merge: (persisted, current) => ({
        ...current,
        ...migratePersistedVisibility(persisted),
      }),
      migrate: (persisted) => migratePersistedVisibility(persisted),
    },
  ),
);

export function sceneVisibilityIsDefault(
  state: Pick<
    SceneVisibilityState,
    "categories" | "labelsVisible" | "objectOverrides" | "orbitsVisible"
  >,
): boolean {
  return (
    state.labelsVisible &&
    state.orbitsVisible &&
    Object.keys(state.objectOverrides).length === 0 &&
    SCENE_VISIBILITY_CATEGORIES.every((category) => state.categories[category])
  );
}

export function resetSceneVisibilityStore(): void {
  useSceneVisibilityStore.setState(initialSceneVisibilityState);
}
