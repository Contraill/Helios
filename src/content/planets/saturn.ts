import { definePlanet, sourced } from "./helpers";

const PHYSICAL = "jpl-planetary-physical-parameters";
const ORBIT = "jpl-approximate-planetary-elements";
const FACTS = "nasa-saturn-facts";

export const saturn = definePlanet({
  id: "saturn",
  orderFromSun: sourced(6, "nasa-planet-order-distance"),
  name: { en: "Saturn", tr: "Satürn" },
  tagline: {
    en: "A low-density giant framed by ice and rock.",
    tr: "Buz ve kaya halkalarıyla çevrili düşük yoğunluklu dev.",
  },
  description: {
    en: "Saturn is a hydrogen-helium giant distinguished by an extensive ring system made of countless particles.",
    tr: "Satürn, sayısız parçacıktan oluşan geniş halka sistemiyle ayrışan bir hidrojen-helyum devidir.",
  },
  accentColor: "#D8C18A",
  kind: "gas-giant",
  physical: {
    meanRadiusKm: sourced(58232, PHYSICAL),
    equatorialDiameterKm: sourced(120536, PHYSICAL, {
      derivation: "calculated",
    }),
    massKg: sourced(5.68317e26, PHYSICAL, { derivation: "unit-conversion" }),
    densityKgM3: sourced(687.1, PHYSICAL, { derivation: "unit-conversion" }),
    gravityMS2: {
      ...sourced(10.44, PHYSICAL),
      definition: "one-bar-reference-level",
    },
    escapeVelocityKmS: sourced(36.09, PHYSICAL),
  },
  orbit: {
    semiMajorAxisKm: sourced(1426666414.18, ORBIT, {
      derivation: "unit-conversion",
    }),
    semiMajorAxisAu: sourced(9.53667594, ORBIT),
    orbitalPeriodEarthDays: sourced(10755.698645, PHYSICAL, {
      derivation: "unit-conversion",
    }),
    eccentricity: sourced(0.05386179, ORBIT),
    inclinationDeg: sourced(2.48599187, ORBIT),
  },
  rotation: {
    siderealRotationHours: sourced(10.65624, PHYSICAL, {
      derivation: "unit-conversion",
    }),
    solarDayHours: sourced(10.7, FACTS),
    axialTiltDeg: sourced(26.73, FACTS),
    retrograde: false,
  },
  environment: {
    temperature: {
      averageC: sourced(-140, "nasa-solar-system-temperatures"),
      definition: "reference-level",
    },
    atmosphereSummary: {
      en: "A hydrogen-helium atmosphere with layered clouds and powerful winds.",
      tr: "Katmanlı bulutlara ve güçlü rüzgârlara sahip hidrojen-helyum atmosferi.",
    },
    majorAtmosphericComponents: ["hydrogen", "helium", "methane", "ammonia"],
  },
  moons: {
    count: sourced(293, "jpl-planetary-satellite-discoveries", {
      asOf: "2026-07-17",
    }),
    featured: ["Titan", "Enceladus", "Rhea", "Iapetus"],
  },
  rings: {
    hasRings: true,
    description: {
      en: "Saturn has the Solar System’s most prominent and complex ring system.",
      tr: "Satürn, Güneş Sistemi’nin en belirgin ve karmaşık halka sistemine sahiptir.",
    },
  },
  sourceIds: [
    "jpl-planetary-physical-parameters",
    "jpl-approximate-planetary-elements",
    "nasa-planet-order-distance",
    "nasa-solar-system-temperatures",
    "nasa-saturn-facts",
    "jpl-planetary-satellite-discoveries",
  ],
});
