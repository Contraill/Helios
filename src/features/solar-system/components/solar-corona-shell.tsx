"use client";

import { useMemo } from "react";
import { AdditiveBlending, Color, FrontSide } from "three";

const VERTEX_SHADER = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_vertex>

  varying vec3 vNormal;
  varying vec3 vViewDirection;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
    #include <logdepthbuf_vertex>
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  #include <logdepthbuf_pars_fragment>

  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uPower;
  varying vec3 vNormal;
  varying vec3 vViewDirection;

  void main() {
    #include <logdepthbuf_fragment>

    float facing = max(dot(normalize(vNormal), normalize(vViewDirection)), 0.0);
    float rim = pow(1.0 - facing, uPower);
    float alpha = smoothstep(0.08, 0.95, rim) * uOpacity;
    gl_FragColor = vec4(uColor * (0.55 + rim * 0.45), alpha);
  }
`;

interface SolarCoronaShellProps {
  readonly color: string;
  readonly opacity: number;
  readonly power: number;
  readonly radius: number;
  readonly segments: readonly [number, number];
}

/**
 * A limb-only solar corona. The front-facing Fresnel falloff keeps the centre
 * transparent, unlike a translucent BackSide sphere that paints a flat disc
 * around the entire Sun.
 */
export function SolarCoronaShell({
  color,
  opacity,
  power,
  radius,
  segments,
}: SolarCoronaShellProps) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(color) },
      uOpacity: { value: opacity },
      uPower: { value: power },
    }),
    [color, opacity, power],
  );

  return (
    <mesh
      raycast={() => undefined}
      scale={radius}
      userData={{ visualLayer: "solar-corona" }}
    >
      <sphereGeometry args={[1, segments[0], segments[1]]} />
      <shaderMaterial
        blending={AdditiveBlending}
        depthWrite={false}
        fragmentShader={FRAGMENT_SHADER}
        side={FrontSide}
        toneMapped={false}
        transparent
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
      />
    </mesh>
  );
}
