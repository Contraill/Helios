"use client";

import { type FormEvent, useEffect, useState } from "react";

import styles from "@/app/explore/explore.module.css";
import {
  SECONDS_PER_JULIAN_YEAR,
  TIME_SCALE_OPTIONS,
  timeScaleLabel,
} from "@/features/solar-system/types/experience-settings";
import { representationLabel } from "@/features/solar-system/lib/celestial-representation";
import { planetEphemerisRepresentation } from "@/lib/data/ephemeris/models";
import { exploreSceneCopy } from "@/lib/i18n/explore-scene-copy";
import { useEphemerisStore } from "@/stores/ephemeris-store";
import { useSimulationStore } from "@/stores/simulation-store";

import {
  inputTimestamp,
  type EphemerisControllerApi,
  useEphemerisControllerSnapshot,
} from "./ephemeris-controller";
import gateStyles from "./explore-scene-gate.module.css";

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

function inputValueFor(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 23);
}

export function EphemerisPanel({
  controller,
}: {
  controller: EphemerisControllerApi;
}) {
  const snapshot = useEphemerisControllerSnapshot();
  const bundle = useEphemerisStore((state) => state.bundle);
  const loadStatus = useEphemerisStore((state) => state.loadStatus);
  const errorMessage = useEphemerisStore((state) => state.errorMessage);
  const isPaused = useSimulationStore((state) => state.isPaused);
  const timeScale = useSimulationStore((state) => state.timeScale);
  const range = useSimulationStore((state) => state.range);
  const boundaryReached = useSimulationStore((state) => state.boundaryReached);
  const togglePaused = useSimulationStore((state) => state.togglePaused);
  const setTimeScale = useSimulationStore((state) => state.setTimeScale);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    controller.refreshView();
    return () => controller.discardDraft();
  }, [controller]);

  if (!snapshot.clockReady) {
    return (
      <div
        aria-busy="true"
        aria-label={exploreSceneCopy.ephemeris.controlsLabel}
        className={gateStyles.embeddedPanel}
        data-embedded-panel="time"
      >
        <p className={styles.timePreparing} role="status">
          <small>{exploreSceneCopy.ephemeris.label}</small>
          <span>{exploreSceneCopy.ephemeris.preparing}</span>
        </p>
      </div>
    );
  }

  const representativePlanetId = bundle.vectors[0]?.planetId ?? "earth";
  const representation = planetEphemerisRepresentation(
    bundle,
    representativePlanetId,
    snapshot.displayedAt,
  );
  const acceleratedPreview =
    (timeScale === SECONDS_PER_JULIAN_YEAR && !isPaused) ||
    snapshot.isScrubbing;
  const sourceStatus = acceleratedPreview
    ? exploreSceneCopy.ephemeris.approximatePreview
    : loadStatus === "loading"
      ? exploreSceneCopy.ephemeris.computing
      : loadStatus === "error"
        ? exploreSceneCopy.ephemeris.previousRetained
        : representationLabel(representation.representationType);
  const currentLabel = dateTimeFormatter.format(new Date(snapshot.displayedAt));
  const observedLabel = dateTimeFormatter.format(new Date(bundle.observedAt));
  const retrievedLabel = dateTimeFormatter.format(new Date(bundle.retrievedAt));
  const boundaryMessage =
    boundaryReached === "maximum"
      ? exploreSceneCopy.ephemeris.maximumReached
      : boundaryReached === "minimum"
        ? exploreSceneCopy.ephemeris.minimumReached
        : null;
  const statusDescription = boundaryMessage
    ? boundaryMessage
    : acceleratedPreview
      ? exploreSceneCopy.ephemeris.approximateDescription(observedLabel)
      : loadStatus === "error" && errorMessage
        ? errorMessage
        : `${exploreSceneCopy.ephemeris.vectorDescription(
            observedLabel,
            retrievedLabel,
            bundle.metadata.barycenterPlanetIds ?? [],
          )} ${representation.precisionNote}`;
  const canGoBackward = snapshot.displayedAt > range.minimumUtcMs;
  const canGoForward = snapshot.displayedAt < range.maximumUtcMs;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const timestamp = inputTimestamp(snapshot.pendingValue, range);
    if (timestamp === null) {
      const message = exploreSceneCopy.ephemeris.rangeError(
        inputValueFor(range.minimumUtcMs),
        inputValueFor(range.maximumUtcMs),
      );
      setDateError(message);
      useEphemerisStore.getState().setError(message);
      return;
    }
    setDateError(null);
    controller.discardDraft();
    controller.navigateTo(timestamp);
  };

  return (
    <div
      aria-label={exploreSceneCopy.ephemeris.controlsLabel}
      className={`${gateStyles.embeddedPanel} ${gateStyles.ephemerisPanel}`}
      data-embedded-panel="time"
      id="time-control-panel"
    >
      <div className={styles.timeHeader}>
        <div>
          <p className={styles.timeEyebrow}>
            {exploreSceneCopy.ephemeris.label}
          </p>
          <time dateTime={new Date(snapshot.displayedAt).toISOString()}>
            {currentLabel} UTC
          </time>
        </div>
        <span className={styles.sourceStatus} data-status={loadStatus}>
          {sourceStatus}
        </span>
      </div>

      <div className={styles.transportControls}>
        <button
          aria-pressed={isPaused}
          className={styles.primaryControl}
          disabled={boundaryReached !== null && isPaused}
          onClick={togglePaused}
          type="button"
        >
          {isPaused
            ? exploreSceneCopy.ephemeris.resume
            : exploreSceneCopy.ephemeris.pause}
        </button>
        <button onClick={controller.goNow} type="button">
          {exploreSceneCopy.ephemeris.resetNow}
        </button>
      </div>

      <fieldset>
        <legend>{exploreSceneCopy.ephemeris.speed}</legend>
        <div className={styles.segmentedControls}>
          {TIME_SCALE_OPTIONS.map((option) => (
            <button
              aria-pressed={timeScale === option}
              key={option}
              onClick={() => setTimeScale(option)}
              type="button"
            >
              {timeScaleLabel(option)}
            </button>
          ))}
        </div>
      </fieldset>

      <form className={styles.timeForm} onSubmit={handleSubmit}>
        <div className={styles.timeSteps}>
          <button
            disabled={!canGoBackward}
            onClick={() => controller.stepByYears(-10)}
            type="button"
          >
            −10y
          </button>
          <button
            disabled={!canGoBackward}
            onClick={() => controller.stepByYears(-1)}
            type="button"
          >
            −1y
          </button>
          <button
            disabled={!canGoBackward}
            onClick={() => controller.stepByDays(-30)}
            type="button"
          >
            −30d
          </button>
          <button
            disabled={!canGoBackward}
            onClick={() => controller.stepByDays(-1)}
            type="button"
          >
            −1d
          </button>
        </div>
        <label className={styles.dateTimeField} htmlFor="ephemeris-date-time">
          <span>{exploreSceneCopy.ephemeris.dateTime}</span>
          <input
            aria-describedby={dateError ? "ephemeris-date-error" : undefined}
            aria-invalid={dateError ? true : undefined}
            id="ephemeris-date-time"
            max={inputValueFor(range.maximumUtcMs)}
            min={inputValueFor(range.minimumUtcMs)}
            onChange={(event) => {
              setDateError(null);
              controller.setPendingValue(event.target.value);
            }}
            onFocus={controller.beginEdit}
            step="0.001"
            type="datetime-local"
            value={snapshot.pendingValue}
          />
        </label>
        <button
          className={styles.applyTimeButton}
          disabled={loadStatus === "loading"}
          type="submit"
        >
          {exploreSceneCopy.ephemeris.apply}
        </button>
        {dateError ? (
          <p id="ephemeris-date-error" role="alert">
            {dateError}
          </p>
        ) : snapshot.isEditing ? (
          <p role="status">{exploreSceneCopy.ephemeris.editingDraft}</p>
        ) : null}
        <div className={styles.timeSteps}>
          <button
            disabled={!canGoForward}
            onClick={() => controller.stepByDays(1)}
            type="button"
          >
            +1d
          </button>
          <button
            disabled={!canGoForward}
            onClick={() => controller.stepByDays(30)}
            type="button"
          >
            +30d
          </button>
          <button
            disabled={!canGoForward}
            onClick={() => controller.stepByYears(1)}
            type="button"
          >
            +1y
          </button>
          <button
            disabled={!canGoForward}
            onClick={() => controller.stepByYears(10)}
            type="button"
          >
            +10y
          </button>
        </div>
      </form>

      <label className={styles.timelineField} htmlFor="ephemeris-year-scrubber">
        <span>
          {exploreSceneCopy.ephemeris.generalDate(snapshot.scrubYearOffset)}
        </span>
        <input
          aria-describedby="ephemeris-range-bounds"
          id="ephemeris-year-scrubber"
          max="600"
          min="-500"
          onChange={(event) =>
            controller.previewScrub(Number(event.target.value))
          }
          onKeyUp={controller.commitScrub}
          onPointerUp={controller.commitScrub}
          step="1"
          type="range"
          value={snapshot.scrubYearOffset}
        />
        <span className={styles.timelineRegions} aria-hidden="true">
          <span>{exploreSceneCopy.ephemeris.timelinePast}</span>
          <span>{exploreSceneCopy.ephemeris.timelineNow}</span>
          <span>{exploreSceneCopy.ephemeris.timelineFuture}</span>
        </span>
        <span className={styles.rangeBounds} id="ephemeris-range-bounds">
          <time dateTime={new Date(range.minimumUtcMs).toISOString()}>
            {dateTimeFormatter.format(new Date(range.minimumUtcMs))}
          </time>
          <time dateTime={new Date(range.maximumUtcMs).toISOString()}>
            {dateTimeFormatter.format(new Date(range.maximumUtcMs))}
          </time>
        </span>
      </label>

      <div className={styles.timeFooter}>
        <p aria-live="polite">{statusDescription}</p>
        <button onClick={() => void controller.copyLink()} type="button">
          {snapshot.copied
            ? exploreSceneCopy.ephemeris.copied
            : exploreSceneCopy.ephemeris.copyLink}
        </button>
      </div>
      <p className={styles.ephemerisMethod}>
        {exploreSceneCopy.ephemeris.method}
      </p>
    </div>
  );
}
