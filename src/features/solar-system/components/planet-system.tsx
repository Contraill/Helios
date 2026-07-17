"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";

import type { ScenePlanet } from "@/features/solar-system/lib/scene-planets";
import {
  advanceAngle,
  orbitalPosition,
} from "@/features/solar-system/lib/orbital-motion";

import { OrbitPath } from "./orbit-path";

interface PlanetSystemProps {
  planet: ScenePlanet;
  motionEnabled: boolean;
}

export function PlanetSystem({ planet, motionEnabled }: PlanetSystemProps) {
  const bodyRef = useRef<Group>(null);
  const surfaceRef = useRef<Mesh>(null);
  const angleRef = useRef(planet.initialAngle);

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

  return (
    <group rotation-z={planet.inclinationRadians}>
      <OrbitPath
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
              metalness={0}
              roughness={0.86}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
