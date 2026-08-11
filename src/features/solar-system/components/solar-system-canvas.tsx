"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Canvas, type RootState } from "@react-three/fiber";

import {
  markRendererAvailable,
  markRendererUnavailable,
  useAssetLoadingSnapshot,
} from "@/features/solar-system/lib/asset-loading-lifecycle";
import { consumeCelestialCameraGesture } from "@/features/solar-system/lib/pointer-interaction";
import { HIGH_VISUAL_CONTRACT } from "@/features/solar-system/lib/quality";
import {
  rendererPerformanceProfileForViewport,
  shouldUseContinuousRenderer,
  type RendererPerformanceProfile,
} from "@/features/solar-system/lib/renderer-performance-policy";
import type { ScenePlanet } from "@/features/solar-system/lib/scene-planets";
import { sceneProfileFor } from "@/features/solar-system/lib/scene-profiles";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import {
  WEBGL_RECOVERY_STABILITY_MS,
  WEBGL_RECOVERY_WATCHDOG_MS,
  shouldArmWebGLRecoveryWatchdog,
  shouldScheduleWebGLContextRecovery,
  webglRecoveryPlan,
  webglRecoveryStabilityAction,
  type WebGLContextPhase,
} from "@/features/solar-system/lib/webgl-context-recovery-policy";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";
import { getExplorePageCopy } from "@/lib/i18n/explore-page-copy";
import { siteCopy } from "@/lib/i18n/site-copy";
import { useExplorationStore } from "@/stores/exploration-store";
import { useGalacticContextStore } from "@/stores/galactic-context-store";
import { useLocaleStore } from "@/stores/locale-store";
import { useSimulationStore } from "@/stores/simulation-store";

import { ExploreOpeningLoader } from "./explore-opening-loader";
import { SceneErrorBoundary } from "./scene-error-boundary";
import { SceneFallback } from "./scene-fallback";
import { SceneRecoveryNotice } from "./scene-recovery-notice";
import { SecondaryAssetScheduler } from "./secondary-asset-scheduler";
import { SolarSystemScene } from "./solar-system-scene";

interface SolarSystemCanvasProps {
  scenePlanets: readonly ScenePlanet[];
  sceneSun: SceneSun;
}

let cachedWebGLAvailability: boolean | null = null;

function subscribeToVisibility(onStoreChange: () => void): () => void {
  document.addEventListener("visibilitychange", onStoreChange);
  return () => document.removeEventListener("visibilitychange", onStoreChange);
}

function documentIsVisible(): boolean {
  return document.visibilityState === "visible";
}

export function SolarSystemCanvas({
  scenePlanets,
  sceneSun,
}: SolarSystemCanvasProps) {
  const reducedMotion = useReducedMotionPreference();
  const clearSelection = useExplorationStore((state) => state.clearSelection);
  const cameraMode = useExplorationStore((state) => state.cameraMode);
  const hoveredBodyId = useExplorationStore((state) => state.hoveredBodyId);
  const galacticContextPhase = useGalacticContextStore((state) => state.phase);
  const scaleMode = useExplorationStore((state) => state.scaleMode);
  const simulationPaused = useSimulationStore((state) => state.isPaused);
  const bootstrap = useAssetLoadingSnapshot();
  const profile = sceneProfileFor(scaleMode);
  const locale = useLocaleStore((state) => state.locale);
  const copy = getExplorePageCopy(locale);
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(
    cachedWebGLAvailability,
  );
  const initialWebGLContextPhase: WebGLContextPhase =
    cachedWebGLAvailability === null
      ? "checking"
      : cachedWebGLAvailability
        ? "ready"
        : "failed";
  const [webglContextPhase, setWebglContextPhaseState] =
    useState<WebGLContextPhase>(initialWebGLContextPhase);
  const webglContextPhaseRef = useRef<WebGLContextPhase>(
    initialWebGLContextPhase,
  );
  const [rendererEpoch, setRendererEpoch] = useState(0);
  const [rendererRecoveryCount, setRendererRecoveryCount] = useState(0);
  const [rendererRecoveryAttempt, setRendererRecoveryAttempt] = useState(0);
  const [rendererStability, setRendererStability] = useState<
    "deferred" | "probation" | "settled"
  >("settled");
  const rendererCanvasCleanupRef = useRef<(() => void) | null>(null);
  const recoveryTimerRef = useRef<number | null>(null);
  const recoveryWatchdogRef = useRef<number | null>(null);
  const recoveryStabilityRef = useRef<number | null>(null);
  const probeFrameRef = useRef<number | null>(null);
  const recoveryAttemptRef = useRef(0);
  const [rendererProfile, setRendererProfile] =
    useState<RendererPerformanceProfile>({
      dpr: HIGH_VISUAL_CONTRACT.dpr,
      tier: "high",
    });
  const documentVisible = useSyncExternalStore(
    subscribeToVisibility,
    documentIsVisible,
    () => false,
  );
  const documentVisibleRef = useRef(documentVisible);
  const stableRendererDeferredRef = useRef(false);
  const recoveryStabilityPendingRef = useRef(false);
  const continuousRendering = shouldUseContinuousRenderer({
    cameraMode,
    documentVisible,
    galacticContextPhase,
    reducedMotion,
    simulationPaused,
  });

  const setWebglContextPhase = useCallback((next: WebGLContextPhase) => {
    webglContextPhaseRef.current = next;
    setWebglContextPhaseState(next);
  }, []);

  const cancelWebglProbe = useCallback(() => {
    if (probeFrameRef.current !== null) {
      window.cancelAnimationFrame(probeFrameRef.current);
      probeFrameRef.current = null;
    }
  }, []);

  const runWebglProbe = useCallback(() => {
    cancelWebglProbe();
    stableRendererDeferredRef.current = false;
    recoveryStabilityPendingRef.current = false;
    setRendererStability("settled");
    setWebglAvailable(null);
    setWebglContextPhase("checking");
    probeFrameRef.current = window.requestAnimationFrame(() => {
      probeFrameRef.current = null;
      const probe = document.createElement("canvas");
      const context =
        probe.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ??
        probe.getContext("webgl", { failIfMajorPerformanceCaveat: false });
      const available = Boolean(context);
      cachedWebGLAvailability = available;
      if (available) markRendererAvailable();
      setWebglAvailable(available);
      setWebglContextPhase(available ? "checking" : "failed");
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    });
  }, [cancelWebglProbe, setWebglContextPhase]);

  const cancelRecoveryDelay = useCallback(() => {
    if (recoveryTimerRef.current === null) return;
    window.clearTimeout(recoveryTimerRef.current);
    recoveryTimerRef.current = null;
  }, []);

  const cancelRecoveryWatchdog = useCallback(() => {
    if (recoveryWatchdogRef.current === null) return;
    window.clearTimeout(recoveryWatchdogRef.current);
    recoveryWatchdogRef.current = null;
  }, []);

  const cancelRecoveryStabilityTimer = useCallback(() => {
    if (recoveryStabilityRef.current === null) return;
    window.clearTimeout(recoveryStabilityRef.current);
    recoveryStabilityRef.current = null;
  }, []);

  const armRecoveryStabilityWindow = useCallback(() => {
    cancelRecoveryStabilityTimer();
    const stabilityAction = webglRecoveryStabilityAction(
      recoveryAttemptRef.current,
      webglContextPhaseRef.current,
      documentVisibleRef.current && document.visibilityState === "visible",
    );
    if (stabilityAction === "settled") {
      recoveryStabilityPendingRef.current = false;
      setRendererRecoveryAttempt(0);
      setRendererStability("settled");
      return;
    }

    recoveryStabilityPendingRef.current = true;
    setRendererStability("probation");
    if (stabilityAction === "wait") return;

    recoveryStabilityRef.current = window.setTimeout(() => {
      recoveryStabilityRef.current = null;
      if (
        !documentVisibleRef.current ||
        document.visibilityState !== "visible" ||
        webglContextPhaseRef.current !== "ready"
      ) {
        return;
      }
      recoveryStabilityPendingRef.current = false;
      recoveryAttemptRef.current = 0;
      setRendererRecoveryAttempt(0);
      setRendererStability("settled");
    }, WEBGL_RECOVERY_STABILITY_MS);
  }, [cancelRecoveryStabilityTimer]);

  const clearRecoveryTimers = useCallback(() => {
    cancelRecoveryDelay();
    cancelRecoveryWatchdog();
    cancelRecoveryStabilityTimer();
  }, [
    cancelRecoveryDelay,
    cancelRecoveryStabilityTimer,
    cancelRecoveryWatchdog,
  ]);

  const armRecoveryWatchdog = useCallback(() => {
    cancelRecoveryWatchdog();
    if (
      !shouldArmWebGLRecoveryWatchdog(
        webglContextPhaseRef.current,
        documentVisibleRef.current,
      )
    ) {
      return;
    }

    recoveryWatchdogRef.current = window.setTimeout(() => {
      recoveryWatchdogRef.current = null;
      if (!documentVisibleRef.current) return;
      rendererCanvasCleanupRef.current?.();
      rendererCanvasCleanupRef.current = null;
      setWebglContextPhase("failed");
    }, WEBGL_RECOVERY_WATCHDOG_MS);
  }, [cancelRecoveryWatchdog, setWebglContextPhase]);

  const markRendererStable = useCallback(() => {
    cancelRecoveryWatchdog();
    if (!documentVisibleRef.current) {
      cancelRecoveryStabilityTimer();
      stableRendererDeferredRef.current = true;
      recoveryStabilityPendingRef.current = false;
      setRendererStability("deferred");
      setWebglContextPhase("recovering");
      return;
    }

    stableRendererDeferredRef.current = false;
    setWebglContextPhase("ready");
    armRecoveryStabilityWindow();
  }, [
    armRecoveryStabilityWindow,
    cancelRecoveryStabilityTimer,
    cancelRecoveryWatchdog,
    setWebglContextPhase,
  ]);

  const remountRenderer = useCallback(() => {
    rendererCanvasCleanupRef.current?.();
    rendererCanvasCleanupRef.current = null;
    stableRendererDeferredRef.current = false;
    recoveryStabilityPendingRef.current = false;
    setRendererStability("settled");
    setWebglContextPhase("recovering");
    setRendererEpoch((value) => value + 1);
    armRecoveryWatchdog();
  }, [armRecoveryWatchdog, setWebglContextPhase]);

  const queueRendererRecovery = useCallback(
    (attempt: number, visible: boolean) => {
      cancelRecoveryDelay();
      const plan = webglRecoveryPlan(attempt, visible);
      if (plan.action === "fail") {
        rendererCanvasCleanupRef.current?.();
        rendererCanvasCleanupRef.current = null;
        setWebglContextPhase("failed");
        return;
      }
      if (plan.action === "wait") return;

      recoveryTimerRef.current = window.setTimeout(() => {
        recoveryTimerRef.current = null;
        if (!documentVisibleRef.current) return;
        remountRenderer();
      }, plan.delayMs);
    },
    [cancelRecoveryDelay, remountRenderer, setWebglContextPhase],
  );

  const scheduleRendererRecovery = useCallback(() => {
    if (
      !shouldScheduleWebGLContextRecovery(
        webglContextPhaseRef.current,
        stableRendererDeferredRef.current,
      )
    ) {
      return;
    }
    stableRendererDeferredRef.current = false;
    recoveryStabilityPendingRef.current = false;
    setRendererStability("settled");
    clearRecoveryTimers();
    const nextAttempt = recoveryAttemptRef.current + 1;
    recoveryAttemptRef.current = nextAttempt;
    setRendererRecoveryAttempt(nextAttempt);
    setRendererRecoveryCount((value) => value + 1);
    setWebglContextPhase("lost");
    queueRendererRecovery(nextAttempt, documentVisibleRef.current);
  }, [clearRecoveryTimers, queueRendererRecovery, setWebglContextPhase]);

  const handleRendererError = useCallback(() => {
    clearRecoveryTimers();
    stableRendererDeferredRef.current = false;
    recoveryStabilityPendingRef.current = false;
    setRendererStability("settled");
    rendererCanvasCleanupRef.current?.();
    rendererCanvasCleanupRef.current = null;
    setWebglContextPhase("failed");
  }, [clearRecoveryTimers, setWebglContextPhase]);

  const attachRendererLifecycle = useCallback(
    ({ gl }: RootState) => {
      rendererCanvasCleanupRef.current?.();
      clearRecoveryTimers();
      const canvas = gl.domElement;

      const handleContextLost = (event: Event) => {
        event.preventDefault();
        scheduleRendererRecovery();
      };
      const handleContextRestored = () => {
        clearRecoveryTimers();
        markRendererStable();
      };

      canvas.addEventListener("webglcontextlost", handleContextLost, {
        passive: false,
      });
      canvas.addEventListener("webglcontextrestored", handleContextRestored);
      rendererCanvasCleanupRef.current = () => {
        canvas.removeEventListener("webglcontextlost", handleContextLost);
        canvas.removeEventListener(
          "webglcontextrestored",
          handleContextRestored,
        );
      };

      markRendererStable();
    },
    [clearRecoveryTimers, markRendererStable, scheduleRendererRecovery],
  );

  const retryRenderer = useCallback(() => {
    clearRecoveryTimers();
    stableRendererDeferredRef.current = false;
    recoveryStabilityPendingRef.current = false;
    recoveryAttemptRef.current = 0;
    setRendererRecoveryAttempt(0);
    setRendererStability("settled");
    if (webglAvailable === false) {
      cachedWebGLAvailability = null;
      runWebglProbe();
      return;
    }
    remountRenderer();
  }, [clearRecoveryTimers, remountRenderer, runWebglProbe, webglAvailable]);

  useEffect(() => {
    if (cachedWebGLAvailability !== null) return;
    const probeTimer = window.setTimeout(runWebglProbe, 0);
    return () => window.clearTimeout(probeTimer);
  }, [runWebglProbe]);

  useEffect(
    () => () => {
      cancelWebglProbe();
      clearRecoveryTimers();
      stableRendererDeferredRef.current = false;
      recoveryStabilityPendingRef.current = false;
      rendererCanvasCleanupRef.current?.();
      rendererCanvasCleanupRef.current = null;
    },
    [cancelWebglProbe, clearRecoveryTimers],
  );

  useEffect(() => {
    documentVisibleRef.current = documentVisible;
    const phase = webglContextPhaseRef.current;

    if (!documentVisible) {
      cancelRecoveryDelay();
      cancelRecoveryWatchdog();
      cancelRecoveryStabilityTimer();
      return;
    }

    if (stableRendererDeferredRef.current) {
      markRendererStable();
      return;
    }
    if (phase === "lost" && recoveryAttemptRef.current > 0) {
      queueRendererRecovery(recoveryAttemptRef.current, true);
      return;
    }
    if (phase === "ready" && recoveryStabilityPendingRef.current) {
      armRecoveryStabilityWindow();
      return;
    }
    if (shouldArmWebGLRecoveryWatchdog(phase, true)) {
      armRecoveryWatchdog();
    }
  }, [
    armRecoveryStabilityWindow,
    armRecoveryWatchdog,
    cancelRecoveryDelay,
    cancelRecoveryStabilityTimer,
    cancelRecoveryWatchdog,
    documentVisible,
    markRendererStable,
    queueRendererRecovery,
  ]);

  useEffect(() => {
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const updateRendererProfile = () => {
      const navigatorHints = navigator as Navigator & {
        readonly deviceMemory?: number;
      };
      const next = rendererPerformanceProfileForViewport(
        HIGH_VISUAL_CONTRACT.dpr,
        window.visualViewport?.width ?? window.innerWidth,
        window.visualViewport?.height ?? window.innerHeight,
        {
          coarsePointer: coarsePointerQuery.matches,
          deviceMemoryGb: navigatorHints.deviceMemory,
          hardwareConcurrency: navigator.hardwareConcurrency,
        },
      );
      setRendererProfile((current) =>
        current.tier === next.tier &&
        current.dpr[0] === next.dpr[0] &&
        current.dpr[1] === next.dpr[1]
          ? current
          : next,
      );
    };

    updateRendererProfile();
    window.addEventListener("resize", updateRendererProfile);
    window.addEventListener("orientationchange", updateRendererProfile);
    window.visualViewport?.addEventListener("resize", updateRendererProfile);
    coarsePointerQuery.addEventListener?.("change", updateRendererProfile);
    return () => {
      window.removeEventListener("resize", updateRendererProfile);
      window.removeEventListener("orientationchange", updateRendererProfile);
      window.visualViewport?.removeEventListener(
        "resize",
        updateRendererProfile,
      );
      coarsePointerQuery.removeEventListener?.("change", updateRendererProfile);
    };
  }, []);

  useEffect(() => {
    if (webglAvailable === false) markRendererUnavailable();
  }, [webglAvailable]);

  return (
    <div
      className={`solar-canvas-shell${hoveredBodyId ? " solar-canvas-shell--interactive" : ""}`}
      data-body-profile={profile.scale.bodyProfile}
      data-bootstrap-ready={bootstrap.blockingReady}
      data-camera-mode={cameraMode}
      data-degraded-assets={bootstrap.degradedOwners.length}
      data-distance-profile={profile.scale.distanceProfile}
      data-document-visibility={documentVisible ? "visible" : "hidden"}
      data-galactic-context={galacticContextPhase}
      data-webgl-context={webglContextPhase}
      data-webgl-availability={
        webglAvailable === null
          ? "checking"
          : webglAvailable
            ? "available"
            : "unavailable"
      }
      data-webgl-recovery-attempt={rendererRecoveryAttempt}
      data-webgl-recovery-count={rendererRecoveryCount}
      data-webgl-stability={rendererStability}
      data-render-loop={continuousRendering ? "continuous" : "demand"}
      data-renderer-dpr={`${rendererProfile.dpr[0]}-${rendererProfile.dpr[1]}`}
      data-renderer-tier={rendererProfile.tier}
      data-scene-profile={profile.id}
      data-secondary-stage={bootstrap.secondaryStageStarted}
      data-visual-contract="high"
    >
      {webglAvailable === null ? (
        <div className="scene-loading" role="status">
          <span>{copy.loading}</span>
        </div>
      ) : webglAvailable && webglContextPhase !== "failed" ? (
        <SceneErrorBoundary
          fallback={<SceneFallback />}
          key={`renderer-boundary-${rendererEpoch}`}
          onError={handleRendererError}
        >
          <Canvas
            aria-hidden="true"
            key={`renderer-${rendererEpoch}`}
            camera={{
              far: 1_500_000,
              fov: 46,
              near: 0.000_000_1,
              position: [0, 48, 90],
            }}
            dpr={[...rendererProfile.dpr]}
            fallback={<SceneFallback />}
            frameloop={continuousRendering ? "always" : "demand"}
            gl={{
              alpha: false,
              antialias: true,
              logarithmicDepthBuffer: true,
              powerPreference: "high-performance",
            }}
            onCreated={attachRendererLifecycle}
            onPointerMissed={(event) => {
              if (event.button !== 0) return;
              if (consumeCelestialCameraGesture()) return;
              if (useExplorationStore.getState().cameraMode !== "free") {
                clearSelection();
              }
            }}
          >
            <Suspense fallback={null}>
              <SolarSystemScene
                reducedMotion={reducedMotion}
                scenePlanets={scenePlanets}
                sceneSun={sceneSun}
              />
            </Suspense>
          </Canvas>
        </SceneErrorBoundary>
      ) : webglAvailable ? null : (
        <SceneFallback />
      )}
      {webglAvailable === false ||
      (webglAvailable &&
        webglContextPhase !== "ready" &&
        webglContextPhase !== "checking") ? (
        <SceneRecoveryNotice
          body={copy.fallbackBody}
          failed={webglAvailable === false || webglContextPhase === "failed"}
          onRetry={retryRenderer}
          retryLabel={siteCopy[locale].errors.retry}
          title={copy.fallbackTitle}
        />
      ) : null}
      {galacticContextPhase !== "local" ? (
        <aside
          aria-live="polite"
          className="galactic-context-notice"
          data-phase={galacticContextPhase}
        >
          <span>{copy.galactic.marker}</span>
          <strong>{copy.galactic.title}</strong>
          <p>{copy.galactic.description}</p>
        </aside>
      ) : null}
      <ExploreOpeningLoader />
      <SecondaryAssetScheduler />
    </div>
  );
}
