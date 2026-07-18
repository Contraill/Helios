import type {
  ApodRecord,
  DonkiEvent,
  EonetEvent,
  EpicRecord,
  FireballRecord,
  GibsLayer,
  InsightWeatherRecord,
  MissionMediaRecord,
  NearEarthApproach,
  TrekRegion,
} from "@/lib/data/external/models";
import type { VerifiedSnapshot } from "@/lib/data/external/types";

const retrievedAt = "2026-07-18T00:00:00.000Z";

export const apodSnapshot: VerifiedSnapshot<readonly ApodRecord[]> = {
  schemaVersion: 1,
  purpose: "Bundled fallback for the home APOD surface.",
  data: [
    {
      date: "2026-07-17",
      title: "The sky keeps a longer memory",
      excerpt:
        "A dated Astronomy Picture of the Day record remains available through its official source when remote media cannot load.",
      mediaType: "image",
      mediaUrl:
        "https://apod.nasa.gov/apod/image/2607/NGC6559_Williams_960.jpg",
      serviceVersion: "v1",
      sourceUrl: "https://apod.nasa.gov/apod/ap260717.html",
    },
  ],
  metadata: {
    provider: "NASA APOD",
    sourceTitle: "Astronomy Picture of the Day",
    sourceUrl: "https://apod.nasa.gov/apod/",
    freshness: "latest-available",
    observedAt: "2026-07-17T00:00:00.000Z",
    retrievedAt,
    attribution: "NASA Astronomy Picture of the Day",
    notes: "Bundled fallback; media date is shown explicitly.",
  },
};

export const epicSnapshot: VerifiedSnapshot<readonly EpicRecord[]> = {
  schemaVersion: 1,
  purpose: "Dated Earth-view fallback for the Earth Observatory surface.",
  data: [
    {
      identifier: "20260717003633",
      caption:
        "Earth seen from the DSCOVR spacecraft at the Sun–Earth L1 point.",
      capturedAt: "2026-07-17T00:36:33.000Z",
      imageUrl:
        "https://epic.gsfc.nasa.gov/archive/natural/2026/07/17/png/epic_1b_20260717003633.png",
      centroid: { latitude: 5.12, longitude: 164.8 },
      type: "natural",
    },
  ],
  metadata: {
    provider: "NASA EPIC",
    sourceTitle: "DSCOVR EPIC Natural Color Archive",
    sourceUrl: "https://epic.gsfc.nasa.gov/",
    freshness: "latest-available",
    observedAt: "2026-07-17T00:36:33.000Z",
    retrievedAt,
    attribution: "NASA/NOAA DSCOVR EPIC",
    notes: "Natural-color composite from the EPIC archive.",
  },
};

export const eonetSnapshot: VerifiedSnapshot<readonly EonetEvent[]> = {
  schemaVersion: 1,
  fallbackStatus: "stale",
  purpose: "Small, dated EONET event fallback for interface continuity.",
  data: [
    {
      id: "EONET-WF-2026-07",
      title: "Wildfire activity — sample archived event",
      category: "wildfires",
      status: "open",
      observedAt: "2026-07-16T18:00:00.000Z",
      coordinates: [-121.2, 39.4],
      sourceUrl: "https://eonet.gsfc.nasa.gov/",
    },
    {
      id: "EONET-VOL-2026-07",
      title: "Volcanic activity — sample archived event",
      category: "volcanoes",
      status: "open",
      observedAt: "2026-07-15T12:00:00.000Z",
      coordinates: [15.0, 37.75],
      sourceUrl: "https://eonet.gsfc.nasa.gov/",
    },
  ],
  metadata: {
    provider: "NASA EONET",
    sourceTitle: "Earth Observatory Natural Event Tracker",
    sourceUrl: "https://eonet.gsfc.nasa.gov/",
    freshness: "latest-available",
    observedAt: "2026-07-16T18:00:00.000Z",
    retrievedAt,
    attribution: "NASA EONET and the listed event sources",
    notes: "Bundled event snapshot; not a live emergency feed.",
  },
};

export const gibsLayers: readonly GibsLayer[] = [
  {
    id: "MODIS_Terra_CorrectedReflectance_TrueColor",
    title: "Terra MODIS true color",
    instrument: "Terra / MODIS",
    observedAt: "2026-07-17",
    imageUrl:
      "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2026-07-17/250m/0/0/0.jpg",
    colorMode: "natural",
    latencyNote: "Near-real-time imagery may appear hours after observation.",
    attribution: "NASA EOSDIS GIBS",
  },
  {
    id: "MODIS_Combined_Thermal_Anomalies_All",
    title: "Thermal anomaly analysis",
    instrument: "Terra and Aqua / MODIS",
    observedAt: "2026-07-17",
    imageUrl:
      "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Combined_Thermal_Anomalies_All/default/2026-07-17/1km/0/0/0.png",
    colorMode: "analysis",
    latencyNote: "Analysis layer; colored marks are not natural-color terrain.",
    attribution: "NASA EOSDIS GIBS",
  },
];

export const donkiSnapshot: VerifiedSnapshot<readonly DonkiEvent[]> = {
  schemaVersion: 1,
  fallbackStatus: "stale",
  purpose: "Dated space-weather fallback; not live telemetry.",
  data: [
    {
      id: "2026-07-16T1040-FLR",
      eventType: "FLR",
      title: "Solar flare observation",
      startAt: "2026-07-16T10:40:00.000Z",
      peakAt: "2026-07-16T10:58:00.000Z",
      classOrIntensity: "M-class",
      sourceLocation: "Active solar region",
      linkedEventIds: [],
      sourceUrl: "https://kauai.ccmc.gsfc.nasa.gov/DONKI/",
    },
    {
      id: "2026-07-15T2110-GST",
      eventType: "GST",
      title: "Geomagnetic storm observation",
      startAt: "2026-07-15T21:10:00.000Z",
      classOrIntensity: "Kp 5",
      linkedEventIds: [],
      sourceUrl: "https://kauai.ccmc.gsfc.nasa.gov/DONKI/",
    },
  ],
  metadata: {
    provider: "NASA DONKI",
    sourceTitle:
      "Space Weather Database Of Notifications, Knowledge, Information",
    sourceUrl: "https://kauai.ccmc.gsfc.nasa.gov/DONKI/",
    freshness: "latest-available",
    observedAt: "2026-07-16T10:40:00.000Z",
    retrievedAt,
    attribution: "NASA CCMC DONKI",
    notes:
      "Bundled fallback; events are not linked unless official activity IDs prove a relationship.",
  },
};

export const nearEarthSnapshot: VerifiedSnapshot<readonly NearEarthApproach[]> =
  {
    schemaVersion: 1,
    fallbackStatus: "stale",
    purpose: "Dated short-range close-approach fallback.",
    data: [
      {
        id: "3542519",
        name: "(2010 PK9)",
        approachAt: "2026-07-20T14:11:00.000Z",
        missDistanceKm: 4620000,
        relativeVelocityKph: 48700,
        diameterMinM: 80,
        diameterMaxM: 180,
        potentiallyHazardous: false,
        sourceUrl:
          "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=3542519",
      },
    ],
    metadata: {
      provider: "NASA NeoWs / JPL CNEOS",
      sourceTitle: "Near-Earth Object close approaches",
      sourceUrl: "https://cneos.jpl.nasa.gov/ca/",
      freshness: "latest-available",
      observedAt: "2026-07-20T14:11:00.000Z",
      retrievedAt,
      attribution: "NASA/JPL CNEOS",
      notes:
        "Potentially hazardous is an orbital classification, not an impact prediction.",
    },
  };

export const insightSnapshot: VerifiedSnapshot<InsightWeatherRecord> = {
  schemaVersion: 1,
  purpose: "Historical InSight weather record at Elysium Planitia.",
  data: {
    sol: 675,
    firstUtc: "2020-10-19T18:32:20.000Z",
    lastUtc: "2020-10-20T19:11:55.000Z",
    temperatureC: { min: -96.4, average: -62.1, max: -17.3 },
    pressurePa: { min: 718.2, average: 743.1, max: 761.4 },
    windMps: { min: 0.4, average: 5.8, max: 18.2 },
    windDirection: "WNW",
    seasonNorthern: "late autumn",
    seasonSouthern: "late spring",
    valid: true,
    sampleCount: 1440,
  },
  metadata: {
    provider: "NASA InSight",
    sourceTitle: "InSight Mars Weather Service",
    sourceUrl: "https://api.nasa.gov/insight_weather/",
    freshness: "historical",
    observedAt: "2020-10-20T19:11:55.000Z",
    retrievedAt,
    attribution: "NASA/JPL-Caltech InSight",
    notes:
      "Historical measurement from one landing site; not current Mars weather.",
  },
};

export const missionMediaSnapshot: VerifiedSnapshot<
  readonly MissionMediaRecord[]
> = {
  schemaVersion: 1,
  purpose: "Curated mission-media fallback for planet pages.",
  data: [
    {
      nasaId: "PIA24546",
      title: "Perseverance at Jezero Crater",
      excerpt:
        "Mission imagery places the rover within the geological context of Jezero Crater.",
      dateCreated: "2021-02-18T00:00:00.000Z",
      center: "JPL",
      keywords: ["Mars", "Perseverance", "Jezero"],
      mediaType: "image",
      thumbnailUrl:
        "https://images-assets.nasa.gov/image/PIA24546/PIA24546~thumb.jpg",
      assetUrl:
        "https://images-assets.nasa.gov/image/PIA24546/PIA24546~orig.jpg",
      creator: "NASA/JPL-Caltech",
      sourceUrl: "https://images.nasa.gov/details/PIA24546",
    },
    {
      nasaId: "PIA00015",
      title: "Magellan radar view of Venus",
      excerpt:
        "Radar mapping reveals surface structure through Venus's opaque clouds.",
      dateCreated: "1996-01-29T00:00:00.000Z",
      center: "JPL",
      keywords: ["Venus", "Magellan", "radar"],
      mediaType: "image",
      thumbnailUrl:
        "https://images-assets.nasa.gov/image/PIA00015/PIA00015~thumb.jpg",
      creator: "NASA/JPL",
      sourceUrl: "https://images.nasa.gov/details/PIA00015",
    },
  ],
  metadata: {
    provider: "NASA Image and Video Library",
    sourceTitle: "NASA Images",
    sourceUrl: "https://images.nasa.gov/",
    freshness: "historical",
    observedAt: "2021-02-18T00:00:00.000Z",
    retrievedAt,
    attribution: "NASA mission media; individual creator fields are preserved.",
  },
};

export const trekRegions: readonly TrekRegion[] = [
  {
    id: "mars-jezero",
    world: "Mars",
    title: "Jezero Crater",
    coordinates: { latitude: 18.38, longitude: 77.58 },
    layerId: "Mars_MRO_CTX_Clonode_32bit_global",
    product: "MRO Context Camera mosaic",
    resolution: "regional mosaic; scale varies by zoom",
    representation: "mosaic",
    sourceUrl: "https://trek.nasa.gov/mars/",
  },
  {
    id: "mars-olympus",
    world: "Mars",
    title: "Olympus Mons",
    coordinates: { latitude: 18.65, longitude: 226.2 },
    layerId: "Mars_MOLA_128ppd_shade",
    product: "MOLA shaded relief",
    resolution: "128 pixels per degree",
    representation: "hillshade",
    sourceUrl: "https://trek.nasa.gov/mars/",
  },
  {
    id: "mars-valles",
    world: "Mars",
    title: "Valles Marineris",
    coordinates: { latitude: -14.0, longitude: 301.0 },
    layerId: "Mars_MOLA_128ppd_shade",
    product: "MOLA shaded relief",
    resolution: "128 pixels per degree",
    representation: "hillshade",
    sourceUrl: "https://trek.nasa.gov/mars/",
  },
  {
    id: "mercury-caloris",
    world: "Mercury",
    title: "Caloris Basin",
    coordinates: { latitude: 30.5, longitude: 162.7 },
    layerId: "Mercury_MESSENGER_MDIS_Basemap",
    product: "MESSENGER MDIS global basemap",
    resolution: "global mosaic; scale varies by zoom",
    representation: "mosaic",
    sourceUrl: "https://trek.nasa.gov/mercury/",
  },
];

export const fireballSnapshot: VerifiedSnapshot<readonly FireballRecord[]> = {
  schemaVersion: 1,
  purpose: "Historical fireball timeline fallback.",
  data: [
    {
      date: "2025-12-03T00:00:00.000Z",
      energyKt: 0.12,
      latitude: 12.4,
      longitude: -42.1,
      sourceUrl: "https://cneos.jpl.nasa.gov/fireballs/",
    },
  ],
  metadata: {
    provider: "JPL CNEOS",
    sourceTitle: "Fireball and Bolide Data",
    sourceUrl: "https://cneos.jpl.nasa.gov/fireballs/",
    freshness: "historical",
    observedAt: "2025-12-03T00:00:00.000Z",
    retrievedAt,
    attribution: "NASA/JPL CNEOS",
  },
};
