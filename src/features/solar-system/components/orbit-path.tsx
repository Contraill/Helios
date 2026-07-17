"use client";

import { useEffect, useMemo } from "react";
import { BufferGeometry, EllipseCurve, Vector3 } from "three";

interface OrbitPathProps {
  active: boolean;
  color: string;
  semiMajorAxis: number;
  semiMinorAxis: number;
}

export function OrbitPath({
  active,
  color,
  semiMajorAxis,
  semiMinorAxis,
}: OrbitPathProps) {
  const geometry = useMemo(() => {
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
    const points = curve.getPoints(128).map(({ x, y }) => new Vector3(x, 0, y));
    return new BufferGeometry().setFromPoints(points);
  }, [semiMajorAxis, semiMinorAxis]);

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
