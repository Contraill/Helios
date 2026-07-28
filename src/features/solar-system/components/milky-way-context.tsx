"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  NormalBlending,
  type Group,
  type MeshBasicMaterial,
  type PointsMaterial,
  type ShaderMaterial,
} from "three";

import { cameraRuntimeSnapshot } from "@/features/solar-system/lib/camera-runtime";
import { SCENE_FRAME_PRIORITY } from "@/features/solar-system/lib/scene-frame-runtime";
import { sceneProfileFor } from "@/features/solar-system/lib/scene-profiles";
import { useSceneTexture } from "@/features/solar-system/lib/texture-cache";
import {
  createDeepFieldParticleData,
  createMilkyWayDustParticleData,
  createMilkyWayParticleData,
  galacticContextDistance,
  galacticContextPhase,
  galacticMapRadius,
  MILKY_WAY_MODEL,
  SOLAR_SYSTEM_GALACTIC_POSITION,
  universeLayerOpacities,
} from "@/features/solar-system/lib/universe-backdrop";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import { useGalacticContextStore } from "@/stores/galactic-context-store";

import { GalaxyParticleCloud } from "./galaxy-particle-cloud";

const DISABLED_RAYCAST = () => undefined;
const MILKY_WAY_EXTERIOR_TEXTURE =
  "/textures/context/milky-way-exterior-v1.webp";

const GALAXY_HAZE_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const GALAXY_HAZE_FRAGMENT_SHADER = `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uPower;
varying vec2 vUv;

void main() {
  float radius = length((vUv - 0.5) * 2.0);
  float alpha = uOpacity * pow(max(0.0, 1.0 - radius), uPower);
  if (alpha < 0.001) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`;

const GALAXY_DISK_FRAGMENT_SHADER = `
uniform float uOpacity;
varying vec2 vUv;

float hash21(vec2 point) {
  point = fract(point * vec2(123.34, 456.21));
  point += dot(point, point + 45.32);
  return fract(point.x * point.y);
}

float valueNoise(vec2 point) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  local = local * local * (3.0 - 2.0 * local);
  return mix(
    mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), local.x),
    mix(
      hash21(cell + vec2(0.0, 1.0)),
      hash21(cell + vec2(1.0, 1.0)),
      local.x
    ),
    local.y
  );
}

void main() {
  vec2 point = (vUv - 0.5) * 2.0;
  float radius = length(point);
  if (radius > 1.0) discard;

  float angle = atan(point.y, point.x);
  float winding = angle - log(radius + 0.095) * 3.35 - 0.42;
  float armGate = smoothstep(0.11, 0.24, radius) *
    (1.0 - smoothstep(0.82, 1.0, radius));
  float majorAlignment = abs(cos(winding));
  float majorArms = (
    pow(majorAlignment, 15.0) * 0.76 +
    pow(majorAlignment, 4.5) * 0.3
  ) * armGate;
  float minorArms = pow(abs(sin(winding + 0.2)), 22.0) * armGate *
    smoothstep(0.3, 0.44, radius) *
    (1.0 - smoothstep(0.72, 0.9, radius));
  float clumps =
    0.48 +
    valueNoise(point * 11.0) * 0.32 +
    valueNoise(point * 28.0) * 0.2;
  majorArms *= clumps;
  minorArms *= 0.34 * clumps;

  float disk = exp(-radius * 2.35) *
    (1.0 - smoothstep(0.76, 1.0, radius));
  float bulge = exp(-radius * radius * 54.0);
  float barAngle = 0.42;
  mat2 barRotation = mat2(
    cos(barAngle), -sin(barAngle),
    sin(barAngle), cos(barAngle)
  );
  vec2 barPoint = barRotation * point;
  float bar = exp(
    -barPoint.x * barPoint.x * 18.0 -
    barPoint.y * barPoint.y * 180.0
  );
  float dustLane = pow(abs(cos(winding - 0.13)), 30.0) *
    smoothstep(0.2, 0.35, radius);
  float structure =
    disk * 0.28 + majorArms + minorArms + bulge * 0.95 + bar * 0.72;
  structure *= 1.0 - dustLane * 0.48;

  vec3 warm = vec3(0.98, 0.58, 0.28);
  vec3 neutral = vec3(0.72, 0.71, 0.7);
  vec3 blue = vec3(0.22, 0.38, 0.74);
  vec3 stellarColor = mix(warm, neutral, smoothstep(0.08, 0.34, radius));
  stellarColor = mix(stellarColor, blue, smoothstep(0.42, 0.92, radius));
  stellarColor += warm * (bulge * 0.72 + bar * 0.38);

  float edge = 1.0 - smoothstep(0.82, 1.0, radius);
  float alpha = uOpacity * edge * min(1.0, structure);
  if (alpha < 0.002) discard;
  float brightness = 0.4 + structure * (0.42 + radius * 0.2);
  gl_FragColor = vec4(stellarColor * brightness, alpha);
}
`;

interface MilkyWayContextProps {
  readonly motionEnabled: boolean;
  readonly resetVersion: number;
  readonly scaleMode: ScaleMode;
  readonly timeScale: number;
}

function contextDistanceForCamera(
  cameraPosition: readonly [number, number, number],
  scaleMode: ScaleMode,
): number {
  const runtime = cameraRuntimeSnapshot();
  return galacticContextDistance(
    {
      cameraMode: runtime?.mode ?? null,
      cameraPosition,
      cameraTarget: runtime?.target ?? [0, 0, 0],
      selectedBodyId: runtime?.selectedBodyId ?? null,
    },
    sceneProfileFor(scaleMode),
  );
}

export function MilkyWayContext(props: MilkyWayContextProps) {
  const profile = sceneProfileFor(props.scaleMode);
  const activatedRef = useRef(false);
  const previousPhase =
    useRef<ReturnType<typeof galacticContextPhase>>("local");
  const [activated, setActivated] = useState(false);
  const setPhase = useGalacticContextStore((state) => state.setPhase);

  useEffect(
    () => () => {
      useGalacticContextStore.getState().setPhase("local");
    },
    [],
  );

  useFrame(({ camera }) => {
    const distance = contextDistanceForCamera(
      [camera.position.x, camera.position.y, camera.position.z],
      props.scaleMode,
    );
    const phase = galacticContextPhase(distance, profile);
    if (phase !== previousPhase.current) {
      previousPhase.current = phase;
      setPhase(phase);
    }
    if (phase !== "local" && !activatedRef.current) {
      activatedRef.current = true;
      setActivated(true);
    }
  }, SCENE_FRAME_PRIORITY.backdrop);

  return activated ? <MilkyWayMap {...props} /> : null;
}

function MilkyWayMap({
  motionEnabled,
  resetVersion,
  scaleMode,
  timeScale,
}: MilkyWayContextProps) {
  const profile = sceneProfileFor(scaleMode);
  const galaxyRef = useRef<Group>(null);
  const stellarMaterialRef = useRef<ShaderMaterial>(null);
  const dustMaterialRef = useRef<ShaderMaterial>(null);
  const galaxyTextureMaterialRef = useRef<MeshBasicMaterial>(null);
  const diskHazeMaterialRef = useRef<ShaderMaterial>(null);
  const barHazeMaterialRef = useRef<ShaderMaterial>(null);
  const deepFieldMaterialRef = useRef<PointsMaterial>(null);
  const markerRingMaterialRef = useRef<MeshBasicMaterial>(null);
  const markerCoreMaterialRef = useRef<MeshBasicMaterial>(null);
  const galaxyTexture = useSceneTexture(MILKY_WAY_EXTERIOR_TEXTURE);
  const galaxy = useMemo(
    () =>
      createMilkyWayParticleData(scaleMode === "scientific" ? 52_000 : 36_000),
    [scaleMode],
  );
  const dust = useMemo(
    () =>
      createMilkyWayDustParticleData(
        scaleMode === "scientific" ? 11_000 : 8_000,
      ),
    [scaleMode],
  );
  const deepField = useMemo(
    () => createDeepFieldParticleData(scaleMode === "scientific" ? 1_400 : 950),
    [scaleMode],
  );

  useEffect(() => {
    if (galaxyRef.current) galaxyRef.current.rotation.z = -0.18;
  }, [resetVersion]);

  useFrame(({ camera }, delta) => {
    const cameraPosition = [
      camera.position.x,
      camera.position.y,
      camera.position.z,
    ] as const;
    const distance = contextDistanceForCamera(cameraPosition, scaleMode);
    const opacity = universeLayerOpacities(distance, profile).milkyWay;
    const phase = galacticContextPhase(distance, profile);
    const mapRadius = galacticMapRadius(Math.hypot(...cameraPosition), profile);
    const pointScale =
      mapRadius *
      profile.backdrop.galaxyPointSize *
      (scaleMode === "scientific" ? 0.75 : 3.1);

    if (galaxyRef.current) {
      galaxyRef.current.visible = opacity > 0.002;
      galaxyRef.current.scale.setScalar(mapRadius);
      galaxyRef.current.userData.testBackdropOpacity = opacity;
      galaxyRef.current.userData.testGalaxyMapRadius = mapRadius;
      if (motionEnabled) {
        galaxyRef.current.rotation.z +=
          delta * 0.000_018 * Math.min(4, timeScale);
      }
    }
    if (stellarMaterialRef.current) {
      const stellarOpacity = opacity * (galaxyTexture ? 0.62 : 1.18);
      stellarMaterialRef.current.opacity = Math.min(1, stellarOpacity);
      stellarMaterialRef.current.uniforms.uOpacity.value = stellarOpacity;
      stellarMaterialRef.current.uniforms.uPointScale.value = pointScale;
    }
    if (dustMaterialRef.current) {
      const dustOpacity = opacity * (galaxyTexture ? 0.18 : 0.3);
      dustMaterialRef.current.opacity = dustOpacity;
      dustMaterialRef.current.uniforms.uOpacity.value = dustOpacity;
      dustMaterialRef.current.uniforms.uPointScale.value = pointScale * 1.1;
    }
    if (galaxyTextureMaterialRef.current) {
      galaxyTextureMaterialRef.current.opacity = opacity * 0.94;
    }
    if (diskHazeMaterialRef.current) {
      const diskOpacity = opacity * (galaxyTexture ? 0.08 : 0.6);
      diskHazeMaterialRef.current.opacity = diskOpacity;
      diskHazeMaterialRef.current.uniforms.uOpacity.value = diskOpacity;
    }
    if (barHazeMaterialRef.current) {
      const barOpacity = opacity * (galaxyTexture ? 0.035 : 0.16);
      barHazeMaterialRef.current.opacity = barOpacity;
      barHazeMaterialRef.current.uniforms.uOpacity.value = barOpacity;
    }
    if (deepFieldMaterialRef.current) {
      deepFieldMaterialRef.current.opacity = opacity * 0.2;
    }
    if (markerRingMaterialRef.current) {
      markerRingMaterialRef.current.opacity =
        opacity * (phase === "galactic" ? 0.82 : 0.38);
    }
    if (markerCoreMaterialRef.current) {
      markerCoreMaterialRef.current.opacity =
        opacity * (phase === "galactic" ? 0.76 : 0.3);
    }
  }, SCENE_FRAME_PRIORITY.backdrop);

  return (
    <group
      ref={galaxyRef}
      frustumCulled={false}
      rotation={[1.02, 0.08, -0.18]}
      userData={{
        majorArmCount: MILKY_WAY_MODEL.majorArmCount,
        minorArmCount: MILKY_WAY_MODEL.minorArmCount,
        representation: "nasa-jpl-barred-spiral-model",
        solarNeighbourhood: MILKY_WAY_MODEL.solarNeighbourhood,
        surfaceAsset: MILKY_WAY_EXTERIOR_TEXTURE,
        surfaceReady: Boolean(galaxyTexture),
        testBackdropLayer: "milky-way",
        visualLayer: "galactic-context",
      }}
      visible={false}
    >
      <mesh
        raycast={DISABLED_RAYCAST}
        renderOrder={-1}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1.02, 1.02, 1]}
        visible={Boolean(galaxyTexture)}
      >
        <circleGeometry args={[1, 128]} />
        <meshBasicMaterial
          ref={galaxyTextureMaterialRef}
          depthTest={false}
          depthWrite={false}
          map={galaxyTexture}
          opacity={0}
          side={DoubleSide}
          toneMapped={false}
          transparent
        />
      </mesh>

      <mesh
        raycast={DISABLED_RAYCAST}
        renderOrder={0}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.95, 0.95, 1]}
      >
        <circleGeometry args={[1, 128]} />
        <shaderMaterial
          ref={diskHazeMaterialRef}
          blending={NormalBlending}
          depthTest={false}
          depthWrite={false}
          fragmentShader={GALAXY_DISK_FRAGMENT_SHADER}
          side={DoubleSide}
          transparent
          uniforms={{
            uOpacity: { value: 0 },
          }}
          vertexShader={GALAXY_HAZE_VERTEX_SHADER}
        />
      </mesh>

      <mesh
        raycast={DISABLED_RAYCAST}
        renderOrder={1}
        rotation={[Math.PI / 2, 0, 0.42]}
        scale={[0.4, 0.12, 1]}
      >
        <circleGeometry args={[1, 96]} />
        <shaderMaterial
          ref={barHazeMaterialRef}
          blending={AdditiveBlending}
          depthTest={false}
          depthWrite={false}
          fragmentShader={GALAXY_HAZE_FRAGMENT_SHADER}
          side={DoubleSide}
          transparent
          uniforms={{
            uColor: { value: new Color(0.82, 0.48, 0.2) },
            uOpacity: { value: 0 },
            uPower: { value: 1.8 },
          }}
          vertexShader={GALAXY_HAZE_VERTEX_SHADER}
        />
      </mesh>

      <GalaxyParticleCloud
        data={galaxy}
        kind="stars"
        materialRef={stellarMaterialRef}
      />
      <GalaxyParticleCloud
        data={dust}
        kind="dust"
        materialRef={dustMaterialRef}
      />

      <points
        frustumCulled={false}
        raycast={DISABLED_RAYCAST}
        renderOrder={-2}
        userData={{ visualLayer: "galactic-deep-field" }}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[deepField.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[deepField.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={deepFieldMaterialRef}
          depthTest={false}
          depthWrite={false}
          fog={false}
          opacity={0}
          size={scaleMode === "scientific" ? 1.35 : 1}
          sizeAttenuation
          transparent
          vertexColors
        />
      </points>

      <group
        position={SOLAR_SYSTEM_GALACTIC_POSITION}
        userData={{
          solarDistanceLightYears: MILKY_WAY_MODEL.solarDistanceLightYears,
          markerColor: "#d98a45",
          testGalacticMarker: "solar-system",
          visualLayer: "solar-system-galactic-location",
        }}
      >
        <mesh
          raycast={DISABLED_RAYCAST}
          renderOrder={5}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.014, 0.019, 64]} />
          <meshBasicMaterial
            ref={markerRingMaterialRef}
            color="#e6a45f"
            depthTest={false}
            depthWrite={false}
            opacity={0}
            side={DoubleSide}
            toneMapped
            transparent
          />
        </mesh>
        <mesh raycast={DISABLED_RAYCAST} renderOrder={6}>
          <sphereGeometry args={[0.0042, 18, 12]} />
          <meshBasicMaterial
            ref={markerCoreMaterialRef}
            color="#d98a45"
            depthTest={false}
            depthWrite={false}
            opacity={0}
            toneMapped
            transparent
          />
        </mesh>
      </group>
    </group>
  );
}
