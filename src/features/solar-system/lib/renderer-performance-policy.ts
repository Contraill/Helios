export type RendererDprRange = readonly [number, number];
export type RendererPerformanceTier = "economy" | "balanced" | "high";

export interface RendererDeviceHints {
  readonly coarsePointer: boolean;
  readonly deviceMemoryGb?: number;
  readonly hardwareConcurrency?: number;
}

export interface RendererPerformanceProfile {
  readonly dpr: RendererDprRange;
  readonly tier: RendererPerformanceTier;
}

function finitePositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function finiteHint(value: number | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function constrainedHandheld(hints: RendererDeviceHints): boolean {
  if (!hints.coarsePointer) return false;
  const memory = finiteHint(hints.deviceMemoryGb);
  const concurrency = finiteHint(hints.hardwareConcurrency);

  if (memory !== null) {
    return memory <= 4 && (concurrency === null || concurrency <= 4);
  }

  return concurrency !== null && concurrency <= 4;
}

/**
 * Preserve the High visual contract on desktop while capping framebuffer load
 * on compact coarse-pointer devices. CSS pixels and scene geometry stay
 * unchanged; only the renderer's internal pixel density is reduced.
 */
export function rendererDprRangeForViewport(
  baseRange: RendererDprRange,
  width: number,
  height: number,
  coarsePointer: boolean,
): RendererDprRange {
  return rendererPerformanceProfileForViewport(baseRange, width, height, {
    coarsePointer,
  }).dpr;
}

export function rendererPerformanceProfileForViewport(
  baseRange: RendererDprRange,
  width: number,
  height: number,
  hints: RendererDeviceHints,
): RendererPerformanceProfile {
  const minimum = Math.max(0.5, finitePositive(baseRange[0], 1));
  const maximum = Math.max(minimum, finitePositive(baseRange[1], minimum));
  const safeWidth = finitePositive(width, 1);
  const safeHeight = finitePositive(height, 1);
  const shortSide = Math.min(safeWidth, safeHeight);
  const longSide = Math.max(safeWidth, safeHeight);
  const handheld = hints.coarsePointer && shortSide < 900 && longSide < 1_400;
  const constrained = handheld && constrainedHandheld(hints);

  let tier: RendererPerformanceTier = "high";
  let cap = maximum;

  if (handheld) {
    tier = constrained || shortSide < 560 ? "economy" : "balanced";
    cap = constrained ? 1 : shortSide < 560 ? 1.25 : 1.5;
  }

  return {
    dpr: [minimum, Math.max(minimum, Math.min(maximum, cap))],
    tier,
  };
}

export function shouldUseContinuousRenderer({
  cameraMode,
  documentVisible,
  galacticContextPhase,
  reducedMotion,
  simulationPaused,
}: {
  readonly cameraMode: string;
  readonly documentVisible: boolean;
  readonly galacticContextPhase: "local" | "transition" | "galactic";
  readonly reducedMotion: boolean;
  readonly simulationPaused: boolean;
}): boolean {
  if (!documentVisible || reducedMotion) return false;
  return (
    !simulationPaused ||
    cameraMode === "transition" ||
    galacticContextPhase !== "local"
  );
}
