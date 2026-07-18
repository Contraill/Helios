"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import type { Group, Mesh } from "three";

import type { SceneQuality } from "@/features/solar-system/lib/quality";
import { rotationAngleAt } from "@/features/solar-system/lib/orbital-motion";
import {
  sceneScaleFor,
  type ScenePlanet,
} from "@/features/solar-system/lib/scene-planets";
import {
  ephemerisOrbitScenePoints,
  ephemerisScenePosition,
} from "@/lib/data/ephemeris/positions";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import type { PlanetObjectRegistry } from "@/features/solar-system/types/planet-object-registry";
import { uiStrings } from "@/lib/i18n/ui-strings";
import { useExplorationStore } from "@/stores/exploration-store";
import { useEphemerisStore } from "@/stores/ephemeris-store";
import {
  currentSimulationTimeMs,
  useSimulationStore,
} from "@/stores/simulation-store";

import { OrbitPath } from "./orbit-path";
import { PlanetLabel, type ScientificLabelPlacement } from "./planet-label";
import { ScientificPlanetMarker } from "./scientific-planet-marker";

const SCIENTIFIC_LABEL_PLACEMENTS: Readonly<
  Record<ScenePlanet["id"], ScientificLabelPlacement>
> = {
  mercury: "south",
  venus: "northeast",
  earth: "northwest",
  mars: "east",
  jupiter: "west",
  saturn: "north",
  uranus: "east",
  neptune: "north",
};

interface PlanetSystemProps {
  labelsVisible: boolean;
  orbitsVisible: boolean;
  planet: ScenePlanet;
  planetObjects: PlanetObjectRegistry;
  quality: SceneQuality;
  resetVersion: number;
  scaleMode: ScaleMode;
}

export function PlanetSystem({
  labelsVisible,
  orbitsVisible,
  planet,
  planetObjects,
  quality,
  resetVersion,
  scaleMode,
}: PlanetSystemProps) {
  const bodyRef = useRef<Group>(null);
  const surfaceRef = useRef<Mesh>(null);
  const selected = useExplorationStore(
    (state) => state.selectedPlanetId === planet.id,
  );
  const hovered = useExplorationStore(
    (state) => state.hoveredPlanetId === planet.id,
  );
  const selectPlanet = useExplorationStore((state) => state.selectPlanet);
  const setHoveredPlanet = useExplorationStore(
    (state) => state.setHoveredPlanet,
  );
  const clearHoveredPlanet = useExplorationStore(
    (state) => state.clearHoveredPlanet,
  );
  const active = selected || hovered;
  const scale = sceneScaleFor(planet, scaleMode);
  const observedAt = useEphemerisStore((state) => state.bundle.observedAt);
  const vector = useEphemerisStore((state) =>
    state.bundle.vectors.find(({ planetId }) => planetId === planet.id),
  );
  const simulationAtMs = useSimulationStore((state) => state.simulationAtMs);
  const orbitPoints = useMemo(
    () =>
      vector
        ? ephemerisOrbitScenePoints(vector, scaleMode, quality.orbitSegments)
        : undefined,
    [quality.orbitSegments, scaleMode, vector],
  );
  const interactionRadius = Math.max(
    scale.radius * 1.65,
    scaleMode === "scientific" ? 0.32 : 0.72,
  );
  const scientificMode = scaleMode === "scientific";

  useLayoutEffect(() => {
    const node = bodyRef.current;
    if (!node) return;

    const registry = planetObjects.current;
    node.userData.planetId = planet.id;
    node.userData.renderRadius = scale.radius;
    registry.set(planet.id, node);

    return () => {
      registry.delete(planet.id);
    };
  }, [planet.id, planetObjects, scale.radius]);

  useLayoutEffect(() => {
    if (bodyRef.current && vector) {
      bodyRef.current.position.set(
        ...ephemerisScenePosition(
          vector,
          observedAt,
          simulationAtMs,
          scaleMode,
        ),
      );
    }
    if (surfaceRef.current) {
      surfaceRef.current.rotation.y = rotationAngleAt(
        simulationAtMs,
        planet.siderealRotationHours,
        planet.retrogradeRotation,
      );
    }
  }, [
    observedAt,
    planet.retrogradeRotation,
    planet.siderealRotationHours,
    resetVersion,
    scaleMode,
    simulationAtMs,
    vector,
  ]);

  useFrame(() => {
    if (!bodyRef.current || !surfaceRef.current) return;

    const currentBundle = useEphemerisStore.getState().bundle;
    const currentVector = currentBundle.vectors.find(
      ({ planetId }) => planetId === planet.id,
    );
    if (currentVector) {
      bodyRef.current.position.set(
        ...ephemerisScenePosition(
          currentVector,
          currentBundle.observedAt,
          currentSimulationTimeMs(useSimulationStore.getState()),
          useExplorationStore.getState().scaleMode,
        ),
      );
    }

    surfaceRef.current.rotation.y = rotationAngleAt(
      currentSimulationTimeMs(useSimulationStore.getState()),
      planet.siderealRotationHours,
      planet.retrogradeRotation,
    );
  });

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHoveredPlanet(planet.id);
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    clearHoveredPlanet(planet.id);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    selectPlanet(planet.id);
  };

  return (
    <>
      {orbitsVisible ? (
        orbitPoints ? (
          <OrbitPath
            active={active}
            color={planet.color}
            points={orbitPoints}
            segments={quality.orbitSegments}
            semiMajorAxis={scale.semiMajorAxis}
            semiMinorAxis={scale.semiMinorAxis}
          />
        ) : (
          <group rotation-x={planet.inclinationRadians}>
            <OrbitPath
              active={active}
              color={planet.color}
              segments={quality.orbitSegments}
              semiMajorAxis={scale.semiMajorAxis}
              semiMinorAxis={scale.semiMinorAxis}
            />
          </group>
        )
      ) : null}
      <group ref={bodyRef} position={scale.initialPosition}>
        <group rotation-z={planet.axialTiltRadians}>
          <mesh
            ref={surfaceRef}
            name={planet.name}
            scale={scale.radius}
            userData={{ planetId: planet.id }}
          >
            <sphereGeometry
              args={[1, quality.planetSegments[0], quality.planetSegments[1]]}
            />
            <meshStandardMaterial
              color={planet.color}
              emissive={active ? planet.color : "#000000"}
              emissiveIntensity={selected ? 0.3 : hovered ? 0.18 : 0}
              metalness={0}
              roughness={0.86}
            />
          </mesh>

          <mesh
            onClick={handleClick}
            onPointerOut={handlePointerOut}
            onPointerOver={handlePointerOver}
            scale={interactionRadius}
          >
            <sphereGeometry args={[1, 14, 10]} />
            <meshBasicMaterial
              color={planet.color}
              depthWrite={false}
              opacity={0}
              transparent
            />
          </mesh>
        </group>

        {scientificMode ? (
          <ScientificPlanetMarker
            active={active}
            color={planet.color}
            selected={selected}
          />
        ) : null}

        {active && !scientificMode ? (
          <mesh
            raycast={() => undefined}
            scale={scale.radius * (selected ? 1.24 : 1.16)}
          >
            <sphereGeometry args={[1, 22, 16]} />
            <meshBasicMaterial
              color={planet.color}
              depthWrite={false}
              opacity={selected ? 0.2 : 0.12}
              transparent
              wireframe
            />
          </mesh>
        ) : null}

        {labelsVisible && (active || scientificMode) ? (
          <PlanetLabel
            active={active}
            color={planet.color}
            mode={scaleMode}
            offsetY={scale.radius + 1.15}
            placement={SCIENTIFIC_LABEL_PLACEMENTS[planet.id]}
            positionCaption={
              selected
                ? uiStrings.pages.explore.scientificSelectedMarkerCaption
                : uiStrings.pages.explore.scientificMarkerCaption
            }
            selected={selected}
            text={planet.name}
          />
        ) : null}
      </group>
    </>
  );
}
