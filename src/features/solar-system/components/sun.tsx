"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { AdditiveBlending } from "three";
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
import { createSolarProminenceCurve } from "@/features/solar-system/lib/solar-prominence";
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
import { SolarCoronaShell } from "./solar-corona-shell";

const DISABLED_RAYCAST = () => undefined;

const SOLAR_PROMINENCES = [
  {
    lift: 0.3,
    rotation: [0.16, 0.15, -0.28] as const,
    spanRadians: 1.02,
    tube: 0.013,
  },
  {
    lift: 0.22,
    rotation: [-0.62, 2.3, 0.42] as const,
    spanRadians: 0.74,
    tube: 0.01,
  },
  {
    lift: 0.16,
    rotation: [0.78, 4.15, 0.18] as const,
    spanRadians: 0.58,
    tube: 0.0085,
  },
] as const;

function SolarProminenceArc({
  lift,
  rotation,
  spanRadians,
  tube,
}: (typeof SOLAR_PROMINENCES)[number]) {
  const curve = useMemo(
    () =>
      createSolarProminenceCurve({
        anchorRadius: 0.995,
        lift,
        spanRadians,
      }),
    [lift, spanRadians],
  );

  return (
    <mesh raycast={DISABLED_RAYCAST} rotation={[...rotation]}>
      <tubeGeometry args={[curve, 64, tube, 8, false]} />
      <meshBasicMaterial
        blending={AdditiveBlending}
        color="#ffb15c"
        depthWrite={false}
        opacity={0.54}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
}

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
          {SOLAR_PROMINENCES.map((prominence) => (
            <SolarProminenceArc
              key={prominence.rotation.join(":")}
              {...prominence}
            />
          ))}
        </group>
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
      <SolarCoronaShell
        color={active ? "#ffd7a0" : "#ffb35a"}
        opacity={
          (primary ? (selected ? 0.34 : hovered ? 0.27 : 0.2) : 0.04) *
          profile.effects.coronaMultiplier
        }
        power={active ? 2.7 : 3.35}
        radius={radius * (active ? 1.045 : 1.035)}
        segments={quality.atmosphereSegments}
      />
      <pointLight
        color="#fff8ed"
        decay={1.7}
        distance={profile.camera.maximumDistance * 0.86}
        intensity={1_450}
      />
    </group>
  );
}
