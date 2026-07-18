import { describe, expect, it } from "vitest";

import { HORIZONS_TARGET_BY_PLANET } from "./horizons-registry";
import {
  buildHorizonsUrl,
  parseHorizonsVector,
  sampleEpochFor,
} from "./horizons.server";

const earth = HORIZONS_TARGET_BY_PLANET.earth;

function responseWith(vectorLine: string) {
  return {
    signature: { version: "1.2", source: "NASA/JPL Horizons API" },
    result: `
Target body name: Earth (399)
Center body name: Sun (10)
Output units    : AU-D
Reference frame : Ecliptic of J2000.0
$$SOE
${vectorLine}
$$EOE
`,
  };
}

describe("Horizons server adapter", () => {
  it("builds the explicit, keyless Cartesian vector contract", () => {
    const url = buildHorizonsUrl(earth, new Date("2026-07-18T00:00:00.000Z"));

    expect(url.origin).toBe("https://ssd.jpl.nasa.gov");
    expect(url.searchParams.get("COMMAND")).toBe("'399'");
    expect(url.searchParams.get("EPHEM_TYPE")).toBe("VECTORS");
    expect(url.searchParams.get("CENTER")).toBe("'500@10'");
    expect(url.searchParams.get("REF_PLANE")).toBe("ECLIPTIC");
    expect(url.searchParams.get("REF_SYSTEM")).toBe("ICRF");
    expect(url.searchParams.get("OUT_UNITS")).toBe("AU-D");
    expect(url.searchParams.get("TIME_TYPE")).toBe("TDB");
    expect(url.searchParams.has("api_key")).toBe(false);
  });

  it("normalizes a valid CSV vector record", () => {
    const parsed = parseHorizonsVector(
      responseWith(
        "2461239.5, A.D. 2026-Jul-18 00:00:00.0000, 4.3E-1, -9.2E-1, 5.3E-5, 1.53E-2, 7.22E-3, 1.31E-7,",
      ),
      earth,
    );

    expect(parsed.apiVersion).toBe("1.2");
    expect(parsed.vector).toMatchObject({
      planetId: "earth",
      targetId: "399",
      positionAu: { x: 0.43, y: -0.92, z: 0.000053 },
    });
  });

  it("rejects malformed values and contract drift", () => {
    expect(() =>
      parseHorizonsVector(
        responseWith("2461239.5, date, nope, -9.2E-1, 0, 0, 0, 0,"),
        earth,
      ),
    ).toThrow(/invalid Cartesian/i);

    expect(() =>
      parseHorizonsVector(
        {
          ...responseWith("2461239.5, date, 1, 2, 3, 4, 5, 6,"),
          signature: { version: "1.2", source: "Unknown service" },
        },
        earth,
      ),
    ).toThrow();
  });

  it("rounds requested times to stable six-hour sample epochs", () => {
    expect(
      sampleEpochFor(new Date("2026-07-18T08:44:00.000Z")).toISOString(),
    ).toBe("2026-07-18T06:00:00.000Z");
    expect(
      sampleEpochFor(new Date("2026-07-18T09:01:00.000Z")).toISOString(),
    ).toBe("2026-07-18T12:00:00.000Z");
  });
});
