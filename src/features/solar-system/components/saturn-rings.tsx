"use client";

import { useLayoutEffect, useRef } from "react";
import { DoubleSide } from "three";
import type { RingGeometry } from "three";

import { saturnRingTextureVariants } from "@/content/sources/planet-textures";
import type { TextureVariantName } from "@/content/sources/planet-textures";
import { useSceneTexture } from "@/features/solar-system/lib/texture-cache";

export const SATURN_RING_INNER_RADIUS = 1.24;
export const SATURN_RING_OUTER_RADIUS = 2.27;

interface SaturnRingsProps {
  radius: number;
  segments: number;
  textureVariant: TextureVariantName;
}

export function SaturnRings({
  radius,
  segments,
  textureVariant,
}: SaturnRingsProps) {
  const geometryRef = useRef<RingGeometry>(null);
  const texture = useSceneTexture(
    saturnRingTextureVariants[textureVariant].path,
  );

  useLayoutEffect(() => {
    const geometry = geometryRef.current;
    if (!geometry) return;

    const positions = geometry.attributes.position;
    const uvs = geometry.attributes.uv;
    const radialSpan = SATURN_RING_OUTER_RADIUS - SATURN_RING_INNER_RADIUS;

    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index);
      const y = positions.getY(index);
      const radiusFromCenter = Math.hypot(x, y);
      const radialCoordinate =
        (radiusFromCenter - SATURN_RING_INNER_RADIUS) / radialSpan;
      uvs.setXY(index, radialCoordinate, 0.5);
    }
    uvs.needsUpdate = true;
  }, [segments]);

  return (
    <mesh
      raycast={() => undefined}
      rotation-x={Math.PI / 2}
      scale={radius}
      userData={{ visualLayer: "saturn-rings" }}
    >
      <ringGeometry
        ref={geometryRef}
        args={[SATURN_RING_INNER_RADIUS, SATURN_RING_OUTER_RADIUS, segments, 1]}
      />
      <meshStandardMaterial
        alphaTest={0.012}
        color={texture ? "#fffaf2" : "#bba986"}
        depthWrite={false}
        emissive="#b69b74"
        emissiveIntensity={texture ? 0.5 : 0}
        emissiveMap={texture ?? undefined}
        map={texture ?? undefined}
        metalness={0}
        opacity={texture ? 1 : 0.38}
        roughness={0.9}
        side={DoubleSide}
        transparent
      />
    </mesh>
  );
}
