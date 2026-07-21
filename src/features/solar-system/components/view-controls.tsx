"use client";

import styles from "@/app/explore/explore.module.css";
import {
  SCENE_VISIBILITY_CATEGORIES,
  type SceneVisibilityCategory,
} from "@/features/solar-system/lib/scene-visibility-policy";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import { uiStrings } from "@/lib/i18n/ui-strings";
import { useExplorationStore } from "@/stores/exploration-store";
import {
  sceneVisibilityIsDefault,
  useSceneVisibilityStore,
} from "@/stores/scene-visibility-store";

import gateStyles from "./explore-scene-gate.module.css";

const profiles: readonly ScaleMode[] = ["exploration", "scientific"];
const visibilityLabels: Readonly<Record<SceneVisibilityCategory, string>> = {
  planets: "Planets",
  moons: "Moons",
  asteroids: "Asteroids",
  "dwarf-kuiper": "Dwarf & Kuiper worlds",
  comets: "Comets",
  regions: "Regions",
};

export function ViewControls() {
  const copy = uiStrings.pages.explore.controls;
  const scaleMode = useExplorationStore((state) => state.scaleMode);
  const cameraMode = useExplorationStore((state) => state.cameraMode);
  const setScaleMode = useExplorationStore((state) => state.setScaleMode);
  const enterFreeCamera = useExplorationStore((state) => state.enterFreeCamera);
  const guideCamera = useExplorationStore((state) => state.guideCamera);
  const resetView = useExplorationStore((state) => state.resetView);
  const categories = useSceneVisibilityStore((state) => state.categories);
  const orbitsVisible = useSceneVisibilityStore((state) => state.orbitsVisible);
  const labelsVisible = useSceneVisibilityStore((state) => state.labelsVisible);
  const toggleCategoryVisibility = useSceneVisibilityStore(
    (state) => state.toggleCategoryVisibility,
  );
  const toggleOrbits = useSceneVisibilityStore((state) => state.toggleOrbits);
  const toggleLabels = useSceneVisibilityStore((state) => state.toggleLabels);
  const restoreAllVisibility = useSceneVisibilityStore(
    (state) => state.restoreAllVisibility,
  );
  const visibilityIsDefault = useSceneVisibilityStore(sceneVisibilityIsDefault);

  return (
    <div
      aria-label="View controls"
      className={`${gateStyles.embeddedPanel} ${gateStyles.viewPanel}`}
      data-embedded-panel="view"
      id="view-control-panel"
    >
      <div className={styles.controlDeckHeader}>
        <div>
          <p className={styles.controlEyebrow}>Scene presentation</p>
          <h2>View</h2>
        </div>
      </div>

      <div className={styles.controlGrid}>
        <fieldset className={gateStyles.viewSection}>
          <legend>{copy.scale}</legend>
          <div className={styles.segmentedControls}>
            {profiles.map((profile) => (
              <button
                aria-pressed={scaleMode === profile}
                key={profile}
                onClick={() => setScaleMode(profile)}
                type="button"
              >
                {copy.scaleOptions[profile]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset
          className={`${gateStyles.viewSection} ${gateStyles.visibilityFieldset}`}
        >
          <legend>Visibility</legend>
          <div className={gateStyles.visibilityGrid}>
            {SCENE_VISIBILITY_CATEGORIES.map((category) => (
              <VisibilityToggle
                key={category}
                label={visibilityLabels[category]}
                onClick={() => toggleCategoryVisibility(category)}
                pressed={categories[category]}
              />
            ))}
            <VisibilityToggle
              label={copy.orbits}
              onClick={toggleOrbits}
              pressed={orbitsVisible}
            />
            <VisibilityToggle
              label={copy.labels}
              onClick={toggleLabels}
              pressed={labelsVisible}
            />
          </div>
          <button
            aria-describedby="restore-visibility-description"
            className={gateStyles.restoreVisibility}
            disabled={visibilityIsDefault}
            onClick={restoreAllVisibility}
            type="button"
          >
            Restore all visibility
          </button>
          <span
            className={gateStyles.srOnly}
            id="restore-visibility-description"
          >
            {visibilityIsDefault
              ? "All categories, orbits and labels are already visible."
              : "Shows every category, clears object overrides and enables orbits and labels."}
          </span>
        </fieldset>

        <fieldset
          className={`${gateStyles.viewSection} ${gateStyles.cameraFieldset}`}
        >
          <legend>{copy.camera}</legend>
          <div className={gateStyles.cameraGrid}>
            <button
              aria-pressed={cameraMode === "free"}
              onClick={enterFreeCamera}
              type="button"
            >
              {copy.freeCamera}
            </button>
            <button
              aria-pressed={cameraMode !== "free"}
              onClick={guideCamera}
              type="button"
            >
              {copy.guidedCamera}
            </button>
            <button onClick={resetView} type="button">
              {copy.resetView}
            </button>
          </div>
          <p className={gateStyles.cameraStatus} role="status">
            {cameraMode === "free"
              ? "Free camera keeps the current pose while selection remains available."
              : cameraMode === "overview"
                ? "Guided overview is active."
                : "Guided camera follows the selected target without locking rotation or zoom."}
          </p>
        </fieldset>
      </div>

      <p className={styles.scaleExplanation} role="status">
        {copy.scaleDescriptions[scaleMode]}
      </p>
      <p className={styles.visualAttribution}>
        One automatic High visual contract is active. Runtime safety is handled
        by staged loading, bounded pixel ratio, mipmaps and texture leases.
      </p>
    </div>
  );
}

function VisibilityToggle({
  label,
  onClick,
  pressed,
}: {
  label: string;
  onClick: () => void;
  pressed: boolean;
}) {
  return (
    <button
      aria-label={`${label}: ${pressed ? "visible" : "hidden"}`}
      aria-pressed={pressed}
      className={gateStyles.visibilityToggle}
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
      <span aria-hidden="true" className={gateStyles.visibilityState}>
        {pressed ? "On" : "Off"}
      </span>
    </button>
  );
}
