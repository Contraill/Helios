"use client";

import styles from "@/app/explore/explore.module.css";
import {
  TIME_SCALE_OPTIONS,
  type MotionPreference,
  type QualityLevel,
  type ScaleMode,
  type TimeScale,
} from "@/features/solar-system/types/experience-settings";
import { uiStrings } from "@/lib/i18n/ui-strings";
import { useExplorationStore } from "@/stores/exploration-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useSimulationStore } from "@/stores/simulation-store";

const scaleModes: readonly ScaleMode[] = ["exploration", "scientific"];
const qualityLevels: readonly QualityLevel[] = ["low", "medium", "high"];
const motionPreferences: readonly MotionPreference[] = [
  "system",
  "reduced",
  "standard",
];

interface SegmentedButtonProps<T extends string | number> {
  active: boolean;
  label: string;
  onSelect: (value: T) => void;
  value: T;
}

function SegmentedButton<T extends string | number>({
  active,
  label,
  onSelect,
  value,
}: SegmentedButtonProps<T>) {
  return (
    <button aria-pressed={active} onClick={() => onSelect(value)} type="button">
      {label}
    </button>
  );
}

export function SimulationControls() {
  const copy = uiStrings.pages.explore.controls;
  const isPaused = useSimulationStore((state) => state.isPaused);
  const timeScale = useSimulationStore((state) => state.timeScale);
  const togglePaused = useSimulationStore((state) => state.togglePaused);
  const setTimeScale = useSimulationStore((state) => state.setTimeScale);
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);

  const scaleMode = useExplorationStore((state) => state.scaleMode);
  const orbitsVisible = useExplorationStore((state) => state.orbitsVisible);
  const labelsVisible = useExplorationStore((state) => state.labelsVisible);
  const setScaleMode = useExplorationStore((state) => state.setScaleMode);
  const toggleOrbits = useExplorationStore((state) => state.toggleOrbits);
  const toggleLabels = useExplorationStore((state) => state.toggleLabels);

  const qualityLevel = usePreferencesStore((state) => state.qualityLevel);
  const motionPreference = usePreferencesStore(
    (state) => state.motionPreference,
  );
  const setQualityLevel = usePreferencesStore((state) => state.setQualityLevel);
  const setMotionPreference = usePreferencesStore(
    (state) => state.setMotionPreference,
  );

  return (
    <aside aria-label={copy.label} className={styles.controlDeck}>
      <div className={styles.controlDeckHeader}>
        <div>
          <p className={styles.controlEyebrow}>{copy.eyebrow}</p>
          <h2>{copy.label}</h2>
        </div>
        <div className={styles.transportControls}>
          <button
            aria-pressed={isPaused}
            className={styles.primaryControl}
            onClick={togglePaused}
            type="button"
          >
            {isPaused ? copy.resume : copy.pause}
          </button>
          <button onClick={resetSimulation} type="button">
            {copy.reset}
          </button>
        </div>
      </div>

      <div className={styles.controlGrid}>
        <fieldset>
          <legend>{copy.speed}</legend>
          <div className={styles.segmentedControls}>
            {TIME_SCALE_OPTIONS.map((option) => (
              <SegmentedButton<TimeScale>
                key={option}
                active={timeScale === option}
                label={`${option}×`}
                onSelect={setTimeScale}
                value={option}
              />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>{copy.scale}</legend>
          <div className={styles.segmentedControls}>
            {scaleModes.map((mode) => (
              <SegmentedButton<ScaleMode>
                key={mode}
                active={scaleMode === mode}
                label={copy.scaleOptions[mode]}
                onSelect={setScaleMode}
                value={mode}
              />
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
          <legend>{copy.quality}</legend>
          <div className={styles.segmentedControls}>
            {qualityLevels.map((level) => (
              <SegmentedButton<QualityLevel>
                key={level}
                active={qualityLevel === level}
                label={copy.qualityOptions[level]}
                onSelect={setQualityLevel}
                value={level}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.motionFieldset}>
          <legend>{copy.motion}</legend>
          <div className={styles.segmentedControls}>
            {motionPreferences.map((preference) => (
              <SegmentedButton<MotionPreference>
                key={preference}
                active={motionPreference === preference}
                label={copy.motionOptions[preference]}
                onSelect={setMotionPreference}
                value={preference}
              />
            ))}
          </div>
        </fieldset>
      </div>

      <p
        className={styles.scaleExplanation}
        id="experience-scale-description"
        role="status"
      >
        {copy.scaleDescriptions[scaleMode]}
      </p>
    </aside>
  );
}
