"use client";

import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import { useFrame } from "@react-three/fiber";
import {
  BackSide,
  BufferGeometry,
  DoubleSide,
  IcosahedronGeometry,
  MeshStandardMaterial,
  RingGeometry,
  SphereGeometry,
  type Group,
  type Texture,
} from "three";

import {
  visualProfileFor,
  type CelestialVisualProfile,
  type VisualBodyId,
} from "@/features/solar-system/lib/celestial-visual-registry";
import {
  textureMaterialKey,
  useSceneTexture,
  useTextureReadiness,
} from "@/features/solar-system/lib/texture-cache";
import { visualRotationAngleAt } from "@/features/solar-system/lib/visual-rotation-policy";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";
import { useExplorationStore } from "@/stores/exploration-store";
import {
  currentSimulationTimeMs,
  useSimulationStore,
} from "@/stores/simulation-store";

const sphereGeometry = new SphereGeometry(1, 64, 32);
const atmosphereGeometry = new SphereGeometry(1, 48, 24);
const geometryCache = new Map<VisualBodyId, BufferGeometry>();
const ringCache = new Map<VisualBodyId, RingGeometry>();

function deterministicVariation(seed: number, x: number, y: number, z: number) {
  const value = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + seed * 0.000_001);
  return value - Math.floor(value);
}

function irregularRadius(
  profile: CelestialVisualProfile,
  x: number,
  y: number,
  z: number,
): number {
  const seed = profile.geometry.seed;
  const broad = deterministicVariation(seed, x, y, z) - 0.5;
  const medium =
    deterministicVariation(seed ^ 0x9e3779b9, x * 2.17, y * 1.71, z * 2.43) -
    0.5;
  const directional =
    Math.sin(x * (2.4 + (seed % 5) * 0.19) + seed * 0.000_013) * 0.5 +
    Math.cos(y * (3.1 + (seed % 7) * 0.11) - z * 1.7) * 0.5;
  const categoryBias = profile.category === "comet" ? 0.085 : 0.055;
  return Math.max(
    0.72,
    0.94 + broad * 0.17 + medium * 0.09 + directional * categoryBias,
  );
}

function bodyGeometry(profile: CelestialVisualProfile): BufferGeometry {
  if (
    profile.geometry.kind === "sphere" ||
    profile.geometry.kind === "ellipsoid"
  ) {
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
    const variation = irregularRadius(profile, x, y, z);
    position.setXYZ(index, x * variation, y * variation, z * variation);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  geometry.name = `helios-visual:${profile.id}:${profile.geometry.seed}`;
  geometry.userData.visualGeometrySignature = `${profile.geometry.kind}:${profile.geometry.seed}:${profile.geometry.scale.join(",")}`;
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

const SINGLE_PART = [
  {
    id: "body",
    position: [0, 0, 0] as const,
    scale: [1, 1, 1] as const,
  },
] as const;

/**
 * The fallback shell is 0.08% smaller than the final surface. During the
 * short opacity crossfade this deterministic separation prevents coplanar
 * depth competition without changing the accepted final geometry bounds.
 */
export const FALLBACK_SURFACE_SCALE = 0.9992;

const BILOBED_PARTS = [
  {
    id: "large-lobe",
    position: [-0.34, 0, 0] as const,
    scale: [0.78, 0.7, 0.66] as const,
  },
  {
    id: "neck",
    position: [0.02, 0.01, 0] as const,
    scale: [0.34, 0.43, 0.37] as const,
  },
  {
    id: "small-lobe",
    position: [0.42, 0.03, 0] as const,
    scale: [0.58, 0.54, 0.5] as const,
  },
] as const;

function SurfaceLayer({ profile, texture }: SurfaceLayerProps) {
  const reducedMotion = useReducedMotionPreference();
  const fallbackMaterials = useRef<Array<MeshStandardMaterial | null>>([]);
  const textureMaterials = useRef<Array<MeshStandardMaterial | null>>([]);
  const progress = useRef(texture ? 1 : 0);
  const geometry = useMemo(() => bodyGeometry(profile), [profile]);
  const parts =
    profile.geometry.kind === "bilobed" ? BILOBED_PARTS : SINGLE_PART;

  useEffect(() => {
    if (texture) applyOrientation(texture, profile);
  }, [profile, texture]);

  useFrame((_, delta) => {
    const target = texture ? 1 : 0;
    progress.current = reducedMotion
      ? target
      : progress.current +
        (target - progress.current) * Math.min(1, delta * 7.5);
    for (const material of fallbackMaterials.current) {
      if (material) material.opacity = 1 - progress.current;
    }
    for (const material of textureMaterials.current) {
      if (material) material.opacity = progress.current;
    }
  });

  return (
    <group scale={profile.geometry.scale as [number, number, number]}>
      {parts.map((part, index) => (
        <group key={part.id} position={part.position} scale={part.scale}>
          <mesh
            geometry={geometry}
            scale={FALLBACK_SURFACE_SCALE}
            userData={{
              testGeometryKind: profile.geometry.kind,
              testGeometryPart: part.id,
              testGeometrySignature: geometry.userData.visualGeometrySignature,
              testSurfaceSeparationScale: FALLBACK_SURFACE_SCALE,
            }}
          >
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
              key={textureMaterialKey(texture)}
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

export interface CelestialVisualSurfaceProps {
  readonly bodyId: VisualBodyId;
  readonly radius: number;
  readonly rootRef?: RefObject<Group | null>;
  readonly position?: readonly [number, number, number];
  readonly textureLoadPolicy?: "immediate" | "scheduled";
}

export function shouldLoadCelestialTexture({
  policy,
  promoted,
  readiness,
}: {
  readonly policy: "immediate" | "scheduled";
  readonly promoted: boolean;
  readonly readiness: "idle" | "loading" | "ready" | "error";
}): boolean {
  return (
    policy === "immediate" ||
    promoted ||
    readiness === "loading" ||
    readiness === "ready"
  );
}

export function CelestialVisualSurface({
  bodyId,
  radius,
  rootRef,
  position = [0, 0, 0],
  textureLoadPolicy = "immediate",
}: CelestialVisualSurfaceProps) {
  const profile = visualProfileFor(bodyId);
  const promoted = useExplorationStore(
    (state) =>
      state.selectedBodyId === bodyId || state.hoveredBodyId === bodyId,
  );
  const readiness = useTextureReadiness(profile.surface.assetPath);
  const texture = useSceneTexture(profile.surface.assetPath, {
    enabled: shouldLoadCelestialTexture({
      policy: textureLoadPolicy,
      promoted,
      readiness,
    }),
  });
  const ring = useMemo(() => bodyRing(profile), [profile]);
  const localRootRef = useRef<Group>(null);
  useImperativeHandle(rootRef, () => localRootRef.current!, []);

  useFrame(() => {
    const node = localRootRef.current;
    if (!node || profile.rotation.kind === "tidally-locked") return;
    const timestamp = currentSimulationTimeMs(useSimulationStore.getState());
    node.rotation.set(0, visualRotationAngleAt(profile.rotation, timestamp), 0);
    node.userData.testRotationAngle = node.rotation.y;
  });

  return (
    <group
      ref={localRootRef}
      position={position as [number, number, number]}
      scale={radius}
      userData={{
        assetRepresentation: profile.surface.representation,
        atmosphereMounted: Boolean(profile.atmosphere),
        geometryKind: profile.geometry.kind,
        orientationApplied: true,
        primeMeridianVerified: profile.orientation.primeMeridianVerified,
        ringMounted: Boolean(profile.ring),
        ringOuterRadius: profile.ring?.outerRadius ?? 0,
        ringParentTransform: profile.ring ? "surface-equatorial" : null,
        rotationKind: profile.rotation.kind,
        testTexturePromoted: promoted,
        testSurfaceReadiness: readiness,
        texturePath: profile.surface.assetPath,
        visualProfileId: bodyId,
      }}
    >
      <SurfaceLayer profile={profile} texture={texture} />
      {profile.atmosphere ? (
        <mesh
          raycast={() => undefined}
          scale={1 + profile.atmosphere.scale}
          userData={{ testAtmosphereBodyId: bodyId }}
        >
          <primitive
            attach="geometry"
            dispose={null}
            object={atmosphereGeometry}
          />
          <meshBasicMaterial
            color={profile.atmosphere.color}
            depthWrite={false}
            opacity={profile.atmosphere.opacity}
            side={BackSide}
            transparent
          />
        </mesh>
      ) : null}
      {profile.ring && ring ? (
        <mesh
          raycast={() => undefined}
          renderOrder={2}
          rotation-x={Math.PI / 2}
          userData={{
            testRingBodyId: bodyId,
            testRingInnerRadius: profile.ring.innerRadius,
            testRingOuterRadius: profile.ring.outerRadius,
            testRingParentTransform: "surface-equatorial",
          }}
        >
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

export function visualGeometrySignatureFor(bodyId: VisualBodyId): string {
  const profile = visualProfileFor(bodyId);
  const geometry = bodyGeometry(profile);
  return String(
    geometry.userData.visualGeometrySignature ??
      `${profile.geometry.kind}:${profile.geometry.seed}:${profile.geometry.scale.join(",")}`,
  );
}

export function visualGeometryPartsFor(
  bodyId: VisualBodyId,
): readonly string[] {
  return visualProfileFor(bodyId).geometry.kind === "bilobed"
    ? BILOBED_PARTS.map(({ id }) => id)
    : SINGLE_PART.map(({ id }) => id);
}
