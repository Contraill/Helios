"use client";

import { useLayoutEffect } from "react";

import { earthCloudTextureSource } from "@/content/sources/planet-textures";
import { markMaterialApplied } from "@/features/solar-system/lib/asset-loading-lifecycle";
import { useSceneTexture } from "@/features/solar-system/lib/texture-cache";

interface EarthCloudLayerProps {
  segments: readonly [number, number];
}

export function EarthCloudLayer({ segments }: EarthCloudLayerProps) {
  const source = earthCloudTextureSource.asset;
  const texture = useSceneTexture(source.path, {
    onError: () => markMaterialApplied(source.owner, true),
  });

  useLayoutEffect(() => {
    if (texture) markMaterialApplied(source.owner);
  }, [source.owner, texture]);

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
