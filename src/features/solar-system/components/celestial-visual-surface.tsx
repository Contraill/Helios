"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  DoubleSide,
  IcosahedronGeometry,
  MeshStandardMaterial,
  RingGeometry,
  SphereGeometry,
  type Group,
  type Mesh,
  type Texture,
} from "three";

import {
  visualProfileFor,
  type CelestialVisualProfile,
  type VisualBodyId,
} from "@/features/solar-system/lib/celestial-visual-registry";
import { useSceneTexture } from "@/features/solar-system/lib/texture-cache";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";

const sphereGeometry = new SphereGeometry(1, 64, 32);
const atmosphereGeometry = new SphereGeometry(1, 48, 24);
const geometryCache = new Map<VisualBodyId, BufferGeometry>();
const ringCache = new Map<VisualBodyId, RingGeometry>();

function deterministicVariation(seed: number, x: number, y: number, z: number) {
  const value = Math.sin(
    x * 127.1 + y * 311.7 + z * 74.7 + seed * 0.000_001,
  );
  return value - Math.floor(value);
}

function bodyGeometry(profile: CelestialVisualProfile): BufferGeometry {
  if (profile.geometry.kind === "sphere" || profile.geometry.kind === "ellipsoid") {
    return sphereGeometry;
  }
  const cached = geometryCache.get(profile.id);
  if (cached) return cached;
  const geometry = new IcosahedronGeometry(1, 4);
  const position = geometry.attributes.position;
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    const variation = 0.86 + deterministicVariation(profile.geometry.seed, x, y, z) * 0.22;
    position.setXYZ(index, x * variation, y * variation, z * variation);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.name = `helios-visual:${profile.id}`;
  geometryCache.set(profile.id, geometry);
  return geometry;
}

function bodyRing(profile: CelestialVisualProfile): RingGeometry | null {
  if (!profile.ring) return null;
  const cached = ringCache.get(profile.id);
  if (cached) return cached;
  const geometry = new RingGeometry(
    profile.ring.innerRadius,
    profile.ring.outerRadius,
    160,
  );
  geometry.name = `helios-ring:${profile.id}`;
  ringCache.set(profile.id, geometry);
  return geometry;
}

function applyOrientation(texture: Texture, profile: CelestialVisualProfile) {
  const orientation = profile.orientation;
  texture.flipY = orientation.flipY;
  texture.repeat.x = orientation.flipX ? -1 : 1;
  const offset = orientation.textureLongitudeOffsetDeg / 360;
  texture.offset.x = orientation.flipX ? 1 + offset : offset;
  texture.needsUpdate = true;
  texture.userData.visualOrientation = orientation;
}

interface SurfaceLayerProps {
  profile: CelestialVisualProfile;
  texture: Texture | null;
}

function SurfaceLayer({ profile, texture }: SurfaceLayerProps) {
  const reducedMotion = useReducedMotionPreference();
  const fallbackMaterials = useRef<Array<MeshStandardMaterial | null>>([]);
  const textureMaterials = useRef<Array<MeshStandardMaterial | null>>([]);
  const progress = useRef(texture ? 1 : 0);
  const geometry = useMemo(() => bodyGeometry(profile), [profile]);
  const scale = profile.geometry.scale;

  useEffect(() => {
    if (texture) applyOrientation(texture, profile);
  }, [profile, texture]);

  useFrame((_, delta) => {
    const target = texture ? 1 : 0;
    progress.current = reducedMotion
      ? target
      : progress.current + (target - progress.current) * Math.min(1, delta * 7.5);
    for (const material of fallbackMaterials.current) {
      if (material) material.opacity = 1 - progress.current;
    }
    for (const material of textureMaterials.current) {
      if (material) material.opacity = progress.current;
    }
  });

  const common = {
    geometry,
    scale: scale as [number, number, number],
  };

  if (profile.geometry.kind === "bilobed") {
    const lobes = [
      { position: [-0.34, 0, 0] as const, scale: [0.78, 0.7, 0.66] as const },
      { position: [0.42, 0.03, 0] as const, scale: [0.58, 0.54, 0.5] as const },
    ];
    return (
      <group>
        {lobes.map((lobe, index) => (
          <group key={index} position={lobe.position} scale={lobe.scale}>
            <mesh geometry={geometry}>
              <meshStandardMaterial
                ref={(material) => {
                  fallbackMaterials.current[index] = material;
                }}
                color={profile.surface.fallbackColor}
                metalness={0}
                opacity={texture ? 0 : 1}
                roughness={profile.surface.roughness}
                transparent
                userData={{
                  testSurfaceBodyId: profile.id,
                  testSurfaceRole: "fallback",
                }}
              />
            </mesh>
            <mesh geometry={geometry}>
              <meshStandardMaterial
                ref={(material) => {
                  textureMaterials.current[index] = material;
                }}
                color="#ffffff"
                emissive={profile.surface.fallbackColor}
                emissiveIntensity={profile.surface.emissiveIntensity}
                map={texture}
                metalness={0}
                opacity={texture ? 1 : 0}
                roughness={profile.surface.roughness}
                transparent
                userData={{
                  testSurfaceBodyId: profile.id,
                  testSurfaceRole: "final",
                }}
              />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  return (
    <group>
      <mesh {...common}>
        <meshStandardMaterial
          ref={(material) => {
            fallbackMaterials.current[0] = material;
          }}
          color={profile.surface.fallbackColor}
          depthWrite
          metalness={0}
          opacity={texture ? 0 : 1}
          roughness={profile.surface.roughness}
          transparent
          userData={{ testSurfaceBodyId: profile.id, testSurfaceRole: "fallback" }}
        />
      </mesh>
      <mesh {...common}>
        <meshStandardMaterial
          ref={(material) => {
            textureMaterials.current[0] = material;
          }}
          color="#ffffff"
          depthWrite
          emissive={profile.surface.fallbackColor}
          emissiveIntensity={profile.surface.emissiveIntensity}
          map={texture}
          metalness={0}
          opacity={texture ? 1 : 0}
          roughness={profile.surface.roughness}
          transparent
          userData={{ testSurfaceBodyId: profile.id, testSurfaceRole: "final" }}
        />
      </mesh>
    </group>
  );
}

export interface CelestialVisualSurfaceProps {
  readonly bodyId: VisualBodyId;
  readonly radius: number;
  readonly rootRef?: RefObject<Group | null>;
  readonly position?: readonly [number, number, number];
}

export function CelestialVisualSurface({
  bodyId,
  radius,
  rootRef,
  position = [0, 0, 0],
}: CelestialVisualSurfaceProps) {
  const profile = visualProfileFor(bodyId);
  const texture = useSceneTexture(profile.surface.assetPath);
  const ring = useMemo(() => bodyRing(profile), [profile]);

  return (
    <group
      ref={rootRef}
      position={position as [number, number, number]}
      scale={radius}
      userData={{
        assetRepresentation: profile.surface.representation,
        primeMeridianVerified: profile.orientation.primeMeridianVerified,
        visualProfileId: bodyId,
      }}
    >
      <SurfaceLayer profile={profile} texture={texture} />
      {profile.atmosphere ? (
        <mesh scale={1 + profile.atmosphere.scale}>
          <primitive attach="geometry" dispose={null} object={atmosphereGeometry} />
          <meshBasicMaterial
            color={profile.atmosphere.color}
            depthWrite={false}
            opacity={profile.atmosphere.opacity}
            transparent
          />
        </mesh>
      ) : null}
      {profile.ring && ring ? (
        <mesh rotation-x={Math.PI / 2}>
          <primitive attach="geometry" dispose={null} object={ring} />
          <meshBasicMaterial
            color={profile.ring.color}
            depthWrite={false}
            opacity={profile.ring.opacity}
            side={DoubleSide}
            transparent
          />
        </mesh>
      ) : null}
    </group>
  );
}

export function visualGeometryCacheSize(): number {
  return geometryCache.size + ringCache.size + 2;
}
