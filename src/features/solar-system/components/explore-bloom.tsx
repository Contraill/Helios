"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { Vector2 } from "three";

const LIMITED_BLOOM_SHADER = {
  uniforms: {
    tDiffuse: { value: null },
    uStrength: { value: 0.2 },
    uTexelSize: { value: new Vector2(1, 1) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uStrength;
    uniform vec2 uTexelSize;
    varying vec2 vUv;

    vec3 brightSample(vec2 offset) {
      vec3 sampleColor = texture2D(tDiffuse, vUv + offset).rgb;
      float peak = max(max(sampleColor.r, sampleColor.g), sampleColor.b);
      return sampleColor * smoothstep(1.0, 1.75, peak);
    }

    void main() {
      vec3 base = texture2D(tDiffuse, vUv).rgb;
      vec2 spread = uTexelSize * 4.0;
      vec3 glow =
        brightSample(vec2(spread.x, 0.0)) +
        brightSample(vec2(-spread.x, 0.0)) +
        brightSample(vec2(0.0, spread.y)) +
        brightSample(vec2(0.0, -spread.y));
      gl_FragColor = vec4(base + glow * uStrength * 0.22, 1.0);
    }
  `,
} as const;

interface ExploreBloomProps {
  enabled: boolean;
  strength: number;
}

function BloomPipeline({ strength }: Pick<ExploreBloomProps, "strength">) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const size = useThree((state) => state.size);
  const composer = useMemo(() => {
    const pipeline = new EffectComposer(gl);
    const bloom = new ShaderPass(LIMITED_BLOOM_SHADER);
    bloom.uniforms.uStrength.value = strength;
    bloom.uniforms.uTexelSize.value = new Vector2(
      1 / Math.max(size.width, 1),
      1 / Math.max(size.height, 1),
    );
    pipeline.addPass(new RenderPass(scene, camera));
    pipeline.addPass(bloom);
    pipeline.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    pipeline.setSize(size.width, size.height);
    return pipeline;
  }, [camera, gl, scene, size.height, size.width, strength]);

  useEffect(
    () => () => {
      composer.dispose();
    },
    [composer],
  );

  useFrame(() => composer.render(), 1);
  return null;
}

export function ExploreBloom({ enabled, strength }: ExploreBloomProps) {
  return enabled ? <BloomPipeline strength={strength} /> : null;
}
