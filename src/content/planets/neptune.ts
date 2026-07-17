import { definePlanet, sourced } from "./helpers";

const PHYSICAL = "jpl-planetary-physical-parameters";
const ORBIT = "jpl-approximate-planetary-elements";
const FACTS = "nasa-neptune-facts";

export const neptune = definePlanet({
  id: "neptune",
  orderFromSun: sourced(8, "nasa-planet-order-distance"),
  name: { en: "Neptune", tr: "Neptün" },
  tagline: {
    en: "A dark blue frontier driven by supersonic winds.",
    tr: "Süpersonik rüzgârların şekillendirdiği koyu mavi sınır.",
  },
  description: {
    en: "Neptune is the most distant major planet, an ice giant with a dynamic atmosphere and exceptionally fast winds.",
    tr: "Neptün en uzaktaki büyük gezegendir; dinamik atmosferi ve olağanüstü hızlı rüzgârları olan bir buz devidir.",
  },
  accentColor: "#4169D8",
  kind: "ice-giant",
  physical: {
    meanRadiusKm: sourced(24622, PHYSICAL),
    equatorialDiameterKm: sourced(49528, PHYSICAL, {
      derivation: "calculated",
    }),
    massKg: sourced(1.024092e26, PHYSICAL, { derivation: "unit-conversion" }),
    densityKgM3: sourced(1638, PHYSICAL, { derivation: "unit-conversion" }),
    gravityMS2: {
      ...sourced(11.15, PHYSICAL),
      definition: "one-bar-reference-level",
    },
    escapeVelocityKmS: sourced(23.56, PHYSICAL),
  },
  orbit: {
    semiMajorAxisKm: sourced(4498396417.009, ORBIT, {
      derivation: "unit-conversion",
    }),
    semiMajorAxisAu: sourced(30.06992276, ORBIT),
    orbitalPeriodEarthDays: sourced(60190.02963, PHYSICAL, {
      derivation: "unit-conversion",
    }),
    eccentricity: sourced(0.00859048, ORBIT),
    inclinationDeg: sourced(1.77004347, ORBIT),
  },
  rotation: {
    siderealRotationHours: sourced(16.11, PHYSICAL, {
      derivation: "unit-conversion",
    }),
    solarDayHours: sourced(16.1, FACTS),
    axialTiltDeg: sourced(28.32, FACTS),
    retrograde: false,
  },
  environment: {
    temperature: {
      averageC: sourced(-200, "nasa-solar-system-temperatures"),
      definition: "reference-level",
    },
    atmosphereSummary: {
      en: "A hydrogen-helium atmosphere with methane and highly active weather.",
      tr: "Metan içeren ve son derece hareketli hava olaylarına sahip hidrojen-helyum atmosferi.",
    },
    majorAtmosphericComponents: ["hydrogen", "helium", "methane"],
  },
  moons: {
    count: sourced(16, "jpl-planetary-satellite-discoveries", {
      asOf: "2026-07-17",
    }),
    featured: ["Triton", "Nereid", "Proteus"],
  },
  rings: {
    hasRings: true,
    description: {
      en: "Neptune has a faint ring system with prominent arcs.",
      tr: "Neptün’ün belirgin yaylar içeren soluk bir halka sistemi vardır.",
    },
  },
  sourceIds: [
    "jpl-planetary-physical-parameters",
    "jpl-approximate-planetary-elements",
    "nasa-planet-order-distance",
    "nasa-solar-system-temperatures",
    "nasa-neptune-facts",
    "jpl-planetary-satellite-discoveries",
  ],
});
