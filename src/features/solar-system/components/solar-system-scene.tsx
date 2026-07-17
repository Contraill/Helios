"use client";

import { useRef } from "react";
import type { Object3D } from "three";

import type { ScenePlanet } from "@/features/solar-system/lib/scene-planets";
import type { PlanetId } from "@/lib/data/schemas/planet";

import { CameraRig } from "./camera-rig";
import { PlanetSystem } from "./planet-system";
import { StarField } from "./star-field";
import { Sun } from "./sun";

interface SolarSystemSceneProps {
  motionEnabled: boolean;
  scenePlanets: readonly ScenePlanet[];
}

export function SolarSystemScene({
  motionEnabled,
  scenePlanets,
}: SolarSystemSceneProps) {
  const planetObjects = useRef<Map<PlanetId, Object3D>>(new Map());

  return (
    <>
      <color attach="background" args={["#03050a"]} />
      <fog attach="fog" args={["#03050a", 105, 205]} />
      <CameraRig motionEnabled={motionEnabled} planetObjects={planetObjects} />
      <ambientLight color="#7c8cab" intensity={0.32} />
      <StarField motionEnabled={motionEnabled} />
      <Sun motionEnabled={motionEnabled} />
      {scenePlanets.map((planet) => (
        <PlanetSystem
          key={planet.id}
          motionEnabled={motionEnabled}
          planet={planet}
          planetObjects={planetObjects}
        />
      ))}
    </>
  );
}
