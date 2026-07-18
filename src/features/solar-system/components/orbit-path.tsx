"use client";

import { useEffect, useMemo } from "react";
import { BufferGeometry, EllipseCurve, Vector3 } from "three";

interface OrbitPathProps {
  active: boolean;
  color: string;
  points?: ReadonlyArray<readonly [number, number, number]>;
  segments: number;
  semiMajorAxis: number;
  semiMinorAxis: number;
}

export function OrbitPath({
  active,
  color,
  points: suppliedPoints,
  segments,
  semiMajorAxis,
  semiMinorAxis,
}: OrbitPathProps) {
  const geometry = useMemo(() => {
    if (suppliedPoints && suppliedPoints.length >= 3) {
      return new BufferGeometry().setFromPoints(
        suppliedPoints.map((point) => new Vector3(...point)),
      );
    }
    const curve = new EllipseCurve(
      0,
      0,
      semiMajorAxis,
      semiMinorAxis,
      0,
      Math.PI * 2,
      false,
      0,
    );
    const points = curve
      .getPoints(segments)
      .map(({ x, y }) => new Vector3(x, 0, y));
    return new BufferGeometry().setFromPoints(points);
  }, [segments, semiMajorAxis, semiMinorAxis, suppliedPoints]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineLoop geometry={geometry} raycast={() => undefined} renderOrder={-1}>
      <lineBasicMaterial
        color={active ? color : "#7c8ca8"}
        depthWrite={false}
        opacity={active ? 0.58 : 0.2}
        transparent
      />
    </lineLoop>
  );
}
