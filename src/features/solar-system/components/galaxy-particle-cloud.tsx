"use client";

import { useMemo, type RefObject } from "react";
import { AdditiveBlending, NormalBlending, type ShaderMaterial } from "three";

import type { GalacticParticleData } from "@/features/solar-system/lib/universe-backdrop";

const GALAXY_PARTICLE_VERTEX_SHADER = `
attribute float aOpacity;
attribute float aSize;
attribute vec3 aColor;
uniform float uPointScale;
varying vec3 vColor;
varying float vOpacity;

void main() {
  vColor = aColor;
  vOpacity = aOpacity;
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = clamp(
    aSize * uPointScale / max(1.0, -viewPosition.z),
    0.9,
    6.4
  );
  gl_Position = projectionMatrix * viewPosition;
}
`;

const GALAXY_PARTICLE_FRAGMENT_SHADER = `
uniform float uOpacity;
varying vec3 vColor;
varying float vOpacity;

void main() {
  vec2 centered = gl_PointCoord * 2.0 - 1.0;
  float radius = length(centered);
  float core = exp(-radius * radius * 4.2);
  float feather = 1.0 - smoothstep(0.58, 1.0, radius);
  float alpha = uOpacity * vOpacity * core * feather;
  if (alpha < 0.002) discard;
  gl_FragColor = vec4(vColor, alpha);
}
`;

interface GalaxyParticleCloudProps {
  readonly data: GalacticParticleData;
  readonly kind: "stars" | "dust";
  readonly materialRef: RefObject<ShaderMaterial | null>;
}

export function GalaxyParticleCloud({
  data,
  kind,
  materialRef,
}: GalaxyParticleCloudProps) {
  const uniforms = useMemo(
    () => ({
      uOpacity: { value: 0 },
      uPointScale: { value: 1 },
    }),
    [],
  );

  return (
    <points
      frustumCulled={false}
      raycast={() => undefined}
      renderOrder={kind === "dust" ? 3 : 2}
      userData={{
        testGalaxyParticleCount: data.sizes.length,
        testGalaxyParticleKind: kind,
        visualLayer: `milky-way-${kind}`,
      }}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.positions, 3]}
        />
        <bufferAttribute attach="attributes-aColor" args={[data.colors, 3]} />
        <bufferAttribute
          attach="attributes-aOpacity"
          args={[data.opacities, 1]}
        />
        <bufferAttribute attach="attributes-aSize" args={[data.sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        blending={kind === "dust" ? NormalBlending : AdditiveBlending}
        depthTest={false}
        depthWrite={false}
        fragmentShader={GALAXY_PARTICLE_FRAGMENT_SHADER}
        transparent
        uniforms={uniforms}
        vertexShader={GALAXY_PARTICLE_VERTEX_SHADER}
      />
    </points>
  );
}
