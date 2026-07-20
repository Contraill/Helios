import { Quaternion, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import {
  cometTailState,
  EXTENDED_BODY_BY_ID,
  extendedBodyPhysicalPositionAu,
  extendedBodyPosition,
  extendedOrbitPoints,
} from "./extended-system";
import {
  EllipticOrbitEvaluator,
  solveEllipticKepler,
  utcMsToApproxJulianDateTdb,
} from "./elliptic-orbit-evaluator";
import { MOON_BY_ID } from "./moon-catalogue";
import {
  moonLocalPositionAt,
  moonOrbitEvaluator,
  moonOrbitNormalScene,
  moonOrbitPoints,
} from "./moon-position";
import {
  applyReferenceBasis,
  dotVectors,
  eclipticJ2000ToIcrf,
  eclipticToThreeYUp,
  icrfToEclipticJ2000,
  referenceBasis,
  unitVectorFromRaDec,
} from "./reference-frame-math";
import {
  createTidalLockScratch,
  tidalLockQuaternion,
} from "./tidal-lock-orientation";

const timestamp = Date.parse("2026-07-19T00:00:00.000Z");

function nearestDistance(
  point: readonly [number, number, number],
  path: readonly (readonly [number, number, number])[],
): number {
  return Math.min(
    ...path.map((candidate) =>
      Math.hypot(
        candidate[0] - point[0],
        candidate[1] - point[1],
        candidate[2] - point[2],
      ),
    ),
  );
}

describe("celestial reference frames and shared orbit evaluators", () => {
  it("keeps explicit ecliptic, equatorial and Laplace transforms in one J2000 → Three chain", () => {
    const icrf: [number, number, number] = [0.3, -0.4, 0.8660254];
    const ecliptic = icrfToEclipticJ2000(icrf);
    const roundTrip = eclipticJ2000ToIcrf(ecliptic);
    expect(roundTrip[0]).toBeCloseTo(icrf[0], 12);
    expect(roundTrip[1]).toBeCloseTo(icrf[1], 12);
    expect(roundTrip[2]).toBeCloseTo(icrf[2], 12);

    const laplacePole = { rightAscensionDeg: 40.6, declinationDeg: 83.5 };
    const laplace = referenceBasis("local-laplace-plane", { laplacePole });
    const sourceNorth = applyReferenceBasis(laplace, [0, 0, 1]);
    const expectedNorth = icrfToEclipticJ2000(unitVectorFromRaDec(laplacePole));
    expect(dotVectors(sourceNorth, expectedNorth)).toBeCloseTo(1, 10);
    expect(dotVectors(laplace.x, laplace.y)).toBeCloseTo(0, 10);
    expect(dotVectors(laplace.x, laplace.z)).toBeCloseTo(0, 10);

    const evaluator = new EllipticOrbitEvaluator(
      {
        semiMajorAxis: 1,
        eccentricity: 0,
        inclinationDeg: 90,
        longitudeAscendingNodeDeg: 90,
        argumentOfPeriapsisDeg: 0,
        meanAnomalyAtEpochDeg: 0,
        epochJulianDateTdb: 2_451_545,
        orbitalPeriodDays: 10,
      },
      referenceBasis("ecliptic-j2000"),
    );
    const atNode = evaluator.positionAtJulianDate(2_451_545);
    expect(Math.hypot(...atNode)).toBeCloseTo(1, 12);
    expect(atNode[0]).toBeCloseTo(0, 10);
    expect(atNode[2]).toBeCloseTo(-1, 10);

    const j2000Utc = Date.parse("2000-01-01T12:00:00.000Z");
    expect(utcMsToApproxJulianDateTdb(j2000Utc)).toBeCloseTo(
      2_451_545 + 69.184 / 86_400,
      10,
    );
    expect(eclipticToThreeYUp([1, 2, 3])).toEqual([1, 3, -2]);
  });

  it("aligns representative Earth, Saturn and Uranus moon paths, positions and tidal locking without profile phase changes", () => {
    for (const moon of [
      MOON_BY_ID["moon-earth-moon"],
      MOON_BY_ID["moon-saturn-titan"],
      MOON_BY_ID["moon-uranus-miranda"],
    ]) {
      expect(moon.representation.epoch.timeScale).toBe("TDB");
      expect(moon.representation.referenceFrame).toBe(moon.referenceFrame);
      if (moon.referenceFrame === "local-laplace-plane") {
        expect(moon.laplacePole).toBeDefined();
      }

      const position = moonLocalPositionAt(moon, timestamp, 4.5);
      const path = moonOrbitPoints(moon, 4.5, 720);
      expect(nearestDistance(position, path)).toBeLessThan(0.04);

      const scientific = moonLocalPositionAt(moon, timestamp, 9);
      const exploration = moonLocalPositionAt(moon, timestamp, 3);
      const normalizedScientific = new Vector3(...scientific).normalize();
      const normalizedExploration = new Vector3(...exploration).normalize();
      expect(normalizedScientific.dot(normalizedExploration)).toBeCloseTo(
        1,
        10,
      );

      const normal = moonOrbitNormalScene(moon);
      const orientation = tidalLockQuaternion(
        position,
        normal,
        new Quaternion(),
        createTidalLockScratch(),
      );
      const localForward = new Vector3(0, 0, 1).applyQuaternion(orientation);
      const towardParent = new Vector3(...position)
        .multiplyScalar(-1)
        .normalize();
      expect(localForward.dot(towardParent)).toBeCloseTo(1, 10);

      const evaluator = moonOrbitEvaluator(moon);
      const onePeriodLater = evaluator.positionAtJulianDate(
        utcMsToApproxJulianDateTdb(timestamp) + moon.orbitalPeriodDays,
      );
      const atTimestamp = evaluator.positionAtUtcMs(timestamp);
      expect(nearestDistance(onePeriodLater, [atTimestamp])).toBeLessThan(1e-3);
    }
  });

  it("uses six-element small-body geometry, bounded high-e solving and anti-solar comet activity", () => {
    const ceres = EXTENDED_BODY_BY_ID.ceres;
    const pallas = EXTENDED_BODY_BY_ID.pallas;
    expect(ceres.elements.longitudeAscendingNodeDeg).not.toBe(
      pallas.elements.longitudeAscendingNodeDeg,
    );
    expect(ceres.elements.argumentOfPeriapsisDeg).not.toBe(
      pallas.elements.argumentOfPeriapsisDeg,
    );

    for (const body of [ceres, pallas, EXTENDED_BODY_BY_ID.halley]) {
      const evaluated = extendedBodyPhysicalPositionAu(body, timestamp);
      expect(evaluated.solver.converged).toBe(true);
      expect(evaluated.position.every(Number.isFinite)).toBe(true);
      const scenePosition = extendedBodyPosition(body, timestamp, "scientific");
      const path = extendedOrbitPoints(body, "scientific", 1440);
      expect(nearestDistance(scenePosition, path)).toBeLessThan(
        body.id === "halley" ? 0.35 : 0.06,
      );
    }

    const highE = solveEllipticKepler(Math.PI * 0.93, 0.9992);
    expect(highE.converged).toBe(true);
    expect(Number.isFinite(highE.eccentricAnomalyRadians)).toBe(true);

    const halley = EXTENDED_BODY_BY_ID.halley;
    const tail = cometTailState(halley, timestamp);
    const cometPosition = extendedBodyPhysicalPositionAu(
      halley,
      timestamp,
    ).position;
    const radial = new Vector3(...cometPosition).normalize();
    expect(new Vector3(...tail.antiSolarDirection).dot(radial)).toBeCloseTo(
      1,
      10,
    );
    expect(tail.activity).toBeGreaterThanOrEqual(0);
    expect(tail.activity).toBeLessThanOrEqual(1);

    const perihelionMs = Date.parse("1986-02-05T21:29:15.000Z");
    const active = cometTailState(halley, perihelionMs);
    const far = cometTailState(
      halley,
      perihelionMs + (halley.elements.orbitalPeriodDays / 2) * 86_400_000,
    );
    expect(active.activity).toBeGreaterThan(far.activity);
    expect(active.lengthScale).toBeGreaterThan(far.lengthScale);
  });
});
