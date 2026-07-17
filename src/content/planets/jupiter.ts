import { definePlanet, sourced } from "./helpers";

const PHYSICAL = "jpl-planetary-physical-parameters";
const ORBIT = "jpl-approximate-planetary-elements";
const FACTS = "nasa-jupiter-facts";

export const jupiter = definePlanet({
  id: "jupiter",
  orderFromSun: sourced(5, "nasa-planet-order-distance"),
  name: { en: "Jupiter", tr: "Jüpiter" },
  tagline: {
    en: "A storm-bound giant with no solid ground.",
    tr: "Katı zemini olmayan fırtınalı dev.",
  },
  description: {
    en: "Jupiter is the largest planet, a hydrogen-helium giant whose visible bands and storms sit above progressively denser fluid layers.",
    tr: "Jüpiter en büyük gezegendir; görünür kuşakları ve fırtınaları giderek yoğunlaşan akışkan katmanların üzerinde bulunan bir hidrojen-helyum devidir.",
  },
  accentColor: "#C99A72",
  kind: "gas-giant",
  physical: {
    meanRadiusKm: sourced(69911, PHYSICAL),
    equatorialDiameterKm: sourced(142984, PHYSICAL, {
      derivation: "calculated",
    }),
    massKg: sourced(1.898125e27, PHYSICAL, { derivation: "unit-conversion" }),
    densityKgM3: sourced(1326.2, PHYSICAL, { derivation: "unit-conversion" }),
    gravityMS2: {
      ...sourced(24.79, PHYSICAL),
      definition: "one-bar-reference-level",
    },
    escapeVelocityKmS: sourced(60.2, PHYSICAL),
  },
  orbit: {
    semiMajorAxisKm: sourced(778340816.693, ORBIT, {
      derivation: "unit-conversion",
    }),
    semiMajorAxisAu: sourced(5.202887, ORBIT),
    orbitalPeriodEarthDays: sourced(4332.820129, PHYSICAL, {
      derivation: "unit-conversion",
    }),
    eccentricity: sourced(0.04838624, ORBIT),
    inclinationDeg: sourced(1.30439695, ORBIT),
  },
  rotation: {
    siderealRotationHours: sourced(9.92496, PHYSICAL, {
      derivation: "unit-conversion",
    }),
    solarDayHours: sourced(9.9, FACTS),
    axialTiltDeg: sourced(3.0, FACTS),
    retrograde: false,
  },
  environment: {
    temperature: {
      averageC: sourced(-110, "nasa-solar-system-temperatures"),
      definition: "reference-level",
    },
    atmosphereSummary: {
      en: "A deep hydrogen-helium atmosphere with ammonia and water clouds.",
      tr: "Amonyak ve su bulutları içeren derin bir hidrojen-helyum atmosferi.",
    },
    majorAtmosphericComponents: ["hydrogen", "helium", "methane", "ammonia"],
  },
  moons: {
    count: sourced(115, "jpl-planetary-satellite-discoveries", {
      asOf: "2026-07-17",
    }),
    featured: ["Io", "Europa", "Ganymede", "Callisto"],
  },
  rings: {
    hasRings: true,
    description: {
      en: "Jupiter has a faint dusty ring system.",
      tr: "Jüpiter’in soluk ve tozlu bir halka sistemi vardır.",
    },
  },
  sourceIds: [
    "jpl-planetary-physical-parameters",
    "jpl-approximate-planetary-elements",
    "nasa-planet-order-distance",
    "nasa-solar-system-temperatures",
    "nasa-jupiter-facts",
    "jpl-planetary-satellite-discoveries",
  ],
});
