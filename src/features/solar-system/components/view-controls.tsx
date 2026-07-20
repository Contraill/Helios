"use client";

import styles from "@/app/explore/explore.module.css";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import { uiStrings } from "@/lib/i18n/ui-strings";
import { useExplorationStore } from "@/stores/exploration-store";

import gateStyles from "./explore-scene-gate.module.css";

const profiles: readonly ScaleMode[] = ["exploration", "scientific"];

export function ViewControls() {
  const copy = uiStrings.pages.explore.controls;
  const scaleMode = useExplorationStore((state) => state.scaleMode);
  const orbitsVisible = useExplorationStore((state) => state.orbitsVisible);
  const labelsVisible = useExplorationStore((state) => state.labelsVisible);
  const cameraMode = useExplorationStore((state) => state.cameraMode);
  const setScaleMode = useExplorationStore((state) => state.setScaleMode);
  const toggleOrbits = useExplorationStore((state) => state.toggleOrbits);
  const toggleLabels = useExplorationStore((state) => state.toggleLabels);
  const enterFreeCamera = useExplorationStore((state) => state.enterFreeCamera);
  const exitFreeCamera = useExplorationStore((state) => state.exitFreeCamera);
  const clearSelection = useExplorationStore((state) => state.clearSelection);

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
        <fieldset>
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

        <fieldset>
          <legend>{copy.scene}</legend>
          <div className={styles.toggleControls}>
            <button
              aria-pressed={orbitsVisible}
              onClick={toggleOrbits}
              type="button"
            >
              {copy.orbits}
            </button>
            <button
              aria-pressed={labelsVisible}
              onClick={toggleLabels}
              type="button"
            >
              {copy.labels}
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>{copy.camera}</legend>
          <div className={styles.toggleControls}>
            <button
              aria-pressed={cameraMode === "free"}
              onClick={enterFreeCamera}
              type="button"
            >
              {copy.freeCamera}
            </button>
            <button
              aria-pressed={cameraMode !== "free"}
              onClick={exitFreeCamera}
              type="button"
            >
              {copy.guidedCamera}
            </button>
            <button onClick={clearSelection} type="button">
              {copy.resetView}
            </button>
          </div>
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
