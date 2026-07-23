"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, Vector3 } from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

import type { OrbitEmphasis } from "@/features/solar-system/lib/orbit-visibility-policy";
import { orbitPathDiagnosticsFromFlatPositions } from "@/features/solar-system/lib/orbit-path-diagnostics";
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
}: OrbitPathProps) {
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);
  const worldPosition = useRef(new Vector3());
  const lineRef = useRef<Line2 | null>(null);
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
  }, [bodyId, color, orbitClass, positions]);

  useEffect(() => {
    const lineNode = lineRef.current;
    if (!lineNode) return;
    lineNode.material.resolution.set(
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
  }, [emphasis, lineWidth, orbitClass]);

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
  });

  useEffect(() => {
    const lineNode = lineRef.current;
    return () => {
      lineNode?.geometry.dispose();
      lineNode?.material.dispose();
    };
  }, []);

  return <primitive ref={lineRef} object={line} />;
}
