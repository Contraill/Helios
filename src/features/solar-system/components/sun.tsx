"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";

interface SunProps {
  motionEnabled: boolean;
  resetVersion: number;
  scaleMode: ScaleMode;
  segments: readonly [number, number];
  sun: SceneSun;
  timeScale: number;
}

export function Sun({
  motionEnabled,
  resetVersion,
  scaleMode,
  segments,
  sun,
  timeScale,
}: SunProps) {
  const surfaceRef = useRef<Mesh>(null);
  const radius = sun.scales[scaleMode];

  useEffect(() => {
    if (surfaceRef.current) surfaceRef.current.rotation.y = 0;
  }, [resetVersion]);

  useFrame((_, delta) => {
    if (motionEnabled && surfaceRef.current) {
      surfaceRef.current.rotation.y += delta * 0.025 * timeScale;
    }
  });

  return (
    <group>
      <mesh ref={surfaceRef} name={sun.name} scale={radius}>
        <sphereGeometry args={[1, segments[0], segments[1]]} />
        <meshStandardMaterial
          color="#f5b85f"
          emissive="#f2a844"
          emissiveIntensity={2.8}
          roughness={0.72}
        />
      </mesh>
      <pointLight
        color="#ffd7a1"
        decay={1.7}
        distance={scaleMode === "scientific" ? 5_000 : 190}
        intensity={2_300}
      />
    </group>
  );
}
