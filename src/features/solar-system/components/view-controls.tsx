"use client";

import styles from "@/app/explore/explore.module.css";
import { SCENE_VISIBILITY_CATEGORIES } from "@/features/solar-system/lib/scene-visibility-policy";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import { getExplorePageCopy } from "@/lib/i18n/explore-page-copy";
import { useExplorationStore } from "@/stores/exploration-store";
import { useLocaleStore } from "@/stores/locale-store";
import {
  sceneVisibilityIsDefault,
  useSceneVisibilityStore,
} from "@/stores/scene-visibility-store";

import controlStyles from "./explore-scene-controls.module.css";

const profiles: readonly ScaleMode[] = ["exploration", "scientific"];

export function ViewControls() {
  const locale = useLocaleStore((state) => state.locale);
  const copy = getExplorePageCopy(locale).controls;
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
      aria-label={copy.label}
      className={`${controlStyles.embeddedPanel} ${controlStyles.viewPanel}`}
      data-embedded-panel="view"
      id="view-control-panel"
    >
      <div className={styles.controlDeckHeader}>
        <div>
          <p className={styles.controlEyebrow}>{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
        </div>
      </div>

      <div
        className={`${styles.controlGrid} ${controlStyles.viewControlGrid}`}
        data-view-layout="stacked"
      >
        <fieldset className={controlStyles.viewSection}>
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
          className={`${controlStyles.viewSection} ${controlStyles.visibilityFieldset}`}
        >
          <legend>{copy.visibility}</legend>
          <div className={controlStyles.visibilityGrid} data-visibility-grid>
            {SCENE_VISIBILITY_CATEGORIES.map((category) => (
              <VisibilityToggle
                copy={copy}
                key={category}
                label={copy.visibilityLabels[category]}
                onClick={() => toggleCategoryVisibility(category)}
                pressed={categories[category]}
              />
            ))}
            <VisibilityToggle
              copy={copy}
              label={copy.orbits}
              onClick={toggleOrbits}
              pressed={orbitsVisible}
            />
            <VisibilityToggle
              copy={copy}
              label={copy.labels}
              onClick={toggleLabels}
              pressed={labelsVisible}
            />
          </div>
          <button
            aria-describedby="restore-visibility-description"
            className={controlStyles.restoreVisibility}
            disabled={visibilityIsDefault}
            onClick={restoreAllVisibility}
            type="button"
          >
            {copy.restoreVisibility}
          </button>
          <span
            className={controlStyles.srOnly}
            id="restore-visibility-description"
          >
            {visibilityIsDefault ? copy.restoreAlready : copy.restoreAction}
          </span>
        </fieldset>

        <fieldset
          className={`${controlStyles.viewSection} ${controlStyles.cameraFieldset}`}
        >
          <legend>{copy.camera}</legend>
          <div className={controlStyles.cameraGrid}>
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
          <p className={controlStyles.cameraStatus} role="status">
            {cameraMode === "free"
              ? copy.freeStatus
              : cameraMode === "overview"
                ? copy.overviewStatus
                : copy.guidedStatus}
          </p>
        </fieldset>
      </div>

      <p className={styles.scaleExplanation} role="status">
        {copy.scaleDescriptions[scaleMode]}
      </p>
      <p className={styles.visualAttribution}>{copy.visualContract}</p>
    </div>
  );
}

function VisibilityToggle({
  copy,
  label,
  onClick,
  pressed,
}: {
  copy: ReturnType<typeof getExplorePageCopy>["controls"];
  label: string;
  onClick: () => void;
  pressed: boolean;
}) {
  return (
    <button
      aria-label={copy.visibilityAria(label, pressed)}
      aria-pressed={pressed}
      className={controlStyles.visibilityToggle}
      data-visibility-toggle
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
      <span aria-hidden="true" className={controlStyles.visibilityState}>
        {copy.visibilityState(pressed)}
      </span>
    </button>
  );
}
