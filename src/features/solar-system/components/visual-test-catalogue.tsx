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
  "all" | "moons" | "dwarf-systems" | "asteroids" | "dwarf-kuiper" | "comets";

export const VISUAL_CATALOGUE_PAGE_SIZE = 8;

const DWARF_SYSTEM_PARENT_IDS = new Set<VisualBodyId>([
  "pluto",
  "eris",
  "haumea",
  "makemake",
  "quaoar",
  "gonggong",
  "orcus",
]);

const DISPLAY_NAMES: Partial<Record<VisualBodyId, string>> = {
  "moon-earth-moon": "Moon",
  "moon-mars-phobos": "Phobos",
  "moon-mars-deimos": "Deimos",
  "moon-jupiter-io": "Io",
  "moon-jupiter-europa": "Europa",
  "moon-jupiter-ganymede": "Ganymede",
  "moon-jupiter-callisto": "Callisto",
  "moon-saturn-mimas": "Mimas",
  "moon-saturn-enceladus": "Enceladus",
  "moon-saturn-tethys": "Tethys",
  "moon-saturn-dione": "Dione",
  "moon-saturn-rhea": "Rhea",
  "moon-saturn-titan": "Titan",
  "moon-saturn-iapetus": "Iapetus",
  "moon-uranus-miranda": "Miranda",
  "moon-uranus-ariel": "Ariel",
  "moon-uranus-umbriel": "Umbriel",
  "moon-uranus-titania": "Titania",
  "moon-uranus-oberon": "Oberon",
  "moon-neptune-proteus": "Proteus",
  "moon-neptune-triton": "Triton",
  "moon-neptune-nereid": "Nereid",
  "dwarf-satellite-charon": "Charon",
  "dwarf-satellite-dysnomia": "Dysnomia",
  "dwarf-satellite-hiiaka": "Hiʻiaka",
  "dwarf-satellite-namaka": "Namaka",
  "dwarf-satellite-mk2": "MK2",
  "dwarf-satellite-weywot": "Weywot",
  "dwarf-satellite-xiangliu": "Xiangliu",
  "dwarf-satellite-vanth": "Vanth",
  "hale-bopp": "Hale–Bopp",
  "67p": "67P",
  neowise: "NEOWISE",
  "tempel-1": "Tempel 1",
};

export function catalogueIdsFor(
  mode: VisualCatalogueMode,
): readonly VisualBodyId[] {
  if (mode === "all") return visualRegistryIds;
  return visualRegistryIds.filter((id) => {
    const category = visualProfileFor(id).category;
    if (mode === "moons") return category === "featured-moon";
    if (mode === "dwarf-systems") {
      return (
        category === "dwarf-system-satellite" || DWARF_SYSTEM_PARENT_IDS.has(id)
      );
    }
    if (mode === "asteroids") return category === "asteroid";
    if (mode === "dwarf-kuiper") return category === "dwarf-kuiper";
    return category === "comet";
  });
}

const EVIDENCE_GROUPS: Readonly<Record<string, readonly VisualBodyId[]>> = {
  "earth-mars-moons": [
    "moon-earth-moon",
    "moon-mars-phobos",
    "moon-mars-deimos",
  ],
  "galilean-moons": [
    "moon-jupiter-io",
    "moon-jupiter-europa",
    "moon-jupiter-ganymede",
    "moon-jupiter-callisto",
  ],
  "saturn-moons-1": [
    "moon-saturn-mimas",
    "moon-saturn-enceladus",
    "moon-saturn-tethys",
    "moon-saturn-dione",
  ],
  "saturn-moons-2": [
    "moon-saturn-rhea",
    "moon-saturn-titan",
    "moon-saturn-iapetus",
  ],
  "uranus-moons": [
    "moon-uranus-miranda",
    "moon-uranus-ariel",
    "moon-uranus-umbriel",
    "moon-uranus-titania",
    "moon-uranus-oberon",
  ],
  "neptune-moons": [
    "moon-neptune-proteus",
    "moon-neptune-triton",
    "moon-neptune-nereid",
  ],
  "main-belt-worlds": ["ceres", "vesta", "pallas", "hygiea"],
  "dwarf-worlds-1": ["pluto", "eris", "haumea", "makemake"],
  "dwarf-worlds-2": ["quaoar", "gonggong", "sedna", "orcus"],
};

export function catalogueEvidenceIdsFor(
  evidenceGroup: string | null | undefined,
): readonly VisualBodyId[] | null {
  return evidenceGroup ? (EVIDENCE_GROUPS[evidenceGroup] ?? null) : null;
}

export function cataloguePageFor(
  mode: VisualCatalogueMode,
  page: number,
): {
  readonly ids: readonly VisualBodyId[];
  readonly page: number;
  readonly pageCount: number;
  readonly totalCount: number;
} {
  const allIds = catalogueIdsFor(mode);
  const pageCount = Math.max(
    1,
    Math.ceil(allIds.length / VISUAL_CATALOGUE_PAGE_SIZE),
  );
  const safePage = Math.min(pageCount, Math.max(1, Math.round(page)));
  return {
    ids: allIds.slice(
      (safePage - 1) * VISUAL_CATALOGUE_PAGE_SIZE,
      safePage * VISUAL_CATALOGUE_PAGE_SIZE,
    ),
    page: safePage,
    pageCount,
    totalCount: allIds.length,
  };
}

function CatalogueCometTail({ bodyId }: { bodyId: VisualBodyId }) {
  const visual = visualProfileFor(bodyId).comet;
  if (!visual) return null;
  return (
    <group
      position={[0.25, 0, -0.08]}
      rotation-z={-Math.PI / 2}
      scale={0.13}
      userData={{ testCatalogueTailBodyId: bodyId }}
    >
      <mesh position={[0, -visual.dustLength / 2, 0]}>
        <coneGeometry
          args={[visual.dustWidth, visual.dustLength, 18, 1, true]}
        />
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

function displayNameFor(bodyId: VisualBodyId): string {
  return DISPLAY_NAMES[bodyId] ?? bodyId.replaceAll("-", " ");
}

function CatalogueLabelOverlay({
  columns,
  ids,
  rows,
}: {
  columns: number;
  ids: readonly VisualBodyId[];
  rows: number;
}) {
  useEffect(() => {
    const overlay = document.createElement("div");
    overlay.dataset.catalogueLabelOverlay = "true";
    Object.assign(overlay.style, {
      alignItems: "stretch",
      display: "grid",
      gap: "0.75rem",
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      height: rows === 1 ? "46vh" : "72vh",
      left: "50%",
      maxWidth: "1180px",
      pointerEvents: "none",
      position: "fixed",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: columns === 1 ? "42vw" : "92vw",
      zIndex: "30",
    });

    for (const bodyId of ids) {
      const cell = document.createElement("div");
      Object.assign(cell.style, {
        alignItems: "flex-end",
        display: "flex",
        justifyContent: "center",
        minWidth: "0",
        paddingBottom: "0.4rem",
      });
      const label = document.createElement("span");
      label.dataset.catalogueLabel = bodyId;
      label.textContent = displayNameFor(bodyId);
      Object.assign(label.style, {
        color: "#eef4ff",
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        fontWeight: "650",
        letterSpacing: "0.04em",
        textShadow: "0 1px 4px #000",
        whiteSpace: "nowrap",
      });
      cell.append(label);
      overlay.append(cell);
    }

    document.body.append(overlay);
    return () => overlay.remove();
  }, [columns, ids, rows]);

  return null;
}

function CatalogueTile({
  bodyId,
  position,
}: {
  bodyId: VisualBodyId;
  position: readonly [number, number, number];
}) {
  const profile = visualProfileFor(bodyId);
  const radius = profile.ring ? 0.46 : profile.comet ? 0.58 : 0.68;
  return (
    <group
      position={position as [number, number, number]}
      userData={{
        testCatalogueBodyId: bodyId,
        testCatalogueGeometryKind: profile.geometry.kind,
      }}
    >
      <mesh position={[0, 0, -0.7]}>
        <planeGeometry args={[2.65, 2.55]} />
        <meshBasicMaterial
          color="#0a101b"
          depthWrite={false}
          opacity={0.62}
          transparent
        />
      </mesh>
      <CelestialVisualSurface bodyId={bodyId} radius={radius} />
      <CatalogueCometTail bodyId={bodyId} />
    </group>
  );
}

export function VisualTestCatalogue({
  evidenceGroup,
  mode,
  page = 1,
}: {
  evidenceGroup?: string | null;
  mode: VisualCatalogueMode;
  page?: number;
}) {
  const camera = useThree((state) => state.camera);
  const cataloguePage = useMemo(
    () => cataloguePageFor(mode, page),
    [mode, page],
  );
  const evidenceIds = useMemo(
    () => catalogueEvidenceIdsFor(evidenceGroup),
    [evidenceGroup],
  );
  const ids = evidenceIds ?? cataloguePage.ids;
  const safePage = evidenceIds ? 1 : cataloguePage.page;
  const pageCount = evidenceIds ? 1 : cataloguePage.pageCount;
  const totalCount = evidenceIds?.length ?? cataloguePage.totalCount;
  const columns = Math.min(4, Math.max(1, ids.length));
  const rows = Math.ceil(ids.length / columns);
  const spacingX = 2.95;
  const spacingY = 2.85;

  useEffect(() => {
    camera.position.set(0, 0, rows === 1 ? 8.2 : 10.8);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, rows]);

  return (
    <>
      <group
        userData={{
          testCatalogue: true,
          testCatalogueEvidenceGroup: evidenceGroup ?? null,
          testCatalogueMode: mode,
          testCataloguePage: safePage,
          testCataloguePageCount: pageCount,
          testCatalogueTotalCount: totalCount,
          testCatalogueTileCount: ids.length,
        }}
      >
        <ambientLight intensity={0.34} />
        <directionalLight intensity={2.15} position={[6, 8, 12]} />
        <directionalLight intensity={0.35} position={[-7, -3, 4]} />
        {ids.map((bodyId, index) => {
          const column = index % columns;
          const row = Math.floor(index / columns);
          const x = (column - (columns - 1) / 2) * spacingX;
          const y = ((rows - 1) / 2 - row) * spacingY;
          return (
            <CatalogueTile key={bodyId} bodyId={bodyId} position={[x, y, 0]} />
          );
        })}
      </group>
      <CatalogueLabelOverlay columns={columns} ids={ids} rows={rows} />
    </>
  );
}
