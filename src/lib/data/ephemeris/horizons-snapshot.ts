import { HORIZONS_TARGET_BY_PLANET } from "./horizons-registry";
import {
  EPHEMERIS_METADATA,
  MAX_PROPAGATION_DAYS,
  type EphemerisBundle,
  type EphemerisVector,
} from "./models";

export const HORIZONS_SNAPSHOT_OBSERVED_AT = "2026-07-18T00:00:00.000Z";
const HORIZONS_SNAPSHOT_RETRIEVED_AT = "2026-07-18T08:45:00.000Z";

const snapshotVectors = {
  mercury: {
    positionAu: {
      x: 2.494229496155396e-1,
      y: -3.457039995629371e-1,
      z: -5.112846823843964e-2,
    },
    velocityAuPerDay: {
      x: 1.720786331554438e-2,
      y: 1.78289914892629e-2,
      z: -1.21197223705779e-4,
    },
  },
  venus: {
    positionAu: {
      x: -4.192542200052363e-1,
      y: -5.905390848025907e-1,
      z: 1.607726919771543e-2,
    },
    velocityAuPerDay: {
      x: 1.635106885240278e-2,
      y: -1.180240033815716e-2,
      z: -1.105595730851806e-3,
    },
  },
  earth: {
    positionAu: {
      x: 4.302887483162997e-1,
      y: -9.207120721206883e-1,
      z: 5.335880848154005e-5,
    },
    velocityAuPerDay: {
      x: 1.531001970042685e-2,
      y: 7.226268560018027e-3,
      z: 1.31045089928396e-7,
    },
  },
  mars: {
    positionAu: {
      x: 1.025632300690023,
      y: 1.042094439425827,
      z: -3.31049366761031e-3,
    },
    velocityAuPerDay: {
      x: -9.440163821842517e-3,
      y: 1.100964049784473e-2,
      z: 4.622030416864227e-4,
    },
  },
  jupiter: {
    positionAu: {
      x: -3.038495422954724,
      y: 4.320243577876646,
      z: 5.00358211682257e-2,
    },
    velocityAuPerDay: {
      x: -6.265990372217911e-3,
      y: -3.992324259216141e-3,
      z: 1.567597924035788e-4,
    },
  },
  saturn: {
    positionAu: {
      x: 9.351605897227431,
      y: 1.355131097912403,
      z: -3.958497643506522e-1,
    },
    velocityAuPerDay: {
      x: -1.109615627582809e-3,
      y: 5.507888858462109e-3,
      z: -5.201102361814797e-5,
    },
  },
  uranus: {
    positionAu: {
      x: 9.194358342137285,
      y: 1.71449788640006e1,
      z: -5.55418688951917e-2,
    },
    velocityAuPerDay: {
      x: -3.501494557148815e-3,
      y: 1.67365295273684e-3,
      z: 5.152061206669371e-5,
    },
  },
  neptune: {
    positionAu: {
      x: 2.984948912803496e1,
      y: 1.143699433147822,
      z: -7.114197621484153e-1,
    },
    velocityAuPerDay: {
      x: -1.46203215491873e-4,
      y: 3.153665923814217e-3,
      z: -6.181427121993384e-5,
    },
  },
} as const;

const vectors: readonly EphemerisVector[] = Object.entries(snapshotVectors).map(
  ([planetId, vector]) => {
    const target =
      HORIZONS_TARGET_BY_PLANET[
        planetId as keyof typeof HORIZONS_TARGET_BY_PLANET
      ];
    return { ...target, ...vector };
  },
);

export const HORIZONS_SNAPSHOT: EphemerisBundle = Object.freeze({
  schemaVersion: 1,
  status: "fallback",
  requestedAt: HORIZONS_SNAPSHOT_OBSERVED_AT,
  observedAt: HORIZONS_SNAPSHOT_OBSERVED_AT,
  retrievedAt: HORIZONS_SNAPSHOT_RETRIEVED_AT,
  validPropagationDays: MAX_PROPAGATION_DAYS,
  vectors: [...vectors],
  metadata: EPHEMERIS_METADATA,
});

export function fallbackBundleFor(requestedAt: string): EphemerisBundle | null {
  const distanceDays =
    Math.abs(
      Date.parse(requestedAt) - Date.parse(HORIZONS_SNAPSHOT_OBSERVED_AT),
    ) / 86_400_000;
  if (distanceDays > MAX_PROPAGATION_DAYS) return null;
  return { ...HORIZONS_SNAPSHOT, requestedAt };
}
