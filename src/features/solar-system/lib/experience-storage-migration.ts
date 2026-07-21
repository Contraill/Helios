import { DEFAULT_SCENE_VISIBILITY_CATEGORIES } from "@/features/solar-system/lib/scene-visibility-policy";
import {
  SCENE_VISIBILITY_STORAGE_KEY,
  SCENE_VISIBILITY_STORAGE_VERSION,
} from "@/stores/scene-visibility-store";

const LEGACY_PREFERENCES_KEY = "helios-preferences";
const EXPLORATION_KEY = "helios-exploration";
const RETIRED_EXTENDED_SYSTEM_KEY = "helios-extended-system";
export const EXPLORE_STORAGE_MIGRATION_VERSION = 4;

function parsedEnvelope(
  storage: Storage,
  key: string,
): Record<string, unknown> | null {
  const raw = storage.getItem(key);
  if (raw === null) return null;
  try {
    const value = JSON.parse(raw) as unknown;
    return value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function booleanField(
  state: Record<string, unknown> | null,
  key: "orbitsVisible" | "labelsVisible",
): boolean | undefined {
  const value = state?.[key];
  return typeof value === "boolean" ? value : undefined;
}

/**
 * Retires obsolete quality/motion preferences and migrates the two historical
 * scene toggles into the dedicated visibility domain before either store hydrates.
 * Malformed envelopes are removed so Zustand deterministically falls back.
 */
export function migrateLegacyExplorePreferences(storage: Storage): void {
  storage.removeItem(RETIRED_EXTENDED_SYSTEM_KEY);

  if (storage.getItem(LEGACY_PREFERENCES_KEY) !== null) {
    storage.removeItem(LEGACY_PREFERENCES_KEY);
  }

  const explorationEnvelope = parsedEnvelope(storage, EXPLORATION_KEY);
  if (storage.getItem(EXPLORATION_KEY) !== null && !explorationEnvelope) {
    storage.removeItem(EXPLORATION_KEY);
  }
  const explorationState =
    explorationEnvelope?.state && typeof explorationEnvelope.state === "object"
      ? (explorationEnvelope.state as Record<string, unknown>)
      : null;

  const visibilityEnvelope = parsedEnvelope(
    storage,
    SCENE_VISIBILITY_STORAGE_KEY,
  );
  if (
    storage.getItem(SCENE_VISIBILITY_STORAGE_KEY) !== null &&
    !visibilityEnvelope
  ) {
    storage.removeItem(SCENE_VISIBILITY_STORAGE_KEY);
  }

  if (!visibilityEnvelope && explorationState) {
    const orbitsVisible = booleanField(explorationState, "orbitsVisible");
    const labelsVisible = booleanField(explorationState, "labelsVisible");
    if (orbitsVisible !== undefined || labelsVisible !== undefined) {
      storage.setItem(
        SCENE_VISIBILITY_STORAGE_KEY,
        JSON.stringify({
          state: {
            categories: { ...DEFAULT_SCENE_VISIBILITY_CATEGORIES },
            objectOverrides: {},
            orbitsVisible: orbitsVisible ?? true,
            labelsVisible: labelsVisible ?? true,
          },
          version: SCENE_VISIBILITY_STORAGE_VERSION,
        }),
      );
    }
  }

  if (explorationEnvelope && explorationState) {
    const supported = { ...explorationState };
    delete supported.orbitsVisible;
    delete supported.labelsVisible;
    storage.setItem(
      EXPLORATION_KEY,
      JSON.stringify({ ...explorationEnvelope, state: supported, version: 2 }),
    );
  }
}
