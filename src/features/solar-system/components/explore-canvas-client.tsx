"use client";

import dynamic from "next/dynamic";

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

export function ExploreCanvasClient() {
  return <SolarSystemCanvas />;
}
