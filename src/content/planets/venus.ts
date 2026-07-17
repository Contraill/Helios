import { definePlanet, sourced } from "./helpers";

const PHYSICAL = "jpl-planetary-physical-parameters";
const ORBIT = "jpl-approximate-planetary-elements";
const FACTS = "nasa-venus-facts";

export const venus = definePlanet({
  id: "venus",
  orderFromSun: sourced(2, "nasa-planet-order-distance"),
  name: { en: "Venus", tr: "Venüs" },
  tagline: {
    en: "A bright world hidden beneath crushing clouds.",
    tr: "Ezici bulutların altında saklanan parlak dünya.",
  },
  description: {
    en: "Venus is close to Earth in size, but its dense carbon-dioxide atmosphere drives a runaway greenhouse effect and extreme surface pressure.",
    tr: "Venüs boyut olarak Dünya'ya yakındır; ancak yoğun karbondioksit atmosferi kaçak sera etkisine ve aşırı yüzey basıncına yol açar.",
  },
  accentColor: "#D9A35F",
  kind: "terrestrial",
  physical: {
    meanRadiusKm: sourced(6051.8, PHYSICAL),
    equatorialDiameterKm: sourced(12103.6, PHYSICAL, {
      derivation: "calculated",
    }),
    massKg: sourced(4.86731e24, PHYSICAL, { derivation: "unit-conversion" }),
    densityKgM3: sourced(5243, PHYSICAL, { derivation: "unit-conversion" }),
    gravityMS2: {
      ...sourced(8.87, PHYSICAL),
      definition: "surface-equatorial",
    },
    escapeVelocityKmS: sourced(10.36, PHYSICAL),
  },
  orbit: {
    semiMajorAxisKm: sourced(108209474.537, ORBIT, {
      derivation: "unit-conversion",
    }),
    semiMajorAxisAu: sourced(0.72333566, ORBIT),
    orbitalPeriodEarthDays: sourced(224.700799, PHYSICAL, {
      derivation: "unit-conversion",
    }),
    eccentricity: sourced(0.00677672, ORBIT),
    inclinationDeg: sourced(3.39467605, ORBIT),
  },
  rotation: {
    siderealRotationHours: sourced(5832.432, PHYSICAL, {
      derivation: "unit-conversion",
    }),
    solarDayHours: sourced(2802.0, FACTS),
    axialTiltDeg: sourced(3.0, FACTS),
    retrograde: true,
  },
  environment: {
    temperature: {
      averageC: sourced(464, "nasa-solar-system-temperatures"),
      definition: "surface",
    },
    atmosphereSummary: {
      en: "A dense carbon-dioxide atmosphere with sulfuric-acid clouds.",
      tr: "Sülfürik asit bulutları içeren yoğun bir karbondioksit atmosferi.",
    },
    majorAtmosphericComponents: ["carbon dioxide", "nitrogen"],
  },
  moons: {
    count: sourced(0, "nasa-venus-facts", { asOf: "2026-07-17" }),
    featured: [],
  },
  rings: {
    hasRings: false,
    description: {
      en: "Venus has no ring system.",
      tr: "Venüs’ün halka sistemi yoktur.",
    },
  },
  sourceIds: [
    "jpl-planetary-physical-parameters",
    "jpl-approximate-planetary-elements",
    "nasa-planet-order-distance",
    "nasa-solar-system-temperatures",
    "nasa-venus-facts",
  ],
});
