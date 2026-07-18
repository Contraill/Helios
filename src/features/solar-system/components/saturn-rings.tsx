"use client";

import { DoubleSide } from "three";

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
  const texture = useSceneTexture(
    saturnRingTextureVariants[textureVariant].path,
  );

  return (
    <mesh
      raycast={() => undefined}
      rotation-x={Math.PI / 2}
      scale={radius}
      userData={{ visualLayer: "saturn-rings" }}
    >
      <ringGeometry
        args={[SATURN_RING_INNER_RADIUS, SATURN_RING_OUTER_RADIUS, segments, 1]}
      />
      <meshStandardMaterial
        alphaTest={0.025}
        color={texture ? "#fff5dc" : "#bba986"}
        depthWrite={false}
        map={texture ?? undefined}
        metalness={0}
        opacity={texture ? 0.92 : 0.38}
        roughness={0.9}
        side={DoubleSide}
        transparent
      />
    </mesh>
  );
}
