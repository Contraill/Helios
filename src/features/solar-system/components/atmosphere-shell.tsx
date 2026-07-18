"use client";

import { useMemo } from "react";
import { AdditiveBlending, BackSide, Color } from "three";

import type { AtmosphereMode } from "@/features/solar-system/lib/quality";
import type { AtmosphereProfile } from "@/features/solar-system/lib/planet-visual-profiles";

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDirection;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uPower;
  varying vec3 vNormal;
  varying vec3 vViewDirection;

  void main() {
    float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDirection)), 0.0), uPower);
    gl_FragColor = vec4(uColor, rim * uOpacity);
  }
`;

interface AtmosphereShellProps {
  mode: AtmosphereMode;
  profile: AtmosphereProfile;
  radius: number;
  segments: readonly [number, number];
}

export function AtmosphereShell({
  mode,
  profile,
  radius,
  segments,
}: AtmosphereShellProps) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(profile.color) },
      uOpacity: { value: profile.opacity },
      uPower: { value: profile.fresnelPower },
    }),
    [profile.color, profile.fresnelPower, profile.opacity],
  );

  return (
    <mesh
      raycast={() => undefined}
      scale={radius * profile.radiusScale}
      userData={{ visualLayer: "atmosphere" }}
    >
      <sphereGeometry args={[1, segments[0], segments[1]]} />
      {mode === "simple" ? (
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={profile.color}
          depthWrite={false}
          opacity={profile.opacity * 0.55}
          side={BackSide}
          transparent
        />
      ) : (
        <shaderMaterial
          blending={AdditiveBlending}
          depthWrite={false}
          fragmentShader={FRAGMENT_SHADER}
          side={BackSide}
          transparent
          uniforms={uniforms}
          vertexShader={VERTEX_SHADER}
        />
      )}
    </mesh>
  );
}
