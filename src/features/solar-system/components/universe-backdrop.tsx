"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, DoubleSide } from "three";
import type { Group, MeshBasicMaterial, PointsMaterial } from "three";

import {
  createMilkyWayParticleData,
  universeLayerOpacities,
} from "@/features/solar-system/lib/universe-backdrop";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";

import { StarField } from "./star-field";

interface UniverseBackdropProps {
  motionEnabled: boolean;
  resetVersion: number;
  scaleMode: ScaleMode;
  starCount: number;
  starSize: number;
  timeScale: number;
}

export function UniverseBackdrop({
  motionEnabled,
  resetVersion,
  scaleMode,
  starCount,
  starSize,
  timeScale,
}: UniverseBackdropProps) {
  const galaxyPointsRef = useRef<PointsMaterial>(null);
  const galaxyGlowRef = useRef<MeshBasicMaterial>(null);
  const galaxyCoreRef = useRef<MeshBasicMaterial>(null);
  const galaxyRef = useRef<Group>(null);
  const galaxyData = useMemo(
    () => createMilkyWayParticleData(Math.max(2_200, starCount * 5)),
    [starCount],
  );
  const galaxyRadius = scaleMode === "scientific" ? 3_200 : 520;

  useFrame(({ camera }, delta) => {
    const layers = universeLayerOpacities(camera.position.length(), scaleMode);
    if (galaxyPointsRef.current) {
      galaxyPointsRef.current.opacity = layers.milkyWay * 0.86;
    }
    if (galaxyGlowRef.current) {
      galaxyGlowRef.current.opacity = layers.milkyWay * 0.11;
    }
    if (galaxyCoreRef.current) {
      galaxyCoreRef.current.opacity = layers.milkyWay * 0.2;
    }
    if (motionEnabled && galaxyRef.current) {
      galaxyRef.current.rotation.y += delta * 0.000035 * timeScale;
    }
  });

  return (
    <>
      <StarField
        motionEnabled={motionEnabled}
        resetVersion={resetVersion}
        scaleMode={scaleMode}
        starCount={starCount}
        starSize={starSize}
        timeScale={timeScale}
      />

      <group
        ref={galaxyRef}
        rotation-x={-0.22}
        scale={galaxyRadius}
        userData={{ visualLayer: "milky-way-exterior" }}
      >
        <points frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[galaxyData.positions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[galaxyData.colors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={galaxyPointsRef}
            blending={AdditiveBlending}
            depthWrite={false}
            fog={false}
            opacity={0}
            size={scaleMode === "scientific" ? 8 : 1.35}
            sizeAttenuation
            transparent
            vertexColors
          />
        </points>
        <mesh rotation-x={Math.PI / 2} scale={[0.84, 0.84, 0.026]}>
          <sphereGeometry args={[1, 48, 24]} />
          <meshBasicMaterial
            ref={galaxyGlowRef}
            blending={AdditiveBlending}
            color="#89a9e8"
            depthWrite={false}
            fog={false}
            opacity={0}
            side={DoubleSide}
            transparent
          />
        </mesh>
        <mesh rotation-x={Math.PI / 2} scale={[0.25, 0.25, 0.075]}>
          <sphereGeometry args={[1, 48, 24]} />
          <meshBasicMaterial
            ref={galaxyCoreRef}
            blending={AdditiveBlending}
            color="#ffd6a0"
            depthWrite={false}
            fog={false}
            opacity={0}
            side={DoubleSide}
            transparent
          />
        </mesh>
      </group>
    </>
  );
}
