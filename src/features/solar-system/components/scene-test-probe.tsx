"use client";

import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import type { Material, Mesh, Object3D, ShaderMaterial, Texture } from "three";

import { cameraRuntimeSnapshot } from "@/features/solar-system/lib/camera-runtime";
import { regionFocusAnchorOffset } from "@/features/solar-system/lib/region-visual-policy";
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
  readonly camera: ReturnType<typeof cameraRuntimeSnapshot>;
  readonly catalogue: {
    readonly enabled: boolean;
    readonly mode: string | null;
    readonly page: number;
    readonly pageCount: number;
    readonly totalCount: number;
    readonly tileCount: number;
    readonly bodyIds: readonly string[];
  };
  readonly cityLights: {
    readonly materialReady: boolean;
    readonly texturePath: string | null;
    readonly textureReady: boolean;
    readonly uniformsReady: boolean;
  };
  readonly backdrop: {
    readonly distanceAttenuation: number;
    readonly distanceDimmingEnabled: boolean;
    readonly localStarsMounted: boolean;
    readonly localStarsOpacity: number;
    readonly milkyWayMounted: boolean;
    readonly milkyWayOpacity: number;
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
  readonly regions: Readonly<
    Record<
      string,
      {
        readonly selected: boolean;
        readonly visualState: string;
        readonly visualKind: string;
        readonly representation: string;
        readonly pointCount: number;
        readonly visibleOpacity: number;
        readonly ambientOpacity: number;
        readonly selectedOpacity: number;
        readonly radialExtent: readonly [number, number];
        readonly verticalExtent: number;
        readonly projectedCenter: readonly [number, number];
        readonly projectedBounds: readonly [number, number, number, number];
        readonly projectedCoverage: number;
        readonly viewportVisible: boolean;
        readonly cameraFramingExtent: number;
        readonly cameraPreferredDirection: readonly [number, number, number];
        readonly focusAnchorProjected: readonly [number, number];
        readonly sunProjected: readonly [number, number];
        readonly sunProjectedCoverage: number;
        readonly macroEnvelopeMounted: boolean;
        readonly macroEnvelopeOpacity: number;
        readonly macroEnvelopeCoverage: number;
        readonly minimumViewportCoverage: number;
        readonly maximumViewportCoverage: number;
        readonly drawCalls: number;
        readonly materialCount: number;
        readonly distributionSignature: string;
        readonly boundaryCount: number;
        readonly boundaryRepresentation: string | null;
        readonly layers: readonly string[];
      }
    >
  >;
  readonly screenTargets: Readonly<
    Record<
      string,
      {
        readonly visible: boolean;
        readonly x: number;
        readonly y: number;
      }
    >
  >;
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
  const camera = useThree((state) => state.camera);
  const frame = useRef(0);
  const worldPosition = useRef(new Vector3());
  const projectedPosition = useRef(new Vector3());
  const regionCenter = useRef(new Vector3());
  const regionFocusAnchor = useRef(new Vector3());
  const sunWorldPosition = useRef(new Vector3());

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
      page: 1,
      pageCount: 1,
      totalCount: 0,
      tileCount: 0,
      bodyIds: [] as string[],
    };
    const mountedBodyIds = new Set<string>();
    const visibleBodyIds = new Set<string>();
    const interactiveBodyIds = new Set<string>();
    const visibleOrbitBodyIds = new Set<string>();
    const visibleLabelBodyIds = new Set<string>();
    const screenTargets: Record<
      string,
      { visible: boolean; x: number; y: number }
    > = {};
    const canvasBounds = gl.domElement.getBoundingClientRect();
    const regionRoots: Object3D[] = [];
    const regionLayers = new Map<string, string[]>();
    const backdrop = {
      distanceAttenuation: scene.fog ? 1 : 0,
      distanceDimmingEnabled: scene.fog !== null,
      localStarsMounted: false,
      localStarsOpacity: 0,
      milkyWayMounted: false,
      milkyWayOpacity: 0,
    };
    let sunProjected: [number, number] = [0.5, 0.5];
    let sunProjectedCoverage = 0;
    let sunRenderRadius = 0;

    scene.traverse((object) => {
      const backdropLayer = object.userData.testBackdropLayer as
        string | undefined;
      if (backdropLayer === "local-stars" || backdropLayer === "milky-way") {
        const opacity = materialsFor(object).reduce(
          (maximum, material) =>
            Math.max(maximum, Number(material.opacity ?? 0)),
          0,
        );
        if (backdropLayer === "local-stars") {
          backdrop.localStarsMounted = true;
          backdrop.localStarsOpacity = Math.max(
            backdrop.localStarsOpacity,
            opacity,
          );
        } else {
          backdrop.milkyWayMounted = true;
          backdrop.milkyWayOpacity = Math.max(
            backdrop.milkyWayOpacity,
            opacity,
          );
        }
      }

      const regionId = object.userData.testRegionId as string | undefined;
      if (regionId) regionRoots.push(object);
      const regionLayer = object.userData.testRegionLayer as string | undefined;
      if (regionLayer) {
        let owner: Object3D | null = object;
        while (owner && !owner.userData.testRegionId) owner = owner.parent;
        const ownerId = owner?.userData.testRegionId as string | undefined;
        if (ownerId) {
          const layers = regionLayers.get(ownerId) ?? [];
          if (!layers.includes(regionLayer)) layers.push(regionLayer);
          regionLayers.set(ownerId, layers);
        }
      }
      if (object.userData.testCatalogue === true) {
        catalogue.enabled = true;
        catalogue.mode = String(object.userData.testCatalogueMode ?? "unknown");
        catalogue.page = Number(object.userData.testCataloguePage ?? 1);
        catalogue.pageCount = Number(
          object.userData.testCataloguePageCount ?? 1,
        );
        catalogue.totalCount = Number(
          object.userData.testCatalogueTotalCount ?? 0,
        );
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
        object.getWorldPosition(projectedPosition.current);
        projectedPosition.current.project(camera);
        const visible =
          objectVisible &&
          projectedPosition.current.z >= -1 &&
          projectedPosition.current.z <= 1 &&
          projectedPosition.current.x >= -1 &&
          projectedPosition.current.x <= 1 &&
          projectedPosition.current.y >= -1 &&
          projectedPosition.current.y <= 1;
        screenTargets[rootBodyId] = {
          visible,
          x:
            canvasBounds.left +
            ((projectedPosition.current.x + 1) / 2) * canvasBounds.width,
          y:
            canvasBounds.top +
            ((1 - projectedPosition.current.y) / 2) * canvasBounds.height,
        };
        if (rootBodyId === "sun") {
          object.getWorldPosition(sunWorldPosition.current);
          sunProjected = [
            (projectedPosition.current.x + 1) / 2,
            (1 - projectedPosition.current.y) / 2,
          ];
          const cameraTarget = object.userData.cameraTarget as
            { renderRadius?: number } | undefined;
          sunRenderRadius = Number(
            cameraTarget?.renderRadius ?? object.userData.renderRadius ?? 0,
          );
        }
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

    const regions: Record<string, HeliosSceneTestSnapshot["regions"][string]> =
      {};
    const perspectiveFov =
      camera instanceof PerspectiveCamera ? camera.fov : 46;
    const halfVerticalFov = Math.max(0.04, (perspectiveFov * Math.PI) / 360);
    const viewportAspect = Math.max(
      0.1,
      canvasBounds.width / Math.max(canvasBounds.height, 1),
    );
    const sunDistance = Math.max(
      0.001,
      camera.position.distanceTo(sunWorldPosition.current),
    );
    sunProjectedCoverage =
      sunRenderRadius /
      Math.max(0.001, sunDistance * Math.tan(halfVerticalFov));

    for (const root of regionRoots) {
      const id = String(root.userData.testRegionId);
      root.getWorldPosition(regionCenter.current);
      const focusAnchor = root.userData.testRegionFocusAnchor as
        | {
            radialFraction?: number;
            azimuthDeg?: number;
            heightFraction?: number;
          }
        | undefined;
      const framingExtent = Number(
        root.userData.testRegionCameraFramingExtent ?? 0,
      );
      const anchorOffset = regionFocusAnchorOffset({
        framingExtent,
        preferredDirection: [1, 0, 0],
        focusAnchor: {
          radialFraction: Number(focusAnchor?.radialFraction ?? 0),
          azimuthDeg: Number(focusAnchor?.azimuthDeg ?? 0),
          heightFraction: Number(focusAnchor?.heightFraction ?? 0),
        },
        minimumViewportCoverage: 0,
        maximumViewportCoverage: 1,
      });
      regionFocusAnchor.current.copy(regionCenter.current);
      regionFocusAnchor.current.x += anchorOffset[0];
      regionFocusAnchor.current.y += anchorOffset[1];
      regionFocusAnchor.current.z += anchorOffset[2];
      const distance = Math.max(
        0.001,
        camera.position.distanceTo(regionFocusAnchor.current),
      );
      projectedPosition.current.copy(regionCenter.current).project(camera);
      const centerX = projectedPosition.current.x;
      const centerY = projectedPosition.current.y;
      projectedPosition.current.copy(regionFocusAnchor.current).project(camera);
      const focusAnchorProjected: [number, number] = [
        (projectedPosition.current.x + 1) / 2,
        (1 - projectedPosition.current.y) / 2,
      ];
      const verticalCoverage =
        framingExtent / Math.max(0.001, distance * Math.tan(halfVerticalFov));
      const horizontalCoverage = verticalCoverage / viewportAspect;
      const coverage = Math.max(verticalCoverage, horizontalCoverage);
      const minX = centerX - horizontalCoverage;
      const maxX = centerX + horizontalCoverage;
      const minY = centerY - verticalCoverage;
      const maxY = centerY + verticalCoverage;
      const radial = root.userData.testRegionRadialExtent as
        readonly number[] | undefined;
      const direction = root.userData.testRegionCameraPreferredDirection as
        readonly number[] | undefined;
      const macroEnvelopeExtent = Number(
        root.userData.testRegionMacroEnvelopeCoverageExtent ?? 0,
      );
      const macroEnvelopeCoverage =
        macroEnvelopeExtent > 0
          ? macroEnvelopeExtent /
            Math.max(0.001, distance * Math.tan(halfVerticalFov))
          : 0;
      regions[id] = {
        selected: root.userData.testRegionVisualState === "selected",
        visualState: String(root.userData.testRegionVisualState ?? "ambient"),
        visualKind: String(root.userData.testRegionKind ?? "unknown"),
        representation: String(
          root.userData.testRegionRepresentation ?? "context-layer",
        ),
        pointCount: Number(root.userData.testRegionPointCount ?? 0),
        visibleOpacity: Number(root.userData.testRegionVisibleOpacity ?? 0),
        ambientOpacity: Number(root.userData.testRegionAmbientOpacity ?? 0),
        selectedOpacity: Number(root.userData.testRegionSelectedOpacity ?? 0),
        radialExtent: [Number(radial?.[0] ?? 0), Number(radial?.[1] ?? 0)],
        verticalExtent: Number(root.userData.testRegionVerticalExtent ?? 0),
        projectedCenter: [(centerX + 1) / 2, (1 - centerY) / 2],
        projectedBounds: [
          (minX + 1) / 2,
          (1 - maxY) / 2,
          (maxX + 1) / 2,
          (1 - minY) / 2,
        ],
        projectedCoverage: coverage,
        viewportVisible:
          projectedPosition.current.z >= -1 &&
          projectedPosition.current.z <= 1 &&
          maxX >= -1 &&
          minX <= 1 &&
          maxY >= -1 &&
          minY <= 1,
        cameraFramingExtent: framingExtent,
        cameraPreferredDirection: [
          Number(direction?.[0] ?? 0),
          Number(direction?.[1] ?? 0),
          Number(direction?.[2] ?? 0),
        ],
        focusAnchorProjected,
        sunProjected,
        sunProjectedCoverage,
        macroEnvelopeMounted: Boolean(
          root.userData.testRegionMacroEnvelopeMounted,
        ),
        macroEnvelopeOpacity: Number(
          root.userData.testRegionMacroEnvelopeOpacity ?? 0,
        ),
        macroEnvelopeCoverage,
        minimumViewportCoverage: Number(
          root.userData.testRegionMinimumCoverage ?? 0,
        ),
        maximumViewportCoverage: Number(
          root.userData.testRegionMaximumCoverage ?? 1,
        ),
        drawCalls: Number(root.userData.testRegionDrawCalls ?? 0),
        materialCount: Number(root.userData.testRegionMaterialCount ?? 0),
        distributionSignature: String(
          root.userData.testRegionDistributionSignature ?? "",
        ),
        boundaryCount: Number(root.userData.testRegionBoundaryCount ?? 0),
        boundaryRepresentation:
          typeof root.userData.testRegionBoundaryRepresentation === "string"
            ? root.userData.testRegionBoundaryRepresentation
            : null,
        layers: regionLayers.get(id) ?? [],
      };
    }

    const cityMaterial = cityMaterials[0];
    const simulationState = useSimulationStore.getState();
    const cityTexture = cityMaterial?.uniforms.uNightMap?.value as
      Texture | null | undefined;
    window.__HELIOS_SCENE_TEST__ = {
      camera: cameraRuntimeSnapshot(),
      backdrop,
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
      regions,
      screenTargets,
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
