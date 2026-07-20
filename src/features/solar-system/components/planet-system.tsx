"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { BackSide } from "three";
import type { Group, Mesh } from "three";

import { planetTextureSources } from "@/content/sources/planet-textures";
import { planetEphemerisRepresentation } from "@/lib/data/ephemeris/models";
import { markMaterialApplied } from "@/features/solar-system/lib/asset-loading-lifecycle";
import { parentEquatorialQuaternion } from "@/features/solar-system/lib/body-equatorial-orientation";
import { currentNavigatorView } from "@/features/solar-system/lib/celestial-navigation-state";
import { PLANET_VISUAL_PROFILES } from "@/features/solar-system/lib/planet-visual-profiles";
import type { SceneQuality } from "@/features/solar-system/lib/quality";
import { rotationAngleAt } from "@/features/solar-system/lib/orbital-motion";
import { planetOrbitVisibility } from "@/features/solar-system/lib/orbit-visibility-policy";
import { sceneProfileFor } from "@/features/solar-system/lib/scene-profiles";
import {
  sceneScaleFor,
  type ScenePlanet,
} from "@/features/solar-system/lib/scene-planets";
import { planetSceneVisibility } from "@/features/solar-system/lib/scene-visibility-policy";
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
import { useExploreSceneUiStore } from "@/stores/explore-scene-ui-store";
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
  const selectPlanet = useExplorationStore((state) => state.selectPlanet);
  const setHoveredPlanet = useExplorationStore(
    (state) => state.setHoveredPlanet,
  );
  const clearHoveredPlanet = useExplorationStore(
    (state) => state.clearHoveredPlanet,
  );
  const navigator = useExploreSceneUiStore((state) => state.navigator);
  const active = selected || hovered;
  const equatorialOrientation = useMemo(
    () => parentEquatorialQuaternion(planet.id),
    [planet.id],
  );
  const navigatorView = currentNavigatorView(navigator);
  const visibility = planetSceneVisibility(planet.id, {
    navigatorView,
    selectedBodyId: selected ? planet.id : null,
  });
  const orbitEmphasis = planetOrbitVisibility(planet.id, {
    navigatorView,
    orbitsVisible,
    selectedBodyId: selected ? planet.id : null,
    hoveredBodyId: hovered ? planet.id : null,
  });
  const primary = visibility === "primary";
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
  const scientificMode = profile.scale.bodyProfile === "physical-ratio";

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
    event.stopPropagation();
    setHoveredPlanet(planet.id);
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    clearHoveredPlanet(planet.id);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    selectPlanet(planet.id);
  };

  return (
    <>
      {orbitEmphasis !== "hidden" ? (
        orbitPoints ? (
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
        )
      ) : null}
      <group ref={bodyRef} position={scale.initialPosition}>
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
              color={surfaceTexture ? visualProfile.surfaceTint : planet.color}
              depthWrite={primary}
              emissive="#000000"
              emissiveIntensity={0}
              map={surfaceTexture ?? undefined}
              metalness={0}
              opacity={primary ? 1 : 0.3}
              roughness={visualProfile.roughness}
              transparent={!primary}
            />
            {primary && planet.id === "earth" ? (
              <EarthCityLights segments={quality.atmosphereSegments} />
            ) : null}
            {primary && planet.id === "earth" ? (
              <EarthCloudLayer segments={quality.atmosphereSegments} />
            ) : null}
          </mesh>

          {primary && visualProfile.atmosphere ? (
            <AtmosphereShell
              profile={visualProfile.atmosphere}
              radius={scale.radius}
              segments={quality.atmosphereSegments}
            />
          ) : null}

          {primary && planet.id === "saturn" ? (
            <SaturnRings
              radius={scale.radius}
              segments={quality.ringSegments}
            />
          ) : null}

          {primary &&
          (planet.id === "jupiter" ||
            planet.id === "uranus" ||
            planet.id === "neptune") ? (
            <PlanetaryRingSystem
              active={active}
              planetId={planet.id}
              radius={scale.radius}
              segments={quality.ringSegments}
            />
          ) : null}

          {primary ? (
            <mesh
              onClick={handleClick}
              onPointerOut={handlePointerOut}
              onPointerOver={handlePointerOver}
              scale={interactionRadius}
            >
              <sphereGeometry args={[1, 14, 10]} />
              <meshBasicMaterial
                color={planet.color}
                depthWrite={false}
                opacity={0}
                transparent
              />
            </mesh>
          ) : null}
        </group>

        <PlanetaryMoonSystem
          parentPlanet={planet}
          parentRadiusScene={scale.radius}
          planetObjects={planetObjects}
          quality={quality}
          scaleMode={scaleMode}
        />

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

        {primary && labelsVisible && (active || scientificMode) ? (
          <PlanetLabel
            active={active}
            color={planet.color}
            mode={scaleMode}
            offsetY={scale.radius + 1.15}
            placement={SCIENTIFIC_LABEL_PLACEMENTS[planet.id]}
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
    </>
  );
}
