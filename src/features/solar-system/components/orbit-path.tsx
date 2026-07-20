"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, Vector3 } from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

import type { OrbitEmphasis } from "@/features/solar-system/lib/orbit-visibility-policy";
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
  const safeSegments = Math.max(24, Math.round(segments));
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

  const orbitResource = useMemo(() => {
    const geometry = new LineGeometry();
    const positions =
      suppliedPoints && suppliedPoints.length >= 3
        ? suppliedPositions(suppliedPoints)
        : ellipsePositions(semiMajorAxis, semiMinorAxis, segments);
    geometry.setPositions(positions);
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
    return { geometry, boundsRadius };
  }, [segments, semiMajorAxis, semiMinorAxis, suppliedPoints]);
  const { geometry, boundsRadius } = orbitResource;

  const material = useMemo(
    () =>
      new LineMaterial({
        alphaToCoverage: true,
        color: new Color(color),
        depthTest: true,
        depthWrite: false,
        dashed: false,
        opacity: 0.28,
        transparent: true,
        linewidth: lineWidth * 1.25,
        worldUnits: false,
      }),
    [color, lineWidth],
  );

  const line = useMemo(() => {
    const next = new Line2(geometry, material);
    next.computeLineDistances();
    next.frustumCulled = true;
    next.renderOrder = -1;
    next.raycast = () => undefined;
    next.userData.testOrbitBodyId = bodyId;
    next.userData.testOrbitClass = orbitClass;
    next.userData.testGeometryUuid = geometry.uuid;
    next.userData.testMaterialUuid = material.uuid;
    next.userData.testBoundsRadius = boundsRadius;
    return next;
  }, [bodyId, boundsRadius, geometry, material, orbitClass]);

  useEffect(() => {
    material.resolution.set(Math.max(1, size.width), Math.max(1, size.height));
  }, [material, size.height, size.width]);

  useEffect(() => {
    const lineNode = lineRef.current;
    if (!lineNode) return;
    const selected = emphasis === "selected";
    lineNode.material.linewidth = lineWidth * (selected ? 2.25 : 1.25);
    lineNode.renderOrder = selected ? 3 : -1;
    lineNode.visible = emphasis !== "hidden";
  }, [emphasis, lineWidth]);

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
    const distanceRatio = cameraDistance / boundsRadius;
    const distanceFactor = Math.max(
      0.58,
      Math.min(1, 5 / Math.max(1, distanceRatio)),
    );
    const selected = emphasis === "selected";
    const lineMaterial = lineNode.material;
    lineMaterial.opacity = (selected ? 0.82 : 0.28) * distanceFactor;
  });

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return <primitive ref={lineRef} object={line} />;
}
