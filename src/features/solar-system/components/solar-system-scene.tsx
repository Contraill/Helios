"use client";

import { useRef } from "react";
import type { Object3D } from "three";

import { SCENE_QUALITY } from "@/features/solar-system/lib/quality";
import type { ScenePlanet } from "@/features/solar-system/lib/scene-planets";
import type { PlanetId } from "@/lib/data/schemas/planet";
import { useExplorationStore } from "@/stores/exploration-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useSimulationStore } from "@/stores/simulation-store";

import { CameraRig } from "./camera-rig";
import { PlanetSystem } from "./planet-system";
import { StarField } from "./star-field";
import { Sun } from "./sun";

interface SolarSystemSceneProps {
  reducedMotion: boolean;
  scenePlanets: readonly ScenePlanet[];
}

export function SolarSystemScene({
  reducedMotion,
  scenePlanets,
}: SolarSystemSceneProps) {
  const planetObjects = useRef<Map<PlanetId, Object3D>>(new Map());
  const scaleMode = useExplorationStore((state) => state.scaleMode);
  const orbitsVisible = useExplorationStore((state) => state.orbitsVisible);
  const labelsVisible = useExplorationStore((state) => state.labelsVisible);
  const qualityLevel = usePreferencesStore((state) => state.qualityLevel);
  const isPaused = useSimulationStore((state) => state.isPaused);
  const timeScale = useSimulationStore((state) => state.timeScale);
  const resetVersion = useSimulationStore((state) => state.resetVersion);
  const quality = SCENE_QUALITY[qualityLevel];
  const simulationMotionEnabled = !isPaused && !reducedMotion;

  return (
    <>
      <color attach="background" args={["#03050a"]} />
      <fog
        attach="fog"
        args={
          scaleMode === "scientific"
            ? ["#03050a", 3_600, 5_900]
            : ["#03050a", 105, 205]
        }
      />
      <CameraRig planetObjects={planetObjects} reducedMotion={reducedMotion} />
      <ambientLight color="#7c8cab" intensity={0.32} />
      <StarField
        motionEnabled={simulationMotionEnabled}
        resetVersion={resetVersion}
        scaleMode={scaleMode}
        starCount={quality.starCount}
        starSize={quality.starSize}
        timeScale={timeScale}
      />
      <Sun
        motionEnabled={simulationMotionEnabled}
        resetVersion={resetVersion}
        scaleMode={scaleMode}
        segments={quality.planetSegments}
        timeScale={timeScale}
      />
      {scenePlanets.map((planet) => (
        <PlanetSystem
          key={planet.id}
          labelsVisible={labelsVisible}
          motionEnabled={simulationMotionEnabled}
          orbitsVisible={orbitsVisible}
          planet={planet}
          planetObjects={planetObjects}
          quality={quality}
          resetVersion={resetVersion}
          scaleMode={scaleMode}
          timeScale={timeScale}
        />
      ))}
    </>
  );
}
