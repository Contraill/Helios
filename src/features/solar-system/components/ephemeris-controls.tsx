"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import styles from "@/app/explore/explore.module.css";
import {
  addCalendarYearsSafely,
  clampSimulationTimestamp,
  isWithinSimulationRange,
  type SimulationRange,
} from "@/features/solar-system/lib/simulation-range";
import { SECONDS_PER_JULIAN_YEAR } from "@/features/solar-system/types/experience-settings";
import {
  MAX_PROPAGATION_DAYS,
  ephemerisBundleSchema,
} from "@/lib/data/ephemeris/models";
import { useEphemerisStore } from "@/stores/ephemeris-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import {
  currentSimulationTimeMs,
  INITIAL_SIMULATION_TIMESTAMP_MS,
  useSimulationStore,
} from "@/stores/simulation-store";

const MILLISECONDS_PER_DAY = 86_400_000;
const AUTOMATIC_REFRESH_DAYS = MAX_PROPAGATION_DAYS - 30;
const WINDOW_PREFETCH_MARGIN_DAYS = 90;
const SCRUB_DEBOUNCE_MS = 450;

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

function inputValueFor(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 23);
}

function inputTimestamp(value: string, range: SimulationRange): number | null {
  const timestamp = Date.parse(
    `${value.length === 16 ? `${value}:00` : value}Z`,
  );
  return Number.isFinite(timestamp) && isWithinSimulationRange(timestamp, range)
    ? timestamp
    : null;
}

function requestErrorMessage(raw: unknown): string {
  if (
    typeof raw === "object" &&
    raw !== null &&
    "error" in raw &&
    typeof raw.error === "string"
  ) {
    return raw.error;
  }
  return "The requested ephemeris could not be loaded.";
}

function yearOffsetFromAnchor(timestamp: number, range: SimulationRange) {
  return Math.max(
    -500,
    Math.min(
      600,
      new Date(timestamp).getUTCFullYear() -
        new Date(range.anchorUtcMs).getUTCFullYear(),
    ),
  );
}

export function EphemerisControls() {
  const bundle = useEphemerisStore((state) => state.bundle);
  const loadStatus = useEphemerisStore((state) => state.loadStatus);
  const errorMessage = useEphemerisStore((state) => state.errorMessage);
  const beginLoading = useEphemerisStore((state) => state.beginLoading);
  const setBundle = useEphemerisStore((state) => state.setBundle);
  const setError = useEphemerisStore((state) => state.setError);
  const isPaused = useSimulationStore((state) => state.isPaused);
  const timeScale = useSimulationStore((state) => state.timeScale);
  const range = useSimulationStore((state) => state.range);
  const boundaryReached = useSimulationStore((state) => state.boundaryReached);
  const initializeSimulationRange = useSimulationStore(
    (state) => state.initializeSimulationRange,
  );
  const syncSimulationClock = useSimulationStore(
    (state) => state.syncSimulationClock,
  );
  const timePanelExpanded = usePreferencesStore(
    (state) => state.timePanelExpanded,
  );
  const toggleTimePanel = usePreferencesStore((state) => state.toggleTimePanel);
  const setSimulationTime = useSimulationStore(
    (state) => state.setSimulationTime,
  );
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);
  const [clockReady, setClockReady] = useState(false);
  const [displayedAt, setDisplayedAt] = useState(
    INITIAL_SIMULATION_TIMESTAMP_MS,
  );
  const [pendingValue, setPendingValue] = useState(inputValueFor(displayedAt));
  const [scrubYearOffset, setScrubYearOffset] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [copied, setCopied] = useState(false);
  const requestController = useRef<AbortController | null>(null);
  const scrubTimer = useRef<number | null>(null);
  const lastAutomaticRequestKey = useRef<string | null>(null);
  const lastAutomaticRequestRealMs = useRef(0);
  const mounted = useRef(false);
  const clockReadyRef = useRef(false);

  const updateUrl = useCallback((timestamp: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("at", new Date(timestamp).toISOString());
    window.history.replaceState(window.history.state, "", url);
  }, []);

  const loadAt = useCallback(
    async (timestamp: number, shareable = true, synchronizeClock = true) => {
      const simulationState = useSimulationStore.getState();
      if (!isWithinSimulationRange(timestamp, simulationState.range)) {
        setError("Choose a UTC date inside the supported session range.");
        return;
      }

      const previousTimestamp = currentSimulationTimeMs(simulationState);
      requestController.current?.abort();
      const controller = new AbortController();
      requestController.current = controller;
      beginLoading();
      setDisplayedAt(timestamp);
      setPendingValue(inputValueFor(timestamp));
      setScrubYearOffset(
        yearOffsetFromAnchor(timestamp, simulationState.range),
      );
      if (shareable) updateUrl(timestamp);
      if (synchronizeClock) setSimulationTime(timestamp);

      try {
        const response = await fetch(
          `/api/ephemeris?at=${encodeURIComponent(new Date(timestamp).toISOString())}&anchor=${encodeURIComponent(new Date(simulationState.range.anchorUtcMs).toISOString())}`,
          {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        );
        const raw: unknown = await response.json();
        if (!response.ok) throw new Error(requestErrorMessage(raw));
        setBundle(ephemerisBundleSchema.parse(raw));
        const current = currentSimulationTimeMs(useSimulationStore.getState());
        setDisplayedAt(current);
        setPendingValue(inputValueFor(current));
        setScrubYearOffset(
          yearOffsetFromAnchor(current, useSimulationStore.getState().range),
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        if (synchronizeClock) setSimulationTime(previousTimestamp);
        setDisplayedAt(previousTimestamp);
        setPendingValue(inputValueFor(previousTimestamp));
        setError(
          error instanceof Error
            ? error.message
            : "The requested ephemeris could not be loaded.",
        );
      }
    },
    [beginLoading, setBundle, setError, setSimulationTime, updateUrl],
  );

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    let cancelled = false;
    const initialize = async () => {
      if (!useSimulationStore.persist.hasHydrated()) {
        await useSimulationStore.persist.rehydrate();
      }
      if (cancelled) return;

      const anchorUtcMs = Date.now();
      initializeSimulationRange(anchorUtcMs);
      const sessionRange = useSimulationStore.getState().range;
      const requested = new URL(window.location.href).searchParams.get("at");
      const requestedTimestamp = requested ? Date.parse(requested) : Number.NaN;
      const initialTimestamp =
        Number.isFinite(requestedTimestamp) &&
        isWithinSimulationRange(requestedTimestamp, sessionRange)
          ? requestedTimestamp
          : anchorUtcMs;
      setSimulationTime(initialTimestamp);
      setDisplayedAt(initialTimestamp);
      setPendingValue(inputValueFor(initialTimestamp));
      setScrubYearOffset(yearOffsetFromAnchor(initialTimestamp, sessionRange));
      clockReadyRef.current = true;
      setClockReady(true);
      void loadAt(initialTimestamp, Boolean(requested));
    };
    void initialize();
    return () => {
      cancelled = true;
      requestController.current?.abort();
      if (scrubTimer.current !== null) {
        window.clearTimeout(scrubTimer.current);
      }
    };
  }, [initializeSimulationRange, loadAt, setSimulationTime]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!clockReadyRef.current) return;
      const simulationState = useSimulationStore.getState();
      const current = simulationState.syncSimulationClock();
      setDisplayedAt(current);
      setScrubYearOffset(yearOffsetFromAnchor(current, simulationState.range));
      if (
        document.activeElement?.id !== "ephemeris-date-time" &&
        document.activeElement?.id !== "ephemeris-year-scrubber"
      ) {
        setPendingValue(inputValueFor(current));
      }

      if (useEphemerisStore.getState().loadStatus === "loading") return;

      const currentBundle = useEphemerisStore.getState().bundle;
      const observedAt = Date.parse(currentBundle.observedAt);
      const distanceDays =
        Math.abs(current - observedAt) / MILLISECONDS_PER_DAY;
      const sourceWindow = currentBundle.windows?.[0];
      const needsSourceWindow = sourceWindow
        ? current <=
            Date.parse(sourceWindow.startAt) +
              WINDOW_PREFETCH_MARGIN_DAYS * MILLISECONDS_PER_DAY ||
          current >=
            Date.parse(sourceWindow.endAt) -
              WINDOW_PREFETCH_MARGIN_DAYS * MILLISECONDS_PER_DAY
        : distanceDays >= AUTOMATIC_REFRESH_DAYS;
      const approximatePlayback =
        simulationState.timeScale === SECONDS_PER_JULIAN_YEAR &&
        !simulationState.isPaused;
      const atBoundary = simulationState.boundaryReached !== null;
      const automaticRequestKey = `${Math.round(current / (6 * 60 * 60 * 1_000))}`;

      if (!needsSourceWindow) {
        lastAutomaticRequestKey.current = null;
      } else if (
        !approximatePlayback &&
        !atBoundary &&
        !isScrubbing &&
        Date.now() - lastAutomaticRequestRealMs.current >= 60_000 &&
        lastAutomaticRequestKey.current !== automaticRequestKey
      ) {
        lastAutomaticRequestKey.current = automaticRequestKey;
        lastAutomaticRequestRealMs.current = Date.now();
        void loadAt(current, false, false);
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, [isScrubbing, loadAt, syncSimulationClock]);

  const navigateTo = (timestamp: number) => {
    const target = clampSimulationTimestamp(timestamp, range);
    void loadAt(target);
  };

  const stepByDays = (days: number) =>
    navigateTo(displayedAt + days * MILLISECONDS_PER_DAY);

  const stepByYears = (years: number) =>
    navigateTo(addCalendarYearsSafely(displayedAt, years));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const timestamp = inputTimestamp(pendingValue, range);
    if (timestamp === null) {
      setError(
        `Choose a UTC date from ${inputValueFor(range.minimumUtcMs)} through ${inputValueFor(range.maximumUtcMs)}.`,
      );
      return;
    }
    navigateTo(timestamp);
  };

  const commitScrub = () => {
    if (!isScrubbing) return;
    if (scrubTimer.current !== null) window.clearTimeout(scrubTimer.current);
    scrubTimer.current = null;
    setIsScrubbing(false);
    void loadAt(
      addCalendarYearsSafely(range.anchorUtcMs, scrubYearOffset),
      true,
      true,
    );
  };

  const previewScrub = (offset: number) => {
    if (scrubTimer.current !== null) window.clearTimeout(scrubTimer.current);
    const timestamp = addCalendarYearsSafely(range.anchorUtcMs, offset);
    setIsScrubbing(true);
    setScrubYearOffset(offset);
    setDisplayedAt(timestamp);
    setPendingValue(inputValueFor(timestamp));
    setSimulationTime(timestamp);
    scrubTimer.current = window.setTimeout(() => {
      setIsScrubbing(false);
      void loadAt(timestamp, true, true);
      scrubTimer.current = null;
    }, SCRUB_DEBOUNCE_MS);
  };

  const acceleratedPreview =
    (timeScale === SECONDS_PER_JULIAN_YEAR && !isPaused) || isScrubbing;
  const sourceStatus = acceleratedPreview
    ? "Approximate preview"
    : {
        current:
          bundle.metadata.targetFrame === "mixed-barycenters"
            ? "JPL barycenter vector"
            : "JPL computed vector",
        fallback: "Verified JPL fallback",
        loading: "Computing positions…",
        error: "Previous solution retained",
      }[loadStatus];
  const currentLabel = dateTimeFormatter.format(new Date(displayedAt));
  const observedLabel = dateTimeFormatter.format(new Date(bundle.observedAt));
  const retrievedLabel = dateTimeFormatter.format(new Date(bundle.retrievedAt));
  const boundaryMessage =
    boundaryReached === "maximum"
      ? "Maximum supported date reached"
      : boundaryReached === "minimum"
        ? "Minimum supported date reached"
        : null;
  const statusDescription = boundaryMessage
    ? boundaryMessage
    : acceleratedPreview
      ? `Approximate local osculating preview from vector epoch ${observedLabel} TDB. Pause or release the scrubber to request the exact date.`
      : loadStatus === "error" && errorMessage
        ? errorMessage
        : `Vector epoch ${observedLabel} TDB. Retrieved ${retrievedLabel} UTC.${
            bundle.metadata.barycenterPlanetIds?.length
              ? ` Long-range Horizons barycenters: ${bundle.metadata.barycenterPlanetIds.join(", ")}.`
              : ""
          }`;
  const canGoBackward = displayedAt > range.minimumUtcMs;
  const canGoForward = displayedAt < range.maximumUtcMs;

  const copyLink = async () => {
    updateUrl(displayedAt);
    if (!navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_500);
  };

  const goNow = () => {
    resetSimulation();
    const now = useSimulationStore.getState().simulationAtMs;
    void loadAt(now);
  };

  if (!clockReady) {
    return (
      <aside
        aria-busy="true"
        aria-label="Ephemeris time controls"
        className={styles.timeDock}
      >
        <p className={styles.timePreparing} role="status">
          <small>Horizons ephemeris · TDB</small>
          <span>Preparing current UTC…</span>
        </p>
      </aside>
    );
  }

  if (!timePanelExpanded) {
    return (
      <aside aria-label="Ephemeris time controls" className={styles.timeDock}>
        <button
          aria-controls="ephemeris-control-panel"
          aria-expanded="false"
          aria-label="Open ephemeris time controls"
          className={styles.timeDockButton}
          onClick={toggleTimePanel}
          type="button"
        >
          <span>
            <small>Horizons ephemeris · TDB</small>
            <time dateTime={new Date(displayedAt).toISOString()}>
              {currentLabel} UTC
            </time>
          </span>
          <span className={styles.sourceStatus} data-status={loadStatus}>
            {sourceStatus}
          </span>
          <span aria-hidden="true">↓</span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Ephemeris time controls"
      className={styles.timePanel}
      id="ephemeris-control-panel"
    >
      <div className={styles.timeHeader}>
        <div>
          <p className={styles.timeEyebrow}>Horizons ephemeris · TDB</p>
          <time dateTime={new Date(displayedAt).toISOString()}>
            {currentLabel} UTC
          </time>
        </div>
        <div className={styles.timeHeaderActions}>
          <span className={styles.sourceStatus} data-status={loadStatus}>
            {sourceStatus}
          </span>
          <button
            aria-controls="ephemeris-control-panel"
            aria-expanded="true"
            aria-label="Collapse ephemeris time controls"
            className={styles.timeCollapseButton}
            onClick={toggleTimePanel}
            type="button"
          >
            ↑
          </button>
        </div>
      </div>

      <form className={styles.timeForm} onSubmit={handleSubmit}>
        <div className={styles.timeSteps}>
          <button
            disabled={!canGoBackward}
            onClick={() => stepByYears(-10)}
            type="button"
          >
            −10y
          </button>
          <button
            disabled={!canGoBackward}
            onClick={() => stepByYears(-1)}
            type="button"
          >
            −1y
          </button>
          <button
            disabled={!canGoBackward}
            onClick={() => stepByDays(-30)}
            type="button"
          >
            −30d
          </button>
          <button
            disabled={!canGoBackward}
            onClick={() => stepByDays(-1)}
            type="button"
          >
            −1d
          </button>
        </div>
        <label className={styles.dateTimeField} htmlFor="ephemeris-date-time">
          <span>UTC date and time</span>
          <input
            id="ephemeris-date-time"
            max={inputValueFor(range.maximumUtcMs)}
            min={inputValueFor(range.minimumUtcMs)}
            onChange={(event) => setPendingValue(event.target.value)}
            step="0.001"
            type="datetime-local"
            value={pendingValue}
          />
        </label>
        <button
          className={styles.applyTimeButton}
          disabled={loadStatus === "loading"}
          type="submit"
        >
          Apply
        </button>
        <div className={styles.timeSteps}>
          <button
            disabled={!canGoForward}
            onClick={() => stepByDays(1)}
            type="button"
          >
            +1d
          </button>
          <button
            disabled={!canGoForward}
            onClick={() => stepByDays(30)}
            type="button"
          >
            +30d
          </button>
          <button
            disabled={!canGoForward}
            onClick={() => stepByYears(1)}
            type="button"
          >
            +1y
          </button>
          <button
            disabled={!canGoForward}
            onClick={() => stepByYears(10)}
            type="button"
          >
            +10y
          </button>
        </div>
      </form>

      <label className={styles.timelineField} htmlFor="ephemeris-year-scrubber">
        <span>
          General date · {scrubYearOffset > 0 ? "+" : ""}
          {scrubYearOffset} years from session start
        </span>
        <input
          aria-describedby="ephemeris-range-bounds"
          id="ephemeris-year-scrubber"
          max="600"
          min="-500"
          onBlur={commitScrub}
          onChange={(event) => previewScrub(Number(event.target.value))}
          onKeyUp={commitScrub}
          onPointerUp={commitScrub}
          step="1"
          type="range"
          value={scrubYearOffset}
        />
        <span className={styles.timelineRegions} aria-hidden="true">
          <span>Past</span>
          <span>Now</span>
          <span>Future</span>
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
        <div>
          <button onClick={goNow} type="button">
            Now
          </button>
          <button onClick={() => void copyLink()} type="button">
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>
      <p className={styles.ephemerisMethod}>
        Sun-centred geometric vectors · Ecliptic J2000 / ICRF · AU. Exact dates
        use JPL Horizons; accelerated playback and active scrubbing are
        explicitly labelled osculating-orbit previews.
      </p>
      {isPaused ? (
        <p className="sr-only">The ephemeris clock is paused.</p>
      ) : null}
    </aside>
  );
}
