import type { MutableRefObject } from "react";
import type { Object3D } from "three";

import type { CelestialBodyId } from "@/features/solar-system/types/celestial-body";

export type PlanetObjectRegistry = MutableRefObject<
  Map<CelestialBodyId, Object3D>
>;
