"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Quaternion, type Group } from "three";

import {
  featuredMoonsForPlanet,
  isFeaturedMoonParentPlanetId,
  isMoonId,
  MOON_BY_ID,
  type Moon,
} from "@/features/solar-system/lib/moon-catalogue";
import {
  moonLocalPositionAt,
  moonOrbitDistanceScene,
  moonOrbitNormalScene,
  moonOrbitPoints,
  moonPhysicalRadiusScene,
} from "@/features/solar-system/lib/moon-position";
import { moonOrbitVisibility } from "@/features/solar-system/lib/orbit-visibility-policy";
import {
  createTidalLockScratch,
  tidalLockQuaternion,
} from "@/features/solar-system/lib/tidal-lock-orientation";
import type { SceneQuality } from "@/features/solar-system/lib/quality";
import type { ScenePlanet } from "@/features/solar-system/lib/scene-planets";
import { sceneProfileFor } from "@/features/solar-system/lib/scene-profiles";
import { moonSceneVisibility } from "@/features/solar-system/lib/scene-visibility-policy";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import type { PlanetObjectRegistry } from "@/features/solar-system/types/planet-object-registry";
import { currentNavigatorView } from "@/features/solar-system/lib/celestial-navigation-state";
import { exploreSceneCopy } from "@/lib/i18n/explore-scene-copy";
import { useExplorationStore } from "@/stores/exploration-store";
import { useExploreSceneUiStore } from "@/stores/explore-scene-ui-store";
import {
  currentSimulationTimeMs,
  useSimulationStore,
} from "@/stores/simulation-store";

import { CelestialVisualSurface } from "./celestial-visual-surface";
import { OrbitPath } from "./orbit-path";
import { PlanetLabel } from "./planet-label";

interface PlanetaryMoonSystemProps {
  parentPlanet: ScenePlanet;
  parentRadiusScene: number;
  planetObjects: PlanetObjectRegistry;
  quality: SceneQuality;
  scaleMode: ScaleMode;
}

function MoonObject({
  moon,
  parentPlanet,
  parentRadiusScene,
  planetObjects,
  quality,
  scaleMode,
}: PlanetaryMoonSystemProps & { moon: Moon }) {
  const groupRef = useRef<Group>(null);
  const surfaceRef = useRef<Group>(null);
  const localPosition = useRef<[number, number, number]>([0, 0, 0]);
  const tidalOrientation = useRef(new Quaternion());
  const tidalScratch = useRef(createTidalLockScratch());
  const selectedBodyId = useExplorationStore((state) => state.selectedBodyId);
  const hoveredBodyId = useExplorationStore((state) => state.hoveredBodyId);
  const orbitsVisible = useExplorationStore((state) => state.orbitsVisible);
  const selectBody = useExplorationStore((state) => state.selectBody);
  const setHoveredBody = useExplorationStore((state) => state.setHoveredBody);
  const clearHoveredBody = useExplorationStore(
    (state) => state.clearHoveredBody,
  );
  const navigator = useExploreSceneUiStore((state) => state.navigator);
  const simulationAtMs = useSimulationStore((state) => state.simulationAtMs);
  const navigatorView = currentNavigatorView(navigator);
  const visibility = moonSceneVisibility(moon, {
    navigatorView,
    selectedBodyId,
  });
  const orbitEmphasis = moonOrbitVisibility(moon, {
    navigatorView,
    orbitsVisible,
    selectedBodyId,
    hoveredBodyId,
  });
  const selected = selectedBodyId === moon.id;
  const hovered = hoveredBodyId === moon.id;
  const active = selected || hovered;
  const profile = sceneProfileFor(scaleMode);
  const orbitDistance = moonOrbitDistanceScene(
    moon,
    parentRadiusScene,
    parentPlanet.meanRadiusKm,
    scaleMode,
  );
  const physicalRadius = moonPhysicalRadiusScene(
    moon,
    parentRadiusScene,
    parentPlanet.meanRadiusKm,
  );
  const explorationVisualRadius = Math.max(
    physicalRadius,
    Math.min(parentRadiusScene * 0.22, 0.16),
  );
  const renderRadius =
    profile.scale.bodyProfile === "physical-ratio"
      ? physicalRadius
      : explorationVisualRadius;
  const interactionRadius = Math.max(
    renderRadius * 2.6,
    profile.body.moonMinimumInteractionRadius,
  );
  const cameraFocusRadius = Math.max(
    renderRadius,
    profile.body.moonMinimumVisualRadius,
  );
  const orbitNormal = useMemo(() => moonOrbitNormalScene(moon), [moon]);
  const orbitPoints = useMemo(
    () =>
      moonOrbitPoints(
        moon,
        orbitDistance,
        Math.max(32, Math.round(quality.orbitSegments * 0.62)),
      ),
    [moon, orbitDistance, quality.orbitSegments],
  );
  const initialPosition = moonLocalPositionAt(
    moon,
    simulationAtMs,
    orbitDistance,
  );

  useLayoutEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    node.userData.bodyId = moon.id;
    node.userData.moonId = moon.id;
    node.userData.parentPlanetId = moon.parentPlanetId;
    node.userData.renderRadius = cameraFocusRadius;
    node.userData.physicalRenderRadius = renderRadius;
    node.userData.cameraFocusRadius = cameraFocusRadius;
    node.userData.representationType = moon.representation.representationType;
    const objectRegistry = planetObjects.current;
    objectRegistry.set(moon.id, node);
    return () => {
      objectRegistry.delete(moon.id);
    };
  }, [cameraFocusRadius, moon, planetObjects, renderRadius]);

  useFrame(() => {
    const node = groupRef.current;
    if (!node) return;
    const timestamp = currentSimulationTimeMs(useSimulationStore.getState());
    const position = moonLocalPositionAt(
      moon,
      timestamp,
      orbitDistance,
      localPosition.current,
    );
    node.position.set(position[0], position[1], position[2]);
    if (surfaceRef.current && moon.rotation.kind === "tidally-locked") {
      surfaceRef.current.quaternion.copy(
        tidalLockQuaternion(
          position,
          orbitNormal,
          tidalOrientation.current,
          tidalScratch.current,
        ),
      );
    }
  });

  if (visibility === "hidden") return null;

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    selectBody(moon.id);
  };
  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHoveredBody(moon.id);
  };
  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    clearHoveredBody(moon.id);
  };

  return (
    <>
      {orbitEmphasis !== "hidden" ? (
        <OrbitPath
          bodyId={moon.id}
          orbitClass="moon"
          color={moon.visualProfile.color}
          emphasis={orbitEmphasis}
          lineWidth={0.9}
          points={orbitPoints}
          segments={quality.orbitSegments}
          semiMajorAxis={orbitDistance}
          semiMinorAxis={orbitDistance * Math.sqrt(1 - moon.eccentricity ** 2)}
        />
      ) : null}
      <group
        ref={groupRef}
        position={initialPosition as [number, number, number]}
        userData={{
          bodyId: moon.id,
          moonId: moon.id,
          parentPlanetId: moon.parentPlanetId,
          referenceFrame: moon.representation.referenceFrame,
          representationType: moon.representation.representationType,
          visualLayer: "featured-major-moon",
        }}
      >
        <CelestialVisualSurface
          bodyId={moon.id}
          radius={renderRadius}
          rootRef={surfaceRef}
        />

        <mesh
          onClick={handleClick}
          onPointerOut={handlePointerOut}
          onPointerOver={handlePointerOver}
          scale={interactionRadius}
        >
          <sphereGeometry args={[1, 12, 8]} />
          <meshBasicMaterial depthWrite={false} opacity={0} transparent />
        </mesh>

        {active ? (
          <PlanetLabel
            active
            color={moon.visualProfile.color}
            compact
            mode={scaleMode}
            offsetY={interactionRadius + 0.3}
            placement="north"
            positionCaption={exploreSceneCopy.labels.moonRepresentative}
            selected={selected}
            text={moon.name}
          />
        ) : null}
      </group>
    </>
  );
}

export function PlanetaryMoonSystem(props: PlanetaryMoonSystemProps) {
  const navigator = useExploreSceneUiStore((state) => state.navigator);
  const selectedBodyId = useExplorationStore((state) => state.selectedBodyId);
  const view = currentNavigatorView(navigator);
  const moons = useMemo(() => {
    if (!isFeaturedMoonParentPlanetId(props.parentPlanet.id)) return [];
    if (
      view.kind === "moons" &&
      view.parentPlanetId === props.parentPlanet.id
    ) {
      return featuredMoonsForPlanet(props.parentPlanet.id);
    }
    if (selectedBodyId && isMoonId(selectedBodyId)) {
      const selectedMoon = MOON_BY_ID[selectedBodyId];
      return selectedMoon.parentPlanetId === props.parentPlanet.id
        ? [selectedMoon]
        : [];
    }
    return [];
  }, [props.parentPlanet.id, selectedBodyId, view]);
  if (moons.length === 0) return null;
  return (
    <group
      userData={{
        parentPlanetId: props.parentPlanet.id,
        representation: "featured-major-moons",
      }}
    >
      {moons.map((moon) => (
        <MoonObject key={moon.id} moon={moon} {...props} />
      ))}
    </group>
  );
}
