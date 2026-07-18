"use client";

import { earthCloudTextureSource } from "@/content/sources/planet-textures";
import type { TextureVariantName } from "@/content/sources/planet-textures";
import { useSceneTexture } from "@/features/solar-system/lib/texture-cache";

interface EarthCloudLayerProps {
  segments: readonly [number, number];
  textureVariant: TextureVariantName;
}

export function EarthCloudLayer({
  segments,
  textureVariant,
}: EarthCloudLayerProps) {
  const texture = useSceneTexture(
    earthCloudTextureSource.variants[textureVariant].path,
  );

  return (
    <mesh
      raycast={() => undefined}
      renderOrder={3}
      scale={1.008}
      userData={{ visualLayer: "earth-clouds" }}
    >
      <sphereGeometry args={[1, segments[0], segments[1]]} />
      <meshStandardMaterial
        alphaTest={0.018}
        color="#f8fbff"
        depthWrite={false}
        map={texture ?? undefined}
        metalness={0}
        opacity={texture ? 0.58 : 0}
        roughness={1}
        transparent
      />
    </mesh>
  );
}
