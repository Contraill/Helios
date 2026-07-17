"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Points } from "three";

import { createStarPositions } from "@/features/solar-system/lib/star-field";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";

interface StarFieldProps {
  motionEnabled: boolean;
  starCount: number;
  resetVersion: number;
  scaleMode: ScaleMode;
  starSize: number;
  timeScale: number;
}

export function StarField({
  motionEnabled,
  resetVersion,
  scaleMode,
  starCount,
  starSize,
  timeScale,
}: StarFieldProps) {
  const pointsRef = useRef<Points>(null);
  const positions = useMemo(() => createStarPositions(starCount), [starCount]);

  useEffect(() => {
    if (pointsRef.current) pointsRef.current.rotation.y = 0;
  }, [resetVersion]);

  useFrame((_, delta) => {
    if (motionEnabled && pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.002 * timeScale;
    }
  });

  return (
    <points
      ref={pointsRef}
      frustumCulled={false}
      scale={scaleMode === "scientific" ? 30 : 1}
    >
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#dfe8f6"
        depthWrite={false}
        opacity={0.72}
        size={starSize}
        sizeAttenuation
        transparent
      />
    </points>
  );
}
