import { describe, expect, it } from "vitest";

import { cameraFocusPolicy } from "@/features/solar-system/lib/camera-focus-policy";
import { sceneProfileFor } from "@/features/solar-system/lib/scene-profiles";
import {
  buildRegionDistribution,
  regionFocusAnchorOffset,
  regionMacroEnvelopeOpacityFor,
  regionOpacityFor,
  regionVisualProfileFor,
} from "@/features/solar-system/lib/region-visual-policy";

function finitePositions(values: Float32Array): boolean {
  return Array.from(values).every(Number.isFinite);
}

function variance(values: readonly number[]): number {
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return (
    values.reduce((sum, value) => sum + (value - average) ** 2, 0) /
    values.length
  );
}

describe("Gate 3A region visual policy", () => {
  it("exposes one fixed Detailed and Cinematic region contract", () => {
    expect(regionVisualProfileFor).toHaveLength(3);

    for (const mode of ["exploration", "scientific"] as const) {
      const scene = sceneProfileFor(mode);
      const profiles = [
        regionVisualProfileFor("asteroid-belt", mode, scene),
        regionVisualProfileFor("kuiper-belt", mode, scene),
        regionVisualProfileFor("oort-cloud", mode, scene),
        regionVisualProfileFor("heliosphere", mode, scene),
      ];

      expect(
        profiles.map((profile) => profile.distribution.pointCount),
      ).toEqual([1_050, 820, 1_650, 480]);
      expect(profiles[0]?.distribution.opacity).toBe(0.56);
      expect(profiles[1]?.distribution.opacity).toBe(0.47);
      expect(
        profiles.every(
          (profile) =>
            Number.isFinite(profile.distribution.pointCount) &&
            profile.distribution.pointCount >= 64 &&
            profile.distribution.pointCount <= 2_000,
        ),
      ).toBe(true);
      expect(regionVisualProfileFor("asteroid-belt", mode, scene)).toEqual(
        profiles[0],
      );
    }
  });

  it("creates deterministic but distinct asteroid and Kuiper distributions", () => {
    const scene = sceneProfileFor("exploration");
    const asteroidProfile = regionVisualProfileFor(
      "asteroid-belt",
      "exploration",
      scene,
    );
    const kuiperProfile = regionVisualProfileFor(
      "kuiper-belt",
      "exploration",
      scene,
    );
    const asteroid = buildRegionDistribution(asteroidProfile, scene);
    const asteroidAgain = buildRegionDistribution(asteroidProfile, scene);
    const kuiper = buildRegionDistribution(kuiperProfile, scene);

    expect(Array.from(asteroid.strata[0].positions)).toEqual(
      Array.from(asteroidAgain.strata[0].positions),
    );
    expect(asteroid.signature).not.toBe(kuiper.signature);
    expect(kuiper.radialExtent[1]).toBeGreaterThan(asteroid.radialExtent[1]);
    expect(kuiper.verticalExtent).toBeGreaterThan(asteroid.verticalExtent);
    expect(asteroidProfile.macroEnvelope?.kind).toBe("annular-ribbon");
    expect(kuiperProfile.macroEnvelope?.kind).toBe("volumetric-belt");
    expect(kuiperProfile.macroEnvelope!.verticalExtent).toBeGreaterThan(
      asteroidProfile.macroEnvelope!.verticalExtent,
    );
    expect(
      regionMacroEnvelopeOpacityFor(asteroidProfile, "selected"),
    ).toBeGreaterThan(
      regionMacroEnvelopeOpacityFor(asteroidProfile, "ambient"),
    );
    expect(
      regionMacroEnvelopeOpacityFor(asteroidProfile, "ambient"),
    ).toBeGreaterThanOrEqual(
      regionMacroEnvelopeOpacityFor(asteroidProfile, "selected") * 0.7,
    );
    expect(
      regionMacroEnvelopeOpacityFor(kuiperProfile, "selected"),
    ).toBeGreaterThan(regionMacroEnvelopeOpacityFor(kuiperProfile, "ambient"));
    expect(
      regionMacroEnvelopeOpacityFor(kuiperProfile, "ambient"),
    ).toBeGreaterThanOrEqual(
      regionMacroEnvelopeOpacityFor(kuiperProfile, "selected") * 0.7,
    );
    expect(asteroidProfile.distribution.opacity).toBeGreaterThanOrEqual(
      asteroidProfile.distribution.selectedOpacity * 0.7,
    );
    expect(kuiperProfile.distribution.opacity).toBeGreaterThanOrEqual(
      kuiperProfile.distribution.selectedOpacity * 0.7,
    );
    expect(
      asteroid.strata.every((entry) => finitePositions(entry.positions)),
    ).toBe(true);
    expect(
      kuiper.strata.every((entry) => finitePositions(entry.positions)),
    ).toBe(true);
    const asteroidY = asteroid.strata.flatMap((entry) =>
      Array.from(entry.positions).filter((_, index) => index % 3 === 1),
    );
    expect(variance(asteroidY)).toBeGreaterThan(0);
  });

  it("keeps Oort inner, outer and anchor populations sparse and selected-readable", () => {
    for (const mode of ["exploration", "scientific"] as const) {
      const scene = sceneProfileFor(mode);
      const profile = regionVisualProfileFor("oort-cloud", mode, scene);
      const distribution = buildRegionDistribution(profile, scene);
      expect(distribution.strata.map((entry) => entry.population)).toEqual([
        "inner-hills",
        "outer-oort",
        "anchor-particles",
      ]);
      expect(
        distribution.strata.every((entry) => finitePositions(entry.positions)),
      ).toBe(true);
      expect(profile.distribution.pointCount).toBe(1_650);
      expect(profile.distribution.radialExtent[1]).toBe(
        scene.extended.oort.renderRadius,
      );
      expect(profile.distribution.radialExtent[0]).toBeGreaterThan(0);
      expect(regionOpacityFor(profile, "selected", 0)).toBeGreaterThan(
        regionOpacityFor(profile, "ambient", 0),
      );
      expect(regionOpacityFor(profile, "selected", 0.04)).toBeGreaterThan(0.1);
      expect(profile.macroEnvelope?.kind).toBe("distant-shell");
      expect(
        regionMacroEnvelopeOpacityFor(profile, "selected"),
      ).toBeGreaterThan(regionMacroEnvelopeOpacityFor(profile, "ambient"));
      expect(regionMacroEnvelopeOpacityFor(profile, "selected")).toBeLessThan(
        0.08,
      );
      const camera = cameraFocusPolicy({
        aspect: 16 / 9,
        fovDegrees: 46,
        metadata: {
          bodyId: "oort-cloud",
          targetKind: "region",
          renderRadius: profile.camera.framingExtent,
          collisionRadius: profile.collisionRadius,
          focusRadius: profile.camera.framingExtent,
          systemExtent: profile.camera.framingExtent,
          regionPresentation: profile.camera,
        },
        profile: scene,
      });
      expect(camera.minimumDistance).toBeLessThanOrEqual(
        camera.maximumDistance,
      );
      expect(camera.desiredDistance).toBeLessThanOrEqual(
        camera.maximumDistance,
      );
    }
  });

  it("models ordered heliosphere boundaries with finite schematic camera framing", () => {
    for (const mode of ["exploration", "scientific"] as const) {
      const scene = sceneProfileFor(mode);
      const profile = regionVisualProfileFor("heliosphere", mode, scene);
      expect(profile.distribution.pointCount).toBe(480);
      expect(profile.representation).toBe("schematic");
      expect(profile.distribution.radialExtent[1]).toBeGreaterThan(
        profile.distribution.radialExtent[0],
      );
      expect(profile.distribution.selectedOpacity).toBeGreaterThan(
        profile.distribution.opacity,
      );
      expect(profile.camera.framingExtent).toBeGreaterThan(0);
      expect(profile.camera.minimumViewportCoverage).toBeGreaterThan(0);
      expect(profile.camera.maximumViewportCoverage).toBeGreaterThan(
        profile.camera.minimumViewportCoverage,
      );
      expect(profile.camera.preferredDirection.every(Number.isFinite)).toBe(
        true,
      );
      const result = cameraFocusPolicy({
        aspect: 16 / 9,
        fovDegrees: 46,
        metadata: {
          bodyId: "heliosphere",
          targetKind: "region",
          renderRadius: profile.camera.framingExtent,
          collisionRadius: profile.collisionRadius,
          focusRadius: profile.camera.framingExtent,
          systemExtent: profile.camera.framingExtent,
          regionPresentation: profile.camera,
        },
        profile: scene,
      });
      expect(Number.isFinite(result.desiredDistance)).toBe(true);
      expect(result.desiredDistance).toBeLessThanOrEqual(
        result.maximumDistance,
      );
    }
  });

  it("provides finite camera presentations and a safe fallback direction", () => {
    const scene = sceneProfileFor("exploration");
    for (const id of [
      "asteroid-belt",
      "kuiper-belt",
      "oort-cloud",
      "heliosphere",
    ] as const) {
      const profile = regionVisualProfileFor(id, "exploration", scene);
      expect(
        profile.camera.preferredDirection.some((value) => value !== 0),
      ).toBe(true);
      expect(profile.camera.preferredDirection.every(Number.isFinite)).toBe(
        true,
      );
      expect(profile.camera.framingExtent).toBeGreaterThan(0);
      const anchor = regionFocusAnchorOffset(profile.camera);
      expect(anchor.every(Number.isFinite)).toBe(true);
      if (id === "asteroid-belt" || id === "kuiper-belt") {
        expect(Math.hypot(...anchor)).toBeGreaterThan(0);
      } else {
        expect(anchor).toEqual([0, 0, 0]);
      }
      expect(profile.collisionRadius).toBeGreaterThan(0);
    }
  });
});
