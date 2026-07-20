"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

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
import { exploreSceneCopy } from "@/lib/i18n/explore-scene-copy";
import { useEphemerisStore } from "@/stores/ephemeris-store";
import {
  currentSimulationTimeMs,
  useSimulationStore,
} from "@/stores/simulation-store";

const MILLISECONDS_PER_DAY = 86_400_000;
const AUTOMATIC_REFRESH_DAYS = MAX_PROPAGATION_DAYS - 30;
const WINDOW_PREFETCH_MARGIN_DAYS = 90;
const CLOCK_POLL_MS = 250;

export interface EphemerisControllerSnapshot {
  readonly clockReady: boolean;
  readonly copied: boolean;
  readonly displayedAt: number;
  readonly isEditing: boolean;
  readonly isScrubbing: boolean;
  readonly pendingValue: string;
  readonly scrubYearOffset: number;
}

function inputValueFor(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 23);
}

export function inputTimestamp(
  value: string,
  range: SimulationRange,
): number | null {
  const timestamp = Date.parse(
    `${value.length === 16 ? `${value}:00` : value}Z`,
  );
  return Number.isFinite(timestamp) && isWithinSimulationRange(timestamp, range)
    ? timestamp
    : null;
}

export function yearOffsetFromAnchor(
  timestamp: number,
  range: SimulationRange,
) {
  return Math.max(
    -500,
    Math.min(
      600,
      new Date(timestamp).getUTCFullYear() -
        new Date(range.anchorUtcMs).getUTCFullYear(),
    ),
  );
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
  return exploreSceneCopy.ephemeris.requestFailed;
}

const initialSnapshot: EphemerisControllerSnapshot = Object.freeze({
  clockReady: false,
  copied: false,
  displayedAt: 0,
  isEditing: false,
  isScrubbing: false,
  pendingValue: inputValueFor(0),
  scrubYearOffset: 0,
});

let controllerSnapshot = initialSnapshot;
const controllerListeners = new Set<() => void>();

function publishControllerSnapshot(
  patch: Partial<EphemerisControllerSnapshot>,
): void {
  controllerSnapshot = Object.freeze({ ...controllerSnapshot, ...patch });
  for (const listener of controllerListeners) listener();
}

function resetControllerSnapshot(): void {
  controllerSnapshot = initialSnapshot;
  for (const listener of controllerListeners) listener();
}

function subscribeController(listener: () => void): () => void {
  controllerListeners.add(listener);
  return () => controllerListeners.delete(listener);
}

export function useEphemerisControllerSnapshot(): EphemerisControllerSnapshot {
  return useSyncExternalStore(
    subscribeController,
    () => controllerSnapshot,
    () => initialSnapshot,
  );
}

export interface EphemerisControllerApi {
  readonly beginEdit: () => void;
  readonly commitScrub: () => void;
  readonly copyLink: () => Promise<void>;
  readonly discardDraft: () => void;
  readonly goNow: () => void;
  readonly navigateTo: (timestamp: number) => void;
  readonly previewScrub: (offset: number) => void;
  readonly refreshView: () => void;
  readonly setPendingValue: (value: string) => void;
  readonly stepByDays: (days: number) => void;
  readonly stepByYears: (years: number) => void;
}

export function useEphemerisController(): EphemerisControllerApi {
  const requestController = useRef<AbortController | null>(null);
  const lastAutomaticRequestKey = useRef<string | null>(null);
  const lastAutomaticRequestRealMs = useRef(0);
  const lastCompletedRequestKey = useRef<string | null>(null);
  const inFlightRequest = useRef<{
    key: string;
    promise: Promise<void>;
  } | null>(null);
  const initialized = useRef(false);

  const updateUrl = useCallback((timestamp: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("at", new Date(timestamp).toISOString());
    window.history.replaceState(window.history.state, "", url);
  }, []);

  const publishClock = useCallback((timestamp: number) => {
    const range = useSimulationStore.getState().range;
    const preserveDraft =
      controllerSnapshot.isEditing || controllerSnapshot.isScrubbing;
    publishControllerSnapshot({
      displayedAt: timestamp,
      ...(preserveDraft ? {} : { pendingValue: inputValueFor(timestamp) }),
      scrubYearOffset: yearOffsetFromAnchor(timestamp, range),
    });
  }, []);

  const loadAt = useCallback(
    (
      timestamp: number,
      shareable = true,
      synchronizeClock = true,
    ): Promise<void> => {
      const simulationState = useSimulationStore.getState();
      if (!isWithinSimulationRange(timestamp, simulationState.range)) {
        useEphemerisStore
          .getState()
          .setError(exploreSceneCopy.ephemeris.chooseInsideRange);
        return Promise.resolve();
      }

      const target = clampSimulationTimestamp(timestamp, simulationState.range);
      const requestKey = `${target}:${simulationState.range.anchorUtcMs}`;
      if (lastCompletedRequestKey.current === requestKey) {
        if (shareable) updateUrl(target);
        if (synchronizeClock) {
          useSimulationStore.getState().setSimulationTime(target);
        }
        publishClock(target);
        return Promise.resolve();
      }
      if (inFlightRequest.current?.key === requestKey) {
        return inFlightRequest.current.promise;
      }

      const previousTimestamp = currentSimulationTimeMs(simulationState);
      requestController.current?.abort();
      const controller = new AbortController();
      requestController.current = controller;
      // Any explicit or bootstrap request owns the refresh window. A failed
      // provider response must not be followed by the 250 ms clock poll as a
      // second "initial" request with a slightly advanced timestamp.
      lastAutomaticRequestRealMs.current = Date.now();
      useEphemerisStore.getState().beginLoading();
      publishClock(target);
      if (shareable) updateUrl(target);
      if (synchronizeClock) {
        useSimulationStore.getState().setSimulationTime(target);
      }

      const promise = (async () => {
        try {
          const response = await fetch(
            `/api/ephemeris?at=${encodeURIComponent(new Date(target).toISOString())}&anchor=${encodeURIComponent(new Date(simulationState.range.anchorUtcMs).toISOString())}`,
            {
              headers: { Accept: "application/json" },
              signal: controller.signal,
            },
          );
          const raw: unknown = await response.json();
          if (!response.ok) throw new Error(requestErrorMessage(raw));
          useEphemerisStore
            .getState()
            .setBundle(ephemerisBundleSchema.parse(raw));
          lastCompletedRequestKey.current = requestKey;
          publishClock(currentSimulationTimeMs(useSimulationStore.getState()));
        } catch (error) {
          if (controller.signal.aborted) return;
          if (synchronizeClock) {
            useSimulationStore.getState().setSimulationTime(previousTimestamp);
          }
          publishClock(
            synchronizeClock
              ? previousTimestamp
              : currentSimulationTimeMs(useSimulationStore.getState()),
          );
          useEphemerisStore
            .getState()
            .setError(
              error instanceof Error
                ? error.message
                : exploreSceneCopy.ephemeris.requestFailed,
            );
        } finally {
          if (inFlightRequest.current?.key === requestKey) {
            inFlightRequest.current = null;
          }
        }
      })();
      inFlightRequest.current = { key: requestKey, promise };
      return promise;
    },
    [publishClock, updateUrl],
  );

  const refreshView = useCallback(() => {
    if (!controllerSnapshot.clockReady) return;
    publishClock(currentSimulationTimeMs(useSimulationStore.getState()));
  }, [publishClock]);

  const navigateTo = useCallback(
    (timestamp: number) => {
      const target = clampSimulationTimestamp(
        timestamp,
        useSimulationStore.getState().range,
      );
      void loadAt(target);
    },
    [loadAt],
  );

  const stepByDays = useCallback(
    (days: number) => {
      navigateTo(controllerSnapshot.displayedAt + days * MILLISECONDS_PER_DAY);
    },
    [navigateTo],
  );

  const stepByYears = useCallback(
    (years: number) => {
      navigateTo(addCalendarYearsSafely(controllerSnapshot.displayedAt, years));
    },
    [navigateTo],
  );

  const commitScrub = useCallback(() => {
    if (!controllerSnapshot.isScrubbing) return;
    const range = useSimulationStore.getState().range;
    const timestamp = addCalendarYearsSafely(
      range.anchorUtcMs,
      controllerSnapshot.scrubYearOffset,
    );
    publishControllerSnapshot({ isScrubbing: false });
    void loadAt(timestamp, true, true);
  }, [loadAt]);

  const previewScrub = useCallback((offset: number) => {
    const range = useSimulationStore.getState().range;
    const timestamp = addCalendarYearsSafely(range.anchorUtcMs, offset);
    publishControllerSnapshot({
      displayedAt: timestamp,
      isScrubbing: true,
      ...(controllerSnapshot.isEditing
        ? {}
        : { pendingValue: inputValueFor(timestamp) }),
      scrubYearOffset: offset,
    });
  }, []);

  const goNow = useCallback(() => {
    useSimulationStore.getState().resetSimulation();
    const now = useSimulationStore.getState().simulationAtMs;
    lastCompletedRequestKey.current = null;
    void loadAt(now);
  }, [loadAt]);

  const copyLink = useCallback(async () => {
    updateUrl(controllerSnapshot.displayedAt);
    if (!navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(window.location.href);
    publishControllerSnapshot({ copied: true });
    window.setTimeout(
      () => publishControllerSnapshot({ copied: false }),
      1_500,
    );
  }, [updateUrl]);

  const beginEdit = useCallback(() => {
    publishControllerSnapshot({ isEditing: true });
  }, []);

  const setPendingValue = useCallback((pendingValue: string) => {
    publishControllerSnapshot({ isEditing: true, pendingValue });
  }, []);

  const discardDraft = useCallback(() => {
    const simulationState = useSimulationStore.getState();
    const timestamp = currentSimulationTimeMs(simulationState);
    publishControllerSnapshot({
      displayedAt: timestamp,
      isEditing: false,
      isScrubbing: false,
      pendingValue: inputValueFor(timestamp),
      scrubYearOffset: yearOffsetFromAnchor(timestamp, simulationState.range),
    });
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    let cancelled = false;

    const initialize = async () => {
      if (!useSimulationStore.persist.hasHydrated()) {
        await useSimulationStore.persist.rehydrate();
      }
      if (cancelled) return;
      const anchorUtcMs = Date.now();
      useSimulationStore.getState().initializeSimulationRange(anchorUtcMs);
      const sessionRange = useSimulationStore.getState().range;
      const requested = new URL(window.location.href).searchParams.get("at");
      const requestedTimestamp = requested ? Date.parse(requested) : Number.NaN;
      const initialTimestamp =
        Number.isFinite(requestedTimestamp) &&
        isWithinSimulationRange(requestedTimestamp, sessionRange)
          ? requestedTimestamp
          : anchorUtcMs;
      useSimulationStore.getState().setSimulationTime(initialTimestamp);
      publishControllerSnapshot({
        clockReady: true,
        displayedAt: initialTimestamp,
        pendingValue: inputValueFor(initialTimestamp),
        scrubYearOffset: yearOffsetFromAnchor(initialTimestamp, sessionRange),
      });
      void loadAt(initialTimestamp, Boolean(requested), false);
    };
    void initialize();

    const interval = window.setInterval(() => {
      if (!controllerSnapshot.clockReady) return;
      const simulationState = useSimulationStore.getState();
      const current = simulationState.syncSimulationClock();
      if (controllerListeners.size > 0 && !controllerSnapshot.isScrubbing) {
        publishClock(current);
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
      const automaticRequestKey = `${Math.round(current / (6 * 60 * 60 * 1_000))}`;

      if (!needsSourceWindow) {
        lastAutomaticRequestKey.current = null;
      } else if (
        !approximatePlayback &&
        simulationState.boundaryReached === null &&
        !controllerSnapshot.isScrubbing &&
        Date.now() - lastAutomaticRequestRealMs.current >= 60_000 &&
        lastAutomaticRequestKey.current !== automaticRequestKey
      ) {
        lastAutomaticRequestKey.current = automaticRequestKey;
        lastAutomaticRequestRealMs.current = Date.now();
        void loadAt(current, false, false);
      }
    }, CLOCK_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      requestController.current?.abort();
      initialized.current = false;
      resetControllerSnapshot();
    };
  }, [loadAt, publishClock]);

  return useMemo(
    () => ({
      beginEdit,
      commitScrub,
      copyLink,
      discardDraft,
      goNow,
      navigateTo,
      previewScrub,
      refreshView,
      setPendingValue,
      stepByDays,
      stepByYears,
    }),
    [
      beginEdit,
      commitScrub,
      copyLink,
      discardDraft,
      goNow,
      navigateTo,
      previewScrub,
      refreshView,
      setPendingValue,
      stepByDays,
      stepByYears,
    ],
  );
}
