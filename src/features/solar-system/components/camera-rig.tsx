"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MOUSE, PerspectiveCamera, Spherical, TOUCH, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import {
  cameraFocusPolicy,
  clampCameraDistance,
} from "@/features/solar-system/lib/camera-focus-policy";
import {
  cameraTargetMetadataFor,
  clearCameraRuntimeSnapshot,
  updateCameraRuntimeSnapshot,
} from "@/features/solar-system/lib/camera-runtime";
import { markCelestialCameraGesture } from "@/features/solar-system/lib/pointer-interaction";
import { regionFocusAnchorOffset } from "@/features/solar-system/lib/region-visual-policy";
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

interface PointerOrigin {
  readonly button: number;
  readonly pointerType: string;
  readonly x: number;
  readonly y: number;
  moved: boolean;
}

const CAMERA_DRAG_THRESHOLD = 6;

export function CameraRig({ planetObjects, reducedMotion }: CameraRigProps) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const selectedBodyId = useExplorationStore((state) => state.selectedBodyId);
  const cameraMode = useExplorationStore((state) => state.cameraMode);
  const transitionVersion = useExplorationStore(
    (state) => state.cameraTransitionVersion,
  );
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
  const controls = useRef<OrbitControls | null>(null);
  const currentTarget = useRef(new Vector3());
  const desiredTarget = useRef(new Vector3());
  const desiredPosition = useRef(new Vector3(...overviewPosition));
  const worldPosition = useRef(new Vector3());
  const previousWorldPosition = useRef(new Vector3());
  const targetDelta = useRef(new Vector3());
  const relativeOffset = useRef(new Vector3());
  const canonicalOffset = useRef(new Vector3());
  const spherical = useRef(new Spherical());
  const activeTransitionVersion = useRef(-1);
  const activeTransitionBodyId = useRef<string | null>(null);
  const trackedBodyId = useRef<string | null>(null);
  const isDragging = useRef(false);
  const lastMinimumDistance = useRef(profile.camera.minimumDistance);
  const previousStableMode = useRef<"overview" | "focus" | "free">("overview");

  useEffect(() => {
    invalidate();
  }, [cameraMode, invalidate, selectedBodyId, transitionVersion]);

  useEffect(() => {
    const orbitControls = new OrbitControls(camera, gl.domElement);
    orbitControls.enableDamping = false;
    orbitControls.enablePan = true;
    orbitControls.screenSpacePanning = true;
    orbitControls.mouseButtons.LEFT = MOUSE.ROTATE;
    orbitControls.mouseButtons.MIDDLE = MOUSE.DOLLY;
    orbitControls.mouseButtons.RIGHT = MOUSE.PAN;
    orbitControls.touches.ONE = TOUCH.ROTATE;
    orbitControls.touches.TWO = TOUCH.DOLLY_PAN;
    orbitControls.keyPanSpeed = 18;
    controls.current = orbitControls;
    const handleControlChange = () => invalidate();
    orbitControls.addEventListener("change", handleControlChange);

    const pointerOrigins = new Map<number, PointerOrigin>();
    const activeTouches = new Set<number>();

    const handlePointerDown = (event: PointerEvent) => {
      pointerOrigins.set(event.pointerId, {
        button: event.button,
        pointerType: event.pointerType,
        x: event.clientX,
        y: event.clientY,
        moved: false,
      });
      if (event.pointerType === "touch") activeTouches.add(event.pointerId);
    };
    const handlePointerMove = (event: PointerEvent) => {
      const origin = pointerOrigins.get(event.pointerId);
      if (!origin) return;
      if (
        Math.hypot(event.clientX - origin.x, event.clientY - origin.y) <
        CAMERA_DRAG_THRESHOLD
      ) {
        return;
      }
      origin.moved = true;
      isDragging.current = true;
      const isPan =
        (origin.pointerType === "mouse" && origin.button === 2) ||
        (origin.pointerType === "touch" && activeTouches.size > 1);
      if (isPan && useExplorationStore.getState().cameraMode === "focus") {
        useExplorationStore.getState().enterFreeCamera();
      }
    };
    const handlePointerEnd = (event: PointerEvent) => {
      const origin = pointerOrigins.get(event.pointerId);
      if (origin?.moved) markCelestialCameraGesture();
      pointerOrigins.delete(event.pointerId);
      activeTouches.delete(event.pointerId);
      if (pointerOrigins.size === 0) isDragging.current = false;
    };
    const handleStart = () => {
      isDragging.current = true;
    };
    const handleEnd = () => {
      isDragging.current = false;
    };

    gl.domElement.addEventListener("pointerdown", handlePointerDown, true);
    gl.domElement.addEventListener("pointermove", handlePointerMove, true);
    gl.domElement.addEventListener("pointerup", handlePointerEnd, true);
    gl.domElement.addEventListener("pointercancel", handlePointerEnd, true);
    gl.domElement.addEventListener(
      "lostpointercapture",
      handlePointerEnd,
      true,
    );
    orbitControls.addEventListener("start", handleStart);
    orbitControls.addEventListener("end", handleEnd);

    return () => {
      gl.domElement.removeEventListener("pointerdown", handlePointerDown, true);
      gl.domElement.removeEventListener("pointermove", handlePointerMove, true);
      gl.domElement.removeEventListener("pointerup", handlePointerEnd, true);
      gl.domElement.removeEventListener(
        "pointercancel",
        handlePointerEnd,
        true,
      );
      gl.domElement.removeEventListener(
        "lostpointercapture",
        handlePointerEnd,
        true,
      );
      orbitControls.removeEventListener("start", handleStart);
      orbitControls.removeEventListener("end", handleEnd);
      orbitControls.removeEventListener("change", handleControlChange);
      orbitControls.dispose();
      controls.current = null;
      clearCameraRuntimeSnapshot();
    };
  }, [camera, gl.domElement, invalidate]);

  useFrame((_, delta) => {
    const orbitControls = controls.current;
    if (!orbitControls) return;

    const liveState = useExplorationStore.getState();
    const liveMode = liveState.cameraMode;
    const liveSelectedBodyId = liveState.selectedBodyId;
    const liveVersion = liveState.cameraTransitionVersion;
    const selectedObject = liveSelectedBodyId
      ? planetObjects.current.get(liveSelectedBodyId)
      : undefined;
    const metadata = cameraTargetMetadataFor(selectedObject);
    const aspect = width / Math.max(height, 1);
    const fov =
      camera instanceof PerspectiveCamera && Number.isFinite(camera.fov)
        ? camera.fov
        : 46;
    const policy = metadata
      ? cameraFocusPolicy({ aspect, fovDegrees: fov, metadata, profile })
      : null;

    orbitControls.maxDistance = profile.camera.maximumDistance;

    if (
      liveMode === "transition" &&
      activeTransitionVersion.current !== liveVersion
    ) {
      activeTransitionVersion.current = liveVersion;
      activeTransitionBodyId.current = liveSelectedBodyId;

      if (selectedObject && metadata && policy) {
        selectedObject.getWorldPosition(worldPosition.current);
        desiredTarget.current.copy(worldPosition.current);
        const targetOffset = metadata.regionPresentation
          ? regionFocusAnchorOffset(metadata.regionPresentation)
          : null;
        if (targetOffset) {
          desiredTarget.current.add(
            targetDelta.current.set(
              targetOffset[0],
              targetOffset[1],
              targetOffset[2],
            ),
          );
        }
        previousWorldPosition.current.copy(worldPosition.current);
        const sameTarget = trackedBodyId.current === liveSelectedBodyId;
        const guidedRegionTransition =
          Boolean(metadata.regionPresentation) &&
          previousStableMode.current === "free";
        if ((sameTarget || cameraMode === "free") && !guidedRegionTransition) {
          relativeOffset.current.subVectors(
            camera.position,
            currentTarget.current,
          );
          if (relativeOffset.current.lengthSq() < 1e-12) {
            relativeOffset.current.set(1, 0.45, 1);
          }
          relativeOffset.current.setLength(
            clampCameraDistance(
              relativeOffset.current.length(),
              policy.minimumDistance,
              policy.maximumDistance,
            ),
          );
          desiredPosition.current
            .copy(desiredTarget.current)
            .add(relativeOffset.current);
        } else {
          const preferredDirection =
            metadata.regionPresentation?.preferredDirection;
          if (preferredDirection) {
            canonicalOffset.current.set(
              preferredDirection[0],
              preferredDirection[1],
              preferredDirection[2],
            );
          } else {
            const offset = illuminatedFocusCameraOffset(
              [
                worldPosition.current.x,
                worldPosition.current.y,
                worldPosition.current.z,
              ],
              policy.framingRadius,
              Math.max(aspect, 0.1),
              scaleMode,
            );
            canonicalOffset.current.set(...offset);
          }
          if (canonicalOffset.current.lengthSq() < 1e-12) {
            canonicalOffset.current.set(1, 0.45, 1);
          }
          canonicalOffset.current.setLength(policy.desiredDistance);
          desiredPosition.current
            .copy(desiredTarget.current)
            .add(canonicalOffset.current);
        }
        orbitControls.minDistance = policy.minimumDistance;
        lastMinimumDistance.current = policy.minimumDistance;
      } else {
        desiredTarget.current.set(0, 0, 0);
        desiredPosition.current.set(...overviewPosition);
        previousWorldPosition.current.set(0, 0, 0);
        orbitControls.minDistance = profile.camera.minimumDistance;
        lastMinimumDistance.current = profile.camera.minimumDistance;
      }
    }

    if (
      liveMode === "transition" &&
      selectedObject &&
      activeTransitionBodyId.current === liveSelectedBodyId
    ) {
      selectedObject.getWorldPosition(worldPosition.current);
      targetDelta.current.subVectors(
        worldPosition.current,
        previousWorldPosition.current,
      );
      desiredTarget.current.add(targetDelta.current);
      desiredPosition.current.add(targetDelta.current);
      previousWorldPosition.current.copy(worldPosition.current);
    }

    if (liveMode === "transition") {
      orbitControls.enabled = false;
      const alpha = transitionAlpha(delta, reducedMotion);
      camera.position.lerp(desiredPosition.current, alpha);
      currentTarget.current.lerp(desiredTarget.current, alpha);
      camera.lookAt(currentTarget.current);
      if (
        cameraPoseHasSettled(
          camera.position.distanceToSquared(desiredPosition.current),
          currentTarget.current.distanceToSquared(desiredTarget.current),
        )
      ) {
        trackedBodyId.current = liveSelectedBodyId;
        orbitControls.target.copy(currentTarget.current);
        settleCamera(
          liveSelectedBodyId,
          liveVersion,
          liveSelectedBodyId === null ? "overview" : "focus",
        );
      }
    } else if (liveMode === "focus" && selectedObject && metadata && policy) {
      selectedObject.getWorldPosition(worldPosition.current);
      if (trackedBodyId.current !== liveSelectedBodyId) {
        previousWorldPosition.current.copy(worldPosition.current);
        trackedBodyId.current = liveSelectedBodyId;
      }
      targetDelta.current.subVectors(
        worldPosition.current,
        previousWorldPosition.current,
      );
      orbitControls.target.add(targetDelta.current);
      camera.position.add(targetDelta.current);
      previousWorldPosition.current.copy(worldPosition.current);
      currentTarget.current.copy(orbitControls.target);
      orbitControls.minDistance = policy.minimumDistance;
      lastMinimumDistance.current = policy.minimumDistance;
      relativeOffset.current.subVectors(camera.position, orbitControls.target);
      const clamped = clampCameraDistance(
        relativeOffset.current.length(),
        policy.minimumDistance,
        policy.maximumDistance,
      );
      if (Math.abs(clamped - relativeOffset.current.length()) > 1e-6) {
        if (relativeOffset.current.lengthSq() < 1e-12) {
          relativeOffset.current.set(1, 0.45, 1);
        }
        relativeOffset.current.setLength(clamped);
        camera.position.copy(orbitControls.target).add(relativeOffset.current);
      }
      orbitControls.enabled = true;
      orbitControls.update();
    } else {
      if (liveMode === "overview") trackedBodyId.current = null;
      orbitControls.minDistance =
        liveMode === "overview"
          ? profile.camera.minimumDistance
          : lastMinimumDistance.current;
      orbitControls.enabled = true;
      orbitControls.update();
      currentTarget.current.copy(orbitControls.target);
    }

    if (
      liveMode === "overview" ||
      liveMode === "focus" ||
      liveMode === "free"
    ) {
      previousStableMode.current = liveMode;
    }
    relativeOffset.current.subVectors(camera.position, currentTarget.current);
    spherical.current.setFromVector3(relativeOffset.current);
    updateCameraRuntimeSnapshot({
      mode: liveMode,
      selectedBodyId: liveSelectedBodyId,
      targetBodyId:
        liveMode === "focus" || liveMode === "transition"
          ? liveSelectedBodyId
          : null,
      transitionVersion: liveVersion,
      position: [camera.position.x, camera.position.y, camera.position.z],
      target: [
        currentTarget.current.x,
        currentTarget.current.y,
        currentTarget.current.z,
      ],
      distanceToTarget: relativeOffset.current.length(),
      minimumDistance: orbitControls.minDistance,
      azimuth: spherical.current.theta,
      polar: spherical.current.phi,
      controlsEnabled: orbitControls.enabled,
      isDragging: isDragging.current,
    });
  });

  return null;
}
