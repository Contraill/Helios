"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Points } from "three";

import { createStarPositions } from "@/features/solar-system/lib/star-field";

interface StarFieldProps {
  motionEnabled: boolean;
}

export function StarField({ motionEnabled }: StarFieldProps) {
  const pointsRef = useRef<Points>(null);
  const positions = useMemo(() => createStarPositions(900), []);

  useFrame((_, delta) => {
    if (motionEnabled && pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.002;
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#dfe8f6"
        depthWrite={false}
        opacity={0.72}
        size={0.42}
        sizeAttenuation
        transparent
      />
    </points>
  );
}
