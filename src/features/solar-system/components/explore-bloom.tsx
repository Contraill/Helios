"use client";

import { useEffect, useRef } from "react";
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
  type Camera,
  type Scene,
  type WebGLRenderer,
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

interface BloomResources {
  readonly bloom: ShaderPass;
  readonly composer: EffectComposer;
}

function createBloomResources({
  camera,
  gl,
  height,
  scene,
  strength,
  width,
}: {
  camera: Camera;
  gl: WebGLRenderer;
  height: number;
  scene: Scene;
  strength: number;
  width: number;
}): BloomResources {
  const renderTarget = new WebGLRenderTarget(width, height, {
    depthBuffer: true,
    format: RGBAFormat,
    magFilter: LinearFilter,
    minFilter: LinearFilter,
  });
  renderTarget.depthTexture = new DepthTexture(
    width,
    height,
    UnsignedShortType,
  );

  const composer = new EffectComposer(gl, renderTarget);
  const bloom = new ShaderPass(LIMITED_BLOOM_SHADER);
  bloom.uniforms.uStrength.value = strength;
  bloom.uniforms.uTexelSize.value = new Vector2(
    1 / Math.max(width, 1),
    1 / Math.max(height, 1),
  );

  composer.renderTarget2.depthTexture = new DepthTexture(
    width,
    height,
    UnsignedShortType,
  );
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(bloom);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  composer.setSize(width, height);

  return { bloom, composer };
}

function BloomPipeline({ strength }: Pick<ExploreBloomProps, "strength">) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const scene = useThree((state) => state.scene);
  const size = useThree((state) => state.size);
  const resourcesRef = useRef<BloomResources | null>(null);

  useEffect(() => {
    const resources = createBloomResources({
      camera,
      gl,
      height: size.height,
      scene,
      strength,
      width: size.width,
    });
    resourcesRef.current = resources;
    invalidate();

    return () => {
      if (resourcesRef.current === resources) resourcesRef.current = null;
      resources.composer.dispose();
    };
  }, [camera, gl, invalidate, scene, size.height, size.width, strength]);

  useFrame(() => {
    const resources = resourcesRef.current;
    if (!resources) return;
    resources.bloom.uniforms.uDepthTexture.value =
      resources.composer.readBuffer.depthTexture ??
      resources.composer.renderTarget1.depthTexture;
    resources.composer.render();
  }, 1);

  return null;
}

export function ExploreBloom({ enabled, strength }: ExploreBloomProps) {
  return enabled ? <BloomPipeline strength={strength} /> : null;
}
