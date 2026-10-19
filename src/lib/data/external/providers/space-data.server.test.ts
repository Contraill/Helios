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
        if (pathname.endsWith("/GST")) {
          return jsonResponse([
            {
              gstID: "GST-1",
              startTime: "2026-07-17T00:00:00Z",
              allKpIndex: [{ kpIndex: 5.33 }, { kpIndex: 6.67 }],
            },
          ]);
        }
        return jsonResponse([]);
      }),
    );

    const result = await spaceData.loadDonki();
    expect(result.status).toBe("partial");
    expect(result.data?.map(({ eventType }) => eventType)).toEqual([
      "FLR",
      "GST",
    ]);
    expect(result.data?.[1]?.classOrIntensity).toBe("Kp 6.67");
    expect(result.metadata.failedEndpoints).toEqual(["/DONKI-API/get/CME"]);
  });

  it("reads APOD from the science.nasa.gov feed without an API key", async () => {
    delete process.env.NASA_API_KEY;
    resetServerEnvCache();
    const fetchMock = vi.fn<typeof fetch>(async () =>
      jsonResponse([
        {
          date: "2026-10-16",
          title: "Launch",
          permalink: "https://science.nasa.gov/image-article/apod-launch/",
          media_type: "video",
          explanation: "<strong>Explanation:</strong> A rocket&#8217;s climb.",
          copyright: "",
          hdurl: "",
          basic_html:
            '<video controls><source src="https://assets.science.nasa.gov/launch.mp4" type="video/mp4"></video>',
        },
        {
          date: "2026-10-17",
          title: "3D 67P",
          permalink: "https://science.nasa.gov/image-article/apod-67p/",
          media_type: "image",
          explanation:
            "<strong>Explanation:</strong> Put on your <a href='#'>red/blue</a> glasses &amp; float.",
          copyright: '<a href="https://www.esa.int/">ESA</a> , Rosetta',
          hdurl:
            "https://assets.science.nasa.gov/dynamicimage/apod/67p.jpg?w=2628&h=2418&fit=clip",
        },
        {
          date: "2026-10-15",
          title: "Unsupported",
          permalink: "https://science.nasa.gov/image-article/apod-other/",
          media_type: "other",
          explanation: "Interactive page.",
        },
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await spaceData.loadApodArchive();
    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(url.origin + url.pathname).toBe(
      "https://science.nasa.gov/wp-json/wp/v2/apod-basic",
    );
    expect(url.searchParams.get("date_from")).toMatch(/^\d{6}$/);
    expect(url.searchParams.has("api_key")).toBe(false);
    expect(result.status).toBe("latest-available");
    expect(result.data).toEqual([
      {
        date: "2026-10-17",
        title: "3D 67P",
        excerpt: "Put on your red/blue glasses & float.",
        mediaType: "image",
        mediaUrl:
          "https://assets.science.nasa.gov/dynamicimage/apod/67p.jpg?w=1280&fit=clip",
        copyright: "ESA , Rosetta",
        serviceVersion: "wp/v2",
        sourceUrl: "https://science.nasa.gov/image-article/apod-67p/",
      },
      {
        date: "2026-10-16",
        title: "Launch",
        excerpt: "A rocket’s climb.",
        mediaType: "video",
        mediaUrl: "https://assets.science.nasa.gov/launch.mp4",
        serviceVersion: "wp/v2",
        sourceUrl: "https://science.nasa.gov/image-article/apod-launch/",
      },
    ]);
  });

  it("uses the APOD video poster supplied by the science.nasa.gov feed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse([
          {
            date: "2026-10-18",
            title: "Sonified pillars",
            permalink: "https://science.nasa.gov/image-article/apod-video/",
            media_type: "video",
            explanation: "A video.",
            hdurl:
              "https://assets.science.nasa.gov/dynamicimage/apod/poster.jpg?w=3048&h=1708",
            basic_html:
              '<iframe src="https://www.youtube.com/embed/example"></iframe>',
          },
        ]),
      ),
    );

    const result = await spaceData.loadApodArchive();
    expect(result.data?.[0]?.thumbnailUrl).toBe(
      "https://assets.science.nasa.gov/dynamicimage/apod/poster.jpg?w=1280",
    );
  });

  it("serves NASA Images manifest thumbnails over HTTPS", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/search?"))
          return jsonResponse({
            collection: {
              items: [
                {
                  href: "https://images-assets.nasa.gov/image/PIA12264/collection.json",
                  data: [
                    {
                      nasa_id: "PIA12264",
                      title: "Mercury",
                      date_created: "2009-09-29T00:00:00Z",
                      media_type: "image",
                    },
                  ],
                },
              ],
            },
          });
        return jsonResponse([
          "http://images-assets.nasa.gov/image/PIA12264/PIA12264~thumb.jpg",
          "http://images-assets.nasa.gov/image/PIA12264/PIA12264~orig.jpg",
        ]);
      }),
    );

    const result = await spaceData.loadMissionMedia("mercury");
    expect(result.status).toBe("latest-available");
    expect(result.data?.[0]?.thumbnailUrl).toBe(
      "https://images-assets.nasa.gov/image/PIA12264/PIA12264~thumb.jpg",
    );
    expect(result.data?.[0]?.assetUrl).toBe(
      "https://images-assets.nasa.gov/image/PIA12264/PIA12264~orig.jpg",
    );
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

  it("serves the dated InSight landing-site snapshot without a network request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await spaceData.loadInsight();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.status).toBe("historical");
    expect(result.metadata.sourceUrl).toBe(
      "https://science.nasa.gov/mission/insight/",
    );
    expect(result.data).toMatchObject({
      sol: 675,
      archiveMatch: "nearest",
      valid: true,
    });
  });

  it("rejects an undocumented CAD signature and keeps the verified snapshot", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          signature: { version: "9.9" },
          fields: ["des", "cd", "dist", "v_rel"],
          data: [["test", "2026-Jul-20", "0.01", "12"]],
        }),
      ),
    );

    const result = await spaceData.loadCneosCad();
    expect(result.status).toBe("stale");
    expect(result.errorKind).toBe("version");
  });

  it("rejects an undocumented fireball signature and keeps the verified snapshot", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          signature: { version: "9.9" },
          fields: ["date", "energy", "impact-e"],
          data: [["2026-07-18", "1", "1"]],
        }),
      ),
    );

    const result = await spaceData.loadFireballs();
    expect(result.status).toBe("historical");
    expect(result.errorKind).toBe("version");
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
