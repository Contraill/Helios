"use client";

import { useEffect, useMemo } from "react";
import {
  CanvasTexture,
  LinearFilter,
  SRGBColorSpace,
  SpriteMaterial,
} from "three";

interface ScientificPlanetMarkerProps {
  active: boolean;
  color: string;
  selected: boolean;
}

function hexToRgb(hex: string): readonly [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255] as const;
}

function createMarkerTexture(
  color: string,
  active: boolean,
  selected: boolean,
): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is unavailable.");

  const [red, green, blue] = hexToRgb(color);
  const center = 128;
  const bodyRadius = selected ? 48 : active ? 43 : 39;

  const halo = context.createRadialGradient(
    center,
    center,
    bodyRadius * 0.7,
    center,
    center,
    selected ? 92 : 78,
  );
  halo.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 0.32)`);
  halo.addColorStop(0.55, `rgba(${red}, ${green}, ${blue}, 0.12)`);
  halo.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
  context.fillStyle = halo;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const body = context.createRadialGradient(
    105,
    94,
    8,
    center,
    center,
    bodyRadius,
  );
  body.addColorStop(0, "rgba(255, 255, 255, 0.96)");
  body.addColorStop(
    0.16,
    `rgba(${Math.min(red + 60, 255)}, ${Math.min(green + 60, 255)}, ${Math.min(blue + 60, 255)}, 0.98)`,
  );
  body.addColorStop(0.62, `rgba(${red}, ${green}, ${blue}, 1)`);
  body.addColorStop(
    1,
    `rgba(${Math.round(red * 0.28)}, ${Math.round(green * 0.28)}, ${Math.round(blue * 0.28)}, 1)`,
  );

  context.beginPath();
  context.arc(center, center, bodyRadius, 0, Math.PI * 2);
  context.fillStyle = body;
  context.fill();

  context.save();
  context.beginPath();
  context.arc(center, center, bodyRadius - 1, 0, Math.PI * 2);
  context.clip();
  context.globalAlpha = selected ? 0.28 : 0.18;
  context.strokeStyle = "rgba(255, 255, 255, 0.8)";
  context.lineWidth = selected ? 5 : 4;
  context.beginPath();
  context.ellipse(
    center + 3,
    center + 6,
    bodyRadius * 0.92,
    bodyRadius * 0.24,
    -0.16,
    0,
    Math.PI * 2,
  );
  context.stroke();
  context.globalAlpha = active ? 0.22 : 0.12;
  context.beginPath();
  context.ellipse(
    center - 4,
    center - 12,
    bodyRadius * 0.82,
    bodyRadius * 0.13,
    0.24,
    0,
    Math.PI * 2,
  );
  context.stroke();
  context.restore();

  context.beginPath();
  context.arc(center, center, bodyRadius + (selected ? 10 : 7), 0, Math.PI * 2);
  context.strokeStyle = selected
    ? "rgba(242, 239, 230, 0.92)"
    : `rgba(${red}, ${green}, ${blue}, 0.7)`;
  context.lineWidth = selected ? 3 : 2;
  context.stroke();

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function ScientificPlanetMarker({
  active,
  color,
  selected,
}: ScientificPlanetMarkerProps) {
  const texture = useMemo(
    () => createMarkerTexture(color, active, selected),
    [active, color, selected],
  );
  const material = useMemo(
    () =>
      new SpriteMaterial({
        depthTest: false,
        depthWrite: false,
        fog: false,
        map: texture,
        sizeAttenuation: false,
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

  const size = selected ? 0.105 : active ? 0.088 : 0.074;

  return (
    <sprite
      material={material}
      raycast={() => undefined}
      renderOrder={19}
      scale={[size, size, 1]}
    />
  );
}
