"use client";

import { scenePlanets } from "@/features/solar-system/lib/scene-planets";

import { OverviewCamera } from "./overview-camera";
import { PlanetSystem } from "./planet-system";
import { StarField } from "./star-field";
import { Sun } from "./sun";

interface SolarSystemSceneProps {
  motionEnabled: boolean;
}

export function SolarSystemScene({ motionEnabled }: SolarSystemSceneProps) {
  return (
    <>
      <color attach="background" args={["#03050a"]} />
      <fog attach="fog" args={["#03050a", 105, 205]} />
      <OverviewCamera />
      <ambientLight color="#7c8cab" intensity={0.32} />
      <StarField motionEnabled={motionEnabled} />
      <Sun motionEnabled={motionEnabled} />
      {scenePlanets.map((planet) => (
        <PlanetSystem
          key={planet.id}
          motionEnabled={motionEnabled}
          planet={planet}
        />
      ))}
    </>
  );
}
