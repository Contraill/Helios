"use client";

import { useLayoutEffect, useMemo } from "react";
import { AdditiveBlending, Vector2 } from "three";

import { earthCityLightsTextureSource } from "@/content/sources/planet-textures";
import { markMaterialApplied } from "@/features/solar-system/lib/asset-loading-lifecycle";
import { useSceneTexture } from "@/features/solar-system/lib/texture-cache";

interface EarthCityLightsProps {
  segments: readonly [number, number];
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
  uniform vec2 uTexelSize;
  uniform float uIntensity;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  float lightCandidate(vec3 sampleColor) {
    float neutralLight = min(sampleColor.r, sampleColor.g);
    float blueDominance = max(
      0.0,
      sampleColor.b - max(sampleColor.r, sampleColor.g)
    );
    float lightFloor = smoothstep(0.025, 0.16, neutralLight);
    float blueRejection = 1.0 - smoothstep(0.005, 0.10, blueDominance);
    return lightFloor * blueRejection;
  }

  void main() {
    #include <logdepthbuf_fragment>

    vec3 sampleColor = texture2D(uNightMap, vUv).rgb;
    float center = min(sampleColor.r, sampleColor.g);

    vec3 east = texture2D(uNightMap, vUv + vec2(uTexelSize.x * 2.0, 0.0)).rgb;
    vec3 west = texture2D(uNightMap, vUv - vec2(uTexelSize.x * 2.0, 0.0)).rgb;
    vec3 north = texture2D(uNightMap, vUv + vec2(0.0, uTexelSize.y)).rgb;
    vec3 south = texture2D(uNightMap, vUv - vec2(0.0, uTexelSize.y)).rgb;
    float neighbourhood = 0.25 * (
      min(east.r, east.g) + min(west.r, west.g) +
      min(north.r, north.g) + min(south.r, south.g)
    );

    // The source is a blue photographic night basemap. A local-contrast term
    // retains compact urban clusters, while the neutral-light term preserves
    // broad metropolitan regions without turning terrain into a neon overlay.
    float localContrast = smoothstep(0.0015, 0.048, center - neighbourhood);
    float citySignal = max(lightCandidate(sampleColor) * 0.44, localContrast);

    // Suppress polar ice and the bright Antarctic coastline in the source.
    // The transition retains populated northern latitudes such as Scandinavia.
    float normalizedLatitude = abs(vUv.y - 0.5) * 2.0;
    float inhabitedLatitude = 1.0 - smoothstep(0.68, 0.84, normalizedLatitude);
    citySignal = pow(clamp(citySignal * inhabitedLatitude, 0.0, 1.0), 1.25);

    // The Sun is the world origin. Lights are fully rejected on the day side
    // and transition softly across civil twilight around the terminator.
    vec3 directionToSun = normalize(-vWorldPosition);
    float solarIncidence = dot(normalize(vWorldNormal), directionToSun);
    float night = 1.0 - smoothstep(-0.18, 0.06, solarIncidence);

    float alpha = citySignal * night * uIntensity;
    if (alpha < 0.003) discard;

    vec3 amber = mix(
      vec3(1.0, 0.48, 0.16),
      vec3(1.0, 0.88, 0.62),
      smoothstep(0.05, 0.24, center)
    );
    gl_FragColor = vec4(amber * (0.40 + citySignal * 1.10), alpha);
    #include <colorspace_fragment>
  }
`;

export function EarthCityLights({ segments }: EarthCityLightsProps) {
  const source = earthCityLightsTextureSource.asset;
  const texture = useSceneTexture(source.path, {
    onError: () => markMaterialApplied(source.owner, true),
  });
  useLayoutEffect(() => {
    if (texture) markMaterialApplied(source.owner);
  }, [source.owner, texture]);

  const uniforms = useMemo(
    () => ({
      uIntensity: { value: 1.85 },
      uNightMap: { value: texture },
      uTexelSize: { value: new Vector2(1 / source.width, 1 / source.height) },
    }),
    [source.height, source.width, texture],
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
        depthTest
        depthWrite={false}
        fragmentShader={fragmentShader}
        toneMapped={false}
        transparent
        uniforms={uniforms}
        userData={{
          testMaterial: "earth-city-lights",
          texturePath: source.path,
        }}
        vertexShader={vertexShader}
      />
    </mesh>
  );
}
