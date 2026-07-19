"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { AdditiveBlending, BackSide, Quaternion, Vector3 } from "three";
import type { Group, Mesh, PointsMaterial } from "three";

import {
  EXTENDED_BODIES,
  extendedBodyPosition,
  extendedBodyRadius,
  extendedOrbitPoints,
  type ExtendedBody,
  type SystemRegionId,
} from "@/features/solar-system/lib/extended-system";
import type { SceneQuality } from "@/features/solar-system/lib/quality";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import type { PlanetObjectRegistry } from "@/features/solar-system/types/planet-object-registry";
import { explorationScale, scientificScale } from "@/lib/calculations/scale";
import { useExplorationStore } from "@/stores/exploration-store";
import { useExtendedSystemStore } from "@/stores/extended-system-store";
import {
  currentSimulationTimeMs,
  useSimulationStore,
} from "@/stores/simulation-store";

import { OrbitPath } from "./orbit-path";
import { PlanetLabel } from "./planet-label";

interface ExtendedSolarSystemProps {
  labelsVisible: boolean;
  motionEnabled: boolean;
  orbitsVisible: boolean;
  planetObjects: PlanetObjectRegistry;
  quality: SceneQuality;
  scaleMode: ScaleMode;
}

function randomGenerator(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function orbitalParticlePositions(
  layer: "asteroid" | "kuiper",
  count: number,
  scaleMode: ScaleMode,
  cinematic: boolean,
) {
  const random = randomGenerator(layer === "asteroid" ? 0xa57e201 : 0x4b554950);
  const positions = new Float32Array(count * 3);
  const strategy =
    scaleMode === "scientific" ? scientificScale : explorationScale;

  for (let index = 0; index < count; index += 1) {
    const asteroid = layer === "asteroid";
    const semiMajorAxis = asteroid
      ? 2.05 + random() * 1.25
      : 30 + Math.pow(random(), 0.82) * 27;
    const eccentricity = asteroid ? random() * 0.18 : 0.02 + random() * 0.22;
    const inclinationDeg = asteroid
      ? Math.pow(random(), 2.4) * (cinematic ? 24 : 16)
      : Math.pow(random(), 1.8) * (cinematic ? 36 : 26);
    const anomaly = random() * Math.PI * 2;
    const radiusAu =
      (semiMajorAxis * (1 - eccentricity ** 2)) /
      (1 + eccentricity * Math.cos(anomaly));
    const sceneRadius = strategy.distanceFromAu(radiusAu);
    const inclination =
      ((random() < 0.5 ? -1 : 1) * inclinationDeg * Math.PI) / 180;
    const ascendingNode = random() * Math.PI * 2;
    const orbitalX = sceneRadius * Math.cos(anomaly);
    const orbitalZ = sceneRadius * Math.sin(anomaly) * Math.cos(inclination);
    positions[index * 3] =
      orbitalX * Math.cos(ascendingNode) + orbitalZ * Math.sin(ascendingNode);
    positions[index * 3 + 1] =
      sceneRadius * Math.sin(anomaly) * Math.sin(inclination);
    positions[index * 3 + 2] =
      -orbitalX * Math.sin(ascendingNode) + orbitalZ * Math.cos(ascendingNode);
  }
  return positions;
}

function shellParticlePositions(
  count: number,
  innerRadius: number,
  outerRadius: number,
  seed: number,
) {
  const random = randomGenerator(seed);
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const cosine = random() * 2 - 1;
    const azimuth = random() * Math.PI * 2;
    const sine = Math.sqrt(1 - cosine ** 2);
    const radius =
      innerRadius + Math.pow(random(), 0.6) * (outerRadius - innerRadius);
    positions[index * 3] = radius * sine * Math.cos(azimuth);
    positions[index * 3 + 1] = radius * cosine;
    positions[index * 3 + 2] = radius * sine * Math.sin(azimuth);
  }
  return positions;
}

function RegionRegistry({
  cameraFocusRadius,
  id,
  planetObjects,
  renderRadius,
}: {
  cameraFocusRadius: number;
  id: SystemRegionId;
  planetObjects: PlanetObjectRegistry;
  renderRadius: number;
}) {
  const ref = useRef<Group>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const registry = planetObjects.current;
    node.userData.renderRadius = renderRadius;
    node.userData.cameraFocusRadius = cameraFocusRadius;
    registry.set(id, node);
    return () => {
      registry.delete(id);
    };
  }, [cameraFocusRadius, id, planetObjects, renderRadius]);
  return <group ref={ref} />;
}

function BeltLayer({
  layer,
  planetObjects,
  quality,
  scaleMode,
}: {
  layer: "asteroid" | "kuiper";
  planetObjects: PlanetObjectRegistry;
  quality: SceneQuality;
  scaleMode: ScaleMode;
}) {
  const density = useExtendedSystemStore((state) => state.density);
  const representation = useExtendedSystemStore(
    (state) => state.representation,
  );
  const selectedBodyId = useExplorationStore((state) => state.selectedBodyId);
  const selectBody = useExplorationStore((state) => state.selectBody);
  const baseCount =
    density === "sparse" ? 320 : density === "detailed" ? 1_800 : 850;
  const count = Math.round(
    baseCount *
      (quality.textureVariant === "high"
        ? 1.7
        : quality.textureVariant === "low"
          ? 0.55
          : 1) *
      (representation === "cinematic" ? 1.45 : 1),
  );
  const positions = useMemo(
    () =>
      orbitalParticlePositions(
        layer,
        count,
        scaleMode,
        representation === "cinematic",
      ),
    [count, layer, representation, scaleMode],
  );
  const strategy =
    scaleMode === "scientific" ? scientificScale : explorationScale;
  const id: SystemRegionId =
    layer === "asteroid" ? "asteroid-belt" : "kuiper-belt";
  const focusRadius = strategy.distanceFromAu(layer === "asteroid" ? 3.3 : 57);
  const cameraFocusRadius =
    scaleMode === "scientific"
      ? layer === "asteroid"
        ? 8
        : 120
      : layer === "asteroid"
        ? 11
        : 18;
  const selected = selectedBodyId === id;

  return (
    <group userData={{ visualLayer: id }}>
      <RegionRegistry
        cameraFocusRadius={cameraFocusRadius}
        id={id}
        planetObjects={planetObjects}
        renderRadius={focusRadius}
      />
      <points
        frustumCulled={false}
        onClick={(event) => {
          event.stopPropagation();
          selectBody(id);
        }}
      >
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={layer === "asteroid" ? "#aa9a84" : "#9db8ce"}
          depthWrite={false}
          opacity={
            selected ? 0.92 : representation === "physical" ? 0.47 : 0.68
          }
          size={
            scaleMode === "scientific"
              ? 0.06
              : layer === "asteroid"
                ? 0.075
                : 0.065
          }
          sizeAttenuation
          transparent
        />
      </points>
    </group>
  );
}

function ExtendedBodyObject({
  body,
  labelsVisible,
  motionEnabled,
  orbitsVisible,
  planetObjects,
  quality,
  scaleMode,
}: {
  body: ExtendedBody;
  labelsVisible: boolean;
  motionEnabled: boolean;
  orbitsVisible: boolean;
  planetObjects: PlanetObjectRegistry;
  quality: SceneQuality;
  scaleMode: ScaleMode;
}) {
  const groupRef = useRef<Group>(null);
  const surfaceRef = useRef<Mesh>(null);
  const tailRef = useRef<Group>(null);
  const awayFromSun = useRef(new Vector3());
  const physicalPosition = useRef(new Vector3());
  const tailOrientation = useRef(new Quaternion());
  const tailAxis = useRef(new Vector3(0, -1, 0));
  const selected = useExplorationStore(
    (state) => state.selectedBodyId === body.id,
  );
  const hovered = useExplorationStore(
    (state) => state.hoveredBodyId === body.id,
  );
  const selectBody = useExplorationStore((state) => state.selectBody);
  const setHoveredBody = useExplorationStore((state) => state.setHoveredBody);
  const clearHoveredBody = useExplorationStore(
    (state) => state.clearHoveredBody,
  );
  const simulationAtMs = useSimulationStore((state) => state.simulationAtMs);
  const radius = extendedBodyRadius(body, scaleMode);
  const interactionRadius = Math.max(
    radius * 2,
    scaleMode === "scientific" ? 0.26 : 0.28,
  );
  const orbitPoints = useMemo(
    () => extendedOrbitPoints(body, scaleMode, quality.orbitSegments),
    [body, quality.orbitSegments, scaleMode],
  );
  const trailPositions = useMemo(
    () =>
      new Float32Array(
        orbitPoints
          .filter((_, index) => index % 3 === 0)
          .flatMap((point) => [...point]),
      ),
    [orbitPoints],
  );
  const active = selected || hovered;
  const isComet = body.kind === "comet";

  useLayoutEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    const registry = planetObjects.current;
    node.userData.renderRadius = interactionRadius;
    node.userData.extendedBodyId = body.id;
    registry.set(body.id, node);
    return () => {
      registry.delete(body.id);
    };
  }, [body.id, interactionRadius, planetObjects]);

  useFrame((_, delta) => {
    const node = groupRef.current;
    if (!node) return;
    const now = currentSimulationTimeMs(useSimulationStore.getState());
    const position = extendedBodyPosition(body, now, scaleMode);
    node.position.set(...position);
    if (motionEnabled && surfaceRef.current) {
      surfaceRef.current.rotation.y += delta * 0.09;
    }

    if (tailRef.current && isComet) {
      const away = awayFromSun.current.set(...position);
      if (away.lengthSq() > Number.EPSILON) away.normalize();
      tailRef.current.quaternion.copy(
        tailOrientation.current.setFromUnitVectors(tailAxis.current, away),
      );
      const physical = extendedBodyPosition(body, now, "scientific");
      const distanceAu =
        physicalPosition.current.set(...physical).length() / 12;
      const activity = Math.max(0, Math.min(1, (5.2 - distanceAu) / 4.2));
      tailRef.current.visible = activity > 0.015;
      tailRef.current.scale.setScalar(0.18 + activity * 0.82);
    }
  });

  const pointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHoveredBody(body.id);
  };
  const pointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    clearHoveredBody(body.id);
  };
  const click = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    selectBody(body.id);
  };

  const initialPosition = extendedBodyPosition(body, simulationAtMs, scaleMode);
  const tailLength = scaleMode === "scientific" ? 0.48 : 3.4;

  return (
    <>
      {orbitsVisible && active ? (
        <>
          <OrbitPath
            active={active}
            color={body.color}
            points={orbitPoints}
            segments={quality.orbitSegments}
            semiMajorAxis={1}
            semiMinorAxis={1}
          />
          {isComet && quality.textureVariant !== "low" ? (
            <points
              frustumCulled={false}
              raycast={() => undefined}
              userData={{ visualLayer: "comet-orbit-particle-trail" }}
            >
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[trailPositions, 3]}
                />
              </bufferGeometry>
              <pointsMaterial
                color="#c7b58e"
                depthWrite={false}
                opacity={active ? 0.28 : 0.1}
                size={0.035}
                transparent
              />
            </points>
          ) : null}
        </>
      ) : null}
      <group
        ref={groupRef}
        position={initialPosition as [number, number, number]}
      >
        <mesh ref={surfaceRef} scale={radius}>
          {body.kind === "asteroid" || isComet ? (
            <icosahedronGeometry
              args={[1, quality.textureVariant === "high" ? 3 : 2]}
            />
          ) : (
            <sphereGeometry
              args={[1, quality.planetSegments[0], quality.planetSegments[1]]}
            />
          )}
          <meshStandardMaterial
            color={body.color}
            metalness={0}
            roughness={0.92}
          />
        </mesh>

        {isComet ? (
          <group
            ref={tailRef}
            userData={{ visualLayer: "physical-comet-tails" }}
          >
            <mesh position={[0, -tailLength / 2, 0]}>
              <coneGeometry args={[0.36, tailLength, 18, 1, true]} />
              <meshBasicMaterial
                blending={AdditiveBlending}
                color="#e7c68f"
                depthWrite={false}
                opacity={0.24}
                side={BackSide}
                transparent
              />
            </mesh>
            <mesh
              position={[0.2, -tailLength * 0.64, 0]}
              scale={[0.34, 1.3, 0.34]}
            >
              <coneGeometry args={[0.2, tailLength, 14, 1, true]} />
              <meshBasicMaterial
                blending={AdditiveBlending}
                color="#65bfff"
                depthWrite={false}
                opacity={0.34}
                side={BackSide}
                transparent
              />
            </mesh>
            <mesh scale={Math.max(radius * 3.8, 0.16)}>
              <sphereGeometry args={[1, 20, 14]} />
              <meshBasicMaterial
                blending={AdditiveBlending}
                color="#dff6e8"
                depthWrite={false}
                opacity={0.34}
                transparent
              />
            </mesh>
          </group>
        ) : null}

        {scaleMode === "scientific" ? (
          <mesh raycast={() => undefined} scale={active ? 0.16 : 0.1}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial
              color={body.color}
              depthWrite={false}
              opacity={active ? 0.8 : 0.46}
              transparent
            />
          </mesh>
        ) : null}

        <mesh
          onClick={click}
          onPointerOut={pointerOut}
          onPointerOver={pointerOver}
          scale={interactionRadius}
        >
          <sphereGeometry args={[1, 12, 8]} />
          <meshBasicMaterial depthWrite={false} opacity={0} transparent />
        </mesh>

        {labelsVisible && active ? (
          <PlanetLabel
            active
            color={body.color}
            compact
            mode={scaleMode}
            offsetY={interactionRadius + 0.7}
            placement="north"
            positionCaption={
              isComet ? "ANTI-SOLAR TAIL" : "REPRESENTATIVE ORBIT"
            }
            selected={selected}
            text={body.name}
          />
        ) : null}
      </group>
    </>
  );
}

function OortCloud({
  planetObjects,
  quality,
  scaleMode,
}: Pick<ExtendedSolarSystemProps, "planetObjects" | "quality" | "scaleMode">) {
  const innerMaterialRef = useRef<PointsMaterial>(null);
  const outerMaterialRef = useRef<PointsMaterial>(null);
  const strategy =
    scaleMode === "scientific" ? scientificScale : explorationScale;
  const innerRadius = strategy.distanceFromAu(2_000);
  const outerRadius = strategy.distanceFromAu(100_000);
  const count =
    quality.textureVariant === "high"
      ? 1_500
      : quality.textureVariant === "medium"
        ? 700
        : 260;
  const splitRadius = strategy.distanceFromAu(20_000);
  const innerPositions = useMemo(
    () =>
      shellParticlePositions(
        Math.round(count * 0.42),
        innerRadius,
        splitRadius,
        0x00a7c10d,
      ),
    [count, innerRadius, splitRadius],
  );
  const outerPositions = useMemo(
    () =>
      shellParticlePositions(
        Math.round(count * 0.58),
        splitRadius,
        outerRadius,
        0x0b71c10d,
      ),
    [count, outerRadius, splitRadius],
  );
  const selected = useExplorationStore(
    (state) => state.selectedBodyId === "oort-cloud",
  );
  const selectBody = useExplorationStore((state) => state.selectBody);

  useFrame(({ camera }) => {
    const revealStart = scaleMode === "scientific" ? 650 : 145;
    const reveal = Math.min(
      0.34,
      Math.max(0, (camera.position.length() - revealStart) / revealStart) *
        0.34,
    );
    if (innerMaterialRef.current) innerMaterialRef.current.opacity = reveal;
    if (outerMaterialRef.current) {
      outerMaterialRef.current.opacity = reveal * 0.62;
    }
  });

  return (
    <group
      userData={{
        dataCertainty: "inferred",
        visualLayer: "oort-cloud-schematic",
      }}
    >
      <RegionRegistry
        cameraFocusRadius={scaleMode === "scientific" ? 520 : 42}
        id="oort-cloud"
        planetObjects={planetObjects}
        renderRadius={scaleMode === "scientific" ? 720 : 165}
      />
      {[
        {
          color: selected ? "#c7e4ff" : "#88a6c2",
          layer: "inner-oort-cloud",
          positions: innerPositions,
          ref: innerMaterialRef,
        },
        {
          color: selected ? "#a8d3fb" : "#627f9e",
          layer: "outer-oort-cloud",
          positions: outerPositions,
          ref: outerMaterialRef,
        },
      ].map((cloud) => (
        <points
          frustumCulled={false}
          key={cloud.layer}
          onClick={(event) => {
            event.stopPropagation();
            selectBody("oort-cloud");
          }}
          userData={{ visualLayer: cloud.layer }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[cloud.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={cloud.ref}
            color={cloud.color}
            depthWrite={false}
            fog={false}
            opacity={0}
            size={scaleMode === "scientific" ? 1.35 : 0.9}
            sizeAttenuation={false}
            transparent
          />
        </points>
      ))}
    </group>
  );
}

function DustAndMeteorLayer({
  quality,
  scaleMode,
}: Pick<ExtendedSolarSystemProps, "quality" | "scaleMode">) {
  const strategy =
    scaleMode === "scientific" ? scientificScale : explorationScale;
  const radius = strategy.distanceFromAu(2.8);
  const dust = useMemo(
    () =>
      shellParticlePositions(
        quality.textureVariant === "high" ? 520 : 180,
        radius * 0.15,
        radius,
        0xd0572026,
      ),
    [quality.textureVariant, radius],
  );
  return (
    <group
      rotation-x={0.12}
      scale={[1, 0.075, 1]}
      userData={{ visualLayer: "zodiacal-dust-and-meteor-streams" }}
    >
      <points frustumCulled={false} raycast={() => undefined}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial
          blending={AdditiveBlending}
          color="#d4b27b"
          depthWrite={false}
          opacity={0.18}
          size={0.04}
          transparent
        />
      </points>
      {quality.textureVariant !== "low"
        ? [0.91, 1, 1.08].map((scale, index) => (
            <mesh
              key={scale}
              rotation-x={Math.PI / 2 + index * 0.12}
              scale={scale}
            >
              <torusGeometry
                args={[strategy.distanceFromAu(1), 0.012, 4, 128]}
              />
              <meshBasicMaterial
                color={["#6aa7d8", "#c5a469", "#9b78bd"][index]}
                depthWrite={false}
                opacity={0.13}
                transparent
              />
            </mesh>
          ))
        : null}
    </group>
  );
}

function Heliosphere({
  planetObjects,
  quality,
  scaleMode,
}: Pick<ExtendedSolarSystemProps, "planetObjects" | "quality" | "scaleMode">) {
  const strategy =
    scaleMode === "scientific" ? scientificScale : explorationScale;
  const termination = strategy.distanceFromAu(84);
  const heliopause = strategy.distanceFromAu(121);
  const windPositions = useMemo(
    () =>
      shellParticlePositions(
        quality.textureVariant === "high" ? 620 : 220,
        1.5,
        heliopause,
        0x501a2eed,
      ),
    [heliopause, quality.textureVariant],
  );
  const selectBody = useExplorationStore((state) => state.selectBody);
  const earthDistance = strategy.distanceFromAu(1);
  const missionMarkers = [
    { name: "Parker Solar Probe", distanceAu: 0.08, angle: 0.48 },
    { name: "Voyager 1", distanceAu: 165, angle: 0.62 },
    { name: "Voyager 2", distanceAu: 137, angle: -0.78 },
  ] as const;
  return (
    <group userData={{ visualLayer: "solar-wind-heliosphere" }}>
      <RegionRegistry
        cameraFocusRadius={scaleMode === "scientific" ? 240 : 24}
        id="heliosphere"
        planetObjects={planetObjects}
        renderRadius={heliopause}
      />
      {[
        { radius: termination, color: "#5b9ac8", opacity: 0.045 },
        { radius: heliopause, color: "#7d6fd3", opacity: 0.055 },
      ].map((shell) => (
        <mesh
          key={shell.radius}
          onClick={(event) => {
            event.stopPropagation();
            selectBody("heliosphere");
          }}
          scale={shell.radius}
        >
          <sphereGeometry args={[1, 48, 32]} />
          <meshBasicMaterial
            color={shell.color}
            depthWrite={false}
            opacity={shell.opacity}
            side={BackSide}
            transparent
            wireframe
          />
        </mesh>
      ))}
      <points frustumCulled={false} raycast={() => undefined}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[windPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          blending={AdditiveBlending}
          color="#72b8e5"
          depthWrite={false}
          opacity={0.14}
          size={0.035}
          transparent
        />
      </points>
      <mesh
        position={[earthDistance / 2, 0, 0]}
        rotation-z={Math.PI / 2}
        userData={{ visualLayer: "donki-cme-sun-earth-context" }}
      >
        <coneGeometry
          args={[
            scaleMode === "scientific" ? 0.1 : 0.65,
            earthDistance,
            24,
            1,
            true,
          ]}
        />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#74b9e6"
          depthWrite={false}
          opacity={0.05}
          transparent
        />
      </mesh>
      {missionMarkers.map((marker) => {
        const distance = strategy.distanceFromAu(marker.distanceAu);
        return (
          <group
            key={marker.name}
            position={[
              Math.cos(marker.angle) * distance,
              Math.sin(marker.angle * 0.4) * distance * 0.12,
              Math.sin(marker.angle) * distance,
            ]}
            userData={{ visualLayer: "mission-context-marker" }}
          >
            <mesh scale={scaleMode === "scientific" ? 0.12 : 0.09}>
              <octahedronGeometry args={[1, 0]} />
              <meshBasicMaterial color="#d5e6f2" toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function ExtendedSolarSystem({
  labelsVisible,
  motionEnabled,
  orbitsVisible,
  planetObjects,
  quality,
  scaleMode,
}: ExtendedSolarSystemProps) {
  const asteroidBeltVisible = useExtendedSystemStore(
    (state) => state.asteroidBeltVisible,
  );
  const kuiperBeltVisible = useExtendedSystemStore(
    (state) => state.kuiperBeltVisible,
  );
  const cometsVisible = useExtendedSystemStore((state) => state.cometsVisible);
  const oortCloudVisible = useExtendedSystemStore(
    (state) => state.oortCloudVisible,
  );
  const dustVisible = useExtendedSystemStore((state) => state.dustVisible);
  const heliosphereVisible = useExtendedSystemStore(
    (state) => state.heliosphereVisible,
  );

  const bodies = EXTENDED_BODIES.filter(
    (body) => body.kind !== "comet" || cometsVisible,
  );

  return (
    <>
      {asteroidBeltVisible ? (
        <BeltLayer
          layer="asteroid"
          planetObjects={planetObjects}
          quality={quality}
          scaleMode={scaleMode}
        />
      ) : null}
      {kuiperBeltVisible ? (
        <BeltLayer
          layer="kuiper"
          planetObjects={planetObjects}
          quality={quality}
          scaleMode={scaleMode}
        />
      ) : null}
      {bodies.map((body) => (
        <ExtendedBodyObject
          key={body.id}
          body={body}
          labelsVisible={labelsVisible}
          motionEnabled={motionEnabled}
          orbitsVisible={orbitsVisible}
          planetObjects={planetObjects}
          quality={quality}
          scaleMode={scaleMode}
        />
      ))}
      {oortCloudVisible ? (
        <OortCloud
          planetObjects={planetObjects}
          quality={quality}
          scaleMode={scaleMode}
        />
      ) : null}
      {dustVisible && quality.textureVariant !== "low" ? (
        <DustAndMeteorLayer quality={quality} scaleMode={scaleMode} />
      ) : null}
      {heliosphereVisible ? (
        <Heliosphere
          planetObjects={planetObjects}
          quality={quality}
          scaleMode={scaleMode}
        />
      ) : null}
    </>
  );
}
