import "server-only";

import { z } from "zod";

import {
  apodSnapshot,
  donkiSnapshot,
  eonetSnapshot,
  epicSnapshot,
  fireballSnapshot,
  gibsLayers,
  insightSnapshot,
  missionMediaSnapshot,
  nearEarthSnapshot,
  trekRegions,
} from "@/content/snapshots/external-data";

import { executeExternal, isProductionBuild } from "../execute.server";
import type {
  ApodRecord,
  DonkiEvent,
  EonetCategory,
  EonetEvent,
  EpicRecord,
  FireballRecord,
  GibsLayer,
  InsightWeatherRecord,
  MissionMediaRecord,
  NearEarthApproach,
  TrekRegion,
} from "../models";
import {
  ExternalRequestError,
  fetchExternalJson,
  fetchExternalText,
} from "../request.server";
import type { ExternalMetadata, ExternalResult, FetchPolicy } from "../types";

const MILLISECONDS_PER_DAY = 86_400_000;
import type { PlanetId } from "@/lib/data/schemas/planet";

const policies = {
  apod: {
    providerId: "apod",
    revalidateSeconds: 86400,
    timeoutMs: 5000,
    cacheTag: "apod",
  },
  epic: {
    providerId: "epic",
    revalidateSeconds: 10800,
    timeoutMs: 5000,
    cacheTag: "epic-latest",
  },
  eonet: {
    providerId: "eonet",
    revalidateSeconds: 1800,
    timeoutMs: 5000,
    cacheTag: "eonet-open",
  },
  donki: {
    providerId: "donki",
    revalidateSeconds: 1800,
    timeoutMs: 5000,
    cacheTag: "donki-events",
  },
  neows: {
    providerId: "neows",
    revalidateSeconds: 10800,
    timeoutMs: 5000,
    cacheTag: "neows-feed",
  },
  insight: {
    providerId: "insight",
    revalidateSeconds: 2592000,
    timeoutMs: 5000,
    cacheTag: "insight-historical",
  },
  images: {
    providerId: "nasa-images",
    revalidateSeconds: 259200,
    timeoutMs: 5000,
    cacheTag: "nasa-images",
  },
  gibs: {
    providerId: "gibs",
    revalidateSeconds: 86400,
    timeoutMs: 15000,
    cacheTag: "gibs-capabilities",
  },
  cad: {
    providerId: "cneos-cad",
    revalidateSeconds: 10800,
    timeoutMs: 10000,
    cacheTag: "cneos-cad",
  },
  fireball: {
    providerId: "cneos-fireball",
    revalidateSeconds: 86400,
    timeoutMs: 5000,
    cacheTag: "cneos-fireball",
  },
} as const satisfies Record<string, FetchPolicy>;

const apodRawSchema = z.object({
  date: z.string(),
  title: z.string(),
  explanation: z.string(),
  media_type: z.enum(["image", "video"]),
  url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  copyright: z.string().optional(),
  service_version: z.string().default("v1"),
});

const epicRawSchema = z.array(
  z.object({
    identifier: z.string(),
    caption: z.string(),
    image: z.string(),
    date: z.string(),
    centroid_coordinates: z.object({ lat: z.number(), lon: z.number() }),
  }),
);

const eonetRawSchema = z.object({ events: z.array(z.unknown()) });

const eonetEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  closed: z.string().nullable().optional(),
  categories: z.array(z.object({ id: z.string(), title: z.string() })),
  sources: z
    .array(z.object({ id: z.string(), url: z.string().url() }))
    .default([]),
  geometry: z.array(
    z.object({
      date: z.string(),
      type: z.enum(["Point", "Polygon"]),
      magnitudeValue: z.number().nullable().optional(),
      magnitudeUnit: z.string().nullable().optional(),
      coordinates: z.unknown(),
    }),
  ),
});

const donkiItemSchema = z.object({
  activityID: z.string().optional(),
  flrID: z.string().optional(),
  gstID: z.string().optional(),
  cmeID: z.string().optional(),
  messageID: z.string().optional(),
  beginTime: z.string().optional(),
  startTime: z.string().optional(),
  peakTime: z.string().optional(),
  eventTime: z.string().optional(),
  messageIssueTime: z.string().optional(),
  classType: z.string().optional(),
  sourceLocation: z.string().optional(),
  kpIndex: z.number().optional(),
  messageType: z.string().optional(),
  link: z.string().url().optional(),
  linkedEvents: z
    .array(z.object({ activityID: z.string() }))
    .nullable()
    .optional(),
});

const neoFeedSchema = z.object({
  near_earth_objects: z.record(
    z.string(),
    z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        is_potentially_hazardous_asteroid: z.boolean(),
        estimated_diameter: z.object({
          meters: z.object({
            estimated_diameter_min: z.number(),
            estimated_diameter_max: z.number(),
          }),
        }),
        nasa_jpl_url: z.string().url(),
        close_approach_data: z.array(
          z.object({
            close_approach_date_full: z.string(),
            relative_velocity: z.object({ kilometers_per_hour: z.string() }),
            miss_distance: z.object({ kilometers: z.string() }),
          }),
        ),
      }),
    ),
  ),
});

const insightRawSchema = z
  .object({
    sol_keys: z.array(z.string()),
  })
  .passthrough();

const insightMetricSchema = z.object({
  mn: z.number(),
  av: z.number(),
  mx: z.number(),
  ct: z.number(),
});

const insightSolSchema = z.object({
  First_UTC: z.string(),
  Last_UTC: z.string(),
  Season: z.string().optional(),
  Northern_season: z.string().optional(),
  Southern_season: z.string().optional(),
  AT: insightMetricSchema.optional(),
  PRE: insightMetricSchema.optional(),
  HWS: insightMetricSchema.optional(),
  WD: z
    .object({
      most_common: z.object({ compass_point: z.string() }).optional(),
    })
    .optional(),
});

const imagesRawSchema = z.object({
  collection: z.object({
    items: z.array(
      z.object({
        href: z.string().url(),
        data: z
          .array(
            z.object({
              nasa_id: z.string(),
              title: z.string(),
              description: z.string().optional(),
              date_created: z.string(),
              center: z.string().optional(),
              keywords: z.array(z.string()).optional(),
              media_type: z.enum(["image", "video"]),
              photographer: z.string().optional(),
              secondary_creator: z.string().optional(),
            }),
          )
          .min(1),
        links: z
          .array(
            z.object({
              href: z.string().url(),
              rel: z.string(),
              render: z.string().optional(),
            }),
          )
          .optional(),
      }),
    ),
  }),
});

const cneosRawSchema = z.object({
  signature: z.object({ version: z.string() }),
  fields: z.array(z.string()),
  data: z
    .array(z.array(z.union([z.string(), z.number(), z.null()])))
    .default([]),
});

function excerpt(value: string, max = 230): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max);
  const boundary = slice.lastIndexOf(" ");
  return `${slice.slice(0, boundary > 120 ? boundary : max).trim()}…`;
}

function metadata(
  provider: string,
  sourceTitle: string,
  sourceUrl: string,
  freshness: ExternalMetadata["freshness"],
  observedAt?: string,
  notes?: string,
): ExternalMetadata {
  return {
    provider,
    sourceTitle,
    sourceUrl,
    freshness,
    ...(observedAt ? { observedAt } : {}),
    retrievedAt: new Date().toISOString(),
    attribution: provider,
    ...(notes ? { notes } : {}),
  };
}

function dateRange(
  daysBack = 5,
  daysForward = 0,
): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  start.setUTCDate(start.getUTCDate() - daysBack);
  end.setUTCDate(end.getUTCDate() + daysForward);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export async function loadApodArchive(): Promise<
  ExternalResult<readonly ApodRecord[]>
> {
  return executeExternal({
    snapshot: apodSnapshot,
    empty: (data) => data.length === 0,
    currentStatus: "latest-available",
    fetchCurrent: async () => {
      const { start, end } = dateRange(4);
      const raw = await fetchExternalJson({
        path: "/planetary/apod",
        params: { start_date: start, end_date: end, thumbs: true },
        policy: policies.apod,
      });
      const parsed = z.array(apodRawSchema).parse(raw);
      return parsed
        .map((item): ApodRecord => ({
          date: item.date,
          title: item.title,
          excerpt: excerpt(item.explanation),
          mediaType: item.media_type,
          mediaUrl: item.url,
          ...(item.thumbnail_url ? { thumbnailUrl: item.thumbnail_url } : {}),
          ...(item.copyright ? { copyright: item.copyright } : {}),
          serviceVersion: item.service_version,
          sourceUrl: `https://apod.nasa.gov/apod/ap${item.date.slice(2).replaceAll("-", "")}.html`,
        }))
        .sort((a, b) => b.date.localeCompare(a.date));
    },
    metadata: (data) =>
      metadata(
        "NASA APOD",
        "Astronomy Picture of the Day",
        data[0]?.sourceUrl ?? "https://apod.nasa.gov/apod/",
        "latest-available",
        data[0] ? `${data[0].date}T00:00:00.000Z` : undefined,
      ),
  });
}

export async function loadEpic(): Promise<
  ExternalResult<readonly EpicRecord[]>
> {
  return executeExternal({
    snapshot: epicSnapshot,
    empty: (data) => data.length === 0,
    currentStatus: "latest-available",
    fetchCurrent: async () => {
      const parsed = epicRawSchema.parse(
        await fetchExternalJson({
          path: "/api/natural",
          policy: policies.epic,
        }),
      );
      return parsed.slice(0, 8).map((item): EpicRecord => {
        const [datePart] = item.date.split(" ");
        const [year, month, day] = datePart.split("-");
        return {
          identifier: item.identifier,
          caption: item.caption,
          capturedAt: `${item.date.replace(" ", "T")}Z`,
          imageUrl: `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/jpg/${item.image}.jpg`,
          centroid: {
            latitude: item.centroid_coordinates.lat,
            longitude: item.centroid_coordinates.lon,
          },
          type: "natural",
        };
      });
    },
    metadata: (data) =>
      metadata(
        "NASA EPIC",
        "DSCOVR EPIC Natural Color Archive",
        "https://epic.gsfc.nasa.gov/",
        "latest-available",
        data[0]?.capturedAt,
      ),
  });
}

const categoryMap: Readonly<Record<string, EonetCategory | undefined>> = {
  wildfires: "wildfires",
  severeStorms: "severeStorms",
  volcanoes: "volcanoes",
  floods: "floods",
  seaLakeIce: "seaLakeIce",
  dustHaze: "dustHaze",
};

function coordinatePairs(value: unknown): Array<readonly [number, number]> {
  if (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  ) {
    return [[value[0], value[1]]];
  }
  return Array.isArray(value) ? value.flatMap(coordinatePairs) : [];
}

function representativeCoordinate(
  type: "Point" | "Polygon",
  value: unknown,
): readonly [number, number] | null {
  const points = coordinatePairs(value);
  if (points.length === 0) return null;
  if (type === "Point") return points[0];
  const totals = points.reduce(
    (sum, point) => [sum[0] + point[0], sum[1] + point[1]] as const,
    [0, 0] as const,
  );
  return [totals[0] / points.length, totals[1] / points.length];
}

export async function loadEonet(): Promise<
  ExternalResult<readonly EonetEvent[]>
> {
  return executeExternal({
    snapshot: eonetSnapshot,
    empty: (data) => data.length === 0,
    currentStatus: "near-live",
    fetchCurrent: async () => {
      const parsed = eonetRawSchema.parse(
        await fetchExternalJson({
          path: "/api/v3/events",
          params: { status: "open", limit: 60, days: 30 },
          policy: policies.eonet,
        }),
      );
      return parsed.events
        .flatMap((rawEvent): EonetEvent[] => {
          const result = eonetEventSchema.safeParse(rawEvent);
          if (!result.success) return [];
          const event = result.data;
          const category = event.categories
            .map((item) => categoryMap[item.id])
            .find(Boolean);
          const geometry = event.geometry.at(-1);
          if (!category || !geometry) return [];
          const coordinates = representativeCoordinate(
            geometry.type,
            geometry.coordinates,
          );
          if (!coordinates) return [];
          return [
            {
              id: event.id,
              title: event.title,
              category,
              status: event.closed ? "closed" : "open",
              observedAt: geometry.date,
              geometryType: geometry.type,
              coordinates,
              sourceUrl:
                event.sources[0]?.url ??
                `https://eonet.gsfc.nasa.gov/api/v3/events/${event.id}`,
              ...(geometry.magnitudeValue !== null &&
              geometry.magnitudeValue !== undefined &&
              geometry.magnitudeUnit
                ? {
                    magnitude: {
                      value: geometry.magnitudeValue,
                      unit: geometry.magnitudeUnit,
                    },
                  }
                : {}),
            },
          ];
        })
        .slice(0, 24);
    },
    metadata: (data) =>
      metadata(
        "NASA EONET",
        "Earth Observatory Natural Event Tracker",
        "https://eonet.gsfc.nasa.gov/",
        "near-live",
        data[0]?.observedAt,
        "Event timing follows the contributing source; this is not an emergency alert service.",
      ),
  });
}

async function fetchDonkiType(
  path: "/DONKI/FLR" | "/DONKI/CME" | "/DONKI/GST" | "/DONKI/notifications",
) {
  const { start, end } = dateRange(14);
  const raw = await fetchExternalJson({
    path,
    params: { startDate: start, endDate: end },
    policy: policies.donki,
  });
  return z.array(donkiItemSchema).parse(raw);
}

function normalizeDonki(
  item: z.infer<typeof donkiItemSchema>,
  type: DonkiEvent["eventType"],
): DonkiEvent | null {
  const id =
    item.activityID ?? item.flrID ?? item.gstID ?? item.cmeID ?? item.messageID;
  const startAt =
    item.beginTime ?? item.startTime ?? item.eventTime ?? item.messageIssueTime;
  if (!id || !startAt) return null;
  return {
    id,
    eventType: type,
    title:
      type === "FLR"
        ? "Solar flare"
        : type === "CME"
          ? "Coronal mass ejection"
          : type === "GST"
            ? "Geomagnetic storm"
            : (item.messageType ?? "Space-weather notification"),
    startAt,
    ...(item.peakTime ? { peakAt: item.peakTime } : {}),
    ...(item.classType
      ? { classOrIntensity: item.classType }
      : item.kpIndex
        ? { classOrIntensity: `Kp ${item.kpIndex}` }
        : {}),
    ...(item.sourceLocation ? { sourceLocation: item.sourceLocation } : {}),
    linkedEventIds:
      item.linkedEvents?.map(({ activityID }) => activityID) ?? [],
    sourceUrl: item.link ?? "https://kauai.ccmc.gsfc.nasa.gov/DONKI/",
  };
}

export async function loadDonki(): Promise<
  ExternalResult<readonly DonkiEvent[]>
> {
  const endpoints = [
    ["/DONKI/FLR", "FLR"],
    ["/DONKI/CME", "CME"],
    ["/DONKI/GST", "GST"],
    ["/DONKI/notifications", "notification"],
  ] as const;

  if (isProductionBuild()) {
    return {
      data: donkiSnapshot.data,
      status: donkiSnapshot.fallbackStatus ?? "fallback",
      metadata: donkiSnapshot.metadata,
      errorKind: "network",
    };
  }

  try {
    const settled = await Promise.allSettled(
      endpoints.map(async ([path, type]) => ({
        path,
        type,
        records: await fetchDonkiType(path),
      })),
    );
    const failedEndpoints = settled.flatMap((result, index) =>
      result.status === "rejected" ? [endpoints[index][0]] : [],
    );
    const results = settled
      .flatMap((result): DonkiEvent[] => {
        if (result.status === "rejected") return [];
        return result.value.records.flatMap((record) => {
          const normalized = normalizeDonki(record, result.value.type);
          return normalized ? [normalized] : [];
        });
      })
      .sort((a, b) => b.startAt.localeCompare(a.startAt))
      .slice(0, 16);

    if (results.length === 0) {
      throw new ExternalRequestError(
        "empty",
        "DONKI endpoints returned no usable records.",
      );
    }
    return {
      data: results,
      status: failedEndpoints.length > 0 ? "partial" : "near-live",
      metadata: {
        ...metadata(
          "NASA DONKI",
          "Space Weather Database",
          "https://kauai.ccmc.gsfc.nasa.gov/DONKI/",
          "near-live",
          results[0]?.startAt,
          failedEndpoints.length > 0
            ? `${failedEndpoints.length} endpoint(s) were unavailable; successful event families remain visible.`
            : "Events are linked only when official activity IDs match.",
        ),
        ...(failedEndpoints.length > 0 ? { failedEndpoints } : {}),
      },
    };
  } catch {
    return {
      data: donkiSnapshot.data,
      status: donkiSnapshot.fallbackStatus ?? "fallback",
      metadata: donkiSnapshot.metadata,
      errorKind: "upstream",
    };
  }
}

export async function loadNearEarth(): Promise<
  ExternalResult<readonly NearEarthApproach[]>
> {
  return executeExternal({
    snapshot: nearEarthSnapshot,
    empty: (data) => data.length === 0,
    currentStatus: "latest-available",
    fetchCurrent: async () => {
      const { start, end } = dateRange(0, 6);
      const parsed = neoFeedSchema.parse(
        await fetchExternalJson({
          path: "/neo/rest/v1/feed",
          params: { start_date: start, end_date: end },
          policy: policies.neows,
        }),
      );
      return Object.values(parsed.near_earth_objects)
        .flat()
        .flatMap((item): NearEarthApproach[] => {
          const approach = item.close_approach_data[0];
          if (!approach) return [];
          return [
            {
              id: item.id,
              name: item.name,
              approachAt: approach.close_approach_date_full,
              missDistanceKm: Number(approach.miss_distance.kilometers),
              relativeVelocityKph: Number(
                approach.relative_velocity.kilometers_per_hour,
              ),
              diameterMinM:
                item.estimated_diameter.meters.estimated_diameter_min,
              diameterMaxM:
                item.estimated_diameter.meters.estimated_diameter_max,
              potentiallyHazardous: item.is_potentially_hazardous_asteroid,
              timeScale: "UTC",
              sourceUrl: item.nasa_jpl_url,
            },
          ];
        })
        .sort((a, b) => a.missDistanceKm - b.missDistanceKm)
        .slice(0, 12);
    },
    metadata: (data) =>
      metadata(
        "NASA NeoWs",
        "Near-Earth Object Web Service",
        "https://api.nasa.gov/",
        "latest-available",
        data[0]?.approachAt,
        "Potentially hazardous is a classification, not an impact prediction.",
      ),
  });
}

export async function loadInsight(): Promise<
  ExternalResult<InsightWeatherRecord>
> {
  return executeExternal({
    snapshot: insightSnapshot,
    empty: (data) => !data.valid,
    currentStatus: "historical",
    fetchCurrent: async () => {
      const raw = await fetchExternalJson({
        path: "/insight_weather/",
        params: { feedtype: "json", ver: "1.0" },
        policy: policies.insight,
      });
      const parsed = insightRawSchema.parse(raw) as z.infer<
        typeof insightRawSchema
      > &
        Record<string, unknown>;
      const candidates = parsed.sol_keys.flatMap((key) => {
        const result = insightSolSchema.safeParse(parsed[key]);
        const firstAt = result.success
          ? Date.parse(result.data.First_UTC)
          : Number.NaN;
        return result.success && Number.isFinite(firstAt)
          ? [{ key, sol: result.data, firstAt }]
          : [];
      });
      if (candidates.length === 0) {
        throw new ExternalRequestError("empty", "InSight returned no sols.");
      }
      const today = new Date();
      const targetMonth = today.getUTCMonth();
      const targetDay = today.getUTCDate();
      const exact = candidates.find(({ firstAt }) => {
        const date = new Date(firstAt);
        return (
          date.getUTCMonth() === targetMonth && date.getUTCDate() === targetDay
        );
      });
      const targetDayIndex =
        Date.UTC(2000, targetMonth, targetDay) / MILLISECONDS_PER_DAY;
      const selected =
        exact ??
        candidates.reduce((nearest, candidate) => {
          const date = new Date(candidate.firstAt);
          const dayIndex =
            Date.UTC(2000, date.getUTCMonth(), date.getUTCDate()) /
            MILLISECONDS_PER_DAY;
          const distance = Math.abs(dayIndex - targetDayIndex);
          const nearestDate = new Date(nearest.firstAt);
          const nearestIndex =
            Date.UTC(
              2000,
              nearestDate.getUTCMonth(),
              nearestDate.getUTCDate(),
            ) / MILLISECONDS_PER_DAY;
          const nearestDistance = Math.abs(nearestIndex - targetDayIndex);
          return Math.min(distance, 366 - distance) <
            Math.min(nearestDistance, 366 - nearestDistance)
            ? candidate
            : nearest;
        });
      const { key, sol } = selected;
      const metric = (
        value: z.infer<typeof insightMetricSchema> | undefined,
      ) =>
        value ? { min: value.mn, average: value.av, max: value.mx } : undefined;
      const counts = [sol.AT?.ct, sol.PRE?.ct, sol.HWS?.ct].filter(
        (value): value is number => typeof value === "number",
      );
      const temperatureC = metric(sol.AT);
      const pressurePa = metric(sol.PRE);
      const windMps = metric(sol.HWS);
      return {
        sol: Number(key),
        firstUtc: sol.First_UTC,
        lastUtc: sol.Last_UTC,
        ...(temperatureC ? { temperatureC } : {}),
        ...(pressurePa ? { pressurePa } : {}),
        ...(windMps ? { windMps } : {}),
        windDirection: sol.WD?.most_common?.compass_point ?? "not recorded",
        seasonNorthern: sol.Northern_season ?? sol.Season ?? "not recorded",
        seasonSouthern: sol.Southern_season ?? "not recorded",
        valid: counts.some((count) => count > 0),
        sampleCount: counts.length > 0 ? Math.max(...counts) : 0,
        archiveMatch: exact ? "on-this-day" : "nearest",
      };
    },
    metadata: (data) =>
      metadata(
        "NASA InSight",
        "InSight Mars Weather Service",
        "https://api.nasa.gov/insight_weather/",
        "historical",
        data.lastUtc,
        data.archiveMatch === "on-this-day"
          ? "Historical observation matching today's UTC month and day at Elysium Planitia."
          : `Nearest archived observation to ${new Intl.DateTimeFormat("en", { month: "long", day: "numeric", timeZone: "UTC" }).format(new Date())}; not current Mars weather.`,
      ),
  });
}

const missionMediaQueries: Readonly<Record<PlanetId, string>> = {
  mercury: "Mercury MESSENGER",
  venus: "Venus Magellan",
  earth: "Earth Blue Marble",
  mars: "Mars Perseverance",
  jupiter: "Jupiter Juno",
  saturn: "Saturn Cassini",
  uranus: "Uranus Voyager 2",
  neptune: "Neptune Voyager 2",
};

async function nasaAssetManifest(href: string) {
  const url = new URL(href);
  if (url.origin !== "https://images-assets.nasa.gov") {
    throw new ExternalRequestError(
      "schema",
      "NASA media manifest used an unexpected origin.",
    );
  }
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: policies.images.revalidateSeconds },
    signal: AbortSignal.timeout(policies.images.timeoutMs),
  });
  if (!response.ok) {
    throw new ExternalRequestError(
      "upstream",
      `NASA media manifest returned ${response.status}.`,
      response.status,
    );
  }
  return z.array(z.string().url()).parse(await response.json());
}

function mediaAssets(urls: readonly string[]) {
  const images = urls.filter((url) => /\.(?:jpe?g|png|webp)$/i.test(url));
  const thumbnailUrl =
    images.find((url) => /~thumb\./i.test(url)) ??
    images.find((url) => /~small\./i.test(url));
  const assetUrl = images.find((url) => /~orig\./i.test(url)) ?? images.at(-1);
  return { thumbnailUrl, assetUrl };
}

export async function loadMissionMedia(
  planetId: PlanetId,
): Promise<ExternalResult<readonly MissionMediaRecord[]>> {
  const query = missionMediaQueries[planetId];
  const filteredSnapshot = {
    ...missionMediaSnapshot,
    data: missionMediaSnapshot.data.filter(
      (item) => item.planetId === planetId,
    ),
  };
  return executeExternal<readonly MissionMediaRecord[]>({
    snapshot: filteredSnapshot,
    empty: (data) => data.length === 0,
    currentStatus: "latest-available",
    fetchCurrent: async (): Promise<readonly MissionMediaRecord[]> => {
      const parsed = imagesRawSchema.parse(
        await fetchExternalJson({
          path: "/search",
          params: { q: query, media_type: "image,video", page_size: 12 },
          policy: policies.images,
        }),
      );
      const records: Array<MissionMediaRecord | null> = await Promise.all(
        parsed.collection.items.slice(0, 8).map(async (item) => {
          const data = item.data[0];
          try {
            const assets = mediaAssets(await nasaAssetManifest(item.href));
            if (!assets.thumbnailUrl && !assets.assetUrl) return null;
            const record: MissionMediaRecord = {
              planetId,
              nasaId: data.nasa_id,
              title: data.title,
              excerpt: excerpt(data.description ?? data.title, 180),
              dateCreated: data.date_created,
              ...(data.center ? { center: data.center } : {}),
              keywords: data.keywords ?? [],
              mediaType: data.media_type,
              ...(assets.thumbnailUrl
                ? { thumbnailUrl: assets.thumbnailUrl }
                : {}),
              ...(assets.assetUrl ? { assetUrl: assets.assetUrl } : {}),
              ...((data.photographer ?? data.secondary_creator)
                ? { creator: data.photographer ?? data.secondary_creator }
                : {}),
              sourceUrl: `https://images.nasa.gov/details/${encodeURIComponent(data.nasa_id)}`,
            };
            return record;
          } catch {
            return null;
          }
        }),
      );
      return records.filter(
        (record): record is MissionMediaRecord => record !== null,
      );
    },
    metadata: (data) =>
      metadata(
        "NASA Image and Video Library",
        "NASA Images",
        "https://images.nasa.gov/",
        "latest-available",
        data[0]?.dateCreated,
      ),
  });
}

function tableRows(
  raw: z.infer<typeof cneosRawSchema>,
  supportedVersions: readonly string[],
): ReadonlyArray<Record<string, string | number | null>> {
  if (!supportedVersions.includes(raw.signature.version)) {
    throw new ExternalRequestError(
      "version",
      `Unexpected provider version ${raw.signature.version}; expected ${supportedVersions.join(" or ")}.`,
    );
  }
  return raw.data.map((row) =>
    Object.fromEntries(
      raw.fields.map((field, index) => [field, row[index] ?? null]),
    ),
  );
}

export async function loadCneosCad(): Promise<
  ExternalResult<readonly NearEarthApproach[]>
> {
  return executeExternal({
    snapshot: nearEarthSnapshot,
    empty: (data) => data.length === 0,
    currentStatus: "latest-available",
    fetchCurrent: async () => {
      const raw = cneosRawSchema.parse(
        await fetchExternalJson({
          path: "/cad.api",
          params: {
            "dist-max": "0.05",
            "date-min": "now",
            "date-max": "+30",
            sort: "dist",
            limit: 20,
            diameter: true,
            fullname: true,
          },
          policy: policies.cad,
        }),
      );
      return tableRows(raw, ["1.5"])
        .map((row, index): NearEarthApproach => {
          const diameterM =
            row.diameter === null ? null : Number(row.diameter) * 1000;
          return {
            id: String(row.des ?? `cad-${index}`),
            name: String(row.fullname ?? row.des ?? "Unnamed object").trim(),
            approachAt: String(row.cd ?? ""),
            missDistanceKm: Number(row.dist ?? 0) * 149597870.7,
            relativeVelocityKph: Number(row.v_rel ?? 0) * 3600,
            ...(diameterM !== null && Number.isFinite(diameterM)
              ? { diameterMinM: diameterM, diameterMaxM: diameterM }
              : {}),
            potentiallyHazardous: null,
            timeScale: "TDB",
            sourceUrl: "https://cneos.jpl.nasa.gov/ca/",
          };
        })
        .filter(
          (item) =>
            Number.isFinite(item.missDistanceKm) && item.missDistanceKm > 0,
        );
    },
    metadata: (data) =>
      metadata(
        "JPL CNEOS",
        "Close-Approach Data",
        "https://ssd-api.jpl.nasa.gov/doc/cad.html",
        "latest-available",
        data[0]?.approachAt,
      ),
  });
}

export async function loadFireballs(): Promise<
  ExternalResult<readonly FireballRecord[]>
> {
  return executeExternal({
    snapshot: fireballSnapshot,
    empty: (data) => data.length === 0,
    currentStatus: "historical",
    fetchCurrent: async () => {
      const raw = cneosRawSchema.parse(
        await fetchExternalJson({
          path: "/fireball.api",
          params: { limit: 20 },
          policy: policies.fireball,
        }),
      );
      return tableRows(raw, ["1.2"]).flatMap((row): FireballRecord[] => {
        const date = String(row.date ?? "");
        const radiatedEnergy = row.energy === null ? null : Number(row.energy);
        const impactEnergy =
          row["impact-e"] === null ? null : Number(row["impact-e"]);
        if (
          !date ||
          (!Number.isFinite(radiatedEnergy) && !Number.isFinite(impactEnergy))
        )
          return [];
        return [
          {
            date,
            ...(Number.isFinite(radiatedEnergy)
              ? { radiatedEnergy10e10J: radiatedEnergy as number }
              : {}),
            ...(Number.isFinite(impactEnergy)
              ? { estimatedImpactEnergyKt: impactEnergy as number }
              : {}),
            ...(row.lat
              ? {
                  latitude:
                    Number(row.lat) * (String(row.lat_dir) === "S" ? -1 : 1),
                }
              : {}),
            ...(row.lon
              ? {
                  longitude:
                    Number(row.lon) * (String(row.lon_dir) === "W" ? -1 : 1),
                }
              : {}),
            sourceUrl: "https://cneos.jpl.nasa.gov/fireballs/",
          },
        ];
      });
    },
    metadata: (data) =>
      metadata(
        "JPL CNEOS",
        "Fireball and Bolide Data",
        "https://ssd-api.jpl.nasa.gov/doc/fireball.html",
        "historical",
        data[0]?.date,
      ),
  });
}

const gibsLayerDefinitions = [
  {
    id: "MODIS_Terra_CorrectedReflectance_TrueColor",
    title: "Terra MODIS true color",
    instrument: "Terra / MODIS",
    colorMode: "natural",
    latencyNote: "Near-real-time imagery may appear hours after observation.",
    extent: [-180, -90, 180, 90],
  },
  {
    id: "GOES-East_ABI_FireTemp",
    title: "GOES-East fire temperature",
    instrument: "GOES-East / ABI",
    colorMode: "analysis",
    latencyNote: "Analysis layer; color represents estimated fire temperature.",
    extent: [-140, -60, -10, 60],
  },
  {
    id: "IMERG_Precipitation_Rate",
    title: "IMERG precipitation rate",
    instrument: "GPM / IMERG",
    colorMode: "analysis",
    latencyNote: "Dated precipitation analysis; not a live weather radar.",
    extent: [-180, -60, 180, 60],
  },
] as const;

function capabilityLayer(xml: string, id: string): string {
  const identifier = `<ows:Identifier>${id}</ows:Identifier>`;
  const identifierAt = xml.indexOf(identifier);
  const startAt = xml.lastIndexOf("<Layer>", identifierAt);
  const endAt = xml.indexOf("</Layer>", identifierAt);
  if (identifierAt < 0 || startAt < 0 || endAt < 0) {
    throw new ExternalRequestError(
      "schema",
      `GIBS capabilities do not contain ${id}.`,
    );
  }
  return xml.slice(startAt, endAt);
}

function capabilityValue(layer: string, tag: string): string {
  const match = new RegExp(`<${tag}>([^<]+)</${tag}>`).exec(layer);
  if (!match?.[1]) {
    throw new ExternalRequestError("schema", `GIBS layer is missing ${tag}.`);
  }
  return match[1];
}

function gibsSnapshotUrl(
  id: string,
  observedAt: string,
  format: "image/jpeg" | "image/png",
  extent: readonly [number, number, number, number],
): string {
  const url = new URL("https://wvs.earthdata.nasa.gov/api/v1/snapshot");
  url.searchParams.set("REQUEST", "GetSnapshot");
  url.searchParams.set("TIME", observedAt);
  url.searchParams.set("BBOX", extent.join(","));
  url.searchParams.set("CRS", "EPSG:4326");
  url.searchParams.set("LAYERS", id);
  url.searchParams.set("FORMAT", format);
  url.searchParams.set("WIDTH", "1024");
  url.searchParams.set("HEIGHT", extent[1] === -90 ? "512" : "640");
  return url.toString();
}

function parseGibsCapabilities(xml: string): readonly GibsLayer[] {
  return gibsLayerDefinitions.map((definition): GibsLayer => {
    const layer = capabilityLayer(xml, definition.id);
    const observedAt = capabilityValue(layer, "Default");
    const rawFormat = capabilityValue(layer, "Format");
    if (rawFormat !== "image/jpeg" && rawFormat !== "image/png") {
      throw new ExternalRequestError(
        "schema",
        `GIBS ${definition.id} returned unsupported format ${rawFormat}.`,
      );
    }
    const extent = definition.extent as readonly [
      number,
      number,
      number,
      number,
    ];
    return {
      ...definition,
      observedAt,
      imageUrl: gibsSnapshotUrl(definition.id, observedAt, rawFormat, extent),
      attribution: "NASA EOSDIS GIBS",
      format: rawFormat,
      tileMatrixSet: capabilityValue(layer, "TileMatrixSet"),
      extent,
      availability: "verified",
    };
  });
}

export async function loadGibsLayers(): Promise<
  ExternalResult<readonly GibsLayer[]>
> {
  return executeExternal({
    snapshot: {
      schemaVersion: 1,
      purpose: "Verified dated GIBS preview fallback.",
      data: gibsLayers,
      metadata: {
        provider: "NASA EOSDIS GIBS",
        sourceTitle: "Global Imagery Browse Services",
        sourceUrl:
          "https://www.earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs",
        freshness: "reference",
        observedAt: gibsLayers[0].observedAt,
        retrievedAt: "2026-07-18T00:00:00.000Z",
        attribution: "NASA EOSDIS GIBS",
        notes:
          "Verified dated fallback previews; not presented as the latest provider response.",
      },
    },
    empty: (data) => data.length !== gibsLayerDefinitions.length,
    currentStatus: "latest-available",
    fetchCurrent: async () =>
      parseGibsCapabilities(
        await fetchExternalText({
          // The capabilities document is currently larger than Next's 2 MB
          // fetch-cache item limit. The enclosing page/result cache stores the
          // small parsed layer model; asking the fetch cache to store the raw
          // XML only creates a warning and never succeeds.
          cacheMode: "no-store",
          path: "/wmts/epsg4326/best/1.0.0/WMTSCapabilities.xml",
          policy: policies.gibs,
        }),
      ),
    metadata: (data) =>
      metadata(
        "NASA EOSDIS GIBS",
        "Global Imagery Browse Services",
        "https://www.earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs",
        "latest-available",
        data
          .map(({ observedAt }) => observedAt)
          .sort()
          .at(-1),
        "Layer availability, default date, format and tile matrix were read from the current EPSG:4326 capabilities document.",
      ),
  });
}

export function loadTrekRegions(
  world: TrekRegion["world"],
): ExternalResult<readonly TrekRegion[]> {
  const data = trekRegions.filter((region) => region.world === world);
  return {
    data,
    status: "latest-available",
    metadata: metadata(
      `NASA ${world} Trek`,
      `${world} Trek curated regions`,
      world === "Mars"
        ? "https://trek.nasa.gov/mars/"
        : "https://trek.nasa.gov/mercury/",
      "reference",
      undefined,
      "Curated surface products; not ephemeris or live imagery.",
    ),
  };
}
