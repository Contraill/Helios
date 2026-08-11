export type WebGLContextPhase =
  "checking" | "ready" | "lost" | "recovering" | "failed";

export interface WebGLRecoveryPlan {
  readonly action: "remount" | "wait" | "fail";
  readonly delayMs: number;
}

export const MAX_WEBGL_RECOVERY_ATTEMPTS = 3;
export const WEBGL_RECOVERY_WATCHDOG_MS = 5_000;
export const WEBGL_RECOVERY_STABILITY_MS = 10_000;

export type WebGLRecoveryStabilityAction = "arm" | "settled" | "wait";

export function webglRecoveryStabilityAction(
  attempt: number,
  phase: WebGLContextPhase,
  documentVisible: boolean,
): WebGLRecoveryStabilityAction {
  const safeAttempt = Math.max(
    0,
    Math.floor(Number.isFinite(attempt) ? attempt : 0),
  );
  if (safeAttempt === 0) return "settled";
  if (phase !== "ready" || !documentVisible) return "wait";
  return "arm";
}

export function shouldScheduleWebGLContextRecovery(
  phase: WebGLContextPhase,
  stableRendererDeferred = false,
): boolean {
  return (
    phase === "ready" || (phase === "recovering" && stableRendererDeferred)
  );
}

export function shouldArmWebGLRecoveryWatchdog(
  phase: WebGLContextPhase,
  documentVisible: boolean,
): boolean {
  return documentVisible && phase === "recovering";
}

const VISIBLE_RECOVERY_DELAYS = [280, 720, 1_400] as const;

export function webglRecoveryPlan(
  attempt: number,
  documentVisible: boolean,
): WebGLRecoveryPlan {
  const safeAttempt = Math.max(
    1,
    Math.floor(Number.isFinite(attempt) ? attempt : 1),
  );
  if (safeAttempt > MAX_WEBGL_RECOVERY_ATTEMPTS) {
    return { action: "fail", delayMs: 0 };
  }
  if (!documentVisible) {
    return { action: "wait", delayMs: 0 };
  }

  const visibleDelay =
    VISIBLE_RECOVERY_DELAYS[
      Math.min(VISIBLE_RECOVERY_DELAYS.length - 1, safeAttempt - 1)
    ];
  return { action: "remount", delayMs: visibleDelay };
}
