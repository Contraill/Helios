import { describe, expect, it } from "vitest";

import {
  rendererDprRangeForViewport,
  rendererPerformanceProfileForViewport,
  shouldUseContinuousRenderer,
} from "./renderer-performance-policy";

describe("mobile renderer performance policy", () => {
  it("caps compact handheld DPR while preserving the desktop visual contract", () => {
    expect(rendererDprRangeForViewport([1, 2], 390, 844, true)).toEqual([
      1, 1.25,
    ]);
    expect(rendererDprRangeForViewport([1, 2], 844, 390, true)).toEqual([
      1, 1.25,
    ]);
    expect(rendererDprRangeForViewport([1, 2], 768, 1_024, true)).toEqual([
      1, 1.5,
    ]);
    expect(rendererDprRangeForViewport([1, 2], 1_440, 900, false)).toEqual([
      1, 2,
    ]);
  });

  it("uses a stricter economy profile only for constrained handhelds", () => {
    expect(
      rendererPerformanceProfileForViewport([1, 2], 390, 844, {
        coarsePointer: true,
        deviceMemoryGb: 4,
        hardwareConcurrency: 4,
      }),
    ).toEqual({ dpr: [1, 1], tier: "economy" });

    expect(
      rendererPerformanceProfileForViewport([1, 2], 390, 844, {
        coarsePointer: true,
        deviceMemoryGb: 8,
        hardwareConcurrency: 8,
      }),
    ).toEqual({ dpr: [1, 1.25], tier: "economy" });

    expect(
      rendererPerformanceProfileForViewport([1, 2], 390, 844, {
        coarsePointer: true,
        deviceMemoryGb: 8,
        hardwareConcurrency: 4,
      }),
    ).toEqual({ dpr: [1, 1.25], tier: "economy" });

    expect(
      rendererPerformanceProfileForViewport([1, 2], 1_440, 900, {
        coarsePointer: false,
        deviceMemoryGb: 4,
        hardwareConcurrency: 4,
      }),
    ).toEqual({ dpr: [1, 2], tier: "high" });
  });

  it("switches a paused or hidden scene to demand rendering", () => {
    expect(
      shouldUseContinuousRenderer({
        cameraMode: "overview",
        documentVisible: true,
        galacticContextPhase: "local",
        reducedMotion: false,
        simulationPaused: false,
      }),
    ).toBe(true);
    expect(
      shouldUseContinuousRenderer({
        cameraMode: "overview",
        documentVisible: true,
        galacticContextPhase: "local",
        reducedMotion: false,
        simulationPaused: true,
      }),
    ).toBe(false);
    expect(
      shouldUseContinuousRenderer({
        cameraMode: "transition",
        documentVisible: true,
        galacticContextPhase: "local",
        reducedMotion: false,
        simulationPaused: true,
      }),
    ).toBe(true);
    expect(
      shouldUseContinuousRenderer({
        cameraMode: "overview",
        documentVisible: true,
        galacticContextPhase: "galactic",
        reducedMotion: false,
        simulationPaused: true,
      }),
    ).toBe(true);
    expect(
      shouldUseContinuousRenderer({
        cameraMode: "transition",
        documentVisible: false,
        galacticContextPhase: "transition",
        reducedMotion: false,
        simulationPaused: false,
      }),
    ).toBe(false);
  });

  it("never produces an inverted or non-finite DPR range", () => {
    expect(rendererDprRangeForViewport([2, 1], Number.NaN, -1, true)).toEqual([
      2, 2,
    ]);
  });
});
