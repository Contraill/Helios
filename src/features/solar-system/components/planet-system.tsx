"use client";

import { useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import type { Group, Mesh } from "three";

import type { ScenePlanet } from "@/features/solar-system/lib/scene-planets";
import {
  advanceAngle,
  orbitalPosition,
} from "@/features/solar-system/lib/orbital-motion";
import type { PlanetObjectRegistry } from "@/features/solar-system/types/planet-object-registry";
import { useExplorationStore } from "@/stores/exploration-store";

import { OrbitPath } from "./orbit-path";
import { PlanetLabel } from "./planet-label";

interface PlanetSystemProps {
  motionEnabled: boolean;
  planet: ScenePlanet;
  planetObjects: PlanetObjectRegistry;
}

export function PlanetSystem({
  motionEnabled,
  planet,
  planetObjects,
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

  useLayoutEffect(() => {
    const node = bodyRef.current;
    if (!node) return;

    const registry = planetObjects.current;
    node.userData.planetId = planet.id;
    node.userData.renderRadius = planet.radius;
    registry.set(planet.id, node);

    return () => {
      registry.delete(planet.id);
    };
  }, [planet.id, planet.radius, planetObjects]);

  useFrame((_, delta) => {
    if (!motionEnabled || !bodyRef.current || !surfaceRef.current) return;

    angleRef.current = advanceAngle(
      angleRef.current,
      planet.orbitalAngularVelocity,
      delta,
    );
    bodyRef.current.position.set(
      ...orbitalPosition(
        angleRef.current,
        planet.semiMajorAxis,
        planet.semiMinorAxis,
      ),
    );
    surfaceRef.current.rotation.y += planet.rotationAngularVelocity * delta;
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
      <OrbitPath
        active={active}
        color={planet.color}
        semiMajorAxis={planet.semiMajorAxis}
        semiMinorAxis={planet.semiMinorAxis}
      />
      <group ref={bodyRef} position={planet.initialPosition}>
        <group rotation-z={planet.axialTiltRadians}>
          <mesh
            ref={surfaceRef}
            name={planet.name}
            scale={planet.radius}
            userData={{ planetId: planet.id }}
          >
            <sphereGeometry args={[1, 28, 20]} />
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
            scale={Math.max(planet.radius * 1.65, 0.72)}
          >
            <sphereGeometry args={[1, 18, 14]} />
            <meshBasicMaterial
              color={planet.color}
              depthWrite={false}
              opacity={0}
              transparent
            />
          </mesh>
        </group>

        {active ? (
          <>
            <mesh
              raycast={() => undefined}
              scale={planet.radius * (selected ? 1.24 : 1.16)}
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
            <PlanetLabel
              color={planet.color}
              offsetY={planet.radius + 1.15}
              text={planet.name}
            />
          </>
        ) : null}
      </group>
    </group>
  );
}
