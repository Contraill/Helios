"use client";

import dynamic from "next/dynamic";

import type { ScenePlanet } from "@/features/solar-system/lib/scene-planets";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import { getExplorePageCopy } from "@/lib/i18n/explore-page-copy";
import { useLocaleStore } from "@/stores/locale-store";

function CanvasLoading() {
  const locale = useLocaleStore((state) => state.locale);
  return (
    <div className="scene-loading" role="status">
      <span>{getExplorePageCopy(locale).loading}</span>
    </div>
  );
}

const SolarSystemCanvas = dynamic(
  () =>
    import("./solar-system-canvas").then((module) => module.SolarSystemCanvas),
  { ssr: false, loading: () => <CanvasLoading /> },
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
