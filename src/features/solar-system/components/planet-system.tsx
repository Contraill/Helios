"use client";

import { useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import type { Group, Mesh } from "three";

import type { SceneQuality } from "@/features/solar-system/lib/quality";
import {
  sceneScaleFor,
  type ScenePlanet,
} from "@/features/solar-system/lib/scene-planets";
import {
  advanceAngle,
  orbitalPosition,
} from "@/features/solar-system/lib/orbital-motion";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import type { PlanetObjectRegistry } from "@/features/solar-system/types/planet-object-registry";
import { useExplorationStore } from "@/stores/exploration-store";

import { OrbitPath } from "./orbit-path";
import { PlanetLabel } from "./planet-label";

interface PlanetSystemProps {
  labelsVisible: boolean;
  motionEnabled: boolean;
  orbitsVisible: boolean;
  planet: ScenePlanet;
  planetObjects: PlanetObjectRegistry;
  quality: SceneQuality;
  resetVersion: number;
  scaleMode: ScaleMode;
  timeScale: number;
}

export function PlanetSystem({
  labelsVisible,
  motionEnabled,
  orbitsVisible,
  planet,
  planetObjects,
  quality,
  resetVersion,
  scaleMode,
  timeScale,
}: PlanetSystemProps) {
  const bodyRef = useRef<Group>(null);
  const surfaceRef = useRef<Mesh>(null);
  const angleRef = useRef(planet.initialAngle);
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
  const interactionRadius = Math.max(
    scale.radius * 1.65,
    scaleMode === "scientific" ? 0.32 : 0.72,
  );
  const showScientificMarker =
    scaleMode === "scientific" && scale.radius < 0.12;

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
    angleRef.current = planet.initialAngle;
    if (bodyRef.current) {
      bodyRef.current.position.set(...scale.initialPosition);
    }
    if (surfaceRef.current) {
      surfaceRef.current.rotation.y = 0;
    }
  }, [planet.initialAngle, resetVersion, scale.initialPosition]);

  useLayoutEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.position.set(
      ...orbitalPosition(
        angleRef.current,
        scale.semiMajorAxis,
        scale.semiMinorAxis,
      ),
    );
  }, [scale.semiMajorAxis, scale.semiMinorAxis]);

  useFrame((_, delta) => {
    if (!motionEnabled || !bodyRef.current || !surfaceRef.current) return;

    const scaledDelta = delta * timeScale;
    angleRef.current = advanceAngle(
      angleRef.current,
      planet.orbitalAngularVelocity,
      scaledDelta,
    );
    bodyRef.current.position.set(
      ...orbitalPosition(
        angleRef.current,
        scale.semiMajorAxis,
        scale.semiMinorAxis,
      ),
    );
    surfaceRef.current.rotation.y +=
      planet.rotationAngularVelocity * scaledDelta;
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
    <group rotation-z={planet.inclinationRadians}>
      {orbitsVisible ? (
        <OrbitPath
          active={active}
          color={planet.color}
          segments={quality.orbitSegments}
          semiMajorAxis={scale.semiMajorAxis}
          semiMinorAxis={scale.semiMinorAxis}
        />
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

        {showScientificMarker ? (
          <mesh raycast={() => undefined} scale={0.18}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial
              color={planet.color}
              depthWrite={false}
              opacity={active ? 0.7 : 0.34}
              transparent
              wireframe
            />
          </mesh>
        ) : null}

        {active ? (
          <mesh
            raycast={() => undefined}
            scale={Math.max(
              scale.radius * (selected ? 1.24 : 1.16),
              showScientificMarker ? 0.22 : 0,
            )}
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

        {labelsVisible && (active || scaleMode === "scientific") ? (
          <PlanetLabel
            color={planet.color}
            offsetY={Math.max(scale.radius + 1.15, 1.15)}
            text={planet.name}
          />
        ) : null}
      </group>
    </group>
  );
}
