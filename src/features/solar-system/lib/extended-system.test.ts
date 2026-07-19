import { describe, expect, it } from "vitest";

import {
  EXTENDED_BODIES,
  EXTENDED_BODY_BY_ID,
  extendedBodyPosition,
  extendedBodyRadius,
  extendedOrbitPoints,
} from "./extended-system";

describe("extended Solar System catalog and orbital preview", () => {
  it("includes every requested featured small body and comet", () => {
    expect(EXTENDED_BODIES.map(({ id }) => id)).toEqual(
      expect.arrayContaining([
        "ceres",
        "vesta",
        "pallas",
        "hygiea",
        "pluto",
        "eris",
        "haumea",
        "makemake",
        "quaoar",
        "gonggong",
        "sedna",
        "orcus",
        "halley",
        "hale-bopp",
        "encke",
        "67p",
        "neowise",
        "tempel-1",
      ]),
    );
  });

  it("keeps scientific radii and distances on the shared 1:1 scale", () => {
    const ceres = EXTENDED_BODY_BY_ID.ceres;
    const position = extendedBodyPosition(
      ceres,
      Date.parse("2026-07-19T00:00:00.000Z"),
      "scientific",
    );
    const distanceAu = Math.hypot(...position) / 12;

    expect(distanceAu).toBeGreaterThan(
      ceres.semiMajorAxisAu * (1 - ceres.eccentricity) - 0.01,
    );
    expect(distanceAu).toBeLessThan(
      ceres.semiMajorAxisAu * (1 + ceres.eccentricity) + 0.01,
    );
    expect(extendedBodyRadius(ceres, "scientific")).toBeCloseTo(
      (ceres.meanRadiusKm / 149_597_870.7) * 12,
      12,
    );
  });

  it("produces finite, closed orbit paths", () => {
    const points = extendedOrbitPoints(
      EXTENDED_BODY_BY_ID.pluto,
      "exploration",
      96,
    );
    expect(points).toHaveLength(97);
    expect(points[0][0]).toBeCloseTo(points.at(-1)![0], 8);
    expect(points.flat().every(Number.isFinite)).toBe(true);
  });

  it("keeps comet tails physically addressable from time-dependent positions", () => {
    const before = extendedBodyPosition(
      EXTENDED_BODY_BY_ID.encke,
      Date.parse("2026-07-19T00:00:00.000Z"),
      "scientific",
    );
    const after = extendedBodyPosition(
      EXTENDED_BODY_BY_ID.encke,
      Date.parse("2027-02-10T00:00:00.000Z"),
      "scientific",
    );
    expect(after).not.toEqual(before);
    expect(Math.hypot(...after)).toBeLessThan(Math.hypot(...before));
  });
});
