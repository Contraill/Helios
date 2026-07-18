import { afterEach, describe, expect, it, vi } from "vitest";

import {
  HORIZONS_TARGET_BY_PLANET,
  HORIZONS_TARGETS,
} from "./horizons-registry";
import {
  buildHorizonsUrl,
  buildHorizonsWindowUrl,
  loadHorizonsEphemeris,
  parseHorizonsVector,
  resolvedTargetForWindow,
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
  afterEach(() => vi.unstubAllGlobals());

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

  it("builds a cacheable range window instead of a single playback point", () => {
    const url = buildHorizonsWindowUrl(
      earth,
      new Date("2026-07-18T00:00:00.000Z"),
    );

    expect(url.searchParams.has("TLIST")).toBe(false);
    expect(url.searchParams.get("START_TIME")).toMatch(/^'2021-/);
    expect(url.searchParams.get("STOP_TIME")).toMatch(/^'2031-/);
    expect(url.searchParams.get("STEP_SIZE")).toBe("'30 d'");
  });

  it("uses verified long-range barycenters only outside body-center kernels", () => {
    expect(
      resolvedTargetForWindow(
        HORIZONS_TARGET_BY_PLANET.jupiter,
        new Date("2026-07-18T00:00:00Z"),
      ).targetId,
    ).toBe("599");
    expect(
      resolvedTargetForWindow(
        HORIZONS_TARGET_BY_PLANET.jupiter,
        new Date("2626-07-18T00:00:00Z"),
      ),
    ).toMatchObject({ targetId: "5", targetName: "Jupiter Barycenter" });
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

  it("rejects an unexpected API version explicitly", () => {
    expect(() =>
      parseHorizonsVector(
        {
          ...responseWith(
            "2461239.5, A.D. 2026-Jul-18 00:00:00.0000, 1, 2, 3, 4, 5, 6,",
          ),
          signature: {
            version: "9.9",
            source: "NASA/JPL Horizons API",
          },
        },
        earth,
      ),
    ).toThrow(/Expected 1\.2 or 1\.3; received 9\.9/i);
  });

  it("serializes JPL calls and coalesces duplicate in-flight windows", async () => {
    let active = 0;
    let maximumActive = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      await Promise.resolve();
      const command = new URL(String(input)).searchParams
        .get("COMMAND")
        ?.replaceAll("'", "");
      const target = HORIZONS_TARGETS.find(
        ({ targetId }) => targetId === command,
      )!;
      active -= 1;
      return new Response(
        JSON.stringify({
          signature: {
            version: "1.3",
            source: "NASA/JPL Horizons API",
          },
          result: `
Target body name: ${target.targetName} (${target.targetId})
Center body name: Sun (10)
Output units    : AU-D
Reference frame : Ecliptic of J2000.0
$$SOE
2461239.5, A.D. 2026-Jul-18 00:00:00.0000, 0.43, -0.92, 0.00005, 0.0153, 0.0072, 0.0000001,
2461269.5, A.D. 2026-Aug-17 00:00:00.0000, 0.81, -0.59, 0.00005, 0.0100, 0.0120, 0.0000001,
$$EOE
`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const requestedAt = new Date("2026-07-18T00:00:00.000Z");
    const [first, second] = await Promise.all([
      loadHorizonsEphemeris(requestedAt),
      loadHorizonsEphemeris(requestedAt),
    ]);

    expect(maximumActive).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(8);
    expect(first.windows).toHaveLength(8);
    expect(second.windows).toHaveLength(8);
    expect(first.metadata.apiVersion).toBe("1.3");
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
