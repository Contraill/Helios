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

import { executeExternal } from "../execute.server";
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
import { ExternalRequestError, fetchExternalJson } from "../request.server";
import type { ExternalMetadata, ExternalResult, FetchPolicy } from "../types";

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

const eonetRawSchema = z.object({
  events: z.array(
    z.object({
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
          magnitudeValue: z.number().nullable().optional(),
          magnitudeUnit: z.string().nullable().optional(),
          coordinates: z.tuple([z.number(), z.number()]),
        }),
      ),
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
  data: z.array(z.array(z.union([z.string(), z.number(), z.null()]))),
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
        .flatMap((event): EonetEvent[] => {
          const category = event.categories
            .map((item) => categoryMap[item.id])
            .find(Boolean);
          const geometry = event.geometry.at(-1);
          if (!category || !geometry) return [];
          return [
            {
              id: event.id,
              title: event.title,
              category,
              status: event.closed ? "closed" : "open",
              observedAt: geometry.date,
              coordinates: geometry.coordinates,
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
  return executeExternal({
    snapshot: donkiSnapshot,
    empty: (data) => data.length === 0,
    currentStatus: "near-live",
    fetchCurrent: async () => {
      const results: DonkiEvent[] = [];
      for (const [path, type] of [
        ["/DONKI/FLR", "FLR"],
        ["/DONKI/CME", "CME"],
        ["/DONKI/GST", "GST"],
        ["/DONKI/notifications", "notification"],
      ] as const) {
        const records = await fetchDonkiType(path);
        for (const record of records) {
          const normalized = normalizeDonki(record, type);
          if (normalized) results.push(normalized);
        }
      }
      return results
        .sort((a, b) => b.startAt.localeCompare(a.startAt))
        .slice(0, 16);
    },
    metadata: (data) =>
      metadata(
        "NASA DONKI",
        "Space Weather Database",
        "https://kauai.ccmc.gsfc.nasa.gov/DONKI/",
        "near-live",
        data[0]?.startAt,
        "Events are linked only when official activity IDs match.",
      ),
  });
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
      const key = parsed.sol_keys.at(-1);
      if (!key)
        throw new ExternalRequestError("empty", "InSight returned no sols.");
      const sol = z
        .object({
          First_UTC: z.string(),
          Last_UTC: z.string(),
          Season: z.string().optional(),
          Northern_season: z.string().optional(),
          Southern_season: z.string().optional(),
          AT: z.object({
            mn: z.number(),
            av: z.number(),
            mx: z.number(),
            ct: z.number(),
          }),
          PRE: z.object({
            mn: z.number(),
            av: z.number(),
            mx: z.number(),
            ct: z.number(),
          }),
          HWS: z.object({
            mn: z.number(),
            av: z.number(),
            mx: z.number(),
            ct: z.number(),
          }),
          WD: z
            .object({
              most_common: z.object({ compass_point: z.string() }).optional(),
            })
            .optional(),
        })
        .parse(parsed[key]);
      return {
        sol: Number(key),
        firstUtc: sol.First_UTC,
        lastUtc: sol.Last_UTC,
        temperatureC: { min: sol.AT.mn, average: sol.AT.av, max: sol.AT.mx },
        pressurePa: { min: sol.PRE.mn, average: sol.PRE.av, max: sol.PRE.mx },
        windMps: { min: sol.HWS.mn, average: sol.HWS.av, max: sol.HWS.mx },
        windDirection: sol.WD?.most_common?.compass_point ?? "not recorded",
        seasonNorthern: sol.Northern_season ?? sol.Season ?? "not recorded",
        seasonSouthern: sol.Southern_season ?? "not recorded",
        valid: sol.AT.ct > 0 && sol.PRE.ct > 0,
        sampleCount: Math.min(sol.AT.ct, sol.PRE.ct, sol.HWS.ct),
      };
    },
    metadata: (data) =>
      metadata(
        "NASA InSight",
        "InSight Mars Weather Service",
        "https://api.nasa.gov/insight_weather/",
        "historical",
        data.lastUtc,
        "Measurement from Elysium Planitia; not current Mars weather.",
      ),
  });
}

export async function loadMissionMedia(
  query = "Mars Perseverance",
): Promise<ExternalResult<readonly MissionMediaRecord[]>> {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const filteredSnapshot = {
    ...missionMediaSnapshot,
    data: missionMediaSnapshot.data.filter((item) => {
      const haystack = [item.title, ...item.keywords].join(" ").toLowerCase();
      return queryTerms.some((term) => haystack.includes(term));
    }),
  };
  return executeExternal({
    snapshot:
      filteredSnapshot.data.length > 0
        ? filteredSnapshot
        : missionMediaSnapshot,
    empty: (data) => data.length === 0,
    currentStatus: "latest-available",
    fetchCurrent: async () => {
      const parsed = imagesRawSchema.parse(
        await fetchExternalJson({
          path: "/search",
          params: { q: query, media_type: "image,video", page_size: 12 },
          policy: policies.images,
        }),
      );
      return parsed.collection.items
        .slice(0, 8)
        .map((item): MissionMediaRecord => {
          const data = item.data[0];
          const thumbnail =
            item.links?.find((link) => link.rel === "preview")?.href ??
            item.links?.[0]?.href;
          return {
            nasaId: data.nasa_id,
            title: data.title,
            excerpt: excerpt(data.description ?? data.title, 180),
            dateCreated: data.date_created,
            ...(data.center ? { center: data.center } : {}),
            keywords: data.keywords ?? [],
            mediaType: data.media_type,
            ...(thumbnail ? { thumbnailUrl: thumbnail } : {}),
            ...((data.photographer ?? data.secondary_creator)
              ? { creator: data.photographer ?? data.secondary_creator }
              : {}),
            sourceUrl: `https://images.nasa.gov/details/${encodeURIComponent(data.nasa_id)}`,
          };
        });
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
  expectedVersionPrefix: string,
): ReadonlyArray<Record<string, string | number | null>> {
  if (!raw.signature.version.startsWith(expectedVersionPrefix)) {
    throw new ExternalRequestError(
      "version",
      `Unexpected provider version ${raw.signature.version}.`,
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
            dist_max: "0.05",
            date_min: "now",
            date_max: "+30",
            sort: "dist",
            limit: 20,
          },
          policy: policies.cad,
        }),
      );
      return tableRows(raw, "1.")
        .map((row, index): NearEarthApproach => ({
          id: String(row.des ?? `cad-${index}`),
          name: String(row.fullname ?? row.des ?? "Unnamed object").trim(),
          approachAt: String(row.cd ?? ""),
          missDistanceKm: Number(row.dist ?? 0) * 149597870.7,
          relativeVelocityKph: Number(row.v_rel ?? 0) * 3600,
          diameterMinM: Number(row.diameter ?? 0) * 1000,
          diameterMaxM: Number(row.diameter ?? 0) * 1000,
          potentiallyHazardous: false,
          sourceUrl: "https://cneos.jpl.nasa.gov/ca/",
        }))
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
      return tableRows(raw, "1.").flatMap((row): FireballRecord[] => {
        const date = String(row.date ?? "");
        const energy = Number(row.energy ?? row.impact_e ?? 0);
        if (!date || !Number.isFinite(energy)) return [];
        return [
          {
            date,
            energyKt: energy,
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

export function loadGibsLayers(): ExternalResult<readonly GibsLayer[]> {
  return {
    data: gibsLayers,
    status: "latest-available",
    metadata: metadata(
      "NASA EOSDIS GIBS",
      "Global Imagery Browse Services",
      "https://www.earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs",
      "near-live",
      `${gibsLayers[0].observedAt}T00:00:00.000Z`,
      "Curated layers only; color mode and latency are stated per layer.",
    ),
  };
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
