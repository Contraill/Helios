"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { AdditiveBlending, BackSide } from "three";
import type { Group, Mesh } from "three";

import { textureVariantFor } from "@/content/sources/planet-textures";
import type { SceneQuality } from "@/features/solar-system/lib/quality";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import { useSceneTexture } from "@/features/solar-system/lib/texture-cache";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import type { PlanetObjectRegistry } from "@/features/solar-system/types/planet-object-registry";
import { useExplorationStore } from "@/stores/exploration-store";

import { PlanetLabel } from "./planet-label";

interface SunProps {
  labelsVisible: boolean;
  motionEnabled: boolean;
  planetObjects: PlanetObjectRegistry;
  resetVersion: number;
  scaleMode: ScaleMode;
  quality: SceneQuality;
  sun: SceneSun;
  timeScale: number;
}

export function Sun({
  labelsVisible,
  motionEnabled,
  planetObjects,
  resetVersion,
  scaleMode,
  quality,
  sun,
  timeScale,
}: SunProps) {
  const bodyRef = useRef<Group>(null);
  const surfaceRef = useRef<Mesh>(null);
  const prominenceRef = useRef<Group>(null);
  const selected = useExplorationStore(
    (state) => state.selectedBodyId === "sun",
  );
  const hovered = useExplorationStore((state) => state.hoveredBodyId === "sun");
  const selectSun = useExplorationStore((state) => state.selectSun);
  const setHoveredBody = useExplorationStore((state) => state.setHoveredBody);
  const clearHoveredBody = useExplorationStore(
    (state) => state.clearHoveredBody,
  );
  const active = selected || hovered;
  const radius = sun.scales[scaleMode];
  const surfaceTexture = useSceneTexture(
    textureVariantFor("sun", quality.textureVariant).path,
  );

  useLayoutEffect(() => {
    const node = bodyRef.current;
    if (!node) return;

    node.userData.bodyId = sun.id;
    node.userData.renderRadius = radius;
    const registry = planetObjects.current;
    registry.set(sun.id, node);

    return () => {
      registry.delete(sun.id);
    };
  }, [planetObjects, radius, sun.id]);

  useEffect(() => {
    if (surfaceRef.current) surfaceRef.current.rotation.y = 0;
  }, [resetVersion]);

  useFrame((_, delta) => {
    if (motionEnabled && surfaceRef.current) {
      surfaceRef.current.rotation.y += delta * 0.025 * timeScale;
    }
    if (motionEnabled && prominenceRef.current) {
      prominenceRef.current.rotation.y += delta * 0.0035 * timeScale;
    }
  });

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHoveredBody("sun");
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    clearHoveredBody("sun");
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    selectSun();
  };

  return (
    <group ref={bodyRef}>
      <mesh ref={surfaceRef} name={sun.name} scale={radius}>
        <sphereGeometry
          args={[1, quality.planetSegments[0], quality.planetSegments[1]]}
        />
        <meshBasicMaterial
          color={surfaceTexture ? "#fff8ec" : "#f5b85f"}
          map={surfaceTexture ?? undefined}
          toneMapped={false}
        />
      </mesh>
      <mesh
        onClick={handleClick}
        onPointerOut={handlePointerOut}
        onPointerOver={handlePointerOver}
        scale={radius * 1.12}
      >
        <sphereGeometry args={[1, 18, 14]} />
        <meshBasicMaterial depthWrite={false} opacity={0} transparent />
      </mesh>
      {quality.textureVariant !== "low" ? (
        <group
          ref={prominenceRef}
          rotation={[0.42, 0.1, -0.3]}
          scale={radius}
          userData={{ visualLayer: "controlled-solar-prominences" }}
        >
          {[
            { arc: 1.05, radius: 1.08, tube: 0.012, rotation: 0.2 },
            { arc: 0.72, radius: 1.13, tube: 0.009, rotation: 2.35 },
            { arc: 0.56, radius: 1.06, tube: 0.008, rotation: 4.2 },
          ].map((prominence) => (
            <mesh
              key={prominence.rotation}
              raycast={() => undefined}
              rotation={[Math.PI / 2, prominence.rotation, 0]}
            >
              <torusGeometry
                args={[
                  prominence.radius,
                  prominence.tube,
                  8,
                  quality.textureVariant === "high" ? 72 : 36,
                  prominence.arc,
                ]}
              />
              <meshBasicMaterial
                blending={AdditiveBlending}
                color="#ffb15c"
                depthWrite={false}
                opacity={quality.textureVariant === "high" ? 0.58 : 0.34}
                toneMapped={false}
                transparent
              />
            </mesh>
          ))}
        </group>
      ) : null}
      {active ? (
        <mesh raycast={() => undefined} scale={radius * 1.095}>
          <sphereGeometry args={[1, 40, 30]} />
          <meshBasicMaterial
            color="#f6bd69"
            depthWrite={false}
            opacity={selected ? 0.13 : 0.08}
            side={BackSide}
            transparent
          />
        </mesh>
      ) : null}
      {labelsVisible && active ? (
        <PlanetLabel
          active
          color="#f2b766"
          mode={scaleMode}
          offsetY={radius + 1.15}
          placement="north"
          positionCaption={selected ? "Selected star" : ""}
          selected={selected}
          text={sun.name}
        />
      ) : null}
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
          color="#ffd18a"
          depthWrite={false}
          opacity={quality.bloomStrength > 0 ? 0.16 : 0.07}
          side={BackSide}
          toneMapped={false}
          transparent
        />
      </mesh>
      <pointLight
        color="#fff8ed"
        decay={1.7}
        distance={scaleMode === "scientific" ? 5_000 : 190}
        intensity={1_450}
      />
    </group>
  );
}
