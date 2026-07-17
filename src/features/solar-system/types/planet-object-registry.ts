import type { MutableRefObject } from "react";
import type { Object3D } from "three";

import type { PlanetId } from "@/lib/data/schemas/planet";

export type PlanetObjectRegistry = MutableRefObject<Map<PlanetId, Object3D>>;
