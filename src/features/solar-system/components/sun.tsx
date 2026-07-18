"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BackSide } from "three";
import type { Mesh } from "three";

import { textureVariantFor } from "@/content/sources/planet-textures";
import type { SceneQuality } from "@/features/solar-system/lib/quality";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import { useSceneTexture } from "@/features/solar-system/lib/texture-cache";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";

interface SunProps {
  motionEnabled: boolean;
  resetVersion: number;
  scaleMode: ScaleMode;
  quality: SceneQuality;
  sun: SceneSun;
  timeScale: number;
}

export function Sun({
  motionEnabled,
  resetVersion,
  scaleMode,
  quality,
  sun,
  timeScale,
}: SunProps) {
  const surfaceRef = useRef<Mesh>(null);
  const radius = sun.scales[scaleMode];
  const surfaceTexture = useSceneTexture(
    textureVariantFor("sun", quality.textureVariant, true).path,
  );

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
        <sphereGeometry
          args={[1, quality.planetSegments[0], quality.planetSegments[1]]}
        />
        <meshStandardMaterial
          color={surfaceTexture ? "#ffffff" : "#f5b85f"}
          emissive="#f2a844"
          emissiveIntensity={1.7}
          emissiveMap={surfaceTexture ?? undefined}
          map={surfaceTexture ?? undefined}
          roughness={0.72}
          toneMapped={false}
        />
      </mesh>
      <mesh
        raycast={() => undefined}
        scale={radius * (quality.bloomStrength > 0 ? 1.085 : 1.045)}
        userData={{ visualLayer: "solar-corona" }}
      >
        <sphereGeometry
          args={[
            1,
            quality.atmosphereSegments[0],
            quality.atmosphereSegments[1],
          ]}
        />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#f6a84f"
          depthWrite={false}
          opacity={quality.bloomStrength > 0 ? 0.16 : 0.07}
          side={BackSide}
          toneMapped={false}
          transparent
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
