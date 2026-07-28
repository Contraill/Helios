import { getPlanetById, isPlanetId } from "@/content/planets";
import { sun } from "@/content/solar-system/sun";
import {
  DWARF_SATELLITE_BY_ID,
  DWARF_SATELLITES,
  isDwarfSatelliteId,
} from "@/features/solar-system/lib/dwarf-satellite-catalogue";
import {
  EXTENDED_BODIES,
  EXTENDED_BODY_BY_ID,
  isExtendedBodyId,
} from "@/features/solar-system/lib/extended-system";
import {
  FEATURED_MOONS,
  isMoonId,
  MOON_BY_ID,
} from "@/features/solar-system/lib/moon-catalogue";
import { visualProfileFor } from "@/features/solar-system/lib/celestial-visual-registry";
import {
  bodyDetailHref,
  CELESTIAL_DETAIL_SLUGS,
  celestialDetailHref,
  isCelestialDetailSlug,
  isRealBodySlug,
  REAL_BODY_SLUGS,
  type CelestialDetailSlug,
  type RealBodySlug,
} from "@/features/solar-system/lib/celestial-detail-routes";
import { regionMetadata } from "@/features/solar-system/lib/celestial-registry";
import {
  isSystemRegionIdValue,
  type DwarfSatelliteId,
  type ExtendedBodyId,
  type MoonId,
  type SystemRegionId,
} from "@/features/solar-system/types/celestial-body";
import type { PlanetId } from "@/lib/data/schemas/planet";
import type { Locale } from "@/lib/i18n/locale";

import {
  DWARF_SATELLITE_EDITORIAL_COPY,
  MOON_EDITORIAL_COPY,
} from "./body-detail-copy";
import {
  DWARF_SATELLITE_EDITORIAL_COPY_TR,
  MOON_EDITORIAL_COPY_TR,
} from "./body-detail-copy.tr";
import { EXTENDED_BODY_COPY_TR } from "./extended-body-copy.tr";
import { REGION_EDITORIAL_COPY } from "./region-detail-copy";
import { REGION_EDITORIAL_COPY_TR } from "./region-detail-copy.tr";

export {
  bodyDetailHref,
  CELESTIAL_DETAIL_SLUGS,
  celestialDetailHref,
  isCelestialDetailSlug,
  isRealBodySlug,
  REAL_BODY_SLUGS,
};
export type { CelestialDetailSlug, RealBodySlug };

export type DetailVisualKind = "star" | "world" | "belt" | "cloud" | "boundary";

export interface BodyMetric {
  readonly label: string;
  readonly value: string;
  readonly note?: string;
}
export interface BodySection {
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
}
export interface BodySourceLink {
  readonly label: string;
  readonly href: string;
}
export interface BodyRelation {
  readonly id: CelestialDetailSlug;
  readonly name: string;
  readonly context: string;
}
export interface BodyDetailModel {
  readonly id: Exclude<RealBodySlug, PlanetId> | SystemRegionId;
  readonly name: string;
  readonly kindLabel: string;
  readonly accentColor: string;
  readonly tagline: string;
  readonly overview: string;
  readonly visualKind: DetailVisualKind;
  readonly visualAssetPath?: string;
  readonly visualGeometry?: "sphere" | "ellipsoid" | "irregular" | "bilobed";
  readonly metricTitle?: string;
  readonly modelLabel?: string;
  readonly visualLabel?: string;
  readonly parent?: BodyRelation;
  readonly metrics: readonly BodyMetric[];
  readonly sections: readonly BodySection[];
  readonly sourceLinks: readonly BodySourceLink[];
  readonly related: readonly BodyRelation[];
  readonly representationLabel: string;
  readonly representationNote: string;
  readonly surfaceLabel: string;
  readonly surfaceNote: string;
}

const MAIN_BELT_BODY_IDS = new Set<ExtendedBodyId>([
  "ceres",
  "vesta",
  "pallas",
  "hygiea",
]);
const COMET_BODY_IDS = new Set<ExtendedBodyId>([
  "halley",
  "hale-bopp",
  "encke",
  "67p",
  "neowise",
  "tempel-1",
]);

const modelCopy = {
  en: {
    sun: {
      kind: "Star · system origin",
      tagline: "The source of the system’s light, heat and orbital structure.",
      overview:
        "The Sun is not simply the brightest object in the scene. It is the physical origin around which the planetary system is organised, and its scale sets the reference for every distance and body size that follows.",
      metrics: ["Mean radius", "Diameter", "Scene role", "Physical basis"],
      metricNotes: [
        "Reference value used by the scene scale strategy.",
        "System origin",
        "Physical surface reference",
      ],
      sections: [
        {
          eyebrow: "Scale",
          title: "Every other body begins here",
          body: "Exploration mode enlarges small worlds and compresses distance for navigation, but the Sun’s sourced radius remains the anchor for the transformation. Scientific mode keeps the same scene system while changing the scale profile.",
        },
        {
          eyebrow: "Reading the visual",
          title: "Light is expressive; the data stays separate",
          body: "Corona, glow and surface motion communicate stellar character. They are visual layers, not measurements of a specific solar event. Current solar activity belongs on the Data page with its own observation and retrieval times.",
        },
      ],
      source: "NASA Sun fact sheet",
      related: "First planet from the Sun",
      representation: "Physical surface reference",
      representationNote:
        "The Sun is fixed at the scene origin. Visual rotation and corona treatment are illustrative layers around sourced physical scale.",
      surface: "Textured emissive surface",
      surfaceNote:
        "The surface texture and corona effects follow the project asset limits and do not claim to reproduce a current solar observation.",
    },
    labels: {
      featuredMoon: "Featured planetary moon",
      dwarfSatellite: "Dwarf-system satellite",
      parentPlanet: "Parent planet",
      parentDwarf: "Parent dwarf planet or Kuiper object",
      siblingMoon: "Featured moon in the same planetary system",
      siblingDwarf: "Companion in the same dwarf-planet system",
      meanRadius: "Mean radius",
      orbitalDistance: "Mean orbital distance",
      orbitalDistanceNote: "Semi-major axis around the parent body.",
      orbitalPeriod: "Orbital period",
      eccentricity: "Eccentricity",
      inclination: "Inclination",
      rotation: "Rotation",
      locked: "Tidally locked",
      unresolvedRotation: "Rotation unresolved",
      unresolved: "Unresolved",
      orbitPlane: "Orbit plane",
      sourceBacked: "Source-backed",
      representative: "Representative",
      worldPortrait: "World portrait",
      systemPortrait: "System portrait",
      systemGeometry: "System geometry",
      primarySatelliteSource: "JPL planetary satellite elements",
      primarySystemSource: "Primary system source",
      orbitPlaneSource: "Orbit-plane source",
      semiMajorAxis: "Semi-major axis",
      earthYears: "Earth years",
      periodNote: "Keplerian estimate from the catalogued semi-major axis.",
      visualGeometry: "Visual geometry",
      orbitalCharacter: "Orbital character",
      catalogueContext: "Catalogue context",
      primaryOrbitSource: "Primary science and orbital source",
      modelLabel: "Spatial representation",
    },
  },
  tr: {
    sun: {
      kind: "Yıldız · sistem başlangıcı",
      tagline: "Sistemin ışık, ısı ve yörünge yapısının kaynağı.",
      overview:
        "Güneş yalnızca sahnedeki en parlak cisim değildir. Gezegen sisteminin çevresinde düzenlendiği fiziksel başlangıçtır; ölçeği, sonraki bütün uzaklık ve cisim boyutlarının referansını belirler.",
      metrics: ["Ortalama yarıçap", "Çap", "Sahne rolü", "Fiziksel temel"],
      metricNotes: [
        "Sahne ölçek stratejisinin kullandığı referans değer.",
        "Sistem başlangıcı",
        "Fiziksel yüzey referansı",
      ],
      sections: [
        {
          eyebrow: "Ölçek",
          title: "Diğer bütün cisimler buradan başlar",
          body: "Keşif modu küçük dünyaları büyütür ve navigasyon için uzaklığı sıkıştırır; ancak Güneş'in kaynaklı yarıçapı dönüşümün dayanağı olarak kalır. Bilimsel mod aynı görüntüleyiciyi korur, yalnızca ölçek profilini değiştirir.",
        },
        {
          eyebrow: "Görseli okumak",
          title: "Işık etkileyici, veri ayrı kalır",
          body: "Korona, parıltı ve yüzey hareketi yıldız karakterini anlatır. Belirli bir Güneş olayının ölçümü değildir. Güncel Güneş etkinliği gözlem ve alınma zamanlarıyla Veri sayfasında yer alır.",
        },
      ],
      source: "NASA Güneş bilgi formu",
      related: "Güneş'ten ilk gezegen",
      representation: "Fiziksel yüzey referansı",
      representationNote:
        "Güneş sahne başlangıcında sabittir. Görsel dönüş ve korona işlenişi kaynaklı fiziksel ölçeğin çevresindeki açıklayıcı katmanlardır.",
      surface: "Dokulu ışık yayan yüzey",
      surfaceNote:
        "Görüntü dokusu ve korona efektleri proje varlık politikasıyla sınırlıdır; güncel bir Güneş gözlemini yeniden ürettiğini iddia etmez.",
    },
    labels: {
      featuredMoon: "Öne çıkan gezegen uydusu",
      dwarfSatellite: "Cüce sistem uydusu",
      parentPlanet: "Ana gezegen",
      parentDwarf: "Ana cüce gezegen veya Kuiper cismi",
      siblingMoon: "Aynı gezegen sistemindeki öne çıkan uydu",
      siblingDwarf: "Aynı cüce gezegen sistemindeki eşlikçi",
      meanRadius: "Ortalama yarıçap",
      orbitalDistance: "Ortalama yörünge uzaklığı",
      orbitalDistanceNote: "Ana cisim çevresindeki yarı büyük eksen.",
      orbitalPeriod: "Yörünge dönemi",
      eccentricity: "Dışmerkezlik",
      inclination: "Eğiklik",
      rotation: "Dönüş",
      locked: "Gelgitsel kilitli",
      unresolvedRotation: "Dönüş çözümlenmemiş",
      unresolved: "Çözümlenmemiş",
      orbitPlane: "Yörünge düzlemi",
      sourceBacked: "Kaynaklı",
      representative: "Temsili",
      worldPortrait: "Dünya portresi",
      systemPortrait: "Sistem portresi",
      systemGeometry: "Sistem geometrisi",
      primarySatelliteSource: "JPL gezegen uydusu elemanları",
      primarySystemSource: "Birincil sistem kaynağı",
      orbitPlaneSource: "Yörünge düzlemi kaynağı",
      semiMajorAxis: "Yarı büyük eksen",
      earthYears: "Dünya yılı",
      periodNote: "Kabul edilen yarı büyük eksenden Kepler tahmini.",
      visualGeometry: "Görsel geometri",
      orbitalCharacter: "Yörünge karakteri",
      catalogueContext: "Katalog bağlamı",
      primaryOrbitSource: "Birincil bilim ve yörünge kaynağı",
      modelLabel: "Mekânsal temsil",
    },
  },
} as const;

export function bodyName(slug: RealBodySlug, locale: Locale = "en"): string {
  if (slug === "sun") return sun.name[locale];
  if (isPlanetId(slug)) return getPlanetById(slug)?.name[locale] ?? slug;
  if (isMoonId(slug))
    return slug === "moon-earth-moon" && locale === "tr"
      ? "Ay"
      : MOON_BY_ID[slug].name;
  if (isExtendedBodyId(slug)) return EXTENDED_BODY_BY_ID[slug].name;
  return DWARF_SATELLITE_BY_ID[slug].name;
}

export function detailName(
  slug: CelestialDetailSlug,
  locale: Locale = "en",
): string {
  return isSystemRegionIdValue(slug)
    ? regionMetadata(slug, locale).displayName
    : bodyName(slug, locale);
}

export function detailDescription(
  slug: CelestialDetailSlug,
  locale: Locale = "en",
): string {
  return isSystemRegionIdValue(slug)
    ? regionCopy(locale)[slug].metadataDescription
    : bodyDescription(slug, locale);
}

export function bodyDescription(
  slug: RealBodySlug,
  locale: Locale = "en",
): string {
  if (slug === "sun")
    return locale === "tr"
      ? "Güneş Sistemi merkezindeki yıldız; kaynaklı ölçek ve fiziksel yüzeyi açıkça ayrılan bir görsel temsille sunulur."
      : "The star at the centre of the Solar System, presented with sourced scale and a clearly identified visual interpretation of its physical surface.";
  if (isPlanetId(slug))
    return (
      getPlanetById(slug)?.description[locale] ??
      (locale === "tr" ? "Gezegen detayı" : "Planet detail")
    );
  if (isMoonId(slug))
    return `${bodyName(slug, locale)} — ${moonCopy(locale)[slug].tagline}`;
  if (isDwarfSatelliteId(slug))
    return `${bodyName(slug, locale)} — ${dwarfSatelliteCopy(locale)[slug].tagline}`;
  return locale === "tr"
    ? EXTENDED_BODY_COPY_TR[slug].description
    : EXTENDED_BODY_BY_ID[slug].description;
}

export function createRegionDetailModel(
  id: SystemRegionId,
  locale: Locale = "en",
): BodyDetailModel {
  const copy = regionCopy(locale)[id];
  return {
    id,
    name: regionMetadata(id, locale).displayName,
    kindLabel: copy.kindLabel,
    accentColor: copy.accentColor,
    tagline: copy.tagline,
    overview: copy.overview,
    visualKind: copy.visualKind,
    metricTitle: copy.metricTitle,
    modelLabel: modelCopy[locale].labels.modelLabel,
    visualLabel: copy.visualLabel,
    metrics: copy.metrics,
    sections: copy.sections,
    sourceLinks: copy.sourceLinks,
    related: copy.related.map(({ id: relatedId, context }) =>
      relation(relatedId, context, locale),
    ),
    representationLabel: copy.representationLabel,
    representationNote: copy.representationNote,
    surfaceLabel: copy.visualValue,
    surfaceNote: copy.visualNote,
  };
}

export function createNonPlanetBodyDetailModel(
  slug: Exclude<RealBodySlug, PlanetId>,
  locale: Locale = "en",
): BodyDetailModel {
  if (slug === "sun") return createSunModel(locale);
  if (isMoonId(slug)) return createMoonModel(slug, locale);
  if (isDwarfSatelliteId(slug)) return createDwarfSatelliteModel(slug, locale);
  return createExtendedModel(slug, locale);
}

function createSunModel(locale: Locale): BodyDetailModel {
  const radiusKm = sun.physical.meanRadiusKm.value;
  const copy = modelCopy[locale].sun;
  return {
    id: "sun",
    name: sun.name[locale],
    kindLabel: copy.kind,
    accentColor: "#f2bd63",
    tagline: copy.tagline,
    overview: copy.overview,
    visualKind: "star",
    visualAssetPath: "/textures/planets/sun.webp",
    visualGeometry: "sphere",
    metrics: [
      {
        label: copy.metrics[0],
        value: `${formatNumber(radiusKm, locale)} km`,
        note: copy.metricNotes[0],
      },
      {
        label: copy.metrics[1],
        value: `${formatNumber(radiusKm * 2, locale)} km`,
      },
      { label: copy.metrics[2], value: copy.metricNotes[1] },
      { label: copy.metrics[3], value: copy.metricNotes[2] },
    ],
    sections: copy.sections,
    sourceLinks: [
      {
        label: copy.source,
        href: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html",
      },
    ],
    related: [relation("mercury", copy.related, locale)],
    representationLabel: copy.representation,
    representationNote: copy.representationNote,
    surfaceLabel: copy.surface,
    surfaceNote: copy.surfaceNote,
  };
}

function createMoonModel(id: MoonId, locale: Locale): BodyDetailModel {
  const moon = MOON_BY_ID[id];
  const copy = moonCopy(locale)[id];
  const labels = modelCopy[locale].labels;
  const visual = visualProfileFor(id);
  const siblings = FEATURED_MOONS.filter(
    ({ parentPlanetId, id: siblingId }) =>
      parentPlanetId === moon.parentPlanetId && siblingId !== id,
  ).map(({ id: siblingId }) => relation(siblingId, labels.siblingMoon, locale));
  return {
    id,
    name: bodyName(id, locale),
    kindLabel: labels.featuredMoon,
    accentColor: visual.surface.fallbackColor,
    tagline: copy.tagline,
    overview: copy.overview,
    visualKind: "world",
    visualAssetPath: visual.surface.assetPath,
    visualGeometry: visual.geometry.kind,
    parent: relation(moon.parentPlanetId, labels.parentPlanet, locale),
    metrics: [
      {
        label: labels.meanRadius,
        value: `${formatNumber(moon.meanRadiusKm, locale)} km`,
      },
      {
        label: labels.orbitalDistance,
        value: `${formatNumber(moon.semiMajorAxisKm, locale)} km`,
        note: labels.orbitalDistanceNote,
      },
      {
        label: labels.orbitalPeriod,
        value: formatDays(moon.orbitalPeriodDays, locale),
      },
      {
        label: labels.eccentricity,
        value: formatDecimal(moon.eccentricity, locale),
      },
      {
        label: labels.inclination,
        value: `${formatDecimal(moon.inclinationDeg, locale)}°`,
        note: localizeReferencePlane(
          moon.representation.referencePlane,
          locale,
        ),
      },
      {
        label: labels.rotation,
        value:
          moon.rotation.kind === "tidally-locked"
            ? labels.locked
            : labels.unresolvedRotation,
      },
    ],
    sections: [
      {
        eyebrow: labels.worldPortrait,
        title: copy.focusTitle,
        body: copy.focusBody,
      },
      {
        eyebrow: labels.systemGeometry,
        title:
          locale === "tr"
            ? `${bodyName(id, locale)}, ${detailName(moon.parentPlanetId, locale)} çevresinde`
            : `${moon.name} in motion around ${detailName(moon.parentPlanetId, locale)}`,
        body: moonSystemContext(moon, locale),
      },
    ],
    sourceLinks: uniqueLinks([
      {
        label: labels.primarySatelliteSource,
        href: moon.representation.sourceUrl,
      },
    ]),
    related: siblings.length
      ? siblings
      : [relation(moon.parentPlanetId, labels.parentPlanet, locale)],
    representationLabel: representationLabel(
      moon.representation.representationType,
      locale,
    ),
    representationNote: localizeRepresentationNote(
      moon.representation.precisionNote,
      locale,
    ),
    surfaceLabel: localizeToken(visual.surface.representation, locale),
    surfaceNote: localizeSurfaceNote(visual.surface.note, locale),
  };
}

function createDwarfSatelliteModel(
  id: DwarfSatelliteId,
  locale: Locale,
): BodyDetailModel {
  const moon = DWARF_SATELLITE_BY_ID[id];
  const copy = dwarfSatelliteCopy(locale)[id];
  const labels = modelCopy[locale].labels;
  const visual = visualProfileFor(id);
  const siblings = DWARF_SATELLITES.filter(
    ({ parentId, id: siblingId }) =>
      parentId === moon.parentId && siblingId !== id,
  ).map(({ id: siblingId }) =>
    relation(siblingId, labels.siblingDwarf, locale),
  );
  return {
    id,
    name: moon.name,
    kindLabel: labels.dwarfSatellite,
    accentColor: visual.surface.fallbackColor,
    tagline: copy.tagline,
    overview: copy.overview,
    visualKind: "world",
    visualAssetPath: visual.surface.assetPath,
    visualGeometry: visual.geometry.kind,
    parent: relation(moon.parentId, labels.parentDwarf, locale),
    metrics: [
      {
        label: labels.meanRadius,
        value: `${formatNumber(moon.meanRadiusKm, locale)} km`,
      },
      {
        label: labels.orbitalDistance,
        value: `${formatNumber(moon.semiMajorAxisKm, locale)} km`,
      },
      {
        label: labels.orbitalPeriod,
        value: formatDays(moon.orbitalPeriodDays, locale),
      },
      {
        label: labels.eccentricity,
        value:
          moon.eccentricity === null
            ? labels.unresolved
            : formatDecimal(moon.eccentricity, locale),
      },
      {
        label: labels.inclination,
        value:
          moon.inclinationDeg === null
            ? labels.unresolved
            : `${formatDecimal(moon.inclinationDeg, locale)}°`,
        note: localizeReferencePlane(moon.orbitPlaneReference, locale),
      },
      {
        label: labels.orbitPlane,
        value:
          moon.orbitPlaneStatus === "source-backed-parent-equatorial"
            ? labels.sourceBacked
            : labels.representative,
      },
    ],
    sections: [
      {
        eyebrow: labels.systemPortrait,
        title: copy.focusTitle,
        body: copy.focusBody,
      },
      {
        eyebrow: labels.systemGeometry,
        title:
          locale === "tr"
            ? `${moon.name}, ${detailName(moon.parentId, locale)} çevresinde`
            : `${moon.name} around ${detailName(moon.parentId, locale)}`,
        body: dwarfSatelliteSystemContext(moon, locale),
      },
    ],
    sourceLinks: uniqueLinks([
      {
        label: labels.primarySystemSource,
        href: moon.representation.sourceUrl,
      },
      ...(moon.orbitPlaneSourceUrl
        ? [{ label: labels.orbitPlaneSource, href: moon.orbitPlaneSourceUrl }]
        : []),
    ]),
    related: siblings.length
      ? siblings
      : [relation(moon.parentId, labels.parentDwarf, locale)],
    representationLabel: representationLabel(
      moon.representation.representationType,
      locale,
    ),
    representationNote: localizeRepresentationNote(
      moon.representation.precisionNote,
      locale,
    ),
    surfaceLabel: localizeToken(visual.surface.representation, locale),
    surfaceNote: localizeSurfaceNote(visual.surface.note, locale),
  };
}

function createExtendedModel(
  id: ExtendedBodyId,
  locale: Locale,
): BodyDetailModel {
  const body = EXTENDED_BODY_BY_ID[id];
  const labels = modelCopy[locale].labels;
  const visual = visualProfileFor(id);
  const group = extendedRelationGroup(id);
  const index = group.findIndex(({ id: bodyId }) => bodyId === id);
  const neighbors = [group[index - 1], group[index + 1]]
    .filter(Boolean)
    .map((neighbor) =>
      relation(neighbor.id, localizeKind(neighbor.kind, locale), locale),
    );
  const periodYears = Math.pow(body.semiMajorAxisAu, 1.5);
  return {
    id,
    name: body.name,
    kindLabel: localizeKind(body.kind, locale),
    accentColor: body.color,
    tagline: locale === "tr" ? EXTENDED_BODY_COPY_TR[id].tagline : body.tagline,
    overview:
      locale === "tr"
        ? EXTENDED_BODY_COPY_TR[id].description
        : body.description,
    visualKind: "world",
    visualAssetPath: visual.surface.assetPath,
    visualGeometry: visual.geometry.kind,
    metrics: [
      {
        label: labels.meanRadius,
        value: `${formatNumber(body.meanRadiusKm, locale)} km`,
      },
      {
        label: labels.semiMajorAxis,
        value: `${formatDecimal(body.semiMajorAxisAu, locale)} AU`,
      },
      {
        label: labels.orbitalPeriod,
        value: `${formatDecimal(periodYears, locale)} ${labels.earthYears}`,
        note: labels.periodNote,
      },
      {
        label: labels.eccentricity,
        value: formatDecimal(body.eccentricity, locale),
      },
      {
        label: labels.inclination,
        value: `${formatDecimal(body.inclinationDeg, locale)}°`,
      },
      {
        label: labels.visualGeometry,
        value: localizeToken(visual.geometry.kind, locale),
      },
    ],
    sections: [
      {
        eyebrow: labels.orbitalCharacter,
        title: orbitalCharacter(body.eccentricity, body.inclinationDeg, locale),
        body: extendedOrbitContext(body, periodYears, locale),
      },
      {
        eyebrow: labels.catalogueContext,
        title:
          locale === "tr"
            ? `${body.name} ve Helios'taki yakın katalog eşleri`
            : `${body.name} among its nearest Helios peers`,
        body: extendedCatalogueContext(body, group, locale),
      },
    ],
    sourceLinks: [{ label: labels.primaryOrbitSource, href: body.sourceUrl }],
    related: neighbors,
    representationLabel: representationLabel(
      body.representation.representationType,
      locale,
    ),
    representationNote: localizeRepresentationNote(
      body.representation.precisionNote,
      locale,
    ),
    surfaceLabel: localizeToken(visual.surface.representation, locale),
    surfaceNote: localizeSurfaceNote(visual.surface.note, locale),
  };
}

function moonSystemContext(
  moon: (typeof FEATURED_MOONS)[number],
  locale: Locale,
): string {
  if (locale === "tr") {
    const rotation =
      moon.rotation.kind === "tidally-locked"
        ? "Eşzamanlı dönüşü aynı yarımküreyi büyük ölçüde ana cisme dönük tutar."
        : "Dönüş durumu dekoratif bir spin atanmak yerine çözümlenmemiş kalır.";
    return `${moon.name}, ${formatNumber(moon.semiMajorAxisKm, locale)} km ortalama yörünge uzaklığında ilerler ve turunu ${formatDays(moon.orbitalPeriodDays, locale)} içinde tamamlar. ${formatDecimal(moon.eccentricity, locale)} dışmerkezlik ve ${formatDecimal(moon.inclinationDeg, locale)}° eğiklik ${localizeReferencePlane(moon.representation.referencePlane, locale)} düzlemine göre okunur. ${rotation}`;
  }
  const rotation =
    moon.rotation.kind === "tidally-locked"
      ? "Synchronous rotation keeps the same hemisphere broadly oriented toward the parent body."
      : "The rotation state remains unresolved instead of being assigned a decorative spin.";
  return `${moon.name} travels at a mean orbital distance of ${formatNumber(moon.semiMajorAxisKm, locale)} km and completes a circuit in ${formatDays(moon.orbitalPeriodDays, locale)}. Its eccentricity of ${formatDecimal(moon.eccentricity, locale)} and ${formatDecimal(moon.inclinationDeg, locale)}° inclination are read against ${moon.representation.referencePlane}. ${rotation}`;
}

function dwarfSatelliteSystemContext(
  moon: (typeof DWARF_SATELLITES)[number],
  locale: Locale,
): string {
  if (locale === "tr") {
    const eccentricity =
      moon.eccentricity === null
        ? "Dışmerkezliği çözümlenmemiştir"
        : `Kataloglanan dışmerkezliği ${formatDecimal(moon.eccentricity, locale)}'dir`;
    const inclination =
      moon.inclinationDeg === null
        ? "yörünge eğikliği ileri sürülmez"
        : `kataloglanan eğiklik ${formatDecimal(moon.inclinationDeg, locale)}°'dir`;
    return `${moon.name}, ${formatNumber(moon.semiMajorAxisKm, locale)} km ortalama uzaklıkta ${formatDays(moon.orbitalPeriodDays, locale)} dönemle dolanır. ${eccentricity}; ${localizeReferencePlane(moon.orbitPlaneReference, locale)} düzlemine göre ${inclination}. Eksik açısal yönelim açıkça temsili kalır.`;
  }
  const eccentricity =
    moon.eccentricity === null
      ? "Its eccentricity remains unresolved"
      : `Its catalogued eccentricity is ${formatDecimal(moon.eccentricity, locale)}`;
  const inclination =
    moon.inclinationDeg === null
      ? "the orbital inclination is not asserted"
      : `the catalogued inclination is ${formatDecimal(moon.inclinationDeg, locale)}°`;
  return `${moon.name} orbits at a mean distance of ${formatNumber(moon.semiMajorAxisKm, locale)} km with a period of ${formatDays(moon.orbitalPeriodDays, locale)}. ${eccentricity}, and ${inclination} relative to ${moon.orbitPlaneReference}. Missing angular orientation stays explicitly representative.`;
}

function extendedOrbitContext(
  body: (typeof EXTENDED_BODIES)[number],
  periodYears: number,
  locale: Locale,
): string {
  if (locale === "tr")
    return `${body.name}; ${formatDecimal(body.semiMajorAxisAu, locale)} AU yarı büyük eksen, ${formatDecimal(body.eccentricity, locale)} dışmerkezlik ve ${formatDecimal(body.inclinationDeg, locale)}° eğiklikle kataloglanan bir yol izler. İki cisim yaklaşımındaki dönem tahmini ${formatDecimal(periodYears, locale)} Dünya yılıdır; aşağıdaki temsil notları Keşfet görünümünün kullandığı kaynak çağını ve hassasiyet sınırını açıklar.`;
  return `${body.name} follows a catalogued path with a ${formatDecimal(body.semiMajorAxisAu, locale)} AU semi-major axis, eccentricity ${formatDecimal(body.eccentricity, locale)}, and ${formatDecimal(body.inclinationDeg, locale)}° inclination. The resulting two-body period estimate is ${formatDecimal(periodYears, locale)} Earth years; the representation notes below state the source epoch and precision boundary used by Explore.`;
}

function extendedCatalogueContext(
  body: (typeof EXTENDED_BODIES)[number],
  group: readonly (typeof EXTENDED_BODIES)[number][],
  locale: Locale,
): string {
  const peers = group
    .filter(({ id }) => id !== body.id)
    .map(({ name }) => name)
    .join(", ");
  if (locale === "tr") {
    const groupLabel = MAIN_BELT_BODY_IDS.has(body.id)
      ? "ana kuşak seçimi"
      : COMET_BODY_IDS.has(body.id)
        ? "kuyruklu yıldız seçimi"
        : "dış sistem seçimi";
    return `${body.name}, Helios ${groupLabel} içinde ${peers} ile ilişkilendirilir. Gruplama komşu okumayı tutarlı kılar; bu cisimlerin aynı bileşime, kökene veya güncel fiziksel duruma sahip olduğunu ima etmez.`;
  }
  const groupLabel = MAIN_BELT_BODY_IDS.has(body.id)
    ? "main-belt selection"
    : COMET_BODY_IDS.has(body.id)
      ? "comet selection"
      : "outer-system selection";
  return `${body.name} is linked with ${peers} inside the Helios ${groupLabel}. The grouping keeps adjacent reading coherent; it does not imply that these bodies share the same composition, origin, or present physical state.`;
}

function extendedRelationGroup(id: ExtendedBodyId) {
  if (MAIN_BELT_BODY_IDS.has(id))
    return EXTENDED_BODIES.filter(({ id: bodyId }) =>
      MAIN_BELT_BODY_IDS.has(bodyId),
    );
  if (COMET_BODY_IDS.has(id))
    return EXTENDED_BODIES.filter(({ id: bodyId }) =>
      COMET_BODY_IDS.has(bodyId),
    );
  return EXTENDED_BODIES.filter(
    ({ id: bodyId }) =>
      !MAIN_BELT_BODY_IDS.has(bodyId) && !COMET_BODY_IDS.has(bodyId),
  );
}

function relation(
  id: CelestialDetailSlug,
  context: string,
  locale: Locale,
): BodyRelation {
  return { id, name: detailName(id, locale), context };
}
function moonCopy(locale: Locale) {
  return locale === "tr" ? MOON_EDITORIAL_COPY_TR : MOON_EDITORIAL_COPY;
}
function dwarfSatelliteCopy(locale: Locale) {
  return locale === "tr"
    ? DWARF_SATELLITE_EDITORIAL_COPY_TR
    : DWARF_SATELLITE_EDITORIAL_COPY;
}
function regionCopy(locale: Locale) {
  return locale === "tr" ? REGION_EDITORIAL_COPY_TR : REGION_EDITORIAL_COPY;
}

function representationLabel(type: string, locale: Locale): string {
  const map: Record<string, readonly [string, string]> = {
    "horizons-window": [
      "Horizons ephemeris window",
      "Horizons efemeris aralığı",
    ],
    "latest-available": [
      "Latest available source state",
      "Son mevcut kaynak durumu",
    ],
    "propagated-preview": ["Propagated preview", "İleri taşınmış önizleme"],
    "representative-mean-elements": [
      "Representative mean elements",
      "Temsili ortalama elemanlar",
    ],
  };
  const pair = map[type];
  return pair ? pair[locale === "tr" ? 1 : 0] : localizeToken(type, locale);
}
function orbitalCharacter(
  eccentricity: number,
  inclinationDeg: number,
  locale: Locale,
): string {
  if (locale === "tr") {
    if (eccentricity >= 0.5) return "Güneş çevresinde güçlü biçimde uzamış yol";
    if (inclinationDeg >= 20)
      return "Gezegen düzleminin çok üzerine yükselen yörünge";
    if (eccentricity >= 0.2)
      return "Belirgin biçimde dairesel olmayan Güneş yörüngesi";
    return "Ortak referans çerçevesinde ölçülmüş küçük cisim yolu";
  }
  if (eccentricity >= 0.5) return "A strongly elongated path around the Sun";
  if (inclinationDeg >= 20)
    return "An orbit lifted well beyond the planetary plane";
  if (eccentricity >= 0.2) return "A visibly non-circular solar orbit";
  return "A measured small-body path in the shared reference frame";
}
function localizeKind(kind: string, locale: Locale): string {
  if (locale === "en") return kind.replaceAll("-", " ");
  const map: Record<string, string> = {
    "dwarf-planet": "cüce gezegen",
    asteroid: "asteroit",
    "kuiper-object": "Kuiper cismi",
    comet: "kuyruklu yıldız",
  };
  return map[kind] ?? kind.replaceAll("-", " ");
}
function localizeToken(token: string, locale: Locale): string {
  const map: Readonly<Record<Locale, Record<string, string>>> = {
    en: {
      sphere: "sphere",
      ellipsoid: "ellipsoid",
      "triaxial-ellipsoid": "triaxial ellipsoid",
      "irregular-mesh": "irregular shape",
      "bilobed-mesh": "bilobed shape",
      "procedural-reference": "reference-guided visual",
      "physical-texture": "source-derived texture",
      "reference-texture": "reference texture",
      "fallback-color": "reference colour",
      "procedural-surface": "reference-guided surface",
    },
    tr: {
      sphere: "küre",
      ellipsoid: "elipsoit",
      "triaxial-ellipsoid": "üç eksenli elipsoit",
      "irregular-mesh": "düzensiz biçim",
      "bilobed-mesh": "iki loblu biçim",
      "procedural-reference": "kaynaklara dayalı görsel",
      "physical-texture": "kaynak verisinden üretilmiş doku",
      "reference-texture": "referans dokusu",
      "fallback-color": "referans rengi",
      "procedural-surface": "kaynaklara dayalı yüzey",
    },
  };
  return map[locale][token] ?? token.replaceAll("-", " ");
}
function localizeReferencePlane(value: string, locale: Locale): string {
  if (locale === "en") return value;
  return value
    .replaceAll("parent-equatorial", "ana cismin ekvator")
    .replaceAll("parent orbital plane", "ana cismin yörünge düzlemi")
    .replaceAll("ecliptic", "ekliptik")
    .replaceAll("J2000", "J2000")
    .replaceAll("reference plane", "referans düzlemi");
}
const REPRESENTATION_NOTE_TR: Readonly<Record<string, string>> = {
  "The Sun is fixed at the scene origin. Visual rotation and corona treatment are illustrative layers around sourced physical scale.":
    "Güneş sahnenin merkezinde sabit tutulur. Görsel dönüş ve korona, kaynaklı fiziksel ölçeğin çevresindeki açıklayıcı katmanlardır.",
  "JPL fitted mean elements describe general orbit shape and orientation; they are not an accurate ephemeris.":
    "JPL'nin uyarlanmış ortalama elemanları yörüngenin genel biçimini ve yönelimini anlatır; seyir hassasiyetinde bir efemeris değildir.",
  "A published JPL SBDB sample element set is propagated with a two-body solver for visual preview only; use Horizons for accurate ephemerides.":
    "Yayımlanmış JPL SBDB örnek elemanları yalnızca görsel önizleme için iki cisim çözücüsüyle ilerletilir; tarih hassasiyeti için Horizons gerekir.",
  "A bundled frozen six-element preview preserves the documented body scope. It was not freshly re-fetched from SBDB in this build environment and must not be presented as an accurate or current ephemeris.":
    "Belgelenmiş cisim kapsamını koruyan dondurulmuş altı elemanlı bir kayıt kullanılır. Bu çalışma ortamında SBDB'den yeniden alınmadığından güncel veya hassas efemeris olarak sunulmaz.",
  "Pluto–Charon is shown around a shared visual barycentre using sourced size, mean separation and a source-backed near-zero inclination to Pluto's equator. Node/periapsis orientation remains representative.":
    "Plüton–Charon, kaynaklı boyutlar, ortalama ayrım ve Plüton ekvatoruna yakın sıfır eğiklik kullanılarak ortak bir görsel kütle merkezi çevresinde gösterilir. Düğüm ve enberi yönelimi temsili kalır.",
  "Mean orbit scale and period are representative; a common source-backed J2000 pole solution was not available in the documented source set.":
    "Ortalama yörünge ölçeği ve dönem temsildir; belgelenmiş kaynaklarda ortak, kaynak destekli bir J2000 kutup çözümü bulunmaz.",
  "Published mean system scale and the 2° inclination to Haumea's equator are used. Missing node/periapsis orientation remains representative.":
    "Yayımlanmış ortalama sistem ölçeği ve Haumea'nın ekvatoruna göre 2° eğiklik kullanılır. Eksik düğüm ve enberi yönelimi temsili kalır.",
  "The non-circular mean orbit and 13° inclination to Haumea's equator are used without inventing missing node/periapsis angles.":
    "Dairesel olmayan ortalama yörünge ve Haumea'nın ekvatoruna göre 13° eğiklik kullanılır; eksik düğüm ve enberi açıları uydurulmaz.",
  "Only a restrained representative separation/period context is rendered. No surface map or precise angular orbit is claimed.":
    "Yalnızca ölçülü ve temsili bir ayrım ile dönem bağlamı gösterilir. Yüzey haritası veya hassas açısal yörünge iddiası yoktur.",
  "Mean separation, period and eccentricity are representative. Unresolved orientation remains explicit rather than randomized.":
    "Ortalama ayrım, dönem ve dışmerkezlik temsildir. Çözümlenmemiş yönelim rastgeleleştirilmek yerine açıkça belirtilir.",
  "A representative eccentric orbit is shown; pole and longitude are not asserted.":
    "Temsili bir dışmerkezli yörünge gösterilir; kutup ve boylam yönelimi ileri sürülmez.",
  "Mean orbit scale and period are representative. The orientation is intentionally not navigation-grade.":
    "Ortalama yörünge ölçeği ve dönem temsildir. Yönelim bilinçli olarak seyir hassasiyetinde değildir.",
};

const SURFACE_NOTE_TR: Readonly<Record<string, string>> = {
  "The surface texture and corona effects follow the project asset limits and do not claim to reproduce a current solar observation.":
    "Yüzey dokusu ve korona efektleri proje varlık sınırlarına uyar; güncel bir Güneş gözlemini yeniden ürettiğini iddia etmez.",
  "Reviewed official global map prepared as a 1K display texture. Small no-data seams were cleaned without inventing large-scale landmarks; final seam, pole and lighting review remains device-dependent.":
    "İncelenmiş resmî küresel harita, 1K çözünürlüklü görüntü dokusu olarak hazırlandı. Küçük veri boşlukları büyük ölçekli yer şekilleri uydurulmadan temizlendi; dikiş, kutup ve aydınlatma için son inceleme cihaza bağlıdır.",
  "Reviewed official partial imagery prepared as a 1K display texture. Unobserved areas are softly completed from the observed hemisphere so the globe remains natural-looking in motion; the body summary identifies those regions as reconstructed rather than directly observed. Final seam, pole and landmark review remains device-dependent.":
    "İncelenmiş resmî kısmi görüntüler, 1K çözünürlüklü görüntü dokusu olarak hazırlandı. Küre hareket sırasında doğal görünsün diye gözlenmemiş alanlar gözlenen yarımküreden yumuşak biçimde tamamlandı; cisim özeti bu bölgelerin doğrudan gözlem değil yeniden yapılandırma olduğunu açıkça belirtir. Dikiş, kutup ve yer işaretleri için son inceleme cihaza bağlıdır.",
  "Reference-guided visual reconstruction based on cited mission records; no source raster is reproduced.":
    "Kaynak gösterilen görev kayıtlarına dayalı bir görsel yeniden yapılandırma kullanılır; hiçbir kaynak haritası kopyalanmaz.",
};

function localizeRepresentationNote(original: string, locale: Locale): string {
  if (locale === "en") return original;
  return (
    REPRESENTATION_NOTE_TR[original] ??
    "Yörünge temsili, kaynak kaydındaki bilinen değerleri korur; çözümlenmemiş yönelimler açıkça temsili bırakılır."
  );
}
function localizeSurfaceNote(original: string, locale: Locale): string {
  if (locale === "en") return original;
  return (
    SURFACE_NOTE_TR[original] ??
    "Yüzey görünümü kaynaklı fiziksel ölçeği koruyan kontrollü bir temsildir; çözülemeyen ayrıntılar güncel fotoğraf veya tam topografya gibi sunulmaz."
  );
}
function formatNumber(value: number, locale: Locale): string {
  return value.toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
    maximumFractionDigits: 1,
  });
}
function formatDecimal(value: number, locale: Locale): string {
  return value.toLocaleString(locale === "tr" ? "tr-TR" : "en-GB", {
    maximumFractionDigits: 3,
  });
}
function formatDays(value: number, locale: Locale): string {
  const tag = locale === "tr" ? "tr-TR" : "en-GB";
  if (value < 1)
    return `${(value * 24).toLocaleString(tag, { maximumFractionDigits: 2 })} ${locale === "tr" ? "saat" : "hours"}`;
  return `${value.toLocaleString(tag, { maximumFractionDigits: 3 })} ${locale === "tr" ? "gün" : "days"}`;
}
function uniqueLinks(
  links: readonly BodySourceLink[],
): readonly BodySourceLink[] {
  return [...new Map(links.map((link) => [link.href, link])).values()];
}
