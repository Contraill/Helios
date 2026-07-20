"use client";

import { useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import type { Object3D } from "three";

import { HIGH_VISUAL_CONTRACT } from "@/features/solar-system/lib/quality";
import type { ScenePlanet } from "@/features/solar-system/lib/scene-planets";
import { sceneProfileFor } from "@/features/solar-system/lib/scene-profiles";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import type { CelestialBodyId } from "@/features/solar-system/types/celestial-body";
import { useExplorationStore } from "@/stores/exploration-store";
import { useSimulationStore } from "@/stores/simulation-store";

import { CameraRig } from "./camera-rig";
import { ExploreBloom } from "./explore-bloom";
import { ExtendedSolarSystem } from "./extended-solar-system";
import { PlanetSystem } from "./planet-system";
import { SceneTestProbe } from "./scene-test-probe";
import { SceneReadinessReporter } from "./scene-readiness-reporter";
import { Sun } from "./sun";
import { TexturePreloader } from "./texture-preloader";
import { UniverseBackdrop } from "./universe-backdrop";
import { VisualTestCatalogue, type VisualCatalogueMode } from "./visual-test-catalogue";

interface SolarSystemSceneProps {
  reducedMotion: boolean;
  scenePlanets: readonly ScenePlanet[];
  sceneSun: SceneSun;
}

function RendererProfileSettings({ exposure }: { exposure: number }) {
  const get = useThree((state) => state.get);
  useEffect(() => {
    const renderer = get().gl;
    renderer.toneMappingExposure = exposure;
  }, [exposure, get]);
  return null;
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
  const isPaused = useSimulationStore((state) => state.isPaused);
  const timeScale = useSimulationStore((state) => state.timeScale);
  const resetVersion = useSimulationStore((state) => state.resetVersion);
  const quality = HIGH_VISUAL_CONTRACT;
  const profile = sceneProfileFor(scaleMode);
  const simulationMotionEnabled = !isPaused && !reducedMotion;
  const visualMotionScale = 1 + Math.log10(timeScale);
  const [catalogueMode, setCatalogueMode] = useState<VisualCatalogueMode | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("sceneTest") !== "1") return;
    const value = query.get("catalogue");
    const allowed: VisualCatalogueMode[] = [
      "all",
      "moons",
      "dwarf-systems",
      "asteroids",
      "dwarf-kuiper",
      "comets",
    ];
    if (value && allowed.includes(value as VisualCatalogueMode)) {
      setCatalogueMode(value as VisualCatalogueMode);
    }
  }, []);

  if (catalogueMode) {
    return (
      <>
        <color attach="background" args={["#03050a"]} />
        <SceneTestProbe />
        <VisualTestCatalogue mode={catalogueMode} />
      </>
    );
  }

  return (
    <>
      <color attach="background" args={["#03050a"]} />
      <fog
        attach="fog"
        args={["#03050a", profile.effects.hazeNear, profile.effects.hazeFar]}
      />
      <RendererProfileSettings exposure={profile.effects.exposure} />
      <SceneReadinessReporter />
      <CameraRig planetObjects={planetObjects} reducedMotion={reducedMotion} />
      <SceneTestProbe />
      <ambientLight color="#a8b0bf" intensity={0.22} />
      <UniverseBackdrop
        motionEnabled={simulationMotionEnabled}
        resetVersion={resetVersion}
        scaleMode={profile.id}
        starCount={quality.starCount}
        starSize={quality.starSize}
        timeScale={visualMotionScale}
      />
      <TexturePreloader />
      <Sun
        labelsVisible={labelsVisible}
        motionEnabled={simulationMotionEnabled}
        planetObjects={planetObjects}
        quality={quality}
        resetVersion={resetVersion}
        scaleMode={profile.id}
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
          scaleMode={profile.id}
        />
      ))}
      <ExtendedSolarSystem
        labelsVisible={labelsVisible}
        motionEnabled={simulationMotionEnabled}
        orbitsVisible={orbitsVisible}
        planetObjects={planetObjects}
        quality={quality}
        scaleMode={profile.id}
      />
      <ExploreBloom enabled strength={profile.effects.bloomStrength} />
    </>
  );
}
