"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { sceneProfileFor } from "@/features/solar-system/lib/scene-profiles";
import type { PlanetObjectRegistry } from "@/features/solar-system/types/planet-object-registry";
import { useExplorationStore } from "@/stores/exploration-store";

import {
  cameraPoseHasSettled,
  illuminatedFocusCameraOffset,
  overviewCameraPosition,
  transitionAlpha,
} from "../lib/camera-poses";

interface CameraRigProps {
  planetObjects: PlanetObjectRegistry;
  reducedMotion: boolean;
}

export function CameraRig({ planetObjects, reducedMotion }: CameraRigProps) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const selectedBodyId = useExplorationStore((state) => state.selectedBodyId);
  const cameraMode = useExplorationStore((state) => state.cameraMode);
  const scaleMode = useExplorationStore((state) => state.scaleMode);
  const profile = sceneProfileFor(scaleMode);
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
  const focusAnchorKey = useRef("");
  const controls = useRef<OrbitControls | null>(null);
  const previousCameraMode = useRef(cameraMode);

  useEffect(() => {
    const orbitControls = new OrbitControls(camera, gl.domElement);
    orbitControls.enabled = false;
    // Camera input must stop when the pointer stops. OrbitControls damping is
    // pleasant for a passive model viewer, but here it made a high-distance
    // wheel/pinch gesture continue after release and looked like autonomous
    // camera travel.
    orbitControls.enableDamping = false;
    orbitControls.enablePan = true;
    orbitControls.screenSpacePanning = true;
    orbitControls.minDistance = profile.camera.minimumDistance;
    // The experience ends at an exterior Milky Way view. There is no
    // extragalactic/deep-field zoom stage beyond this boundary.
    orbitControls.maxDistance = profile.camera.maximumDistance;
    orbitControls.keyPanSpeed = 18;
    controls.current = orbitControls;

    const pointerOrigins = new Map<number, { x: number; y: number }>();

    const activateDirectControl = () => {
      if (useExplorationStore.getState().cameraMode === "free") return;
      orbitControls.target.copy(currentTarget.current);
      orbitControls.enabled = true;
      useExplorationStore.getState().enterFreeCamera();
      previousCameraMode.current = "free";
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointerOrigins.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      // Let OrbitControls observe this pointer-down. Camera authority is only
      // handed over after a real drag threshold, so tapping a body still means
      // selection rather than a free-camera flicker.
      orbitControls.target.copy(currentTarget.current);
      orbitControls.enabled = true;
    };
    const handlePointerMove = (event: PointerEvent) => {
      const origin = pointerOrigins.get(event.pointerId);
      if (!origin) return;
      if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) >= 5) {
        activateDirectControl();
      }
    };
    const handlePointerEnd = (event: PointerEvent) => {
      pointerOrigins.delete(event.pointerId);
      if (useExplorationStore.getState().cameraMode !== "free") {
        orbitControls.enabled = false;
      }
    };
    const handleWheel = () => activateDirectControl();

    gl.domElement.addEventListener("pointerdown", handlePointerDown, true);
    gl.domElement.addEventListener("pointermove", handlePointerMove, true);
    gl.domElement.addEventListener("pointerup", handlePointerEnd, true);
    gl.domElement.addEventListener("pointercancel", handlePointerEnd, true);
    gl.domElement.addEventListener("wheel", handleWheel, true);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        useExplorationStore.getState().cameraMode !== "free" ||
        !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
      ) {
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest("input, textarea, select, button, a"))
      ) {
        return;
      }

      event.preventDefault();
      const distance = camera.position.distanceTo(orbitControls.target);
      const amount = Math.max(0.2, distance * 0.025);
      const direction =
        event.key === "ArrowLeft" || event.key === "ArrowRight"
          ? new Vector3().setFromMatrixColumn(camera.matrix, 0)
          : new Vector3().setFromMatrixColumn(camera.matrix, 1);
      const sign =
        event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 1;
      direction.multiplyScalar(amount * sign);
      camera.position.add(direction);
      orbitControls.target.add(direction);
      orbitControls.update();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      gl.domElement.removeEventListener("pointerdown", handlePointerDown, true);
      gl.domElement.removeEventListener("pointermove", handlePointerMove, true);
      gl.domElement.removeEventListener("pointerup", handlePointerEnd, true);
      gl.domElement.removeEventListener(
        "pointercancel",
        handlePointerEnd,
        true,
      );
      gl.domElement.removeEventListener("wheel", handleWheel, true);
      window.removeEventListener("keydown", handleKeyDown);
      orbitControls.dispose();
      controls.current = null;
    };
  }, [
    camera,
    gl.domElement,
    profile.camera.maximumDistance,
    profile.camera.minimumDistance,
  ]);

  useFrame((_, delta) => {
    const aspect = width / Math.max(height, 1);
    const selectedObject = selectedBodyId
      ? planetObjects.current.get(selectedBodyId)
      : undefined;

    if (selectedBodyId && selectedObject) {
      selectedObject.getWorldPosition(worldPosition.current);
      desiredTarget.current.copy(worldPosition.current);

      const radius = Number(
        selectedObject.userData.cameraFocusRadius ??
          selectedObject.userData.renderRadius ??
          1,
      );
      if (controls.current) {
        controls.current.minDistance = Math.max(
          radius * 1.35,
          profile.camera.minimumDistance * 0.000_000_5,
        );
      }
      const anchorKey = `${selectedBodyId}:${scaleMode}:${width}:${height}`;
      if (focusAnchorKey.current !== anchorKey) {
        const offset = illuminatedFocusCameraOffset(
          [
            worldPosition.current.x,
            worldPosition.current.y,
            worldPosition.current.z,
          ],
          radius,
          Math.max(aspect, 0.1),
          scaleMode,
        );
        focusOffset.current.set(...offset);
        focusAnchorKey.current = anchorKey;
      }
      desiredPosition.current
        .copy(worldPosition.current)
        .add(focusOffset.current);
    } else {
      if (controls.current) {
        controls.current.minDistance = profile.camera.minimumDistance;
      }
      focusAnchorKey.current = "";
      desiredTarget.current.set(0, 0, 0);
      desiredPosition.current.set(...overviewPosition);
    }

    const liveCameraMode = useExplorationStore.getState().cameraMode;
    if (liveCameraMode === "free" && controls.current) {
      controls.current.enabled = true;
      if (previousCameraMode.current !== "free") {
        controls.current.target.copy(currentTarget.current);
      }
      controls.current.update();
      currentTarget.current.copy(controls.current.target);
      previousCameraMode.current = "free";
      return;
    }
    if (controls.current) controls.current.enabled = false;
    previousCameraMode.current = liveCameraMode;

    const alpha = transitionAlpha(delta, reducedMotion);
    camera.position.lerp(desiredPosition.current, alpha);
    currentTarget.current.lerp(desiredTarget.current, alpha);
    camera.lookAt(currentTarget.current);

    if (
      liveCameraMode === "transition" &&
      cameraPoseHasSettled(
        camera.position.distanceToSquared(desiredPosition.current),
        currentTarget.current.distanceToSquared(desiredTarget.current),
      )
    ) {
      settleCamera(
        selectedBodyId,
        selectedBodyId === null ? "overview" : "focus",
      );
    }
  });

  return null;
}
