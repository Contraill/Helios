"use client";

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";

export function OverviewCamera() {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);

  useLayoutEffect(() => {
    const aspect = width / Math.max(height, 1);
    const portrait = aspect < 0.85;
    const distance = portrait ? 128 : aspect < 1.2 ? 108 : 90;
    camera.position.set(0, distance * (portrait ? 0.74 : 0.52), distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, height, width]);

  return null;
}
