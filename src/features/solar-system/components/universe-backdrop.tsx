"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, DoubleSide } from "three";
import type { Group, MeshBasicMaterial, PointsMaterial } from "three";

import {
  createDeepFieldParticleData,
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
  const galaxyRef = useRef<Group>(null);
  const deepFieldRef = useRef<PointsMaterial>(null);
  const galaxyData = useMemo(
    () => createMilkyWayParticleData(Math.max(900, starCount * 2)),
    [starCount],
  );
  const deepFieldData = useMemo(
    () => createDeepFieldParticleData(Math.max(420, starCount)),
    [starCount],
  );
  const galaxyRadius = scaleMode === "scientific" ? 3_200 : 520;
  const deepFieldRadius = scaleMode === "scientific" ? 32_000 : 10_000;

  useFrame(({ camera }, delta) => {
    const layers = universeLayerOpacities(camera.position.length(), scaleMode);
    if (galaxyPointsRef.current) {
      galaxyPointsRef.current.opacity = layers.milkyWay * 0.86;
    }
    if (galaxyGlowRef.current) {
      galaxyGlowRef.current.opacity = layers.milkyWay * 0.075;
    }
    if (deepFieldRef.current) {
      deepFieldRef.current.opacity = layers.deepField * 0.78;
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
        <mesh rotation-x={Math.PI / 2} scale={[0.68, 0.68, 0.022]}>
          <sphereGeometry args={[1, 48, 24]} />
          <meshBasicMaterial
            ref={galaxyGlowRef}
            blending={AdditiveBlending}
            color="#b7c9ff"
            depthWrite={false}
            fog={false}
            opacity={0}
            side={DoubleSide}
            transparent
          />
        </mesh>
      </group>

      <points
        frustumCulled={false}
        scale={deepFieldRadius}
        userData={{ visualLayer: "extragalactic-deep-field" }}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[deepFieldData.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[deepFieldData.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={deepFieldRef}
          blending={AdditiveBlending}
          depthWrite={false}
          fog={false}
          opacity={0}
          size={1.15}
          sizeAttenuation={false}
          transparent
          vertexColors
        />
      </points>
    </>
  );
}
