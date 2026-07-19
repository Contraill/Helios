"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { BackSide } from "three";
import type { Group, Mesh } from "three";

import { textureVariantFor } from "@/content/sources/planet-textures";
import { PLANET_VISUAL_PROFILES } from "@/features/solar-system/lib/planet-visual-profiles";
import type { SceneQuality } from "@/features/solar-system/lib/quality";
import { rotationAngleAt } from "@/features/solar-system/lib/orbital-motion";
import {
  sceneScaleFor,
  type ScenePlanet,
} from "@/features/solar-system/lib/scene-planets";
import {
  createEphemerisScenePositionEvaluator,
  ephemerisOrbitScenePoints,
  type MutableScenePosition,
} from "@/lib/data/ephemeris/positions";
import {
  SECONDS_PER_JULIAN_YEAR,
  type ScaleMode,
} from "@/features/solar-system/types/experience-settings";
import type { PlanetObjectRegistry } from "@/features/solar-system/types/planet-object-registry";
import { uiStrings } from "@/lib/i18n/ui-strings";
import { useExplorationStore } from "@/stores/exploration-store";
import { useEphemerisStore } from "@/stores/ephemeris-store";
import {
  currentSimulationTimeMs,
  useSimulationStore,
} from "@/stores/simulation-store";
import { useSceneTexture } from "@/features/solar-system/lib/texture-cache";

import { AtmosphereShell } from "./atmosphere-shell";
import { EarthCityLights } from "./earth-city-lights";
import { EarthCloudLayer } from "./earth-cloud-layer";
import { OrbitPath } from "./orbit-path";
import { PlanetLabel, type ScientificLabelPlacement } from "./planet-label";
import { PlanetaryRingSystem } from "./planetary-ring-system";
import { SaturnRings } from "./saturn-rings";
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
  const scenePositionRef = useRef<MutableScenePosition>([0, 0, 0]);
  const surfaceRef = useRef<Mesh>(null);
  const selected = useExplorationStore(
    (state) => state.selectedBodyId === planet.id,
  );
  const hovered = useExplorationStore(
    (state) => state.hoveredBodyId === planet.id,
  );
  const selectPlanet = useExplorationStore((state) => state.selectPlanet);
  const setHoveredPlanet = useExplorationStore(
    (state) => state.setHoveredPlanet,
  );
  const clearHoveredPlanet = useExplorationStore(
    (state) => state.clearHoveredPlanet,
  );
  const active = selected || hovered;
  const visualProfile = PLANET_VISUAL_PROFILES[planet.id];
  const surfaceTexture = useSceneTexture(
    textureVariantFor(planet.id, quality.textureVariant).path,
  );
  const scale = sceneScaleFor(planet, scaleMode);
  const observedAt = useEphemerisStore((state) => state.bundle.observedAt);
  const vector = useEphemerisStore((state) =>
    state.bundle.vectors.find(({ planetId }) => planetId === planet.id),
  );
  const vectorWindow = useEphemerisStore((state) =>
    state.bundle.windows?.find(({ planetId }) => planetId === planet.id),
  );
  const simulationAtMs = useSimulationStore((state) => state.simulationAtMs);
  const timeScale = useSimulationStore((state) => state.timeScale);
  const acceleratedPreview = timeScale === SECONDS_PER_JULIAN_YEAR;
  const evaluateScenePosition = useMemo(
    () =>
      vector
        ? createEphemerisScenePositionEvaluator(
            vector,
            observedAt,
            scaleMode,
            acceleratedPreview,
            vectorWindow,
          )
        : undefined,
    [acceleratedPreview, observedAt, scaleMode, vector, vectorWindow],
  );
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
    if (bodyRef.current && evaluateScenePosition) {
      const position = evaluateScenePosition(
        simulationAtMs,
        scenePositionRef.current,
      );
      bodyRef.current.position.set(position[0], position[1], position[2]);
    }
    if (surfaceRef.current) {
      surfaceRef.current.rotation.y = rotationAngleAt(
        simulationAtMs,
        planet.siderealRotationHours,
        planet.retrogradeRotation,
      );
    }
  }, [
    evaluateScenePosition,
    planet.retrogradeRotation,
    planet.siderealRotationHours,
    resetVersion,
    simulationAtMs,
  ]);

  useFrame(() => {
    if (!bodyRef.current || !surfaceRef.current) return;

    const simulationState = useSimulationStore.getState();
    const currentTimeMs = currentSimulationTimeMs(simulationState);
    if (evaluateScenePosition) {
      const position = evaluateScenePosition(
        currentTimeMs,
        scenePositionRef.current,
      );
      bodyRef.current.position.set(position[0], position[1], position[2]);
    }

    surfaceRef.current.rotation.y = rotationAngleAt(
      currentTimeMs,
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
        <group rotation-x={planet.axialTiltRadians}>
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
              color={surfaceTexture ? visualProfile.surfaceTint : planet.color}
              emissive="#000000"
              emissiveIntensity={0}
              map={surfaceTexture ?? undefined}
              metalness={0}
              roughness={visualProfile.roughness}
            />
            {planet.id === "earth" ? (
              <EarthCityLights
                segments={quality.atmosphereSegments}
                textureVariant={quality.textureVariant}
              />
            ) : null}
            {planet.id === "earth" && quality.textureVariant !== "low" ? (
              <EarthCloudLayer
                segments={quality.atmosphereSegments}
                textureVariant={quality.textureVariant}
              />
            ) : null}
          </mesh>

          {visualProfile.atmosphere ? (
            <AtmosphereShell
              mode={quality.atmosphereMode}
              profile={visualProfile.atmosphere}
              radius={scale.radius}
              segments={quality.atmosphereSegments}
            />
          ) : null}

          {planet.id === "saturn" ? (
            <SaturnRings
              radius={scale.radius}
              segments={quality.ringSegments}
              textureVariant={quality.textureVariant}
            />
          ) : null}

          {planet.id === "jupiter" ||
          planet.id === "uranus" ||
          planet.id === "neptune" ? (
            <PlanetaryRingSystem
              active={active}
              planetId={planet.id}
              radius={scale.radius}
              segments={quality.ringSegments}
              textureVariant={quality.textureVariant}
            />
          ) : null}

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

        {scientificMode && !selected ? (
          <ScientificPlanetMarker
            active={active}
            color={planet.color}
            selected={selected}
          />
        ) : null}

        {active && !scientificMode ? (
          <mesh
            raycast={() => undefined}
            scale={scale.radius * (selected ? 1.065 : 1.045)}
          >
            <sphereGeometry args={[1, 32, 24]} />
            <meshBasicMaterial
              color={selected ? "#c7d3e3" : planet.color}
              depthWrite={false}
              opacity={selected ? 0.12 : 0.07}
              side={BackSide}
              transparent
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
