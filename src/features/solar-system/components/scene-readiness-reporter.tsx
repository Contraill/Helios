"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";

import {
  markCompleteFrameRendered,
  markRendererReady,
} from "@/features/solar-system/lib/asset-loading-lifecycle";

export function SceneReadinessReporter() {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    if (gl.getContext()) markRendererReady();
  }, [gl]);

  useFrame(() => markCompleteFrameRendered());
  return null;
}
