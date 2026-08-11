import { describe, expect, it } from "vitest";

import {
  MAX_WEBGL_RECOVERY_ATTEMPTS,
  WEBGL_RECOVERY_WATCHDOG_MS,
  shouldArmWebGLRecoveryWatchdog,
  shouldScheduleWebGLContextRecovery,
  webglRecoveryPlan,
  webglRecoveryStabilityAction,
} from "./webgl-context-recovery-policy";

describe("WebGL context recovery policy", () => {
  it("uses bounded progressive remount delays while the page is visible", () => {
    const first = webglRecoveryPlan(1, true);
    const second = webglRecoveryPlan(2, true);
    const third = webglRecoveryPlan(3, true);

    expect(first.action).toBe("remount");
    expect(second.action).toBe("remount");
    expect(third.action).toBe("remount");
    expect(first.delayMs).toBeLessThan(second.delayMs);
    expect(second.delayMs).toBeLessThan(third.delayMs);
    expect(third.delayMs).toBeLessThan(WEBGL_RECOVERY_WATCHDOG_MS);
  });

  it("waits for a hidden tab to become visible and stops after the budget", () => {
    expect(webglRecoveryPlan(1, false)).toEqual({
      action: "wait",
      delayMs: 0,
    });
    expect(webglRecoveryPlan(MAX_WEBGL_RECOVERY_ATTEMPTS + 1, true)).toEqual({
      action: "fail",
      delayMs: 0,
    });
  });

  it("normalizes invalid attempt values", () => {
    expect(webglRecoveryPlan(Number.NaN, true)).toEqual(
      webglRecoveryPlan(1, true),
    );
    expect(webglRecoveryPlan(-20, true)).toEqual(webglRecoveryPlan(1, true));
  });

  it("accepts one loss from a stable or visibility-deferred renderer", () => {
    expect(shouldScheduleWebGLContextRecovery("ready")).toBe(true);
    expect(shouldScheduleWebGLContextRecovery("checking")).toBe(false);
    expect(shouldScheduleWebGLContextRecovery("lost")).toBe(false);
    expect(shouldScheduleWebGLContextRecovery("recovering")).toBe(false);
    expect(shouldScheduleWebGLContextRecovery("recovering", true)).toBe(true);
    expect(shouldScheduleWebGLContextRecovery("failed")).toBe(false);
  });

  it("arms the watchdog only for a visible recovering renderer", () => {
    expect(shouldArmWebGLRecoveryWatchdog("recovering", true)).toBe(true);
    expect(shouldArmWebGLRecoveryWatchdog("recovering", false)).toBe(false);
    expect(shouldArmWebGLRecoveryWatchdog("lost", true)).toBe(false);
    expect(shouldArmWebGLRecoveryWatchdog("ready", true)).toBe(false);
  });

  it("keeps the retry budget until a visible ready renderer is stable", () => {
    expect(webglRecoveryStabilityAction(1, "ready", true)).toBe("arm");
    expect(webglRecoveryStabilityAction(1, "ready", false)).toBe("wait");
    expect(webglRecoveryStabilityAction(1, "recovering", true)).toBe("wait");
    expect(webglRecoveryStabilityAction(1, "lost", true)).toBe("wait");
    expect(webglRecoveryStabilityAction(0, "ready", true)).toBe("settled");
    expect(webglRecoveryStabilityAction(Number.NaN, "ready", true)).toBe(
      "settled",
    );
  });
});
