"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";

import type { PlanetObjectRegistry } from "@/features/solar-system/types/planet-object-registry";
import { useExplorationStore } from "@/stores/exploration-store";

import {
  cameraPoseHasSettled,
  focusCameraOffset,
  overviewCameraPosition,
  transitionAlpha,
} from "../lib/camera-poses";

interface CameraRigProps {
  planetObjects: PlanetObjectRegistry;
  reducedMotion: boolean;
}

export function CameraRig({ planetObjects, reducedMotion }: CameraRigProps) {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const selectedPlanetId = useExplorationStore(
    (state) => state.selectedPlanetId,
  );
  const cameraMode = useExplorationStore((state) => state.cameraMode);
  const scaleMode = useExplorationStore((state) => state.scaleMode);
  const settleCamera = useExplorationStore((state) => state.settleCamera);

  const overviewPosition = useMemo(
    () =>
      overviewCameraPosition(
        Math.max(width, 1),
        Math.max(height, 1),
        scaleMode,
      ),
    [height, scaleMode, width],
  );
  const currentTarget = useRef(new Vector3());
  const desiredTarget = useRef(new Vector3());
  const desiredPosition = useRef(new Vector3(...overviewPosition));
  const worldPosition = useRef(new Vector3());
  const focusOffset = useRef(new Vector3());

  useFrame((_, delta) => {
    const aspect = width / Math.max(height, 1);
    const selectedObject = selectedPlanetId
      ? planetObjects.current.get(selectedPlanetId)
      : undefined;

    if (selectedPlanetId && selectedObject) {
      selectedObject.getWorldPosition(worldPosition.current);
      desiredTarget.current.copy(worldPosition.current);

      const radius = Number(selectedObject.userData.renderRadius ?? 1);
      const offset = focusCameraOffset(radius, Math.max(aspect, 0.1));
      focusOffset.current.set(...offset);
      desiredPosition.current
        .copy(worldPosition.current)
        .add(focusOffset.current);
    } else {
      desiredTarget.current.set(0, 0, 0);
      desiredPosition.current.set(...overviewPosition);
    }

    const alpha = transitionAlpha(delta, reducedMotion);
    camera.position.lerp(desiredPosition.current, alpha);
    currentTarget.current.lerp(desiredTarget.current, alpha);
    camera.lookAt(currentTarget.current);

    if (
      cameraMode === "transition" &&
      cameraPoseHasSettled(
        camera.position.distanceToSquared(desiredPosition.current),
        currentTarget.current.distanceToSquared(desiredTarget.current),
      )
    ) {
      settleCamera(
        selectedPlanetId,
        selectedPlanetId === null ? "overview" : "focus",
      );
    }
  });

  return null;
}
