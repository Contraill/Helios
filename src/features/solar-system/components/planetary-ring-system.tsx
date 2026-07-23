"use client";

import { AdditiveBlending, DoubleSide, NormalBlending } from "three";

import {
  PLANETARY_RING_PROFILES,
  planetaryRingOuterRadius,
  type PlanetaryRingBand,
  type ProceduralRingPlanetId,
} from "@/features/solar-system/lib/planetary-rings";

interface PlanetaryRingSystemProps {
  active: boolean;
  planetId: ProceduralRingPlanetId;
  radius: number;
  segments: number;
}

interface RingBandProps {
  band: PlanetaryRingBand;
  opacityMultiplier: number;
  planetId: ProceduralRingPlanetId;
  radius: number;
  segments: number;
  thetaLength?: number;
  thetaStart?: number;
}

function RingBand({
  band,
  opacityMultiplier,
  planetId,
  radius,
  segments,
  thetaLength = Math.PI * 2,
  thetaStart = 0,
}: RingBandProps) {
  const dusty = planetId !== "uranus";
  const complete = Math.abs(thetaLength - Math.PI * 2) < 1e-6;
  return (
    <mesh
      position-y={complete ? 0 : radius * 0.002}
      raycast={() => undefined}
      renderOrder={4}
      rotation-x={Math.PI / 2}
      scale={radius}
      userData={{
        testPlanetaryRingBandId: band.id,
        testPlanetaryRingComplete: complete,
        testPlanetaryRingOuterRadius: planetaryRingOuterRadius(planetId),
        testPlanetaryRingPlanetId: planetId,
        testPlanetaryRingThetaLength: thetaLength,
        testPlanetaryRingThetaStart: thetaStart,
        testRingParentTransform: "planet-equatorial",
      }}
    >
      <ringGeometry
        args={[
          band.innerRadius,
          band.outerRadius,
          segments,
          1,
          thetaStart,
          thetaLength,
        ]}
      />
      <meshBasicMaterial
        blending={dusty ? AdditiveBlending : NormalBlending}
        color={band.color}
        depthWrite={false}
        fog={false}
        opacity={Math.min(0.72, band.opacity * opacityMultiplier)}
        side={DoubleSide}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
}

export function PlanetaryRingSystem({
  active,
  planetId,
  radius,
  segments,
}: PlanetaryRingSystemProps) {
  const profile = PLANETARY_RING_PROFILES[planetId];
  const opacityMultiplier = 1.35 * (active ? 1.22 : 1);

  return (
    <group
      userData={{
        testPlanetaryRingArcCount: profile.arcs.length,
        testPlanetaryRingArcsOpen: profile.arcs.every(
          ({ arcLength }) => arcLength > 0 && arcLength < Math.PI * 2,
        ),
        testPlanetaryRingBandCount: profile.bands.length,
        testPlanetaryRingPlanetId: planetId,
        testRingParentTransform: "planet-equatorial",
        visualLayer: `${planetId}-rings`,
      }}
    >
      {profile.bands.map((ringBand) => (
        <RingBand
          band={ringBand}
          key={ringBand.id}
          opacityMultiplier={opacityMultiplier}
          planetId={planetId}
          radius={radius}
          segments={segments}
        />
      ))}
      {profile.arcs.map((ringArc) => (
        <RingBand
          band={ringArc}
          key={ringArc.id}
          opacityMultiplier={opacityMultiplier * 1.55}
          planetId={planetId}
          radius={radius}
          segments={Math.max(12, Math.ceil(segments * 0.25))}
          thetaLength={ringArc.arcLength}
          thetaStart={ringArc.arcStart}
        />
      ))}
    </group>
  );
}
