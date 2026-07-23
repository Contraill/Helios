"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, Color, Group, Vector3 } from "three";

import {
  buildComaParticles,
  buildCometTailParticles,
  type CometParticleCloud,
} from "@/features/solar-system/lib/comet-tail-particles";

const PARTICLE_VERTEX_SHADER = `
attribute float aOpacity;
attribute float aSize;
varying float vOpacity;
varying float vDistanceFade;

uniform float uNearDistance;
uniform float uFarDistance;
uniform float uPointScale;

void main() {
  vOpacity = aOpacity;
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  float viewDistance = max(1.0, -viewPosition.z);
  float normalizedFar = clamp((viewDistance - uNearDistance) / max(1.0, uFarDistance - uNearDistance), 0.0, 1.0);
  float perspectiveScale = clamp(uPointScale / viewDistance, 0.12, 1.65);
  vDistanceFade = mix(1.0, 0.14, normalizedFar);
  gl_PointSize = max(0.95, aSize * perspectiveScale * mix(1.0, 0.38, normalizedFar));
  gl_Position = projectionMatrix * viewPosition;
}
`;

const PARTICLE_FRAGMENT_SHADER = `
uniform vec3 uColor;
uniform float uOpacity;
varying float vOpacity;
varying float vDistanceFade;

void main() {
  vec2 centered = gl_PointCoord * 2.0 - 1.0;
  float radius = length(centered);
  float softCore = exp(-radius * radius * 3.4);
  float feather = 1.0 - smoothstep(0.58, 1.0, radius);
  float alpha = uOpacity * vOpacity * vDistanceFade * softCore * feather;
  if (alpha < 0.003) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`;

function ParticleCloud({
  cloud,
  color,
  farDistance,
  nearDistance,
  opacity,
  pointScale,
  role,
}: {
  cloud: CometParticleCloud;
  color: string;
  farDistance: number;
  nearDistance: number;
  opacity: number;
  pointScale: number;
  role: "dust" | "ion" | "coma";
}) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(color) },
      uFarDistance: { value: farDistance },
      uNearDistance: { value: nearDistance },
      uOpacity: { value: opacity },
      uPointScale: { value: pointScale },
    }),
    [color, farDistance, nearDistance, opacity, pointScale],
  );

  return (
    <points
      frustumCulled={false}
      raycast={() => undefined}
      userData={{
        testCometParticleCount: cloud.count,
        testCometParticleRole: role,
        testCometParticleSignature: cloud.signature,
        visualLayer: `comet-${role}-particle-volume`,
      }}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[cloud.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aOpacity"
          args={[cloud.opacities, 1]}
        />
        <bufferAttribute attach="attributes-aSize" args={[cloud.sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        blending={AdditiveBlending}
        depthWrite={false}
        fragmentShader={PARTICLE_FRAGMENT_SHADER}
        transparent
        uniforms={uniforms}
        vertexShader={PARTICLE_VERTEX_SHADER}
      />
    </points>
  );
}

export function CometTailVolume({
  bodyId,
  comaColor,
  comaExtent,
  dustColor,
  dustLength,
  dustWidth,
  ionColor,
  ionLength,
  ionWidth,
}: {
  bodyId: string;
  comaColor: string;
  comaExtent: number;
  dustColor: string;
  dustLength: number;
  dustWidth: number;
  ionColor: string;
  ionLength: number;
  ionWidth: number;
}) {
  const camera = useThree((state) => state.camera);
  const groupRef = useRef<Group | null>(null);
  const worldPosition = useRef(new Vector3());
  const dust = useMemo(
    () =>
      buildCometTailParticles({
        bodyId,
        kind: "dust",
        length: dustLength,
        width: dustWidth,
        count: 520,
      }),
    [bodyId, dustLength, dustWidth],
  );
  const ion = useMemo(
    () =>
      buildCometTailParticles({
        bodyId,
        kind: "ion",
        length: ionLength,
        width: ionWidth,
        count: 260,
      }),
    [bodyId, ionLength, ionWidth],
  );
  const coma = useMemo(
    () => buildComaParticles({ bodyId, extent: comaExtent, count: 180 }),
    [bodyId, comaExtent],
  );

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    group.getWorldPosition(worldPosition.current);
    const cameraDistance = camera.position.distanceTo(worldPosition.current);
    const normalizedFar = Math.max(0, Math.min(1, (cameraDistance - 16) / 120));
    const uniformScale = 1 - normalizedFar * 0.68;
    group.scale.setScalar(uniformScale);
    group.position.x = -dustLength * 0.04 * normalizedFar;
  });

  return (
    <group
      ref={groupRef}
      userData={{
        testCometTailPrimitive: "particle-volume",
        testCometTotalParticleCount: dust.count + ion.count + coma.count,
        testCometTailDistanceLod: true,
        visualLayer: "volumetric-comet-appearance",
      }}
    >
      <ParticleCloud
        cloud={dust}
        color={dustColor}
        farDistance={180}
        nearDistance={28}
        opacity={0.38}
        pointScale={96}
        role="dust"
      />
      <ParticleCloud
        cloud={ion}
        color={ionColor}
        farDistance={200}
        nearDistance={32}
        opacity={0.34}
        pointScale={82}
        role="ion"
      />
      <ParticleCloud
        cloud={coma}
        color={comaColor}
        farDistance={150}
        nearDistance={22}
        opacity={0.28}
        pointScale={74}
        role="coma"
      />
    </group>
  );
}
