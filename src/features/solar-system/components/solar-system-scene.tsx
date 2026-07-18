"use client";

import { useRef } from "react";
import type { Object3D } from "three";

import { SCENE_QUALITY } from "@/features/solar-system/lib/quality";
import type { ScenePlanet } from "@/features/solar-system/lib/scene-planets";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import type { CelestialBodyId } from "@/features/solar-system/types/celestial-body";
import { useExplorationStore } from "@/stores/exploration-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useSimulationStore } from "@/stores/simulation-store";

import { CameraRig } from "./camera-rig";
import { ExploreBloom } from "./explore-bloom";
import { PlanetSystem } from "./planet-system";
import { StarField } from "./star-field";
import { Sun } from "./sun";

interface SolarSystemSceneProps {
  reducedMotion: boolean;
  scenePlanets: readonly ScenePlanet[];
  sceneSun: SceneSun;
}

export function SolarSystemScene({
  reducedMotion,
  scenePlanets,
  sceneSun,
}: SolarSystemSceneProps) {
  const planetObjects = useRef<Map<CelestialBodyId, Object3D>>(new Map());
  const scaleMode = useExplorationStore((state) => state.scaleMode);
  const orbitsVisible = useExplorationStore((state) => state.orbitsVisible);
  const labelsVisible = useExplorationStore((state) => state.labelsVisible);
  const qualityLevel = usePreferencesStore((state) => state.qualityLevel);
  const isPaused = useSimulationStore((state) => state.isPaused);
  const timeScale = useSimulationStore((state) => state.timeScale);
  const resetVersion = useSimulationStore((state) => state.resetVersion);
  const quality = SCENE_QUALITY[qualityLevel];
  const simulationMotionEnabled = !isPaused && !reducedMotion;
  const visualMotionScale = 1 + Math.log10(timeScale);

  return (
    <>
      <color attach="background" args={["#03050a"]} />
      <fog
        attach="fog"
        args={
          scaleMode === "scientific"
            ? ["#03050a", 950, 1_650]
            : ["#03050a", 105, 205]
        }
      />
      <CameraRig planetObjects={planetObjects} reducedMotion={reducedMotion} />
      <ambientLight color="#a8b0bf" intensity={0.22} />
      <StarField
        motionEnabled={simulationMotionEnabled}
        resetVersion={resetVersion}
        scaleMode={scaleMode}
        starCount={quality.starCount}
        starSize={quality.starSize}
        timeScale={visualMotionScale}
      />
      <Sun
        labelsVisible={labelsVisible}
        motionEnabled={simulationMotionEnabled}
        planetObjects={planetObjects}
        quality={quality}
        resetVersion={resetVersion}
        scaleMode={scaleMode}
        sun={sceneSun}
        timeScale={visualMotionScale}
      />
      {scenePlanets.map((planet) => (
        <PlanetSystem
          key={planet.id}
          labelsVisible={labelsVisible}
          orbitsVisible={orbitsVisible}
          planet={planet}
          planetObjects={planetObjects}
          quality={quality}
          resetVersion={resetVersion}
          scaleMode={scaleMode}
        />
      ))}
      <ExploreBloom
        enabled={quality.bloomStrength > 0 && !reducedMotion}
        strength={quality.bloomStrength}
      />
    </>
  );
}
