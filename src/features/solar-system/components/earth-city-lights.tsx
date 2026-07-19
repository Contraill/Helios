"use client";

import { useMemo } from "react";
import { AdditiveBlending } from "three";

import {
  earthCityLightsTextureSource,
  type TextureVariantName,
} from "@/content/sources/planet-textures";
import { useSceneTexture } from "@/features/solar-system/lib/texture-cache";

interface EarthCityLightsProps {
  segments: readonly [number, number];
  textureVariant: TextureVariantName;
}

const vertexShader = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_vertex>

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vUv = uv;
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
    #include <logdepthbuf_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  #include <logdepthbuf_pars_fragment>

  uniform sampler2D uNightMap;
  uniform float uIntensity;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    #include <logdepthbuf_fragment>

    vec3 sampleColor = texture2D(uNightMap, vUv).rgb;

    // The Sun is the world origin in the heliocentric scene. This mask keeps
    // the city layer off the daylight hemisphere and softens the terminator.
    vec3 directionToSun = normalize(-vWorldPosition);
    float solarIncidence = dot(normalize(vWorldNormal), directionToSun);
    float night = 1.0 - smoothstep(-0.14, 0.2, solarIncidence);

    // Suppress the blue basemap while retaining dim amber urban clusters.
    // The source is a photographic night composite, so the extraction needs
    // to preserve both warm excess and small high-luminance settlements.
    float luminance = dot(sampleColor, vec3(0.56, 0.34, 0.10));
    float warmExcess = max(
      sampleColor.r - sampleColor.b * 0.45,
      sampleColor.g - sampleColor.b * 0.62
    );
    float warmSignal = max(warmExcess, luminance * 0.16);
    warmSignal = pow(clamp((warmSignal - 0.006) * 7.2, 0.0, 1.0), 1.05);
    float alpha = warmSignal * night * uIntensity;
    if (alpha < 0.003) discard;

    vec3 amber = mix(
      vec3(1.0, 0.42, 0.12),
      vec3(1.0, 0.82, 0.52),
      clamp(sampleColor.r * 1.6, 0.0, 1.0)
    );
    // Additive blending applies alpha to RGB during compositing; keeping the
    // radiance un-premultiplied avoids squaring dim city-light intensity.
    gl_FragColor = vec4(amber * (0.38 + warmSignal * 1.42), alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function EarthCityLights({
  segments,
  textureVariant,
}: EarthCityLightsProps) {
  const texture = useSceneTexture(
    earthCityLightsTextureSource.variants[textureVariant].path,
  );
  const uniforms = useMemo(
    () => ({
      uIntensity: {
        value:
          textureVariant === "high"
            ? 1.85
            : textureVariant === "medium"
              ? 1.55
              : 1.2,
      },
      uNightMap: { value: texture },
    }),
    [texture, textureVariant],
  );

  if (!texture) return null;

  return (
    <mesh
      raycast={() => undefined}
      renderOrder={2}
      scale={1.0035}
      userData={{ visualLayer: "earth-city-lights" }}
    >
      <sphereGeometry args={[1, segments[0], segments[1]]} />
      <shaderMaterial
        blending={AdditiveBlending}
        depthWrite={false}
        fragmentShader={fragmentShader}
        toneMapped={false}
        transparent
        uniforms={uniforms}
        vertexShader={vertexShader}
      />
    </mesh>
  );
}
