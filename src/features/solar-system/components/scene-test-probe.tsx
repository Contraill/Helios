"use client";

import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { Material, Mesh, Object3D, ShaderMaterial, Texture } from "three";

import { useSceneVisibilityStore } from "@/stores/scene-visibility-store";
import {
  currentSimulationTimeMs,
  useSimulationStore,
} from "@/stores/simulation-store";

import {
  textureCacheSnapshot,
  textureDisposalCount,
  textureReadinessDetails,
} from "@/features/solar-system/lib/texture-cache";

export interface HeliosSceneTestSnapshot {
  readonly catalogue: {
    readonly enabled: boolean;
    readonly mode: string | null;
    readonly tileCount: number;
    readonly bodyIds: readonly string[];
  };
  readonly cityLights: {
    readonly materialReady: boolean;
    readonly texturePath: string | null;
    readonly textureReady: boolean;
    readonly uniformsReady: boolean;
  };
  readonly frame: number;
  readonly gpu: {
    readonly drawCalls: number;
    readonly geometries: number;
    readonly programs: number;
    readonly textures: number;
  };
  readonly bodyPositions: Readonly<
    Record<
      string,
      {
        readonly position: readonly [number, number, number];
        readonly referenceFrame: string | null;
        readonly representationType: string | null;
      }
    >
  >;
  readonly cometTails: Readonly<
    Record<
      string,
      {
        readonly activity: number;
        readonly antiSolarDirection: readonly [number, number, number] | null;
        readonly heliocentricDistanceAu: number;
        readonly visible: boolean;
      }
    >
  >;
  readonly orbitResources: Readonly<
    Record<
      string,
      {
        readonly boundsRadius: number;
        readonly geometryUuid: string;
        readonly materialUuid: string;
        readonly orbitClass: "planet" | "moon" | "extended";
        readonly visible: boolean;
      }
    >
  >;
  readonly orbits: Readonly<Record<"planet" | "moon" | "extended", number>>;
  readonly sceneContract: {
    readonly mountedBodyIds: readonly string[];
    readonly visibleBodyIds: readonly string[];
    readonly interactiveBodyIds: readonly string[];
    readonly visibleOrbitBodyIds: readonly string[];
    readonly visibleLabelBodyIds: readonly string[];
    readonly visibilityCategories: Readonly<Record<string, boolean>>;
  };
  readonly simulation: {
    readonly atMs: number;
    readonly isPaused: boolean;
  };
  readonly surfaces: Readonly<Record<string, string | null>>;
  readonly textureCache: ReturnType<typeof textureCacheSnapshot>;
  readonly textureDisposals: number;
  readonly textureReadiness: ReturnType<typeof textureReadinessDetails>;
}

declare global {
  interface Window {
    __HELIOS_ENABLE_SCENE_TEST__?: boolean;
    __HELIOS_SCENE_TEST__?: HeliosSceneTestSnapshot;
  }
}

function materialsFor(object: Object3D): readonly Material[] {
  const material = (object as Mesh).material;
  if (!material) return [];
  return Array.isArray(material) ? material : [material];
}

function texturePath(texture: Texture | null | undefined): string | null {
  return texture?.name?.replace(/^helios:/, "") ?? null;
}

function isEffectivelyVisible(object: Object3D): boolean {
  let current: Object3D | null = object;
  while (current) {
    if (!current.visible) return false;
    current = current.parent;
  }
  return true;
}

/**
 * Direct renderer instrumentation for scene integration tests. It reads mounted Three
 * objects and materials; it does not predict scene state from UI policy.
 */
function ActiveSceneTestProbe() {
  const scene = useThree((state) => state.scene);
  const gl = useThree((state) => state.gl);
  const frame = useRef(0);
  const worldPosition = useRef(new Vector3());

  useFrame(() => {
    frame.current += 1;
    // Acceptance mode samples every real renderer frame. In demand mode this
    // captures loader, selection and profile invalidations without creating a
    // private continuous loop; normal production never mounts this probe.
    if (typeof window === "undefined") return;

    const bodyPositions: Record<
      string,
      {
        position: [number, number, number];
        referenceFrame: string | null;
        representationType: string | null;
      }
    > = {};
    const cometTails: Record<
      string,
      {
        activity: number;
        antiSolarDirection: [number, number, number] | null;
        heliocentricDistanceAu: number;
        visible: boolean;
      }
    > = {};
    const orbitResources: Record<
      string,
      {
        boundsRadius: number;
        geometryUuid: string;
        materialUuid: string;
        orbitClass: "planet" | "moon" | "extended";
        visible: boolean;
      }
    > = {};
    const orbits = { planet: 0, moon: 0, extended: 0 };
    const surfaces: Record<string, string | null> = {};
    const cityMaterials: ShaderMaterial[] = [];
    const catalogue = {
      enabled: false,
      mode: null as string | null,
      tileCount: 0,
      bodyIds: [] as string[],
    };
    const mountedBodyIds = new Set<string>();
    const visibleBodyIds = new Set<string>();
    const interactiveBodyIds = new Set<string>();
    const visibleOrbitBodyIds = new Set<string>();
    const visibleLabelBodyIds = new Set<string>();

    scene.traverse((object) => {
      if (object.userData.testCatalogue === true) {
        catalogue.enabled = true;
        catalogue.mode = String(object.userData.testCatalogueMode ?? "unknown");
        catalogue.tileCount = Number(
          object.userData.testCatalogueTileCount ?? 0,
        );
      }
      const catalogueBodyId = object.userData.testCatalogueBodyId as
        string | undefined;
      if (catalogueBodyId) catalogue.bodyIds.push(catalogueBodyId);

      const orbitClass = object.userData.testOrbitClass as
        keyof typeof orbits | undefined;
      const orbitBodyId = object.userData.testOrbitBodyId as string | undefined;
      const objectVisible = isEffectivelyVisible(object);
      if (orbitClass && objectVisible) orbits[orbitClass] += 1;
      if (orbitClass && orbitBodyId && objectVisible) {
        visibleOrbitBodyIds.add(orbitBodyId);
      }
      if (orbitClass && orbitBodyId) {
        orbitResources[orbitBodyId] = {
          boundsRadius: Number(object.userData.testBoundsRadius ?? 0),
          geometryUuid: String(object.userData.testGeometryUuid ?? ""),
          materialUuid: String(object.userData.testMaterialUuid ?? ""),
          orbitClass,
          visible: objectVisible,
        };
      }

      const rootBodyId = object.userData.testBodyRoot
        ? (object.userData.bodyId as string | undefined)
        : undefined;
      if (rootBodyId) {
        mountedBodyIds.add(rootBodyId);
        if (objectVisible) visibleBodyIds.add(rootBodyId);
      }
      const interactiveBodyId = object.userData.testInteractiveBodyId as
        string | undefined;
      if (interactiveBodyId && objectVisible) {
        interactiveBodyIds.add(interactiveBodyId);
      }
      const labelBodyId = object.userData.testLabelBodyId as string | undefined;
      if (labelBodyId && objectVisible) visibleLabelBodyIds.add(labelBodyId);

      const bodyId = object.userData.bodyId as string | undefined;
      if (bodyId && !bodyPositions[bodyId]) {
        object.getWorldPosition(worldPosition.current);
        bodyPositions[bodyId] = {
          position: [
            worldPosition.current.x,
            worldPosition.current.y,
            worldPosition.current.z,
          ],
          referenceFrame:
            typeof object.userData.referenceFrame === "string"
              ? object.userData.referenceFrame
              : null,
          representationType:
            typeof object.userData.representationType === "string"
              ? object.userData.representationType
              : null,
        };
      }

      const cometBodyId = object.userData.testCometBodyId as string | undefined;
      if (cometBodyId) {
        const antiSolar = object.userData.antiSolarDirection as
          readonly number[] | undefined;
        cometTails[cometBodyId] = {
          activity: Number(object.userData.activity ?? 0),
          antiSolarDirection:
            antiSolar?.length === 3
              ? [
                  Number(antiSolar[0]),
                  Number(antiSolar[1]),
                  Number(antiSolar[2]),
                ]
              : null,
          heliocentricDistanceAu: Number(
            object.userData.heliocentricDistanceAu ?? Number.POSITIVE_INFINITY,
          ),
          visible: object.visible,
        };
      }

      for (const material of materialsFor(object)) {
        const surfaceBodyId = material.userData.testSurfaceBodyId as
          string | undefined;
        if (surfaceBodyId) {
          surfaces[surfaceBodyId] = texturePath(
            (material as Material & { map?: Texture | null }).map,
          );
        }
        if (material.userData.testMaterial === "earth-city-lights") {
          cityMaterials.push(material as ShaderMaterial);
        }
      }
    });

    const cityMaterial = cityMaterials[0];
    const simulationState = useSimulationStore.getState();
    const cityTexture = cityMaterial?.uniforms.uNightMap?.value as
      Texture | null | undefined;
    window.__HELIOS_SCENE_TEST__ = {
      bodyPositions,
      catalogue,
      cityLights: {
        materialReady: Boolean(cityMaterial),
        texturePath: texturePath(cityTexture),
        textureReady: Boolean(cityTexture),
        uniformsReady: Boolean(
          cityMaterial?.uniforms.uNightMap &&
          cityMaterial.uniforms.uTexelSize &&
          cityMaterial.uniforms.uIntensity,
        ),
      },
      cometTails,
      frame: frame.current,
      gpu: {
        drawCalls: gl.info.render.calls,
        geometries: gl.info.memory.geometries,
        programs: gl.info.programs?.length ?? 0,
        textures: gl.info.memory.textures,
      },
      orbitResources,
      orbits,
      sceneContract: {
        mountedBodyIds: [...mountedBodyIds].sort(),
        visibleBodyIds: [...visibleBodyIds].sort(),
        interactiveBodyIds: [...interactiveBodyIds].sort(),
        visibleOrbitBodyIds: [...visibleOrbitBodyIds].sort(),
        visibleLabelBodyIds: [...visibleLabelBodyIds].sort(),
        visibilityCategories: {
          ...useSceneVisibilityStore.getState().categories,
          orbits: useSceneVisibilityStore.getState().orbitsVisible,
          labels: useSceneVisibilityStore.getState().labelsVisible,
        },
      },
      simulation: {
        atMs: currentSimulationTimeMs(simulationState),
        isPaused: simulationState.isPaused,
      },
      surfaces,
      textureCache: textureCacheSnapshot(),
      textureDisposals: textureDisposalCount(),
      textureReadiness: textureReadinessDetails(),
    };
  });

  return null;
}

export function SceneTestProbe() {
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      (new URLSearchParams(window.location.search).get("sceneTest") === "1" ||
        window.__HELIOS_ENABLE_SCENE_TEST__ === true),
  );

  return enabled ? <ActiveSceneTestProbe /> : null;
}
