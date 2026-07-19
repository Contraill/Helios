"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Points, PointsMaterial } from "three";

import { createStarPositions } from "@/features/solar-system/lib/star-field";
import { universeLayerOpacities } from "@/features/solar-system/lib/universe-backdrop";
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
  const materialRef = useRef<PointsMaterial>(null);
  const positions = useMemo(() => createStarPositions(starCount), [starCount]);

  useEffect(() => {
    if (pointsRef.current) pointsRef.current.rotation.y = 0;
  }, [resetVersion]);

  useFrame(({ camera }, delta) => {
    if (materialRef.current) {
      materialRef.current.opacity =
        universeLayerOpacities(camera.position.length(), scaleMode).localStars *
        0.72;
    }
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
        ref={materialRef}
        color="#dfe8f6"
        depthWrite={false}
        fog={false}
        opacity={0.72}
        size={starSize}
        sizeAttenuation
        transparent
      />
    </points>
  );
}
