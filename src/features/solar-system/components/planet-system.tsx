"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { BackSide } from "three";
import type { Group, Mesh } from "three";

import { planetTextureSources } from "@/content/sources/planet-textures";
import { planetEphemerisRepresentation } from "@/lib/data/ephemeris/models";
import { markMaterialApplied } from "@/features/solar-system/lib/asset-loading-lifecycle";
import { useCelestialPointerInteraction } from "@/features/solar-system/hooks/use-celestial-pointer-interaction";
import { setCameraTargetMetadata } from "@/features/solar-system/lib/camera-runtime";
import { parentEquatorialQuaternion } from "@/features/solar-system/lib/body-equatorial-orientation";
import { PLANET_VISUAL_PROFILES } from "@/features/solar-system/lib/planet-visual-profiles";
import { planetaryRingOuterRadius } from "@/features/solar-system/lib/planetary-rings";
import type { SceneQuality } from "@/features/solar-system/lib/quality";
import { rotationAngleAt } from "@/features/solar-system/lib/orbital-motion";
import {
  labelPriorityForBody,
  shouldMountLabel,
} from "@/features/solar-system/lib/label-visibility-policy";
import { planetOrbitVisibility } from "@/features/solar-system/lib/orbit-visibility-policy";
import { sceneProfileFor } from "@/features/solar-system/lib/scene-profiles";
import {
  sceneScaleFor,
  type ScenePlanet,
} from "@/features/solar-system/lib/scene-planets";
import { effectiveBodyVisibility } from "@/features/solar-system/lib/scene-visibility-policy";
import {
  textureMaterialKey,
  useSceneTexture,
} from "@/features/solar-system/lib/texture-cache";
import {
  SECONDS_PER_JULIAN_YEAR,
  type ScaleMode,
} from "@/features/solar-system/types/experience-settings";
import type { PlanetObjectRegistry } from "@/features/solar-system/types/planet-object-registry";
import {
  createEphemerisScenePositionEvaluator,
  ephemerisOrbitScenePoints,
  type MutableScenePosition,
} from "@/lib/data/ephemeris/positions";
import { uiStrings } from "@/lib/i18n/ui-strings";
import { useEphemerisStore } from "@/stores/ephemeris-store";
import { useExplorationStore } from "@/stores/exploration-store";
import { useSceneVisibilityStore } from "@/stores/scene-visibility-store";
import {
  currentSimulationTimeMs,
  useSimulationStore,
} from "@/stores/simulation-store";

import { AtmosphereShell } from "./atmosphere-shell";
import { EarthCityLights } from "./earth-city-lights";
import { EarthCloudLayer } from "./earth-cloud-layer";
import { PlanetaryMoonSystem } from "./moon-system";
import { OrbitPath } from "./orbit-path";
import { PlanetLabel, type ScientificLabelPlacement } from "./planet-label";
import { PlanetaryRingSystem } from "./planetary-ring-system";
import { SaturnRings } from "./saturn-rings";

const DISABLED_RAYCAST = () => undefined;

const SCIENTIFIC_LABEL_PLACEMENTS: Readonly<
  Record<ScenePlanet["id"], ScientificLabelPlacement>
> = {
  mercury: "south",
  venus: "northeast",
  earth: "northwest",
  mars: "east",
  jupiter: "west",
  saturn: "north",
  uranus: "east",
  neptune: "north",
};

interface PlanetSystemProps {
  labelsVisible: boolean;
  orbitsVisible: boolean;
  planet: ScenePlanet;
  planetObjects: PlanetObjectRegistry;
  quality: SceneQuality;
  resetVersion: number;
  scaleMode: ScaleMode;
}

export function PlanetSystem({
  labelsVisible,
  orbitsVisible,
  planet,
  planetObjects,
  quality,
  resetVersion,
  scaleMode,
}: PlanetSystemProps) {
  const bodyRef = useRef<Group>(null);
  const scenePositionRef = useRef<MutableScenePosition>([0, 0, 0]);
  const surfaceRef = useRef<Mesh>(null);
  const selected = useExplorationStore(
    (state) => state.selectedBodyId === planet.id,
  );
  const hovered = useExplorationStore(
    (state) => state.hoveredBodyId === planet.id,
  );
  const selectBody = useExplorationStore((state) => state.selectBody);
  const setHoveredPlanet = useExplorationStore(
    (state) => state.setHoveredPlanet,
  );
  const clearHoveredPlanet = useExplorationStore(
    (state) => state.clearHoveredPlanet,
  );
  const active = selected || hovered;
  const equatorialOrientation = useMemo(
    () => parentEquatorialQuaternion(planet.id),
    [planet.id],
  );
  const visible = useSceneVisibilityStore((state) =>
    effectiveBodyVisibility(planet.id, state),
  );
  const labelPriority = labelPriorityForBody("planet", {
    bodyVisible: visible,
    hovered,
    labelsVisible,
    scaleMode,
    selected,
  });
  const orbitEmphasis = planetOrbitVisibility(planet.id, {
    bodyVisible: visible,
    orbitsVisible,
    selectedBodyId: selected ? planet.id : null,
    hoveredBodyId: hovered ? planet.id : null,
  });
  const primary = visible;
  const visualProfile = PLANET_VISUAL_PROFILES[planet.id];
  const surfaceAsset = planetTextureSources[planet.id].asset;
  const surfaceTexture = useSceneTexture(surfaceAsset.path, {
    onError: () => markMaterialApplied(surfaceAsset.owner, true),
  });
  const profile = sceneProfileFor(scaleMode);
  const scale = sceneScaleFor(planet, scaleMode);
  const ephemerisBundle = useEphemerisStore((state) => state.bundle);
  const observedAt = ephemerisBundle.observedAt;
  const vector = ephemerisBundle.vectors.find(
    ({ planetId }) => planetId === planet.id,
  );
  const vectorWindow = ephemerisBundle.windows?.find(
    ({ planetId }) => planetId === planet.id,
  );
  const simulationAtMs = useSimulationStore((state) => state.simulationAtMs);
  const representation = useMemo(
    () =>
      planetEphemerisRepresentation(ephemerisBundle, planet.id, simulationAtMs),
    [ephemerisBundle, planet.id, simulationAtMs],
  );
  const timeScale = useSimulationStore((state) => state.timeScale);
  const acceleratedPreview = timeScale === SECONDS_PER_JULIAN_YEAR;
  const evaluateScenePosition = useMemo(
    () =>
      vector
        ? createEphemerisScenePositionEvaluator(
            vector,
            observedAt,
            scaleMode,
            acceleratedPreview,
            vectorWindow,
          )
        : undefined,
    [acceleratedPreview, observedAt, scaleMode, vector, vectorWindow],
  );
  const orbitPoints = useMemo(
    () =>
      vector
        ? ephemerisOrbitScenePoints(vector, scaleMode, quality.orbitSegments)
        : undefined,
    [quality.orbitSegments, scaleMode, vector],
  );
  const interactionRadius = Math.max(
    scale.radius * 1.65,
    profile.body.minimumInteractionRadius,
  );

  useLayoutEffect(() => {
    if (surfaceTexture) markMaterialApplied(surfaceAsset.owner);
  }, [surfaceAsset.owner, surfaceTexture]);

  useLayoutEffect(() => {
    const node = bodyRef.current;
    if (!node) return;

    const registry = planetObjects.current;
    node.userData.bodyId = planet.id;
    node.userData.planetId = planet.id;
    node.userData.renderRadius = scale.radius;
    const ringOuterRadius = planetaryRingOuterRadius(planet.id);
    setCameraTargetMetadata(node, {
      bodyId: planet.id,
      targetKind: "body",
      renderRadius: scale.radius,
      collisionRadius: scale.radius,
      focusRadius: scale.radius * ringOuterRadius,
    });
    node.userData.representationType = representation.representationType;
    node.userData.referenceFrame = representation.referenceFrame;
    registry.set(planet.id, node);

    return () => {
      registry.delete(planet.id);
    };
  }, [
    planet.id,
    planetObjects,
    representation.referenceFrame,
    representation.representationType,
    scale.radius,
  ]);

  useLayoutEffect(() => {
    if (bodyRef.current && evaluateScenePosition) {
      const position = evaluateScenePosition(
        simulationAtMs,
        scenePositionRef.current,
      );
      bodyRef.current.position.set(position[0], position[1], position[2]);
    }
    if (surfaceRef.current) {
      surfaceRef.current.rotation.y = rotationAngleAt(
        simulationAtMs,
        planet.siderealRotationHours,
        planet.retrogradeRotation,
      );
    }
  }, [
    evaluateScenePosition,
    planet.retrogradeRotation,
    planet.siderealRotationHours,
    resetVersion,
    simulationAtMs,
  ]);

  useFrame(() => {
    if (!bodyRef.current || !surfaceRef.current) return;

    const simulationState = useSimulationStore.getState();
    const currentTimeMs = currentSimulationTimeMs(simulationState);
    if (evaluateScenePosition) {
      const position = evaluateScenePosition(
        currentTimeMs,
        scenePositionRef.current,
      );
      bodyRef.current.position.set(position[0], position[1], position[2]);
    }

    surfaceRef.current.rotation.y = rotationAngleAt(
      currentTimeMs,
      planet.siderealRotationHours,
      planet.retrogradeRotation,
    );
  });

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    if (!visible) return;
    event.stopPropagation();
    setHoveredPlanet(planet.id);
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    if (!visible) return;
    event.stopPropagation();
    clearHoveredPlanet(planet.id);
  };


  const pointerInteraction = useCelestialPointerInteraction({
    bodyId: planet.id,
    enabled: visible,
    onSelect: selectBody,
  });

  return (
    <>
      {orbitPoints ? (
        <OrbitPath
          bodyId={planet.id}
          orbitClass="planet"
          color={planet.color}
          emphasis={orbitEmphasis}
          points={orbitPoints}
          segments={quality.orbitSegments}
          semiMajorAxis={scale.semiMajorAxis}
          semiMinorAxis={scale.semiMinorAxis}
        />
      ) : (
        <group rotation-x={planet.inclinationRadians}>
          <OrbitPath
            bodyId={planet.id}
            orbitClass="planet"
            color={planet.color}
            emphasis={orbitEmphasis}
            segments={quality.orbitSegments}
            semiMajorAxis={scale.semiMajorAxis}
            semiMinorAxis={scale.semiMinorAxis}
          />
        </group>
      )}
      <group
        ref={bodyRef}
        position={scale.initialPosition}
        userData={{ bodyId: planet.id, visualLayer: "planet-system" }}
      >
        <group
          visible={visible}
          userData={{ bodyId: planet.id, testBodyRoot: true }}
        >
          <group quaternion={equatorialOrientation}>
            <mesh
              ref={surfaceRef}
              name={planet.name}
              scale={scale.radius}
              userData={{ planetId: planet.id }}
            >
              <sphereGeometry
                args={[1, quality.planetSegments[0], quality.planetSegments[1]]}
              />
              <meshStandardMaterial
                key={textureMaterialKey(surfaceTexture)}
                userData={{
                  testSurfaceBodyId: planet.id,
                  texturePath: surfaceTexture?.name ?? null,
                }}
                color={
                  surfaceTexture ? visualProfile.surfaceTint : planet.color
                }
                depthWrite={primary}
                emissive="#000000"
                emissiveIntensity={0}
                map={surfaceTexture ?? undefined}
                metalness={0}
                opacity={primary ? 1 : 0.3}
                roughness={visualProfile.roughness}
                transparent={!primary}
              />
              {planet.id === "earth" ? (
                <EarthCityLights segments={quality.atmosphereSegments} />
              ) : null}
              {planet.id === "earth" ? (
                <EarthCloudLayer segments={quality.atmosphereSegments} />
              ) : null}
            </mesh>

            {visualProfile.atmosphere ? (
              <AtmosphereShell
                profile={visualProfile.atmosphere}
                radius={scale.radius}
                segments={quality.atmosphereSegments}
              />
            ) : null}

            {planet.id === "saturn" ? (
              <SaturnRings
                radius={scale.radius}
                segments={quality.ringSegments}
              />
            ) : null}

            {planet.id === "jupiter" ||
            planet.id === "uranus" ||
            planet.id === "neptune" ? (
              <PlanetaryRingSystem
                active={visible && active}
                planetId={planet.id}
                radius={scale.radius}
                segments={quality.ringSegments}
              />
            ) : null}

            <mesh
              raycast={visible ? undefined : DISABLED_RAYCAST}
              {...pointerInteraction}
              onPointerOut={handlePointerOut}
              onPointerOver={handlePointerOver}
              scale={interactionRadius}
              userData={{ testInteractiveBodyId: planet.id }}
            >
              <sphereGeometry args={[1, 14, 10]} />
              <meshBasicMaterial
                color={planet.color}
                depthWrite={false}
                opacity={0}
                transparent
              />
            </mesh>
          </group>

          {primary && active ? (
            <mesh
              raycast={() => undefined}
              scale={scale.radius * (selected ? 1.065 : 1.045)}
            >
              <sphereGeometry args={[1, 32, 24]} />
              <meshBasicMaterial
                color={selected ? "#c7d3e3" : planet.color}
                depthWrite={false}
                opacity={selected ? 0.12 : 0.07}
                side={BackSide}
                transparent
              />
            </mesh>
          ) : null}

          {shouldMountLabel(labelPriority) ? (
            <PlanetLabel
              active={active}
              bodyId={planet.id}
              color={planet.color}
              mode={scaleMode}
              offsetY={scale.radius + 1.15}
              placement={SCIENTIFIC_LABEL_PLACEMENTS[planet.id]}
              priority={labelPriority}
              positionCaption={
                selected
                  ? uiStrings.pages.explore.scientificSelectedMarkerCaption
                  : uiStrings.pages.explore.scientificMarkerCaption
              }
              selected={selected}
              text={planet.name}
            />
          ) : null}
        </group>

        <PlanetaryMoonSystem
          parentPlanet={planet}
          parentRadiusScene={scale.radius}
          planetObjects={planetObjects}
          quality={quality}
          scaleMode={scaleMode}
        />
      </group>
    </>
  );
}
