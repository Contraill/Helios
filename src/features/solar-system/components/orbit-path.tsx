"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, Matrix4, Vector3, type Object3D } from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

import type { OrbitEmphasis } from "@/features/solar-system/lib/orbit-visibility-policy";
import { orbitPathDiagnosticsFromFlatPositions } from "@/features/solar-system/lib/orbit-path-diagnostics";
import { SCENE_FRAME_PRIORITY } from "@/features/solar-system/lib/scene-frame-runtime";
import type { CelestialBodyId } from "@/features/solar-system/types/celestial-body";

export type OrbitAcceptanceClass = "planet" | "moon" | "extended";

interface OrbitPathProps {
  bodyId?: CelestialBodyId;
  orbitClass?: OrbitAcceptanceClass;
  /** Backward-compatible active state; emphasis takes precedence. */
  active?: boolean;
  color: string;
  emphasis?: OrbitEmphasis;
  lineWidth?: number;
  points?: ReadonlyArray<readonly [number, number, number]>;
  segments: number;
  semiMajorAxis: number;
  semiMinorAxis: number;
  trackedObjectRef?: RefObject<Object3D | null>;
}

function ellipsePositions(
  semiMajorAxis: number,
  semiMinorAxis: number,
  segments: number,
): number[] {
  const positions: number[] = [];
  const safeSegments = Math.max(96, Math.round(segments));
  for (let index = 0; index <= safeSegments; index += 1) {
    const angle = (index / safeSegments) * Math.PI * 2;
    positions.push(
      semiMajorAxis * Math.cos(angle),
      0,
      semiMinorAxis * Math.sin(angle),
    );
  }
  return positions;
}

function suppliedPositions(
  points: ReadonlyArray<readonly [number, number, number]>,
): number[] {
  const positions = points.flatMap((point) => [point[0], point[1], point[2]]);
  const first = points[0];
  const last = points[points.length - 1];
  if (
    first &&
    last &&
    (first[0] !== last[0] || first[1] !== last[1] || first[2] !== last[2])
  ) {
    positions.push(first[0], first[1], first[2]);
  }
  return positions;
}

function boundsRadiusFor(positions: readonly number[]): number {
  let boundsRadius = 1;
  for (let index = 0; index < positions.length; index += 3) {
    boundsRadius = Math.max(
      boundsRadius,
      Math.hypot(
        positions[index] ?? 0,
        positions[index + 1] ?? 0,
        positions[index + 2] ?? 0,
      ),
    );
  }
  return boundsRadius;
}

function isClosed(positions: readonly number[]): boolean {
  if (positions.length < 6) return false;
  const last = positions.length - 3;
  const boundsRadius = boundsRadiusFor(positions);
  return (
    Math.hypot(
      (positions[0] ?? 0) - (positions[last] ?? 0),
      (positions[1] ?? 0) - (positions[last + 1] ?? 0),
      (positions[2] ?? 0) - (positions[last + 2] ?? 0),
    ) <= Math.max(1e-9, boundsRadius * 1e-9)
  );
}

function contextLineWidth(orbitClass?: OrbitAcceptanceClass): number {
  switch (orbitClass) {
    case "moon":
      return 0.66;
    case "extended":
      return 0.76;
    default:
      return 0.88;
  }
}

function contextOpacity(orbitClass?: OrbitAcceptanceClass): number {
  switch (orbitClass) {
    case "moon":
      return 0.09;
    case "extended":
      return 0.12;
    default:
      return 0.15;
  }
}

function closestSegmentIndex(
  positions: readonly number[],
  point: Vector3,
  segment: Vector3,
  pointDelta: Vector3,
): number {
  let closestIndex = 0;
  let closestDistanceSquared = Number.POSITIVE_INFINITY;
  for (let index = 0; index + 5 < positions.length; index += 3) {
    const startX = positions[index] ?? 0;
    const startY = positions[index + 1] ?? 0;
    const startZ = positions[index + 2] ?? 0;
    const endX = positions[index + 3] ?? 0;
    const endY = positions[index + 4] ?? 0;
    const endZ = positions[index + 5] ?? 0;
    segment.set(endX - startX, endY - startY, endZ - startZ);
    pointDelta.set(point.x - startX, point.y - startY, point.z - startZ);
    const denominator = segment.lengthSq();
    const progress =
      denominator > 0
        ? Math.max(0, Math.min(1, pointDelta.dot(segment) / denominator))
        : 0;
    const distanceSquared =
      (point.x - (startX + segment.x * progress)) ** 2 +
      (point.y - (startY + segment.y * progress)) ** 2 +
      (point.z - (startZ + segment.z * progress)) ** 2;
    if (distanceSquared < closestDistanceSquared) {
      closestDistanceSquared = distanceSquared;
      closestIndex = index;
    }
  }
  return closestIndex;
}

export function OrbitPath({
  active = false,
  bodyId,
  color,
  emphasis = active ? "selected" : "context",
  lineWidth = 1,
  orbitClass,
  points: suppliedPoints,
  segments,
  semiMajorAxis,
  semiMinorAxis,
  trackedObjectRef,
}: OrbitPathProps) {
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);
  const worldPosition = useRef(new Vector3());
  const localTrackedPosition = useRef(new Vector3());
  const inverseOrbitMatrix = useRef(new Matrix4());
  const anchorSegment = useRef(new Vector3());
  const anchorPointDelta = useRef(new Vector3());
  const lineRef = useRef<Line2 | null>(null);
  const anchorRef = useRef<Line2 | null>(null);
  const boundsRadiusRef = useRef(1);
  const [line] = useState(() => {
    const geometry = new LineGeometry();
    const material = new LineMaterial({
      alphaToCoverage: false,
      color: new Color(color),
      depthTest: true,
      depthWrite: false,
      dashed: false,
      opacity: contextOpacity(orbitClass),
      transparent: true,
      linewidth: lineWidth * contextLineWidth(orbitClass),
      worldUnits: false,
    });
    const next = new Line2(geometry, material);
    next.frustumCulled = true;
    next.renderOrder = -1;
    next.raycast = () => undefined;
    return next;
  });
  const [anchor] = useState(() => {
    const geometry = new LineGeometry();
    const material = new LineMaterial({
      alphaToCoverage: false,
      color: new Color(color),
      depthTest: true,
      depthWrite: false,
      dashed: false,
      opacity: 0.92,
      transparent: true,
      linewidth: lineWidth * 1.9,
      worldUnits: false,
    });
    const next = new Line2(geometry, material);
    next.frustumCulled = false;
    next.renderOrder = 4;
    next.raycast = () => undefined;
    next.visible = false;
    return next;
  });

  const positions = useMemo(
    () =>
      suppliedPoints && suppliedPoints.length >= 3
        ? suppliedPositions(suppliedPoints)
        : ellipsePositions(semiMajorAxis, semiMinorAxis, segments),
    [segments, semiMajorAxis, semiMinorAxis, suppliedPoints],
  );

  useLayoutEffect(() => {
    const lineNode = lineRef.current;
    if (!lineNode) return;
    const boundsRadius = boundsRadiusFor(positions);
    const diagnostics = orbitPathDiagnosticsFromFlatPositions(positions);
    lineNode.geometry.setPositions(positions);
    lineNode.geometry.computeBoundingSphere();
    lineNode.computeLineDistances();
    lineNode.material.color.set(color);
    boundsRadiusRef.current = boundsRadius;
    lineNode.userData.testOrbitBodyId = bodyId;
    lineNode.userData.testOrbitClass = orbitClass;
    lineNode.userData.testGeometryUuid = lineNode.geometry.uuid;
    lineNode.userData.testMaterialUuid = lineNode.material.uuid;
    lineNode.userData.testBoundsRadius = boundsRadius;
    lineNode.userData.testOrbitDashed = false;
    lineNode.userData.testOrbitClosed = isClosed(positions);
    lineNode.userData.testOrbitMaxChordToBoundsRatio =
      diagnostics.maxChordToBoundsRatio;
    lineNode.userData.testOrbitMaxToMedianSegmentRatio =
      diagnostics.maxToMedianSegmentRatio;
    const anchorNode = anchorRef.current;
    if (anchorNode) {
      anchorNode.userData.testOrbitAnchorBodyId = bodyId;
      anchorNode.userData.testOrbitAnchorForCurrentPosition = true;
    }
  }, [bodyId, color, orbitClass, positions]);

  useEffect(() => {
    const lineNode = lineRef.current;
    if (!lineNode) return;
    lineNode.material.resolution.set(
      Math.max(1, size.width),
      Math.max(1, size.height),
    );
    anchorRef.current?.material.resolution.set(
      Math.max(1, size.width),
      Math.max(1, size.height),
    );
  }, [size.height, size.width]);

  useEffect(() => {
    const lineNode = lineRef.current;
    if (!lineNode) return;
    const selected = emphasis === "selected";
    lineNode.material.linewidth =
      lineWidth * (selected ? 1.9 : contextLineWidth(orbitClass));
    lineNode.renderOrder = selected ? 3 : -1;
    lineNode.visible = emphasis !== "hidden";
    lineNode.userData.testOrbitEmphasis = emphasis;
    lineNode.userData.testGeometryUuid = lineNode.geometry.uuid;
    lineNode.userData.testMaterialUuid = lineNode.material.uuid;
    const anchorNode = anchorRef.current;
    if (anchorNode) {
      anchorNode.material.color.set(color);
      anchorNode.material.linewidth = lineWidth * 1.9;
      anchorNode.visible = emphasis === "selected" && Boolean(trackedObjectRef);
    }
  }, [color, emphasis, lineWidth, orbitClass, trackedObjectRef]);

  useFrame(() => {
    const lineNode = lineRef.current;
    if (!lineNode) return;
    if (emphasis === "hidden") {
      lineNode.visible = false;
      return;
    }
    lineNode.visible = true;
    lineNode.getWorldPosition(worldPosition.current);
    const cameraDistance = camera.position.distanceTo(worldPosition.current);
    const distanceRatio = cameraDistance / boundsRadiusRef.current;
    const distanceFactor = Math.max(
      emphasis === "selected" ? 0.62 : 0.3,
      Math.min(1, 4.5 / Math.max(1, distanceRatio)),
    );
    lineNode.material.opacity =
      (emphasis === "selected" ? 0.78 : contextOpacity(orbitClass)) *
      distanceFactor;

    const anchorNode = anchorRef.current;
    const trackedObject = trackedObjectRef?.current;
    if (!anchorNode || emphasis !== "selected" || !trackedObject) {
      if (anchorNode) anchorNode.visible = false;
      return;
    }

    trackedObject.getWorldPosition(worldPosition.current);
    lineNode.updateWorldMatrix(true, false);
    localTrackedPosition.current
      .copy(worldPosition.current)
      .applyMatrix4(
        inverseOrbitMatrix.current.copy(lineNode.matrixWorld).invert(),
      );
    const startIndex = closestSegmentIndex(
      positions,
      localTrackedPosition.current,
      anchorSegment.current,
      anchorPointDelta.current,
    );
    anchorNode.position.copy(localTrackedPosition.current);
    anchorNode.geometry.setPositions([
      (positions[startIndex] ?? 0) - localTrackedPosition.current.x,
      (positions[startIndex + 1] ?? 0) - localTrackedPosition.current.y,
      (positions[startIndex + 2] ?? 0) - localTrackedPosition.current.z,
      0,
      0,
      0,
      (positions[startIndex + 3] ?? 0) - localTrackedPosition.current.x,
      (positions[startIndex + 4] ?? 0) - localTrackedPosition.current.y,
      (positions[startIndex + 5] ?? 0) - localTrackedPosition.current.z,
    ]);
    anchorNode.computeLineDistances();
    anchorNode.updateMatrixWorld();
    anchorNode.visible = true;
    anchorNode.userData.testOrbitAnchorWorldPosition = [
      worldPosition.current.x,
      worldPosition.current.y,
      worldPosition.current.z,
    ];
  }, SCENE_FRAME_PRIORITY.visual);

  useEffect(() => {
    return () => {
      line.geometry.dispose();
      line.material.dispose();
      anchor.geometry.dispose();
      anchor.material.dispose();
    };
  }, [anchor, line]);

  return (
    <>
      <primitive ref={lineRef} object={line} />
      <primitive ref={anchorRef} object={anchor} />
    </>
  );
}
