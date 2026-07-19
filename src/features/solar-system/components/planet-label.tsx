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
  compact?: boolean;
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
  const logicalWidth = mode === "scientific" ? 640 : 512;
  const logicalHeight = mode === "scientific" ? 224 : 128;
  const pixelRatio = mode === "scientific" ? 2 : 3;
  const canvas = document.createElement("canvas");
  canvas.width = logicalWidth * pixelRatio;
  canvas.height = logicalHeight * pixelRatio;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable.");

  context.scale(pixelRatio, pixelRatio);
  context.clearRect(0, 0, logicalWidth, logicalHeight);

  if (mode === "scientific") {
    const centerX = logicalWidth / 2;
    const centerY = logicalHeight / 2;
    const offsets: Record<ScientificLabelPlacement, readonly [number, number]> =
      {
        north: [0, -84],
        northeast: [178, -66],
        northwest: [-178, -66],
        east: [198, 0],
        southeast: [174, 70],
        southwest: [-174, 70],
        west: [-198, 0],
        south: [0, 80],
      };
    const [labelX, labelY] = offsets[placement];
    const textX = centerX + labelX;
    const textY = centerY + labelY;

    context.strokeStyle = color;
    context.globalAlpha = selected ? 0.82 : 0.46;
    context.lineWidth = selected ? 3 : 2;
    context.beginPath();
    context.moveTo(centerX + labelX * 0.2, centerY + labelY * 0.2);
    context.lineTo(centerX + labelX * 0.72, centerY + labelY * 0.72);
    context.stroke();
    context.globalAlpha = 1;

    context.font =
      '650 32px ui-sans-serif, system-ui, -apple-system, "Segoe UI"';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "rgba(242, 239, 230, 0.98)";
    context.fillText(text, textX, textY);

    context.fillStyle = color;
    context.fillRect(textX - 24, textY + 22, 48, selected ? 3 : 2);

    if (positionCaption) {
      context.font =
        '600 12px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
      context.fillStyle = selected
        ? "rgba(242, 239, 230, 0.9)"
        : "rgba(155, 163, 176, 0.92)";
      context.fillText(positionCaption.toUpperCase(), textX, textY + 43);
    }
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
  texture.anisotropy = 8;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function PlanetLabel({
  active,
  color,
  compact = false,
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
        // Passive scientific labels respect scene depth; the one actively
        // inspected body may float above geometry for unambiguous feedback.
        depthTest: !active,
        depthWrite: false,
        map: texture,
        fog: false,
        opacity: active || mode === "scientific" ? 1 : 0.82,
        sizeAttenuation: false,
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
  const scale: [number, number, number] = compact
    ? scientific
      ? [0.14, 0.058, 1]
      : [0.14, 0.035, 1]
    : scientific
      ? active
        ? [0.22, 0.092, 1]
        : [0.105, 0.044, 1]
      : [0.2, 0.05, 1];

  return (
    <sprite
      material={material}
      position={[0, scientific ? 0 : offsetY, 0]}
      raycast={() => undefined}
      renderOrder={20}
      scale={scale}
    />
  );
}
