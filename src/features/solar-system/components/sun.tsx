"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

interface SunProps {
  motionEnabled: boolean;
}

export function Sun({ motionEnabled }: SunProps) {
  const surfaceRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (motionEnabled && surfaceRef.current) {
      surfaceRef.current.rotation.y += delta * 0.025;
    }
  });

  return (
    <group>
      <mesh ref={surfaceRef} name="Sun">
        <sphereGeometry args={[2.5, 40, 28]} />
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
        distance={190}
        intensity={2_300}
      />
    </group>
  );
}
