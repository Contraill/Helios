"use client";

import dynamic from "next/dynamic";

import type { ScenePlanet } from "@/features/solar-system/lib/scene-planets";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import { uiStrings } from "@/lib/i18n/ui-strings";

const SolarSystemCanvas = dynamic(
  () =>
    import("./solar-system-canvas").then((module) => module.SolarSystemCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="scene-loading" role="status">
        <span>{uiStrings.pages.explore.loading}</span>
      </div>
    ),
  },
);

interface ExploreCanvasClientProps {
  scenePlanets: readonly ScenePlanet[];
  sceneSun: SceneSun;
}

export function ExploreCanvasClient({
  scenePlanets,
  sceneSun,
}: ExploreCanvasClientProps) {
  return <SolarSystemCanvas scenePlanets={scenePlanets} sceneSun={sceneSun} />;
}
