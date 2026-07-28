"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Points, PointsMaterial } from "three";

import { cameraRuntimeSnapshot } from "@/features/solar-system/lib/camera-runtime";
import { SCENE_FRAME_PRIORITY } from "@/features/solar-system/lib/scene-frame-runtime";
import { sceneProfileFor } from "@/features/solar-system/lib/scene-profiles";
import { createStarPositions } from "@/features/solar-system/lib/star-field";
import {
  galacticContextDistance,
  universeLayerOpacities,
} from "@/features/solar-system/lib/universe-backdrop";
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
  const profile = sceneProfileFor(scaleMode);

  useEffect(() => {
    if (pointsRef.current) pointsRef.current.rotation.y = 0;
  }, [resetVersion]);

  useFrame(({ camera }, delta) => {
    if (materialRef.current) {
      const runtime = cameraRuntimeSnapshot();
      const contextDistance = galacticContextDistance(
        {
          cameraMode: runtime?.mode ?? null,
          cameraPosition: [
            camera.position.x,
            camera.position.y,
            camera.position.z,
          ],
          cameraTarget: runtime?.target ?? [0, 0, 0],
          selectedBodyId: runtime?.selectedBodyId ?? null,
        },
        profile,
      );
      const localStars = universeLayerOpacities(
        contextDistance,
        profile,
      ).localStars;
      materialRef.current.opacity = localStars * 0.72;
      materialRef.current.visible = localStars > 0.002;
    }
    if (motionEnabled && pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.002 * timeScale;
    }
  }, SCENE_FRAME_PRIORITY.backdrop);

  return (
    <points
      ref={pointsRef}
      frustumCulled={false}
      scale={profile.backdrop.starFieldScale}
      userData={{ testBackdropLayer: "local-stars" }}
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
