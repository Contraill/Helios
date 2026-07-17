"use client";

import { useEffect, useMemo } from "react";
import {
  CanvasTexture,
  LinearFilter,
  SRGBColorSpace,
  SpriteMaterial,
} from "three";

interface PlanetLabelProps {
  color: string;
  offsetY: number;
  text: string;
}

function createLabelTexture(text: string, color: string): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = '600 44px ui-sans-serif, system-ui, -apple-system, "Segoe UI"';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "rgba(242, 239, 230, 0.96)";
  context.fillText(text, 256, 52);
  context.fillStyle = color;
  context.fillRect(218, 96, 76, 3);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function PlanetLabel({ color, offsetY, text }: PlanetLabelProps) {
  const texture = useMemo(() => createLabelTexture(text, color), [color, text]);
  const material = useMemo(
    () =>
      new SpriteMaterial({
        depthTest: false,
        depthWrite: false,
        map: texture,
        transparent: true,
      }),
    [texture],
  );

  useEffect(
    () => () => {
      material.dispose();
      texture.dispose();
    },
    [material, texture],
  );

  return (
    <sprite
      material={material}
      position={[0, offsetY, 0]}
      raycast={() => undefined}
      renderOrder={10}
      scale={[6.2, 1.55, 1]}
    />
  );
}
