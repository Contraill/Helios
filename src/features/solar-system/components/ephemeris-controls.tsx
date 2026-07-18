"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import styles from "@/app/explore/explore.module.css";
import {
  MAX_PROPAGATION_DAYS,
  ephemerisBundleSchema,
} from "@/lib/data/ephemeris/models";
import { useEphemerisStore } from "@/stores/ephemeris-store";
import {
  currentSimulationTimeMs,
  useSimulationStore,
} from "@/stores/simulation-store";

const MILLISECONDS_PER_DAY = 86_400_000;
const AUTOMATIC_REFRESH_DAYS = MAX_PROPAGATION_DAYS - 30;
const MINIMUM_TIME = Date.UTC(1900, 0, 1);
const MAXIMUM_TIME = Date.UTC(2100, 11, 31, 23, 59);

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

function inputValueFor(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 16);
}

function inputTimestamp(value: string): number | null {
  const timestamp = Date.parse(`${value}:00Z`);
  return Number.isFinite(timestamp) &&
    timestamp >= MINIMUM_TIME &&
    timestamp <= MAXIMUM_TIME
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

export function EphemerisControls() {
  const bundle = useEphemerisStore((state) => state.bundle);
  const loadStatus = useEphemerisStore((state) => state.loadStatus);
  const errorMessage = useEphemerisStore((state) => state.errorMessage);
  const beginLoading = useEphemerisStore((state) => state.beginLoading);
  const setBundle = useEphemerisStore((state) => state.setBundle);
  const setError = useEphemerisStore((state) => state.setError);
  const isPaused = useSimulationStore((state) => state.isPaused);
  const setSimulationTime = useSimulationStore(
    (state) => state.setSimulationTime,
  );
  const [displayedAt, setDisplayedAt] = useState(
    useSimulationStore.getState().simulationAtMs,
  );
  const [pendingValue, setPendingValue] = useState(inputValueFor(displayedAt));
  const [timelineOrigin] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const requestController = useRef<AbortController | null>(null);
  const mounted = useRef(false);

  const updateUrl = useCallback((timestamp: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("at", new Date(timestamp).toISOString());
    window.history.replaceState(window.history.state, "", url);
  }, []);

  const loadAt = useCallback(
    async (timestamp: number, shareable = true) => {
      const previousTimestamp = currentSimulationTimeMs(
        useSimulationStore.getState(),
      );
      requestController.current?.abort();
      const controller = new AbortController();
      requestController.current = controller;
      beginLoading();
      setDisplayedAt(timestamp);
      setPendingValue(inputValueFor(timestamp));
      if (shareable) updateUrl(timestamp);

      try {
        const response = await fetch(
          `/api/ephemeris?at=${encodeURIComponent(new Date(timestamp).toISOString())}`,
          {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        );
        const raw: unknown = await response.json();
        if (!response.ok) throw new Error(requestErrorMessage(raw));
        setBundle(ephemerisBundleSchema.parse(raw));
        setSimulationTime(timestamp);
        setDisplayedAt(timestamp);
        setPendingValue(inputValueFor(timestamp));
      } catch (error) {
        if (controller.signal.aborted) return;
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
      const requested = new URL(window.location.href).searchParams.get("at");
      const requestedTimestamp = requested ? Date.parse(requested) : Number.NaN;
      const initialTimestamp =
        Number.isFinite(requestedTimestamp) &&
        requestedTimestamp >= MINIMUM_TIME &&
        requestedTimestamp <= MAXIMUM_TIME
          ? requestedTimestamp
          : Date.now();
      void loadAt(initialTimestamp, Boolean(requested));
    };
    void initialize();
    return () => {
      cancelled = true;
      requestController.current?.abort();
    };
  }, [loadAt]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (useEphemerisStore.getState().loadStatus === "loading") return;
      const current = currentSimulationTimeMs(useSimulationStore.getState());
      setDisplayedAt(current);
      if (
        document.activeElement?.id !== "ephemeris-date-time" &&
        document.activeElement?.id !== "ephemeris-timeline"
      ) {
        setPendingValue(inputValueFor(current));
      }

      const observedAt = Date.parse(
        useEphemerisStore.getState().bundle.observedAt,
      );
      const distanceDays =
        Math.abs(current - observedAt) / MILLISECONDS_PER_DAY;
      if (
        distanceDays >= AUTOMATIC_REFRESH_DAYS &&
        useEphemerisStore.getState().loadStatus !== "loading"
      ) {
        void loadAt(current, false);
      }
    }, 500);
    return () => window.clearInterval(interval);
  }, [loadAt]);

  const navigateTo = (timestamp: number) => {
    if (timestamp < MINIMUM_TIME || timestamp > MAXIMUM_TIME) return;
    void loadAt(timestamp);
  };

  const stepByDays = (days: number) =>
    navigateTo(displayedAt + days * MILLISECONDS_PER_DAY);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const timestamp = inputTimestamp(pendingValue);
    if (timestamp === null) {
      setError("Choose a UTC date between 1900 and 2100.");
      return;
    }
    navigateTo(timestamp);
  };

  const pendingTimestamp = inputTimestamp(pendingValue) ?? displayedAt;
  const dayOffset = Math.max(
    -3650,
    Math.min(
      3650,
      Math.round((pendingTimestamp - timelineOrigin) / MILLISECONDS_PER_DAY),
    ),
  );
  const sourceStatus = {
    current: "JPL computed vector",
    fallback: "Verified JPL fallback",
    loading: "Computing positions…",
    error: "Previous solution retained",
  }[loadStatus];
  const currentLabel = dateTimeFormatter.format(new Date(displayedAt));
  const observedLabel = dateTimeFormatter.format(new Date(bundle.observedAt));
  const retrievedLabel = dateTimeFormatter.format(new Date(bundle.retrievedAt));
  const statusDescription =
    loadStatus === "error" && errorMessage
      ? errorMessage
      : `Vector epoch ${observedLabel} TDB. Retrieved ${retrievedLabel} UTC.`;

  const copyLink = async () => {
    updateUrl(displayedAt);
    if (!navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_500);
  };

  return (
    <aside aria-label="Ephemeris time controls" className={styles.timePanel}>
      <div className={styles.timeHeader}>
        <div>
          <p className={styles.timeEyebrow}>Horizons ephemeris · TDB</p>
          <time dateTime={new Date(displayedAt).toISOString()}>
            {currentLabel} UTC
          </time>
        </div>
        <span className={styles.sourceStatus} data-status={loadStatus}>
          {sourceStatus}
        </span>
      </div>

      <form className={styles.timeForm} onSubmit={handleSubmit}>
        <div className={styles.timeSteps}>
          <button onClick={() => stepByDays(-30)} type="button">
            −30d
          </button>
          <button onClick={() => stepByDays(-1)} type="button">
            −1d
          </button>
        </div>
        <label className={styles.dateTimeField} htmlFor="ephemeris-date-time">
          <span>UTC date and time</span>
          <input
            id="ephemeris-date-time"
            max="2100-12-31T23:59"
            min="1900-01-01T00:00"
            onChange={(event) => setPendingValue(event.target.value)}
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
          <button onClick={() => stepByDays(1)} type="button">
            +1d
          </button>
          <button onClick={() => stepByDays(30)} type="button">
            +30d
          </button>
        </div>
      </form>

      <label className={styles.timelineField} htmlFor="ephemeris-timeline">
        <span>
          Timeline · {dayOffset >= 0 ? "+" : ""}
          {dayOffset} days from now
        </span>
        <input
          id="ephemeris-timeline"
          max="3650"
          min="-3650"
          onChange={(event) =>
            setPendingValue(
              inputValueFor(
                timelineOrigin +
                  Number(event.target.value) * MILLISECONDS_PER_DAY,
              ),
            )
          }
          step="1"
          type="range"
          value={dayOffset}
        />
      </label>

      <div className={styles.timeFooter}>
        <p aria-live="polite">{statusDescription}</p>
        <div>
          <button onClick={() => navigateTo(Date.now())} type="button">
            Now
          </button>
          <button onClick={() => void copyLink()} type="button">
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>
      <p className={styles.ephemerisMethod}>
        Sun-centred geometric vectors · Ecliptic J2000 / ICRF · AU. Motion
        between samples uses bounded osculating-orbit propagation; it is not
        live telemetry.
      </p>
      {isPaused ? (
        <p className="sr-only">The ephemeris clock is paused.</p>
      ) : null}
    </aside>
  );
}
