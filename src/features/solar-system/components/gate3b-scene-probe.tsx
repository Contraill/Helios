"use client";

import { useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Quaternion, Vector3 } from "three";
import type { Material, Mesh, Object3D } from "three";

export interface Gate3BCatalogueBodyProbe {
  readonly geometryKind: string;
  readonly surfaceReady: boolean;
  readonly fallbackVisible: boolean;
  readonly finalSurfaceVisible: boolean;
  readonly ringMounted: boolean;
  readonly ringOuterRadius: number;
  readonly ringParentTransform: string | null;
  readonly atmosphereMounted: boolean;
  readonly texturePath: string;
  readonly assetRepresentation: string;
  readonly primeMeridianVerified: boolean;
  readonly orientationApplied: boolean;
  readonly rotationKind: string;
  readonly rotationAngle: number;
  readonly tidalFacingDot: number | null;
}

export interface Gate3BCometProbe {
  readonly nucleusFocusRadius: number;
  readonly tailLength: number;
  readonly tailIncludedInFocusBounds: false;
  readonly tailAnchorDistance: number;
  readonly antiSolarDot: number;
  readonly activity: number;
  readonly tailPrimitive: string;
  readonly dustParticleCount: number;
  readonly ionParticleCount: number;
  readonly comaParticleCount: number;
  readonly totalParticleCount: number;
}

export interface Gate3BDwarfOrbitPlaneProbe {
  readonly status: string;
  readonly inclinationDeg: number | null;
  readonly reference: string;
  readonly sourceId: string | null;
  readonly orbitNormal: readonly [number, number, number];
}

export interface Gate3BOrbitProbe {
  readonly geometryUuid: string;
  readonly materialUuid: string;
  readonly emphasis: "hidden" | "context" | "selected";
  readonly dashed: false;
  readonly closed: boolean;
  readonly maxChordToBoundsRatio: number;
  readonly maxToMedianSegmentRatio: number;
  readonly visible: boolean;
}

export interface Gate3BRingProbe {
  readonly bandCount: number;
  readonly arcCount: number;
  readonly arcsOpen: boolean;
  readonly parentTransform: string;
  readonly planeNormal: readonly [number, number, number];
  readonly textureReady: boolean | null;
  readonly outerRadius: number;
}

export interface Gate3BSceneProbeSnapshot {
  readonly catalogueBodies: Readonly<Record<string, Gate3BCatalogueBodyProbe>>;
  readonly comets: Readonly<Record<string, Gate3BCometProbe>>;
  readonly dwarfOrbitPlanes: Readonly<
    Record<string, Gate3BDwarfOrbitPlaneProbe>
  >;
  readonly orbits: Readonly<Record<string, Gate3BOrbitProbe>>;
  readonly rings: Readonly<Record<string, Gate3BRingProbe>>;
}

declare global {
  interface Window {
    __HELIOS_ENABLE_SCENE_TEST__?: boolean;
    __HELIOS_GATE3B_SCENE_TEST__?: Gate3BSceneProbeSnapshot;
  }
}

function isEffectivelyVisible(object: Object3D): boolean {
  let current: Object3D | null = object;
  while (current) {
    if (!current.visible) return false;
    current = current.parent;
  }
  return true;
}

function materialsFor(object: Object3D): readonly Material[] {
  const material = (object as Mesh).material;
  if (!material) return [];
  return Array.isArray(material) ? material : [material];
}

function ActiveGate3BSceneProbe() {
  const scene = useThree((state) => state.scene);

  useFrame(() => {
    const catalogueBodies: Record<string, Gate3BCatalogueBodyProbe> = {};
    const comets: Record<string, Gate3BCometProbe> = {};
    const dwarfOrbitPlanes: Record<string, Gate3BDwarfOrbitPlaneProbe> = {};
    const orbits: Record<string, Gate3BOrbitProbe> = {};
    const rings: Record<string, Gate3BRingProbe> = {};
    const worldQuaternion = new Quaternion();
    const ringNormal = new Vector3(0, 0, 1);
    const surfaceForward = new Vector3();
    const directionToParent = new Vector3();

    scene.traverse((object) => {
      const profileId = object.userData.visualProfileId as string | undefined;
      if (profileId) {
        const rotationKind = String(object.userData.rotationKind ?? "unknown");
        const parentPosition = object.parent?.position;
        const tidalFacingDot =
          rotationKind === "tidally-locked" &&
          parentPosition &&
          parentPosition.lengthSq() > 1e-12
            ? surfaceForward
                .set(0, 0, 1)
                .applyQuaternion(object.quaternion)
                .normalize()
                .dot(
                  directionToParent
                    .copy(parentPosition)
                    .multiplyScalar(-1)
                    .normalize(),
                )
            : null;
        catalogueBodies[profileId] = {
          geometryKind: String(object.userData.geometryKind ?? "unknown"),
          surfaceReady: object.userData.testSurfaceReadiness === "ready",
          fallbackVisible: false,
          finalSurfaceVisible: false,
          ringMounted: Boolean(object.userData.ringMounted),
          ringOuterRadius: Number(object.userData.ringOuterRadius ?? 0),
          ringParentTransform:
            typeof object.userData.ringParentTransform === "string"
              ? object.userData.ringParentTransform
              : null,
          atmosphereMounted: Boolean(object.userData.atmosphereMounted),
          texturePath: String(object.userData.texturePath ?? ""),
          assetRepresentation: String(
            object.userData.assetRepresentation ?? "missing",
          ),
          primeMeridianVerified: Boolean(object.userData.primeMeridianVerified),
          orientationApplied: Boolean(object.userData.orientationApplied),
          rotationKind,
          rotationAngle: Number(object.userData.testRotationAngle ?? 0),
          tidalFacingDot,
        };
      }

      for (const material of materialsFor(object)) {
        const bodyId = material.userData.testSurfaceBodyId as
          string | undefined;
        const role = material.userData.testSurfaceRole as string | undefined;
        if (!bodyId) continue;
        const entry = catalogueBodies[bodyId];
        if (!entry) continue;
        const visible =
          isEffectivelyVisible(object) && Number(material.opacity ?? 1) > 0.01;
        if (role === "fallback" && visible) {
          catalogueBodies[bodyId] = { ...entry, fallbackVisible: true };
        }
        if (role === "final" && visible) {
          catalogueBodies[bodyId] = {
            ...entry,
            finalSurfaceVisible: true,
          };
        }
      }

      const orbitPlaneStatus = object.userData.orbitPlaneStatus as
        string | undefined;
      const orbitPlaneBodyId = object.userData.bodyId as string | undefined;
      if (orbitPlaneStatus && orbitPlaneBodyId) {
        const rawNormal = object.userData.orbitNormal as
          readonly number[] | undefined;
        dwarfOrbitPlanes[orbitPlaneBodyId] = {
          status: orbitPlaneStatus,
          inclinationDeg:
            typeof object.userData.orbitPlaneInclinationDeg === "number"
              ? object.userData.orbitPlaneInclinationDeg
              : null,
          reference: String(object.userData.orbitPlaneReference ?? ""),
          sourceId:
            typeof object.userData.orbitPlaneSourceId === "string"
              ? object.userData.orbitPlaneSourceId
              : null,
          orbitNormal: [
            Number(rawNormal?.[0] ?? 0),
            Number(rawNormal?.[1] ?? 1),
            Number(rawNormal?.[2] ?? 0),
          ],
        };
      }

      const cometId = object.userData.testCometBodyId as string | undefined;
      if (cometId) {
        comets[cometId] = {
          nucleusFocusRadius: Number(object.userData.nucleusFocusRadius ?? 0),
          tailLength: Number(object.userData.tailLength ?? 0),
          tailIncludedInFocusBounds: false,
          tailAnchorDistance: Number(object.userData.tailAnchorDistance ?? 0),
          antiSolarDot: Number(object.userData.antiSolarDot ?? 0),
          activity: Number(object.userData.activity ?? 0),
          tailPrimitive: String(
            object.userData.testCometTailPrimitive ?? "unknown",
          ),
          dustParticleCount: Number(
            object.userData.testCometDustParticleCount ?? 0,
          ),
          ionParticleCount: Number(
            object.userData.testCometIonParticleCount ?? 0,
          ),
          comaParticleCount: Number(
            object.userData.testCometComaParticleCount ?? 0,
          ),
          totalParticleCount: Number(
            object.userData.testCometTotalParticleCount ?? 0,
          ),
        };
      }

      const ringPlanetId = object.userData.testPlanetaryRingPlanetId as
        string | undefined;
      if (ringPlanetId) {
        const previous = rings[ringPlanetId];
        object.getWorldQuaternion(worldQuaternion);
        const normal = ringNormal
          .set(0, 0, 1)
          .applyQuaternion(worldQuaternion)
          .normalize();
        rings[ringPlanetId] = {
          bandCount: Math.max(
            previous?.bandCount ?? 0,
            Number(object.userData.testPlanetaryRingBandCount ?? 0),
          ),
          arcCount: Math.max(
            previous?.arcCount ?? 0,
            Number(object.userData.testPlanetaryRingArcCount ?? 0),
          ),
          arcsOpen:
            typeof object.userData.testPlanetaryRingArcsOpen === "boolean"
              ? object.userData.testPlanetaryRingArcsOpen
              : (previous?.arcsOpen ?? true),
          parentTransform: String(
            object.userData.testRingParentTransform ??
              previous?.parentTransform ??
              "unknown",
          ),
          planeNormal: [normal.x, normal.y, normal.z],
          textureReady:
            typeof object.userData.testSaturnRingTextureReady === "boolean"
              ? object.userData.testSaturnRingTextureReady
              : (previous?.textureReady ?? null),
          outerRadius: Math.max(
            previous?.outerRadius ?? 0,
            Number(object.userData.testPlanetaryRingOuterRadius ?? 0),
          ),
        };
      }

      const orbitId = object.userData.testOrbitBodyId as string | undefined;
      if (orbitId) {
        const emphasis = String(
          object.userData.testOrbitEmphasis ?? "context",
        ) as Gate3BOrbitProbe["emphasis"];
        orbits[orbitId] = {
          geometryUuid: String(object.userData.testGeometryUuid ?? ""),
          materialUuid: String(object.userData.testMaterialUuid ?? ""),
          emphasis,
          dashed: false,
          closed: Boolean(object.userData.testOrbitClosed),
          maxChordToBoundsRatio: Number(
            object.userData.testOrbitMaxChordToBoundsRatio ??
              Number.POSITIVE_INFINITY,
          ),
          maxToMedianSegmentRatio: Number(
            object.userData.testOrbitMaxToMedianSegmentRatio ??
              Number.POSITIVE_INFINITY,
          ),
          visible: isEffectivelyVisible(object),
        };
      }
    });

    window.__HELIOS_GATE3B_SCENE_TEST__ = {
      catalogueBodies,
      comets,
      dwarfOrbitPlanes,
      orbits,
      rings,
    };
  }, 1);

  return null;
}

export function Gate3BSceneProbe() {
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      (new URLSearchParams(window.location.search).get("sceneTest") === "1" ||
        window.__HELIOS_ENABLE_SCENE_TEST__ === true),
  );

  return enabled ? <ActiveGate3BSceneProbe /> : null;
}
