"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useCelestialPointerInteraction } from "@/features/solar-system/hooks/use-celestial-pointer-interaction";
import { setCameraTargetMetadata } from "@/features/solar-system/lib/camera-runtime";
import type { ThreeEvent } from "@react-three/fiber";
import { AdditiveBlending, BackSide, Quaternion, Vector3 } from "three";
import type { Group, PointsMaterial } from "three";

import {
  EXTENDED_BODIES,
  cometTailState,
  extendedBodyPosition,
  extendedBodyRadius,
  extendedOrbitPoints,
  type ExtendedBody,
  type SystemRegionId,
} from "@/features/solar-system/lib/extended-system";
import { visualProfileFor } from "@/features/solar-system/lib/celestial-visual-registry";
import {
  labelPriorityForBody,
  shouldMountLabel,
} from "@/features/solar-system/lib/label-visibility-policy";
import { extendedBodyOrbitVisibility } from "@/features/solar-system/lib/orbit-visibility-policy";
import { effectiveBodyVisibility } from "@/features/solar-system/lib/scene-visibility-policy";
import type { SceneQuality } from "@/features/solar-system/lib/quality";
import {
  sceneProfileFor,
  type SceneProfile,
} from "@/features/solar-system/lib/scene-profiles";
import { isDwarfSystemParentId } from "@/features/solar-system/types/celestial-body";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import type { PlanetObjectRegistry } from "@/features/solar-system/types/planet-object-registry";
import { useExplorationStore } from "@/stores/exploration-store";
import { useSceneVisibilityStore } from "@/stores/scene-visibility-store";
import { useExtendedSystemStore } from "@/stores/extended-system-store";
import {
  currentSimulationTimeMs,
  useSimulationStore,
} from "@/stores/simulation-store";

import { CelestialVisualSurface } from "./celestial-visual-surface";
import {
  DwarfSatelliteSystem,
  dwarfParentVisualOffset,
} from "./dwarf-satellite-system";
import { OrbitPath } from "./orbit-path";
import { PlanetLabel } from "./planet-label";

const DISABLED_RAYCAST = () => undefined;

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
  profile: SceneProfile,
  cinematic: boolean,
) {
  const random = randomGenerator(layer === "asteroid" ? 0xa57e201 : 0x4b554950);
  const positions = new Float32Array(count * 3);
  const strategy = profile.scale.strategy;

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
  systemExtent,
}: {
  cameraFocusRadius: number;
  id: SystemRegionId;
  planetObjects: PlanetObjectRegistry;
  renderRadius: number;
  systemExtent?: number;
}) {
  const ref = useRef<Group>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const registry = planetObjects.current;
    node.userData.renderRadius = renderRadius;
    node.userData.cameraFocusRadius = cameraFocusRadius;
    setCameraTargetMetadata(node, {
      bodyId: id,
      targetKind: "region",
      renderRadius,
      collisionRadius: Math.max(0.01, cameraFocusRadius * 0.12),
      focusRadius: cameraFocusRadius,
      systemExtent: systemExtent ?? cameraFocusRadius,
    });
    registry.set(id, node);
    return () => {
      registry.delete(id);
    };
  }, [cameraFocusRadius, id, planetObjects, renderRadius, systemExtent]);
  return <group ref={ref} userData={{ bodyId: id, testBodyRoot: true }} />;
}

function BeltLayer({
  layer,
  planetObjects,
  scaleMode,
  visible,
}: {
  layer: "asteroid" | "kuiper";
  planetObjects: PlanetObjectRegistry;
  scaleMode: ScaleMode;
  visible: boolean;
}) {
  const density = useExtendedSystemStore((state) => state.density);
  const representation = useExtendedSystemStore(
    (state) => state.representation,
  );
  const selectedBodyId = useExplorationStore((state) => state.selectedBodyId);
  const baseCount =
    density === "sparse" ? 320 : density === "detailed" ? 1_800 : 850;
  const count = Math.round(
    baseCount * 1.7 * (representation === "cinematic" ? 1.45 : 1),
  );
  const profile = sceneProfileFor(scaleMode);
  const positions = useMemo(
    () =>
      orbitalParticlePositions(
        layer,
        count,
        profile,
        representation === "cinematic",
      ),
    [count, layer, profile, representation],
  );
  const strategy = profile.scale.strategy;
  const id: SystemRegionId =
    layer === "asteroid" ? "asteroid-belt" : "kuiper-belt";
  const focusRadius = strategy.distanceFromAu(layer === "asteroid" ? 3.3 : 57);
  const cameraFocusRadius = profile.extended.beltCameraFocusRadius[layer];
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
        raycast={DISABLED_RAYCAST}
        userData={{ testInteractiveBodyId: id }}
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
          size={profile.extended.beltPointSize[layer]}
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
  const surfaceRef = useRef<Group>(null);
  const tailRef = useRef<Group>(null);
  const awayFromSun = useRef(new Vector3());
  const tailOrientation = useRef(new Quaternion());
  const tailAxis = useRef(new Vector3(0, -1, 0));
  const scenePositionRef = useRef<[number, number, number]>([0, 0, 0]);
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
  const profile = sceneProfileFor(scaleMode);
  const radius = extendedBodyRadius(body, profile.id);
  const interactionRadius = Math.max(
    radius * 2,
    profile.extended.minimumInteractionRadius,
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
  const visualProfile = visualProfileFor(body.id);
  const cometVisual = visualProfile.comet;
  const dwarfSystemParent = isDwarfSystemParentId(body.id);
  const parentVisualOffset = dwarfSystemParent
    ? dwarfParentVisualOffset(body.id, radius)
    : ([0, 0, 0] as const);
  const visible = useSceneVisibilityStore((state) =>
    effectiveBodyVisibility(body.id, state),
  );
  const labelPriority = labelPriorityForBody(body.kind, {
    bodyVisible: visible,
    hovered,
    labelsVisible,
    scaleMode,
    selected,
  });
  const orbitEmphasis = extendedBodyOrbitVisibility(body.id, {
    bodyVisible: visible,
    orbitsVisible,
    selectedBodyId: selected ? body.id : null,
    hoveredBodyId: hovered ? body.id : null,
  });

  useLayoutEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    const registry = planetObjects.current;
    node.userData.renderRadius = interactionRadius;
    node.userData.bodyId = body.id;
    node.userData.extendedBodyId = body.id;
    node.userData.representationType = body.representation.representationType;
    node.userData.referenceFrame = body.representation.referenceFrame;
    setCameraTargetMetadata(node, {
      bodyId: body.id,
      targetKind: dwarfSystemParent ? "system" : "body",
      renderRadius: radius,
      collisionRadius: radius,
      focusRadius: isComet
        ? Math.max(radius * 3.8, interactionRadius)
        : interactionRadius,
      systemExtent: dwarfSystemParent ? interactionRadius * 3.5 : undefined,
    });
    registry.set(body.id, node);
    return () => {
      registry.delete(body.id);
    };
  }, [
    body.id,
    body.representation.referenceFrame,
    body.representation.representationType,
    interactionRadius,
    isComet,
    dwarfSystemParent,
    planetObjects,
    radius,
  ]);

  useFrame((_, delta) => {
    const node = groupRef.current;
    if (!node) return;
    const now = currentSimulationTimeMs(useSimulationStore.getState());
    const position = extendedBodyPosition(
      body,
      now,
      scaleMode,
      scenePositionRef.current,
    );
    node.position.set(...position);
    if (motionEnabled && surfaceRef.current) {
      surfaceRef.current.rotation.y += delta * 0.09;
    }

    if (tailRef.current && isComet) {
      const tail = cometTailState(body, now, scenePositionRef.current);
      const away = awayFromSun.current.set(...tail.antiSolarDirection);
      tailRef.current.quaternion.copy(
        tailOrientation.current.setFromUnitVectors(tailAxis.current, away),
      );
      tailRef.current.visible = tail.visible;
      tailRef.current.scale.setScalar(tail.lengthScale);
      tailRef.current.userData.heliocentricDistanceAu =
        tail.heliocentricDistanceAu;
      tailRef.current.userData.activity = tail.activity;
      tailRef.current.userData.antiSolarDirection = [
        tail.antiSolarDirection[0],
        tail.antiSolarDirection[1],
        tail.antiSolarDirection[2],
      ];
    }
  });

  const pointerOver = (event: ThreeEvent<PointerEvent>) => {
    if (!visible) return;
    event.stopPropagation();
    setHoveredBody(body.id);
  };
  const pointerOut = (event: ThreeEvent<PointerEvent>) => {
    if (!visible) return;
    event.stopPropagation();
    clearHoveredBody(body.id);
  };

  const pointerInteraction = useCelestialPointerInteraction({
    bodyId: body.id,
    enabled: visible,
    onSelect: selectBody,
  });

  const initialPosition = extendedBodyPosition(
    body,
    simulationAtMs,
    profile.id,
  );
  const tailLength =
    cometVisual?.dustLength ?? profile.extended.cometTailLength;
  const ionTailLength = cometVisual?.ionLength ?? tailLength * 1.25;

  return (
    <>
      <OrbitPath
        bodyId={body.id}
        color={body.color}
        emphasis={orbitEmphasis}
        orbitClass="extended"
        points={orbitPoints}
        segments={quality.orbitSegments}
        semiMajorAxis={1}
        semiMinorAxis={1}
      />
      {isComet && active && visible ? (
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
            opacity={0.28}
            size={0.035}
            transparent
          />
        </points>
      ) : null}
      <group
        ref={groupRef}
        position={initialPosition as [number, number, number]}
        userData={{ bodyId: body.id, visualLayer: "extended-body-system" }}
      >
        <group
          visible={visible}
          userData={{ bodyId: body.id, testBodyRoot: true }}
        >
          <CelestialVisualSurface
            bodyId={body.id}
            textureLoadPolicy="scheduled"
            position={parentVisualOffset}
            radius={radius}
            rootRef={surfaceRef}
          />

          {isComet ? (
            <group
              ref={tailRef}
              userData={{
                testCometBodyId: body.id,
                visualLayer: "physical-comet-tails",
              }}
            >
              <mesh position={[0, -tailLength / 2, 0]}>
                <coneGeometry
                  args={[
                    cometVisual?.dustWidth ?? 0.3,
                    tailLength,
                    24,
                    1,
                    true,
                  ]}
                />
                <meshBasicMaterial
                  blending={AdditiveBlending}
                  color={cometVisual?.dustColor ?? "#e7c68f"}
                  depthWrite={false}
                  opacity={0.28}
                  side={BackSide}
                  transparent
                />
              </mesh>
              <mesh position={[0.12, -ionTailLength / 2, 0]}>
                <coneGeometry
                  args={[
                    cometVisual?.ionWidth ?? 0.2,
                    ionTailLength,
                    18,
                    1,
                    true,
                  ]}
                />
                <meshBasicMaterial
                  blending={AdditiveBlending}
                  color={cometVisual?.ionColor ?? "#65bfff"}
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
                  color={cometVisual?.comaColor ?? "#dff6e8"}
                  depthWrite={false}
                  opacity={0.34}
                  transparent
                />
              </mesh>
            </group>
          ) : null}

          <mesh
            raycast={visible ? undefined : DISABLED_RAYCAST}
            {...pointerInteraction}
            onPointerOut={pointerOut}
            onPointerOver={pointerOver}
            scale={interactionRadius}
            userData={{ testInteractiveBodyId: body.id }}
          >
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial depthWrite={false} opacity={0} transparent />
          </mesh>

          {shouldMountLabel(labelPriority) ? (
            <PlanetLabel
              active
              bodyId={body.id}
              color={body.color}
              compact
              mode={scaleMode}
              offsetY={interactionRadius + 0.7}
              placement="north"
              priority={labelPriority}
              positionCaption={
                isComet ? "ANTI-SOLAR TAIL" : "REPRESENTATIVE ORBIT"
              }
              selected={selected}
              text={body.name}
            />
          ) : null}
        </group>

        {dwarfSystemParent ? (
          <DwarfSatelliteSystem
            parentId={body.id}
            parentMeanRadiusKm={body.meanRadiusKm}
            parentRadius={radius}
            planetObjects={planetObjects}
            scaleMode={scaleMode}
          />
        ) : null}
      </group>
    </>
  );
}

function OortCloud({
  planetObjects,
  scaleMode,
  visible,
}: Pick<ExtendedSolarSystemProps, "planetObjects" | "scaleMode"> & {
  visible: boolean;
}) {
  const innerMaterialRef = useRef<PointsMaterial>(null);
  const outerMaterialRef = useRef<PointsMaterial>(null);
  const profile = sceneProfileFor(scaleMode);
  const strategy = profile.scale.strategy;
  const innerRadius = strategy.distanceFromAu(2_000);
  const outerRadius = strategy.distanceFromAu(100_000);
  const count = 1_500;
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
  useFrame(({ camera }) => {
    const revealStart = profile.extended.oort.revealStart;
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
        cameraFocusRadius={profile.extended.oort.cameraFocusRadius}
        id="oort-cloud"
        planetObjects={planetObjects}
        renderRadius={profile.extended.oort.renderRadius}
        systemExtent={profile.extended.oort.renderRadius}
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
          raycast={DISABLED_RAYCAST}
          userData={{
            testInteractiveBodyId: "oort-cloud",
            visualLayer: cloud.layer,
          }}
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
            size={profile.extended.oort.pointSize}
            sizeAttenuation={false}
            transparent
          />
        </points>
      ))}
    </group>
  );
}

function DustAndMeteorLayer({
  scaleMode,
}: Pick<ExtendedSolarSystemProps, "scaleMode">) {
  const strategy = sceneProfileFor(scaleMode).scale.strategy;
  const radius = strategy.distanceFromAu(2.8);
  const dust = shellParticlePositions(520, radius * 0.15, radius, 0xd0572026);
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
      {[0.91, 1, 1.08].map((scale, index) => (
        <mesh
          key={scale}
          raycast={DISABLED_RAYCAST}
          rotation-x={Math.PI / 2 + index * 0.12}
          scale={scale}
        >
          <torusGeometry args={[strategy.distanceFromAu(1), 0.012, 4, 128]} />
          <meshBasicMaterial
            color={["#6aa7d8", "#c5a469", "#9b78bd"][index]}
            depthWrite={false}
            opacity={0.13}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

function Heliosphere({
  planetObjects,
  scaleMode,
  visible,
}: Pick<ExtendedSolarSystemProps, "planetObjects" | "scaleMode"> & {
  visible: boolean;
}) {
  const profile = sceneProfileFor(scaleMode);
  const strategy = profile.scale.strategy;
  const termination = strategy.distanceFromAu(84);
  const heliopause = strategy.distanceFromAu(121);
  const windPositions = useMemo(() => {
    const stageHeliopause =
      sceneProfileFor(scaleMode).scale.strategy.distanceFromAu(121);
    return shellParticlePositions(620, 1.5, stageHeliopause, 0x501a2eed);
  }, [scaleMode]);
  const earthDistance = strategy.distanceFromAu(1);
  const missionMarkers = [
    { name: "Parker Solar Probe", distanceAu: 0.08, angle: 0.48 },
    { name: "Voyager 1", distanceAu: 165, angle: 0.62 },
    { name: "Voyager 2", distanceAu: 137, angle: -0.78 },
  ] as const;
  return (
    <group userData={{ visualLayer: "solar-wind-heliosphere" }}>
      <RegionRegistry
        cameraFocusRadius={profile.extended.heliosphere.cameraFocusRadius}
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
          raycast={DISABLED_RAYCAST}
          userData={{ testInteractiveBodyId: "heliosphere" }}
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
        raycast={DISABLED_RAYCAST}
        rotation-z={Math.PI / 2}
        userData={{ visualLayer: "donki-cme-sun-earth-context" }}
      >
        <coneGeometry
          args={[
            profile.extended.heliosphere.cmeConeRadius,
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
            <mesh scale={profile.extended.heliosphere.missionMarkerScale}>
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
  const dustVisible = useExtendedSystemStore((state) => state.dustVisible);
  const asteroidBeltVisible = useSceneVisibilityStore((state) =>
    effectiveBodyVisibility("asteroid-belt", state),
  );
  const kuiperBeltVisible = useSceneVisibilityStore((state) =>
    effectiveBodyVisibility("kuiper-belt", state),
  );
  const oortVisible = useSceneVisibilityStore((state) =>
    effectiveBodyVisibility("oort-cloud", state),
  );
  const heliosphereVisible = useSceneVisibilityStore((state) =>
    effectiveBodyVisibility("heliosphere", state),
  );
  const regionsVisible = useSceneVisibilityStore(
    (state) => state.categories.regions,
  );

  return (
    <>
      <group visible={asteroidBeltVisible}>
        <BeltLayer
          layer="asteroid"
          planetObjects={planetObjects}
          scaleMode={scaleMode}
          visible={asteroidBeltVisible}
        />
      </group>
      <group visible={kuiperBeltVisible}>
        <BeltLayer
          layer="kuiper"
          planetObjects={planetObjects}
          scaleMode={scaleMode}
          visible={kuiperBeltVisible}
        />
      </group>
      {EXTENDED_BODIES.map((body) => (
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
      <group visible={oortVisible}>
        <OortCloud
          planetObjects={planetObjects}
          scaleMode={scaleMode}
          visible={oortVisible}
        />
      </group>
      <group visible={regionsVisible && dustVisible}>
        <DustAndMeteorLayer scaleMode={scaleMode} />
      </group>
      <group visible={heliosphereVisible}>
        <Heliosphere
          planetObjects={planetObjects}
          scaleMode={scaleMode}
          visible={heliosphereVisible}
        />
      </group>
    </>
  );
}
