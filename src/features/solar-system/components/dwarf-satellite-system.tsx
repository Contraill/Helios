"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Quaternion, type Group } from "three";

import { useCelestialPointerInteraction } from "@/features/solar-system/hooks/use-celestial-pointer-interaction";
import { setCameraTargetMetadata } from "@/features/solar-system/lib/camera-runtime";
import {
  dwarfSatellitesFor,
  type DwarfSatellite,
  type DwarfSystemParentId,
} from "@/features/solar-system/lib/dwarf-satellite-catalogue";
import {
  dwarfSatelliteOrbitDistance,
  dwarfSatelliteSceneMetrics,
} from "@/features/solar-system/lib/dwarf-satellite-scene-metrics";
import {
  dwarfSatelliteOrbitNormal,
  dwarfSatelliteOrbitPoints,
  dwarfSatellitePositionAt,
} from "@/features/solar-system/lib/dwarf-satellite-position";
import {
  labelPriorityForBody,
  shouldMountLabel,
} from "@/features/solar-system/lib/label-visibility-policy";
import { moonOrbitVisibility } from "@/features/solar-system/lib/orbit-visibility-policy";
import { effectiveBodyVisibility } from "@/features/solar-system/lib/scene-visibility-policy";
import {
  createTidalLockScratch,
  tidalLockQuaternion,
} from "@/features/solar-system/lib/tidal-lock-orientation";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import type { PlanetObjectRegistry } from "@/features/solar-system/types/planet-object-registry";
import { useExplorationStore } from "@/stores/exploration-store";
import { useSceneVisibilityStore } from "@/stores/scene-visibility-store";
import {
  currentSimulationTimeMs,
  useSimulationStore,
} from "@/stores/simulation-store";

import { CelestialVisualSurface } from "./celestial-visual-surface";
import { OrbitPath } from "./orbit-path";
import { PlanetLabel } from "./planet-label";

const DISABLED_RAYCAST = () => undefined;
function SatelliteObject({
  moon,
  parentMeanRadiusKm,
  parentRadius,
  planetObjects,
  scaleMode,
}: {
  moon: DwarfSatellite;
  parentMeanRadiusKm: number;
  parentRadius: number;
  planetObjects: PlanetObjectRegistry;
  scaleMode: ScaleMode;
}) {
  const groupRef = useRef<Group>(null);
  const surfaceRef = useRef<Group>(null);
  const tidalOrientation = useRef(new Quaternion());
  const tidalScratch = useRef(createTidalLockScratch());
  const simulationAtMs = useSimulationStore((state) => state.simulationAtMs);
  const selectedBodyId = useExplorationStore((state) => state.selectedBodyId);
  const hoveredBodyId = useExplorationStore((state) => state.hoveredBodyId);
  const orbitsVisible = useSceneVisibilityStore((state) => state.orbitsVisible);
  const labelsVisible = useSceneVisibilityStore((state) => state.labelsVisible);
  const selectBody = useExplorationStore((state) => state.selectBody);
  const setHoveredBody = useExplorationStore((state) => state.setHoveredBody);
  const clearHoveredBody = useExplorationStore(
    (state) => state.clearHoveredBody,
  );
  const selected = selectedBodyId === moon.id;
  const hovered = hoveredBodyId === moon.id;
  const sceneMetrics = dwarfSatelliteSceneMetrics(
    moon,
    parentMeanRadiusKm,
    parentRadius,
    scaleMode,
  );
  const visualRadius = sceneMetrics.renderedRadius;
  const interactionRadius = sceneMetrics.interactionRadius;
  const focusRadius = sceneMetrics.focusRadius;
  const visible = useSceneVisibilityStore((state) =>
    effectiveBodyVisibility(moon.id, state),
  );
  const labelPriority = labelPriorityForBody("dwarf-satellite", {
    bodyVisible: visible,
    hovered,
    labelsVisible,
    scaleMode,
    selected,
  });
  const orbitEmphasis = moonOrbitVisibility(moon.id, {
    bodyVisible: visible,
    orbitsVisible,
    selectedBodyId,
    hoveredBodyId,
  });
  const initialPosition = dwarfSatellitePositionAt(
    moon,
    simulationAtMs,
    parentMeanRadiusKm,
    parentRadius,
    scaleMode,
  );
  const orbitDistance = dwarfSatelliteOrbitDistance(
    moon,
    parentMeanRadiusKm,
    parentRadius,
    scaleMode,
  );
  const resolvedOrbitNormal = useMemo(
    () => dwarfSatelliteOrbitNormal(moon),
    [moon],
  );
  const orbitPoints = useMemo(
    () => dwarfSatelliteOrbitPoints(moon, orbitDistance, 96),
    [moon, orbitDistance],
  );

  useLayoutEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    node.userData.bodyId = moon.id;
    node.userData.parentBodyId = moon.parentId;
    node.userData.cameraFocusRadius = focusRadius;
    node.userData.representationType = moon.representation.representationType;
    node.userData.referenceFrame = moon.representation.referenceFrame;
    node.userData.rotationKind = moon.rotation.kind;
    node.userData.orbitNormal = [...resolvedOrbitNormal];
    node.userData.orbitPlaneStatus = moon.orbitPlaneStatus;
    node.userData.orbitPlaneReference = moon.orbitPlaneReference;
    node.userData.orbitPlaneSourceId = moon.orbitPlaneSourceId;
    node.userData.orbitPlaneInclinationDeg = moon.inclinationDeg;
    setCameraTargetMetadata(node, {
      bodyId: moon.id,
      targetKind: "body",
      renderRadius: visualRadius,
      collisionRadius: visualRadius,
      focusRadius,
    });
    const objectRegistry = planetObjects.current;
    objectRegistry.set(moon.id, node);
    return () => {
      objectRegistry.delete(moon.id);
    };
  }, [focusRadius, moon, planetObjects, resolvedOrbitNormal, visualRadius]);

  useFrame(() => {
    const node = groupRef.current;
    if (!node) return;
    const timestamp = currentSimulationTimeMs(useSimulationStore.getState());
    const position = dwarfSatellitePositionAt(
      moon,
      timestamp,
      parentMeanRadiusKm,
      parentRadius,
      scaleMode,
    );
    node.position.set(...position);
    const surface = surfaceRef.current;
    if (!surface) return;
    if (moon.rotation.kind === "tidally-locked") {
      surface.quaternion.copy(
        tidalLockQuaternion(
          position,
          resolvedOrbitNormal,
          tidalOrientation.current,
          tidalScratch.current,
        ),
      );
    } else {
      surface.quaternion.identity();
    }
    surface.userData.testRotationKind = moon.rotation.kind;
  });

  const over = (event: ThreeEvent<PointerEvent>) => {
    if (!visible) return;
    event.stopPropagation();
    setHoveredBody(moon.id);
  };
  const out = (event: ThreeEvent<PointerEvent>) => {
    if (!visible) return;
    event.stopPropagation();
    clearHoveredBody(moon.id);
  };
  const pointerInteraction = useCelestialPointerInteraction({
    bodyId: moon.id,
    enabled: visible,
    onSelect: selectBody,
  });

  return (
    <>
      <OrbitPath
        bodyId={moon.id}
        color="#9dabbc"
        emphasis={orbitEmphasis}
        lineWidth={0.75}
        orbitClass="moon"
        points={orbitPoints}
        segments={96}
        semiMajorAxis={orbitDistance}
        semiMinorAxis={
          orbitDistance * Math.sqrt(1 - (moon.eccentricity ?? 0) ** 2)
        }
      />
      <group
        ref={groupRef}
        position={initialPosition as [number, number, number]}
        visible={visible}
        userData={{
          angularOrbitResolved:
            moon.orbitPlaneStatus === "source-backed-parent-equatorial",
          bodyId: moon.id,
          orbitPlaneInclinationDeg: moon.inclinationDeg,
          orbitPlaneReference: moon.orbitPlaneReference,
          orbitPlaneSourceId: moon.orbitPlaneSourceId,
          orbitPlaneStatus: moon.orbitPlaneStatus,
          sourceTarget: moon.sourceTarget,
          testBodyRoot: true,
          visualLayer: "dwarf-system-satellite",
        }}
      >
        <CelestialVisualSurface
          bodyId={moon.id}
          textureLoadPolicy="scheduled"
          radius={visualRadius}
          rootRef={surfaceRef}
        />
        <mesh
          raycast={visible ? undefined : DISABLED_RAYCAST}
          {...pointerInteraction}
          onPointerOut={out}
          onPointerOver={over}
          scale={interactionRadius}
          userData={{ testInteractiveBodyId: moon.id }}
        >
          <sphereGeometry args={[1, 12, 8]} />
          <meshBasicMaterial depthWrite={false} opacity={0} transparent />
        </mesh>
        {shouldMountLabel(labelPriority) ? (
          <PlanetLabel
            active
            bodyId={moon.id}
            color="#d9d3c7"
            compact
            mode={scaleMode}
            offsetY={interactionRadius + 0.2}
            placement="north"
            priority={labelPriority}
            positionCaption="DWARF-SYSTEM CONTEXT"
            selected={selected}
            text={moon.name}
          />
        ) : null}
      </group>
    </>
  );
}

export function DwarfSatelliteSystem({
  parentId,
  parentMeanRadiusKm,
  parentRadius,
  planetObjects,
  scaleMode,
}: {
  parentId: DwarfSystemParentId;
  parentMeanRadiusKm: number;
  parentRadius: number;
  planetObjects: PlanetObjectRegistry;
  scaleMode: ScaleMode;
}) {
  const moons = useMemo(() => dwarfSatellitesFor(parentId), [parentId]);
  return (
    <group
      userData={{
        parentBodyId: parentId,
        representation: "dwarf-system-satellites",
      }}
    >
      {moons.map((moon) => (
        <SatelliteObject
          key={moon.id}
          moon={moon}
          parentMeanRadiusKm={parentMeanRadiusKm}
          parentRadius={parentRadius}
          planetObjects={planetObjects}
          scaleMode={scaleMode}
        />
      ))}
    </group>
  );
}
