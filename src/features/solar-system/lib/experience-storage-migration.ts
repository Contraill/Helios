const LEGACY_PREFERENCES_KEY = "helios-preferences";
export const EXPLORE_STORAGE_MIGRATION_VERSION = 3;

/**
 * Quality and motion were once user-owned preferences. Explore now has one
 * visual contract and follows the operating-system motion preference, so the
 * legacy envelope has no supported fields left. Removing it before hydration
 * prevents old values from reappearing or changing the first client render.
 */
export function migrateLegacyExplorePreferences(storage: Storage): void {
  if (storage.getItem(LEGACY_PREFERENCES_KEY) !== null) {
    storage.removeItem(LEGACY_PREFERENCES_KEY);
  }
}
