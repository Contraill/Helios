"use client";

import { useEffect, useMemo } from "react";
import {
  CanvasTexture,
  LinearFilter,
  SRGBColorSpace,
  SpriteMaterial,
} from "three";

export type ScientificLabelPlacement =
  | "north"
  | "northeast"
  | "northwest"
  | "east"
  | "southeast"
  | "southwest"
  | "west"
  | "south";

interface PlanetLabelProps {
  active: boolean;
  color: string;
  mode: "exploration" | "scientific";
  placement: ScientificLabelPlacement;
  offsetY: number;
  positionCaption: string;
  selected: boolean;
  text: string;
}

function createLabelTexture(
  text: string,
  color: string,
  mode: "exploration" | "scientific",
  selected: boolean,
  positionCaption: string,
  placement: ScientificLabelPlacement,
): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = mode === "scientific" ? 640 : 512;
  canvas.height = mode === "scientific" ? 224 : 128;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  if (mode === "scientific") {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const offsets: Record<ScientificLabelPlacement, readonly [number, number]> =
      {
        north: [0, -86],
        northeast: [180, -68],
        northwest: [-180, -68],
        east: [196, 0],
        southeast: [174, 72],
        southwest: [-174, 72],
        west: [-196, 0],
        south: [0, 78],
      };
    const [labelX, labelY] = offsets[placement];
    const textX = centerX + labelX;
    const textY = centerY + labelY;
    context.strokeStyle = color;
    context.lineWidth = selected ? 6 : 4;
    context.globalAlpha = selected ? 1 : 0.86;
    context.beginPath();
    context.arc(centerX, centerY, selected ? 26 : 21, 0, Math.PI * 2);
    context.moveTo(centerX - 39, centerY);
    context.lineTo(centerX - 13, centerY);
    context.moveTo(centerX + 13, centerY);
    context.lineTo(centerX + 39, centerY);
    context.moveTo(centerX, centerY - 39);
    context.lineTo(centerX, centerY - 13);
    context.moveTo(centerX, centerY + 13);
    context.lineTo(centerX, centerY + 39);
    context.stroke();
    context.globalAlpha = 1;

    context.strokeStyle = color;
    context.globalAlpha = 0.62;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(centerX + labelX * 0.22, centerY + labelY * 0.22);
    context.lineTo(centerX + labelX * 0.72, centerY + labelY * 0.72);
    context.stroke();
    context.globalAlpha = 1;

    context.font =
      '650 32px ui-sans-serif, system-ui, -apple-system, "Segoe UI"';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "rgba(242, 239, 230, 0.98)";
    context.fillText(text, textX, textY);

    context.font =
      '600 12px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
    context.fillStyle = selected
      ? "rgba(242, 239, 230, 0.9)"
      : "rgba(155, 163, 176, 0.92)";
    context.fillText(positionCaption.toUpperCase(), textX, textY + 28);
  } else {
    context.font =
      '600 44px ui-sans-serif, system-ui, -apple-system, "Segoe UI"';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "rgba(242, 239, 230, 0.96)";
    context.fillText(text, 256, 52);
    context.fillStyle = color;
    context.fillRect(218, 96, 76, 3);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function PlanetLabel({
  active,
  color,
  mode,
  offsetY,
  placement,
  positionCaption,
  selected,
  text,
}: PlanetLabelProps) {
  const texture = useMemo(
    () =>
      createLabelTexture(
        text,
        color,
        mode,
        selected,
        positionCaption,
        placement,
      ),
    [color, mode, placement, positionCaption, selected, text],
  );
  const material = useMemo(
    () =>
      new SpriteMaterial({
        depthTest: false,
        depthWrite: false,
        map: texture,
        fog: false,
        opacity: active || mode === "scientific" ? 1 : 0.82,
        sizeAttenuation: mode !== "scientific",
        transparent: true,
      }),
    [active, mode, texture],
  );

  useEffect(
    () => () => {
      material.dispose();
      texture.dispose();
    },
    [material, texture],
  );

  const scientific = mode === "scientific";

  return (
    <sprite
      material={material}
      position={[0, scientific ? 0 : offsetY, 0]}
      raycast={() => undefined}
      renderOrder={20}
      scale={scientific ? [0.34, 0.142, 1] : [6.2, 1.55, 1]}
    />
  );
}
