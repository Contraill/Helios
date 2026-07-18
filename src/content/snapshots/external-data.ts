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
      date: "2026-07-18",
      title: "Shadow and Rainbow",
      excerpt:
        "Sunlight, cloud droplets and a well-placed observer turn an atmospheric shadow into a compact study of light and color.",
      mediaType: "image",
      mediaUrl:
        "https://apod.nasa.gov/apod/image/2607/ShadowandRainbow_Loschiavo1024.jpg",
      serviceVersion: "v1",
      sourceUrl: "https://apod.nasa.gov/apod/ap260718.html",
    },
  ],
  metadata: {
    provider: "NASA APOD",
    sourceTitle: "Astronomy Picture of the Day",
    sourceUrl: "https://apod.nasa.gov/apod/",
    freshness: "latest-available",
    observedAt: "2026-07-18T00:00:00.000Z",
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
      identifier: "20260716000830",
      caption:
        "Earth seen from the DSCOVR spacecraft at the Sun–Earth L1 point.",
      capturedAt: "2026-07-16T00:03:42.000Z",
      imageUrl:
        "https://epic.gsfc.nasa.gov/archive/natural/2026/07/16/jpg/epic_1b_20260716000830.jpg",
      centroid: { latitude: 5.04, longitude: 172.54 },
      type: "natural",
    },
  ],
  metadata: {
    provider: "NASA EPIC",
    sourceTitle: "DSCOVR EPIC Natural Color Archive",
    sourceUrl: "https://epic.gsfc.nasa.gov/",
    freshness: "latest-available",
    observedAt: "2026-07-16T00:03:42.000Z",
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
      geometryType: "Point",
      coordinates: [-121.2, 39.4],
      sourceUrl: "https://eonet.gsfc.nasa.gov/",
    },
    {
      id: "EONET-VOL-2026-07",
      title: "Volcanic activity — sample archived event",
      category: "volcanoes",
      status: "open",
      observedAt: "2026-07-15T12:00:00.000Z",
      geometryType: "Point",
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
      "https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&TIME=2026-07-17&BBOX=-180,-90,180,90&CRS=EPSG:4326&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&FORMAT=image/jpeg&WIDTH=1024&HEIGHT=512",
    colorMode: "natural",
    latencyNote: "Near-real-time imagery may appear hours after observation.",
    attribution: "NASA EOSDIS GIBS",
    format: "image/jpeg",
    tileMatrixSet: "250m",
    extent: [-180, -90, 180, 90],
    availability: "verified",
  },
  {
    id: "GOES-East_ABI_FireTemp",
    title: "GOES-East fire temperature",
    instrument: "GOES-East / ABI",
    observedAt: "2026-07-17T12:00:00.000Z",
    imageUrl:
      "https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&TIME=2026-07-17T12:00:00Z&BBOX=-140,-60,-10,60&CRS=EPSG:4326&LAYERS=GOES-East_ABI_FireTemp&FORMAT=image/png&WIDTH=1024&HEIGHT=640",
    colorMode: "analysis",
    latencyNote: "Analysis layer; color represents estimated fire temperature.",
    attribution: "NASA EOSDIS GIBS",
    format: "image/png",
    tileMatrixSet: "1km",
    extent: [-140, -60, -10, 60],
    availability: "verified",
  },
  {
    id: "IMERG_Precipitation_Rate",
    title: "IMERG precipitation rate",
    instrument: "GPM / IMERG",
    observedAt: "2026-07-17",
    imageUrl:
      "https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&TIME=2026-07-17&BBOX=-180,-60,180,60&CRS=EPSG:4326&LAYERS=IMERG_Precipitation_Rate&FORMAT=image/png&WIDTH=1024&HEIGHT=384",
    colorMode: "analysis",
    latencyNote: "Dated precipitation analysis; not a live weather radar.",
    attribution: "NASA EOSDIS GIBS",
    format: "image/png",
    tileMatrixSet: "2km",
    extent: [-180, -60, 180, 60],
    availability: "verified",
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
        timeScale: "UTC",
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
    temperatureC: { min: -96.872, average: -62.314, max: -15.908 },
    pressurePa: { min: 722.0901, average: 750.563, max: 768.791 },
    windMps: { min: 1.051, average: 7.233, max: 22.455 },
    windDirection: "WNW",
    seasonNorthern: "late autumn",
    seasonSouthern: "late spring",
    valid: true,
    sampleCount: 88628,
    archiveMatch: "nearest",
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
      planetId: "mercury",
      nasaId: "PIA13823",
      title: "MESSENGER explores Mercury in color",
      excerpt:
        "MESSENGER color imaging reveals compositional differences across Mercury's cratered surface.",
      dateCreated: "2011-03-30T00:00:00.000Z",
      center: "JPL",
      keywords: ["Mercury", "MESSENGER"],
      mediaType: "image",
      thumbnailUrl:
        "https://images-assets.nasa.gov/image/PIA13823/PIA13823~thumb.jpg",
      creator: "NASA/JHUAPL/CIW",
      sourceUrl: "https://images.nasa.gov/details/PIA13823",
    },
    {
      planetId: "venus",
      nasaId: "PIA00207",
      title: "Magellan and Arecibo views of Venus",
      excerpt:
        "Radar observations compare surface structure hidden beneath Venus's opaque cloud deck.",
      dateCreated: "1996-01-29T00:00:00.000Z",
      center: "JPL",
      keywords: ["Venus", "Magellan", "radar"],
      mediaType: "image",
      thumbnailUrl:
        "https://images-assets.nasa.gov/image/PIA00207/PIA00207~thumb.jpg",
      creator: "NASA/JPL",
      sourceUrl: "https://images.nasa.gov/details/PIA00207",
    },
    {
      planetId: "earth",
      nasaId: "PIA18033",
      title: "Earth",
      excerpt:
        "A whole-disk Earth view provides mission context without being presented as a live observation.",
      dateCreated: "2014-02-12T00:00:00.000Z",
      center: "JPL",
      keywords: ["Earth", "Blue Marble"],
      mediaType: "image",
      thumbnailUrl:
        "https://images-assets.nasa.gov/image/PIA18033/PIA18033~thumb.jpg",
      creator: "NASA",
      sourceUrl: "https://images.nasa.gov/details/PIA18033",
    },
    {
      planetId: "mars",
      nasaId: "PIA21496",
      title: "From Tribulation to Perseverance on Mars",
      excerpt:
        "A mission image places Mars exploration within a specific rover and surface context.",
      dateCreated: "2017-02-14T00:00:00.000Z",
      center: "JPL",
      keywords: ["Mars", "Perseverance"],
      mediaType: "image",
      thumbnailUrl:
        "https://images-assets.nasa.gov/image/PIA21496/PIA21496~thumb.jpg",
      creator: "NASA/JPL-Caltech",
      sourceUrl: "https://images.nasa.gov/details/PIA21496",
    },
    {
      planetId: "jupiter",
      nasaId: "PIA22968",
      title: "Juno captures Jupiter lightning",
      excerpt:
        "Juno's instruments record lightning within Jupiter's deep and dynamic atmosphere.",
      dateCreated: "2019-06-11T00:00:00.000Z",
      center: "JPL",
      keywords: ["Jupiter", "Juno"],
      mediaType: "image",
      thumbnailUrl:
        "https://images-assets.nasa.gov/image/PIA22968/PIA22968~thumb.jpg",
      creator: "NASA/JPL-Caltech/SwRI",
      sourceUrl: "https://images.nasa.gov/details/PIA22968",
    },
    {
      planetId: "saturn",
      nasaId: "PIA05983",
      title: "Saturn from far and near",
      excerpt:
        "Cassini-Huygens observations resolve Saturn and its rings at mission scale.",
      dateCreated: "2004-07-01T00:00:00.000Z",
      center: "JPL",
      keywords: ["Saturn", "Cassini-Huygens"],
      mediaType: "image",
      thumbnailUrl:
        "https://images-assets.nasa.gov/image/PIA05983/PIA05983~thumb.jpg",
      creator: "NASA/JPL/Space Science Institute",
      sourceUrl: "https://images.nasa.gov/details/PIA05983",
    },
    {
      planetId: "uranus",
      nasaId: "PIA18182",
      title: "Uranus as seen by Voyager 2",
      excerpt:
        "Voyager 2 remains the only spacecraft to have observed Uranus at close range.",
      dateCreated: "1986-01-25T00:00:00.000Z",
      center: "JPL",
      keywords: ["Uranus", "Voyager 2"],
      mediaType: "image",
      thumbnailUrl:
        "https://images-assets.nasa.gov/image/PIA18182/PIA18182~thumb.jpg",
      creator: "NASA/JPL-Caltech",
      sourceUrl: "https://images.nasa.gov/details/PIA18182",
    },
    {
      planetId: "neptune",
      nasaId: "PIA01492",
      title: "Neptune from Voyager 2",
      excerpt:
        "Voyager 2 imaging records Neptune's clouds and deep-blue atmosphere during the 1989 flyby.",
      dateCreated: "1989-08-25T00:00:00.000Z",
      center: "JPL",
      keywords: ["Neptune", "Voyager 2"],
      mediaType: "image",
      thumbnailUrl:
        "https://images-assets.nasa.gov/image/PIA01492/PIA01492~thumb.jpg",
      creator: "NASA/JPL-Caltech",
      sourceUrl: "https://images.nasa.gov/details/PIA01492",
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
      radiatedEnergy10e10J: 0.12,
      estimatedImpactEnergyKt: 0.35,
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
