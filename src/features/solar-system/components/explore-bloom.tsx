"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import {
  DepthTexture,
  LinearFilter,
  RGBAFormat,
  UnsignedShortType,
  Vector2,
  WebGLRenderTarget,
} from "three";

const LIMITED_BLOOM_SHADER = {
  uniforms: {
    tDiffuse: { value: null },
    uDepthTexture: { value: null },
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
    uniform sampler2D uDepthTexture;
    uniform float uStrength;
    uniform vec2 uTexelSize;
    varying vec2 vUv;

    vec4 brightSample(vec2 offset, float baseDepth) {
      vec2 uv = vUv + offset;
      vec3 sampleColor = texture2D(tDiffuse, uv).rgb;
      float peak = max(max(sampleColor.r, sampleColor.g), sampleColor.b);
      float neighborDepth = texture2D(uDepthTexture, uv).r;
      float occluded = step(baseDepth + 0.00035, neighborDepth);
      float occlusionWeight = mix(1.0, 0.14, occluded);
      return vec4(sampleColor * smoothstep(1.0, 1.75, peak) * occlusionWeight, 1.0);
    }

    void main() {
      vec3 base = texture2D(tDiffuse, vUv).rgb;
      float baseDepth = texture2D(uDepthTexture, vUv).r;
      vec2 spread = uTexelSize * 4.0;
      vec3 glow =
        brightSample(vec2(spread.x, 0.0), baseDepth).rgb +
        brightSample(vec2(-spread.x, 0.0), baseDepth).rgb +
        brightSample(vec2(0.0, spread.y), baseDepth).rgb +
        brightSample(vec2(0.0, -spread.y), baseDepth).rgb;
      float basePeak = max(max(base.r, base.g), base.b);
      float baseGuard = mix(0.72, 1.0, smoothstep(0.08, 0.42, basePeak));
      gl_FragColor = vec4(base + glow * uStrength * 0.18 * baseGuard, 1.0);
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
  const pipeline = useMemo(() => {
    const renderTarget = new WebGLRenderTarget(size.width, size.height, {
      depthBuffer: true,
      format: RGBAFormat,
      magFilter: LinearFilter,
      minFilter: LinearFilter,
    });
    renderTarget.depthTexture = new DepthTexture(
      size.width,
      size.height,
      UnsignedShortType,
    );
    const pipeline = new EffectComposer(gl, renderTarget);
    const bloom = new ShaderPass(LIMITED_BLOOM_SHADER);
    bloom.uniforms.uStrength.value = strength;
    bloom.uniforms.uTexelSize.value = new Vector2(
      1 / Math.max(size.width, 1),
      1 / Math.max(size.height, 1),
    );

    const secondaryDepth = new DepthTexture(
      size.width,
      size.height,
      UnsignedShortType,
    );
    pipeline.renderTarget2.depthTexture = secondaryDepth;

    pipeline.addPass(new RenderPass(scene, camera));
    pipeline.addPass(bloom);
    pipeline.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    pipeline.setSize(size.width, size.height);
    return { bloom, composer: pipeline };
  }, [camera, gl, scene, size.height, size.width, strength]);

  useEffect(
    () => () => {
      pipeline.composer.dispose();
    },
    [pipeline],
  );

  useFrame(() => {
    pipeline.bloom.uniforms.uDepthTexture.value =
      pipeline.composer.readBuffer.depthTexture ??
      pipeline.composer.renderTarget1.depthTexture;
    pipeline.composer.render();
  }, 1);
  return null;
}

export function ExploreBloom({ enabled, strength }: ExploreBloomProps) {
  return enabled ? <BloomPipeline strength={strength} /> : null;
}
