import { describe, expect, it } from "vitest";

import { HORIZONS_SNAPSHOT } from "./horizons-snapshot";
import {
  ephemerisOrbitScenePoints,
  ephemerisScenePosition,
  propagatedPositionAu,
  vectorToScenePosition,
} from "./positions";

const earth = HORIZONS_SNAPSHOT.vectors.find(
  ({ planetId }) => planetId === "earth",
)!;

describe("ephemeris scene positions", () => {
  it("preserves the exact Horizons vector at its sample epoch", () => {
    expect(
      propagatedPositionAu(
        earth,
        HORIZONS_SNAPSHOT.observedAt,
        Date.parse(HORIZONS_SNAPSHOT.observedAt),
      ),
    ).toEqual(earth.positionAu);
  });

  it("propagates a finite bound orbit instead of a frame-rate-dependent angle", () => {
    const afterOneYear = propagatedPositionAu(
      earth,
      HORIZONS_SNAPSHOT.observedAt,
      Date.parse(HORIZONS_SNAPSHOT.observedAt) + 365 * 86_400_000,
    );

    expect(
      Math.hypot(afterOneYear.x, afterOneYear.y, afterOneYear.z),
    ).toBeCloseTo(1, 1);
    expect(afterOneYear).not.toEqual(earth.positionAu);
  });

  it("keeps the Julian-year preview moving beyond the source refresh window", () => {
    const futureAt =
      Date.parse(HORIZONS_SNAPSHOT.observedAt) + 500 * 86_400_000;
    const bounded = propagatedPositionAu(
      earth,
      HORIZONS_SNAPSHOT.observedAt,
      futureAt,
    );
    const preview = propagatedPositionAu(
      earth,
      HORIZONS_SNAPSHOT.observedAt,
      futureAt,
      true,
    );

    expect(Object.values(preview).every(Number.isFinite)).toBe(true);
    expect(preview).not.toEqual(bounded);
  });

  it("stays close to direct Horizons reference samples 30 days later", () => {
    const references = {
      earth: {
        x: 8.16671152069856e-1,
        y: -5.985317114717831e-1,
        z: 3.326499651721433e-5,
      },
      mercury: {
        x: -2.046230458388703e-2,
        y: 3.07814531363767e-1,
        z: 2.703253071320052e-2,
      },
    } as const;
    const futureAt = Date.parse(HORIZONS_SNAPSHOT.observedAt) + 30 * 86_400_000;

    for (const planetId of ["earth", "mercury"] as const) {
      const vector = HORIZONS_SNAPSHOT.vectors.find(
        (item) => item.planetId === planetId,
      )!;
      const propagated = propagatedPositionAu(
        vector,
        HORIZONS_SNAPSHOT.observedAt,
        futureAt,
      );
      const reference = references[planetId];
      const errorAu = Math.hypot(
        propagated.x - reference.x,
        propagated.y - reference.y,
        propagated.z - reference.z,
      );
      expect(errorAu).toBeLessThan(0.005);
    }
  });

  it("uses one shared AU ratio in scientific mode and a non-linear explore ratio", () => {
    const vector = { x: 30, y: 0, z: 0 };
    expect(vectorToScenePosition(vector, "scientific")).toEqual([360, 0, -0]);
    expect(vectorToScenePosition(vector, "exploration")[0]).toBeLessThan(70);
  });

  it("draws every orbit from the same Horizons vector and scene transform as its planet", () => {
    const observedAtMs = Date.parse(HORIZONS_SNAPSHOT.observedAt);

    for (const vector of HORIZONS_SNAPSHOT.vectors) {
      const points = ephemerisOrbitScenePoints(vector, "exploration", 96);
      expect(points).toHaveLength(96);
      expect(points[0]).toEqual(
        ephemerisScenePosition(
          vector,
          HORIZONS_SNAPSHOT.observedAt,
          observedAtMs,
          "exploration",
        ),
      );
      expect(points.flat().every(Number.isFinite)).toBe(true);
    }
  });
});
