import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(callback: T) =>
    callback,
}));

type SpaceDataModule = typeof import("./space-data.server");
type ResetServerEnvCache =
  typeof import("@/lib/env/server").resetServerEnvCache;

let resetServerEnvCache: ResetServerEnvCache;
let spaceData: SpaceDataModule;

function jsonResponse(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("space-data provider normalization", () => {
  beforeAll(async () => {
    // Vitest intentionally reuses one worker/module graph for this repository.
    // Reset before importing so the local next/cache mock cannot inherit a
    // previously cached production wrapper from a page test.
    vi.resetModules();
    ({ resetServerEnvCache } = await import("@/lib/env/server"));
    spaceData = await import("./space-data.server");
  });

  afterAll(() => {
    vi.doUnmock("next/cache");
    vi.resetModules();
  });

  beforeEach(() => {
    process.env.NASA_API_KEY = "test-key";
    resetServerEnvCache();
    delete process.env.HELIOS_BUILD_MODE;
    delete process.env.NEXT_PHASE;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    delete process.env.HELIOS_BUILD_MODE;
    delete process.env.NASA_API_KEY;
    resetServerEnvCache();
  });

  it("keeps valid EONET Point and Polygon events when one event is malformed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          events: [
            {
              id: "point",
              title: "Point event",
              categories: [{ id: "wildfires", title: "Wildfires" }],
              sources: [],
              geometry: [
                {
                  date: "2026-07-18T00:00:00Z",
                  type: "Point",
                  coordinates: [30, 40],
                },
              ],
            },
            {
              id: "polygon",
              title: "Polygon event",
              categories: [{ id: "floods", title: "Floods" }],
              sources: [],
              geometry: [
                {
                  date: "2026-07-18T01:00:00Z",
                  type: "Polygon",
                  coordinates: [
                    [
                      [10, 20],
                      [14, 20],
                      [14, 24],
                      [10, 24],
                    ],
                  ],
                },
              ],
            },
            { id: "broken", geometry: "invalid" },
          ],
        }),
      ),
    );

    const result = await spaceData.loadEonet();
    expect(result.status).toBe("near-live");
    expect(result.data).toHaveLength(2);
    expect(result.data?.[0]).toMatchObject({
      geometryType: "Point",
      coordinates: [30, 40],
    });
    expect(result.data?.[1]).toMatchObject({
      geometryType: "Polygon",
      coordinates: [12, 22],
    });
  });

  it("keeps successful DONKI families when one endpoint fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const pathname = new URL(String(input)).pathname;
        if (pathname.endsWith("/CME")) return jsonResponse({}, 503);
        if (pathname.endsWith("/FLR")) {
          return jsonResponse([
            {
              flrID: "FLR-1",
              beginTime: "2026-07-18T00:00:00Z",
              classType: "M1",
            },
          ]);
        }
        return jsonResponse([]);
      }),
    );

    const result = await spaceData.loadDonki();
    expect(result.status).toBe("partial");
    expect(result.data?.map(({ eventType }) => eventType)).toEqual(["FLR"]);
    expect(result.metadata.failedEndpoints).toEqual(["/DONKI/CME"]);
  });

  it("requests CAD diameter/fullname and preserves unknown diameter and hazard", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      void input;
      return jsonResponse({
        signature: { version: "1.5" },
        fields: ["des", "cd", "dist", "v_rel", "diameter", "fullname"],
        data: [
          ["2026 AB", "2026-Jul-20 12:30", "0.01", "12", null, "(2026 AB)"],
        ],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await spaceData.loadCneosCad();
    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.searchParams.get("diameter")).toBe("true");
    expect(requestedUrl.searchParams.get("fullname")).toBe("true");
    expect(requestedUrl.searchParams.get("date-min")).toBe("now");
    expect(result.data?.[0]).toMatchObject({
      potentiallyHazardous: null,
      timeScale: "TDB",
    });
    expect(result.data?.[0]?.diameterMinM).toBeUndefined();
  });

  it("separates fireball radiated and estimated impact energy", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          signature: { version: "1.2" },
          fields: ["date", "energy", "impact-e"],
          data: [["2026-07-18 12:00:00", "2.5", "0.8"]],
        }),
      ),
    );

    const result = await spaceData.loadFireballs();
    expect(result.data?.[0]).toMatchObject({
      radiatedEnergy10e10J: 2.5,
      estimatedImpactEnergyKt: 0.8,
    });
  });

  it("builds GIBS previews from current capabilities metadata", async () => {
    const layers = [
      [
        "MODIS_Terra_CorrectedReflectance_TrueColor",
        "2026-07-18",
        "250m",
        "image/jpeg",
      ],
      ["GOES-East_ABI_FireTemp", "2026-07-18T14:40:00Z", "1km", "image/png"],
      ["IMERG_Precipitation_Rate", "2026-07-17", "2km", "image/png"],
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            `<Capabilities>${layers
              .map(
                ([id, date, matrix, format]) =>
                  `<Layer><ows:Identifier>${id}</ows:Identifier><Default>${date}</Default><TileMatrixSet>${matrix}</TileMatrixSet><Format>${format}</Format></Layer>`,
              )
              .join("")}</Capabilities>`,
            { status: 200, headers: { "Content-Type": "text/xml" } },
          ),
      ),
    );

    const result = await spaceData.loadGibsLayers();
    expect(result.status).toBe("latest-available");
    expect(result.data?.map(({ tileMatrixSet }) => tileMatrixSet)).toEqual([
      "250m",
      "1km",
      "2km",
    ]);
    expect(result.data?.[1]?.imageUrl).toContain(
      "TIME=2026-07-18T14%3A40%3A00Z",
    );
    expect(
      result.data?.every(({ availability }) => availability === "verified"),
    ).toBe(true);
  });

  it("selects an on-this-day InSight record without requiring wind", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-18T12:00:00Z"));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          sol_keys: ["1", "2"],
          "1": {
            First_UTC: "2020-07-17T00:00:00Z",
            Last_UTC: "2020-07-17T23:59:00Z",
            AT: { mn: -90, av: -60, mx: -20, ct: 10 },
          },
          "2": {
            First_UTC: "2020-07-18T00:00:00Z",
            Last_UTC: "2020-07-18T23:59:00Z",
            AT: { mn: -88, av: -58, mx: -18, ct: 12 },
            PRE: { mn: 700, av: 720, mx: 740, ct: 9 },
          },
        }),
      ),
    );

    const result = await spaceData.loadInsight();
    expect(result.data).toMatchObject({
      sol: 2,
      archiveMatch: "on-this-day",
      valid: true,
    });
    expect(result.data?.temperatureC?.average).toBe(-58);
    expect(result.data?.windMps).toBeUndefined();
  });

  it("uses a planet-specific mission fallback for all eight worlds", async () => {
    process.env.HELIOS_BUILD_MODE = "snapshot";
    const planetIds = [
      "mercury",
      "venus",
      "earth",
      "mars",
      "jupiter",
      "saturn",
      "uranus",
      "neptune",
    ] as const;

    for (const planetId of planetIds) {
      const result = await spaceData.loadMissionMedia(planetId);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0]?.planetId).toBe(planetId);
    }
  });
});
