"use client";

import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";

import {
  captureSceneFrameTime,
  clearSceneFrameTime,
  SCENE_FRAME_PRIORITY,
} from "@/features/solar-system/lib/scene-frame-runtime";

export function SimulationFrameClock() {
  useEffect(() => clearSceneFrameTime, []);
  useFrame(() => {
    captureSceneFrameTime();
  }, SCENE_FRAME_PRIORITY.clock);
  return null;
}
