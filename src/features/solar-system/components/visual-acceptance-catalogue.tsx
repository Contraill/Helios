"use client";

import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { AdditiveBlending, BackSide } from "three";

import {
  visualProfileFor,
  visualRegistryIds,
  type VisualBodyId,
} from "@/features/solar-system/lib/celestial-visual-registry";

import { CelestialVisualSurface } from "./celestial-visual-surface";

export type VisualCatalogueMode =
  | "all"
  | "moons"
  | "dwarf-systems"
  | "asteroids"
  | "dwarf-kuiper"
  | "comets";

const DWARF_SYSTEM_PARENT_IDS = new Set<VisualBodyId>([
  "pluto",
  "eris",
  "haumea",
  "makemake",
  "quaoar",
  "gonggong",
  "orcus",
]);

function idsFor(mode: VisualCatalogueMode): readonly VisualBodyId[] {
  if (mode === "all") return visualRegistryIds;
  return visualRegistryIds.filter((id) => {
    const category = visualProfileFor(id).category;
    if (mode === "moons") return category === "featured-moon";
    if (mode === "dwarf-systems") {
      return category === "dwarf-system-satellite" || DWARF_SYSTEM_PARENT_IDS.has(id);
    }
    if (mode === "asteroids") return category === "asteroid";
    if (mode === "dwarf-kuiper") return category === "dwarf-kuiper";
    return category === "comet";
  });
}

function CatalogueCometTail({ bodyId }: { bodyId: VisualBodyId }) {
  const visual = visualProfileFor(bodyId).comet;
  if (!visual) return null;
  return (
    <group rotation-z={-Math.PI / 2} scale={0.18}>
      <mesh position={[0, -visual.dustLength / 2, 0]}>
        <coneGeometry args={[visual.dustWidth, visual.dustLength, 18, 1, true]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={visual.dustColor}
          depthWrite={false}
          opacity={0.3}
          side={BackSide}
          transparent
        />
      </mesh>
      <mesh position={[0.1, -visual.ionLength / 2, 0]}>
        <coneGeometry args={[visual.ionWidth, visual.ionLength, 14, 1, true]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={visual.ionColor}
          depthWrite={false}
          opacity={0.35}
          side={BackSide}
          transparent
        />
      </mesh>
    </group>
  );
}

export function VisualAcceptanceCatalogue({
  mode,
}: {
  mode: VisualCatalogueMode;
}) {
  const camera = useThree((state) => state.camera);
  const ids = useMemo(() => idsFor(mode), [mode]);
  const columns = Math.min(8, Math.max(4, Math.ceil(Math.sqrt(ids.length))));
  const rows = Math.ceil(ids.length / columns);
  const spacing = 3.1;

  useEffect(() => {
    camera.position.set(0, 0, Math.max(17, rows * 3.2));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, rows]);

  return (
    <group
      userData={{
        acceptanceCatalogue: true,
        acceptanceCatalogueMode: mode,
        acceptanceCatalogueTileCount: ids.length,
      }}
    >
      <ambientLight intensity={0.38} />
      <directionalLight intensity={2.2} position={[6, 8, 12]} />
      {ids.map((bodyId, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const x = (column - (columns - 1) / 2) * spacing;
        const y = ((rows - 1) / 2 - row) * spacing;
        return (
          <group
            key={bodyId}
            position={[x, y, 0]}
            userData={{ acceptanceCatalogueBodyId: bodyId }}
          >
            <CelestialVisualSurface bodyId={bodyId} radius={0.78} />
            <CatalogueCometTail bodyId={bodyId} />
          </group>
        );
      })}
    </group>
  );
}
