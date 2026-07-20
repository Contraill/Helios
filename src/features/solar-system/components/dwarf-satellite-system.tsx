"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import type { Group } from "three";

import {
  DWARF_SATELLITE_BY_ID,
  dwarfSatellitesFor,
  type DwarfSatellite,
  type DwarfSystemParentId,
} from "@/features/solar-system/lib/dwarf-satellite-catalogue";
import { effectiveBodyVisibility } from "@/features/solar-system/lib/scene-visibility-policy";
import {
  labelPriorityForBody,
  shouldMountLabel,
} from "@/features/solar-system/lib/label-visibility-policy";
import { moonOrbitVisibility } from "@/features/solar-system/lib/orbit-visibility-policy";
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

const DAY_MS = 86_400_000;

function compressedOrbitDistance(
  moon: DwarfSatellite,
  parentMeanRadiusKm: number,
  parentRadius: number,
) {
  const physicalRatio = moon.semiMajorAxisKm / parentMeanRadiusKm;
  return (
    parentRadius *
    Math.min(9.5, Math.max(3, 1.9 + Math.log10(physicalRatio) * 1.72))
  );
}

export function dwarfParentVisualOffset(
  parentId: DwarfSystemParentId,
  parentRadius: number,
): readonly [number, number, number] {
  if (parentId !== "pluto") return [0, 0, 0];
  const charon = DWARF_SATELLITE_BY_ID["dwarf-satellite-charon"];
  const distance = compressedOrbitDistance(charon, 1_188.3, parentRadius);
  // Pluto–Charon’s barycentre is represented explicitly. This visual ratio is
  // derived from the accepted approximate system mass ratio, not the orbit engine.
  return [-distance * 0.108, 0, 0];
}

function satellitePosition(
  moon: DwarfSatellite,
  timestampMs: number,
  parentMeanRadiusKm: number,
  parentRadius: number,
): readonly [number, number, number] {
  const elapsedDays = (timestampMs - Date.UTC(2000, 0, 1, 12)) / DAY_MS;
  const angle =
    (moon.phaseAtEpochDeg * Math.PI) / 180 +
    (elapsedDays / moon.orbitalPeriodDays) * Math.PI * 2;
  const distance = compressedOrbitDistance(
    moon,
    parentMeanRadiusKm,
    parentRadius,
  );
  const eccentricity = moon.eccentricity ?? 0;
  const radial =
    (distance * (1 - eccentricity * eccentricity)) /
    (1 + eccentricity * Math.cos(angle));
  if (moon.id === "dwarf-satellite-charon") {
    return [
      Math.cos(angle) * radial * 0.892,
      0,
      Math.sin(angle) * radial * 0.892,
    ];
  }
  return [Math.cos(angle) * radial, 0, Math.sin(angle) * radial];
}

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
  const simulationAtMs = useSimulationStore((state) => state.simulationAtMs);
  const selected = useExplorationStore(
    (state) => state.selectedBodyId === moon.id,
  );
  const orbitsVisible = useSceneVisibilityStore((state) => state.orbitsVisible);
  const labelsVisible = useSceneVisibilityStore((state) => state.labelsVisible);
  const hovered = useExplorationStore(
    (state) => state.hoveredBodyId === moon.id,
  );
  const selectBody = useExplorationStore((state) => state.selectBody);
  const setHoveredBody = useExplorationStore((state) => state.setHoveredBody);
  const clearHoveredBody = useExplorationStore(
    (state) => state.clearHoveredBody,
  );
  const physicalRadius =
    parentRadius * (moon.meanRadiusKm / parentMeanRadiusKm);
  const visualRadius = Math.max(physicalRadius, parentRadius * 0.075);
  const interactionRadius = Math.max(visualRadius * 2.3, parentRadius * 0.2);
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
    selectedBodyId: selected ? moon.id : null,
    hoveredBodyId: hovered ? moon.id : null,
  });
  const initialPosition = satellitePosition(
    moon,
    simulationAtMs,
    parentMeanRadiusKm,
    parentRadius,
  );
  const orbitDistance = compressedOrbitDistance(
    moon,
    parentMeanRadiusKm,
    parentRadius,
  );
  const orbitPoints = useMemo(() => {
    const eccentricity = moon.eccentricity ?? 0;
    const factor = moon.id === "dwarf-satellite-charon" ? 0.892 : 1;
    return Array.from({ length: 97 }, (_, index) => {
      const angle = (index / 96) * Math.PI * 2;
      const radial =
        (orbitDistance * (1 - eccentricity * eccentricity)) /
        (1 + eccentricity * Math.cos(angle));
      return [
        Math.cos(angle) * radial * factor,
        0,
        Math.sin(angle) * radial * factor,
      ] as [number, number, number];
    });
  }, [moon, orbitDistance]);

  useLayoutEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    node.userData.bodyId = moon.id;
    node.userData.parentBodyId = moon.parentId;
    node.userData.cameraFocusRadius = visualRadius;
    node.userData.representationType = moon.representation.representationType;
    node.userData.referenceFrame = moon.representation.referenceFrame;
    const objectRegistry = planetObjects.current;
    objectRegistry.set(moon.id, node);
    return () => {
      objectRegistry.delete(moon.id);
    };
  }, [moon, planetObjects, visualRadius]);

  useFrame(() => {
    const node = groupRef.current;
    if (!node) return;
    const position = satellitePosition(
      moon,
      currentSimulationTimeMs(useSimulationStore.getState()),
      parentMeanRadiusKm,
      parentRadius,
    );
    node.position.set(...position);
    if (surfaceRef.current) {
      surfaceRef.current.rotation.y = -Math.atan2(position[2], position[0]);
    }
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
  const click = (event: ThreeEvent<MouseEvent>) => {
    if (!visible) return;
    event.stopPropagation();
    selectBody(moon.id);
  };

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
          bodyId: moon.id,
          testBodyRoot: true,
          angularOrbitResolved: moon.inclinationDeg !== null,
          sourceTarget: moon.sourceTarget,
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
          onClick={click}
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
