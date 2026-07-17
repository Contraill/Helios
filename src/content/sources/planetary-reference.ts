import {
  dataSourceReferenceSchema,
  type DataSourceReference,
} from "@/lib/data/schemas/source";

const ACCESSED_AT = "2026-07-17";

const rawSources = [
  {
    id: "jpl-planetary-physical-parameters",
    provider: "NASA Jet Propulsion Laboratory",
    title: "Planetary Physical Parameters",
    url: "https://ssd.jpl.nasa.gov/planets/phys_par.html",
    sourceType: "dataset",
    freshness: "reference",
    accessedAt: ACCESSED_AT,
    publishedOrUpdatedAt: "2019-12-12",
    notes: {
      en: "Primary reference for radii, mass, density, rotation, orbital period, gravity and escape velocity.",
      tr: "Yarıçap, kütle, yoğunluk, dönüş, yörünge süresi, yerçekimi ve kaçış hızı için birincil referans.",
    },
  },
  {
    id: "jpl-approximate-planetary-elements",
    provider: "NASA Jet Propulsion Laboratory",
    title: "Approximate Positions of the Planets",
    url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html",
    sourceType: "dataset",
    freshness: "reference",
    accessedAt: ACCESSED_AT,
    notes: {
      en: "J2000-fit semimajor axis, eccentricity and inclination used for explanatory orbit geometry, not precise ephemerides.",
      tr: "Açıklayıcı yörünge geometrisi için kullanılan J2000 uyumlu büyük yarı eksen, dışmerkezlik ve eğim değerleri; kesin efemeris değildir.",
    },
  },
  {
    id: "nasa-planet-order-distance",
    provider: "NASA Science",
    title: "Planet Sizes and Locations in Our Solar System",
    url: "https://science.nasa.gov/solar-system/planet-sizes-and-locations-in-our-solar-system/",
    sourceType: "article",
    freshness: "reference",
    accessedAt: ACCESSED_AT,
  },
  {
    id: "nasa-sun-fact-sheet",
    provider: "NASA Goddard Space Flight Center",
    title: "Sun Fact Sheet",
    url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html",
    sourceType: "dataset",
    freshness: "reference",
    accessedAt: ACCESSED_AT,
    publishedOrUpdatedAt: "2024-05-09",
    notes: {
      en: "Volumetric mean radius used by the sourced Sun scene model.",
      tr: "Kaynaklı Güneş sahne modelinde kullanılan hacimsel ortalama yarıçap.",
    },
  },
  {
    id: "nasa-solar-system-temperatures",
    provider: "NASA Science",
    title: "Temperatures Across Our Solar System",
    url: "https://science.nasa.gov/solar-system/temperatures-across-our-solar-system/",
    sourceType: "article",
    freshness: "reference",
    accessedAt: ACCESSED_AT,
    publishedOrUpdatedAt: "2025-04-29",
    notes: {
      en: "Rocky-planet values are surface means; giant-planet values use an Earth sea-level-equivalent pressure layer.",
      tr: "Kayalık gezegen değerleri yüzey ortalamasıdır; dev gezegenlerde Dünya deniz seviyesi basıncına eşdeğer atmosfer katmanı kullanılır.",
    },
  },
  ...planetFactSources(),
  {
    id: "nasa-earth-moon-facts",
    provider: "NASA Science",
    title: "Moon Facts",
    url: "https://science.nasa.gov/moon/facts/",
    sourceType: "article",
    freshness: "reference",
    accessedAt: ACCESSED_AT,
    publishedOrUpdatedAt: "2026-02-12",
  },
  {
    id: "nasa-mars-moons-facts",
    provider: "NASA Science",
    title: "Mars Moons: Facts",
    url: "https://science.nasa.gov/mars/moons/facts/",
    sourceType: "article",
    freshness: "reference",
    accessedAt: ACCESSED_AT,
    publishedOrUpdatedAt: "2024-11-03",
  },
  {
    id: "jpl-planetary-satellite-discoveries",
    provider: "NASA Jet Propulsion Laboratory",
    title: "Planetary Satellite Discovery Circumstances",
    url: "https://ssd.jpl.nasa.gov/sats/discovery.html",
    sourceType: "dataset",
    freshness: "latest-available",
    accessedAt: ACCESSED_AT,
    notes: {
      en: "IAU-recognized planetary satellite list used for the dated moon-count snapshot.",
      tr: "Tarihli uydu sayısı kaydı için kullanılan, IAU tarafından tanınan gezegen uyduları listesi.",
    },
  },
] as const;

function planetFactSources() {
  const facts = [
    ["mercury", "Mercury: Facts", "https://science.nasa.gov/mercury/facts/"],
    ["venus", "Venus: Facts", "https://science.nasa.gov/venus/venus-facts/"],
    ["earth", "Facts About Earth", "https://science.nasa.gov/earth/facts/"],
    ["mars", "Mars: Facts", "https://science.nasa.gov/mars/facts/"],
    [
      "jupiter",
      "Jupiter Facts",
      "https://science.nasa.gov/jupiter/jupiter-facts/",
    ],
    ["saturn", "Saturn: Facts", "https://science.nasa.gov/saturn/facts/"],
    ["uranus", "Uranus: Facts", "https://science.nasa.gov/uranus/facts/"],
    [
      "neptune",
      "Neptune: Facts",
      "https://science.nasa.gov/neptune/neptune-facts/",
    ],
  ] as const;

  return facts.map(([id, title, url]) => ({
    id: `nasa-${id}-facts`,
    provider: "NASA Science",
    title,
    url,
    sourceType: "article" as const,
    freshness: "reference" as const,
    accessedAt: ACCESSED_AT,
  }));
}

export const planetaryReferenceSources: readonly DataSourceReference[] =
  Object.freeze(
    rawSources.map((source) => dataSourceReferenceSchema.parse(source)),
  );

export const planetaryReferenceSourceById = new Map(
  planetaryReferenceSources.map((source) => [source.id, source] as const),
);
