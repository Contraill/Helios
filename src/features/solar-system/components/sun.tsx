"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { AdditiveBlending, BackSide } from "three";
import type { Group, Mesh } from "three";

import { planetTextureSources } from "@/content/sources/planet-textures";
import { markMaterialApplied } from "@/features/solar-system/lib/asset-loading-lifecycle";
import { useCelestialPointerInteraction } from "@/features/solar-system/hooks/use-celestial-pointer-interaction";
import { setCameraTargetMetadata } from "@/features/solar-system/lib/camera-runtime";
import {
  labelPriorityForBody,
  shouldMountLabel,
} from "@/features/solar-system/lib/label-visibility-policy";
import type { SceneQuality } from "@/features/solar-system/lib/quality";
import { sceneProfileFor } from "@/features/solar-system/lib/scene-profiles";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import { effectiveBodyVisibility } from "@/features/solar-system/lib/scene-visibility-policy";
import {
  textureMaterialKey,
  useSceneTexture,
} from "@/features/solar-system/lib/texture-cache";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import type { PlanetObjectRegistry } from "@/features/solar-system/types/planet-object-registry";
import { exploreSceneCopy } from "@/lib/i18n/explore-scene-copy";
import { useExplorationStore } from "@/stores/exploration-store";
import { useSceneVisibilityStore } from "@/stores/scene-visibility-store";

import { PlanetLabel } from "./planet-label";

const DISABLED_RAYCAST = () => undefined;

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
  const selectBody = useExplorationStore((state) => state.selectBody);
  const setHoveredBody = useExplorationStore((state) => state.setHoveredBody);
  const clearHoveredBody = useExplorationStore(
    (state) => state.clearHoveredBody,
  );
  const visible = useSceneVisibilityStore((state) =>
    effectiveBodyVisibility("sun", state),
  );
  const active = selected || hovered;
  const labelPriority = labelPriorityForBody("star", {
    bodyVisible: visible,
    hovered,
    labelsVisible,
    scaleMode,
    selected,
  });
  const primary = visible;
  const profile = sceneProfileFor(scaleMode);
  const radius = sun.scales[scaleMode];
  const surfaceAsset = planetTextureSources.sun.asset;
  const surfaceTexture = useSceneTexture(surfaceAsset.path, {
    onError: () => markMaterialApplied(surfaceAsset.owner, true),
  });

  useLayoutEffect(() => {
    if (surfaceTexture) markMaterialApplied(surfaceAsset.owner);
  }, [surfaceAsset.owner, surfaceTexture]);

  useLayoutEffect(() => {
    const node = bodyRef.current;
    if (!node) return;

    node.userData.bodyId = sun.id;
    node.userData.renderRadius = radius;
    setCameraTargetMetadata(node, {
      bodyId: "sun",
      targetKind: "body",
      renderRadius: radius,
      collisionRadius: radius,
      focusRadius: radius * 1.08,
    });
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
    if (!visible) return;
    event.stopPropagation();
    setHoveredBody("sun");
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    if (!visible) return;
    event.stopPropagation();
    clearHoveredBody("sun");
  };


  const pointerInteraction = useCelestialPointerInteraction({
    bodyId: "sun",
    enabled: visible,
    onSelect: selectBody,
  });

  return (
    <group
      ref={bodyRef}
      visible={visible}
      userData={{ bodyId: sun.id, testBodyRoot: true }}
    >
      <mesh ref={surfaceRef} name={sun.name} scale={radius}>
        <sphereGeometry
          args={[1, quality.planetSegments[0], quality.planetSegments[1]]}
        />
        <meshBasicMaterial
          key={textureMaterialKey(surfaceTexture)}
          userData={{
            testSurfaceBodyId: "sun",
            texturePath: surfaceTexture?.name ?? null,
          }}
          color={surfaceTexture ? "#fff8ec" : "#f5b85f"}
          depthWrite={primary}
          map={surfaceTexture ?? undefined}
          opacity={primary ? 1 : 0.34}
          toneMapped={false}
          transparent={!primary}
        />
      </mesh>
      <mesh
        raycast={visible ? undefined : DISABLED_RAYCAST}
        {...pointerInteraction}
        onPointerOut={handlePointerOut}
        onPointerOver={handlePointerOver}
        scale={radius * 1.12}
        userData={{ testInteractiveBodyId: "sun" }}
      >
        <sphereGeometry args={[1, 18, 14]} />
        <meshBasicMaterial depthWrite={false} opacity={0} transparent />
      </mesh>
      {primary ? (
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
                  72,
                  prominence.arc,
                ]}
              />
              <meshBasicMaterial
                blending={AdditiveBlending}
                color="#ffb15c"
                depthWrite={false}
                opacity={0.58}
                toneMapped={false}
                transparent
              />
            </mesh>
          ))}
        </group>
      ) : null}
      {primary && active ? (
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
      {shouldMountLabel(labelPriority) ? (
        <PlanetLabel
          active={active}
          bodyId="sun"
          color="#f2b766"
          mode={scaleMode}
          offsetY={radius + 1.15}
          placement="north"
          priority={labelPriority}
          positionCaption={selected ? exploreSceneCopy.labels.selectedStar : ""}
          selected={selected}
          text={sun.name}
        />
      ) : null}
      <mesh
        raycast={() => undefined}
        scale={radius * 1.085}
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
          opacity={(primary ? 0.16 : 0.025) * profile.effects.coronaMultiplier}
          side={BackSide}
          toneMapped={false}
          transparent
        />
      </mesh>
      <pointLight
        color="#fff8ed"
        decay={1.7}
        distance={profile.camera.maximumDistance * 0.86}
        intensity={1_450}
      />
    </group>
  );
}
