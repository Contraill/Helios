"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useCelestialPointerInteraction } from "@/features/solar-system/hooks/use-celestial-pointer-interaction";
import { setCameraTargetMetadata } from "@/features/solar-system/lib/camera-runtime";
import type { ThreeEvent } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Quaternion,
  Vector3,
} from "three";
import type { Group, PointsMaterial } from "three";

import {
  EXTENDED_BODIES,
  cometTailState,
  extendedBodySceneLabel,
  extendedBodyPosition,
  extendedOrbitPoints,
  type ExtendedBody,
  type SystemRegionId,
} from "@/features/solar-system/lib/extended-system";
import { extendedBodySceneMetrics } from "@/features/solar-system/lib/extended-body-scene-metrics";
import { visualProfileFor } from "@/features/solar-system/lib/celestial-visual-registry";
import {
  labelPriorityForBody,
  shouldMountLabel,
} from "@/features/solar-system/lib/label-visibility-policy";
import { extendedBodyOrbitVisibility } from "@/features/solar-system/lib/orbit-visibility-policy";
import { effectiveBodyVisibility } from "@/features/solar-system/lib/scene-visibility-policy";
import {
  buildRegionDistribution,
  regionMacroEnvelopeOpacityFor,
  regionOpacityFor,
  regionPointSizeFor,
  regionVisualProfileFor,
  type RegionVisualProfile,
  type RegionVisualState,
} from "@/features/solar-system/lib/region-visual-policy";
import type { SceneQuality } from "@/features/solar-system/lib/quality";
import { sceneProfileFor } from "@/features/solar-system/lib/scene-profiles";
import { isDwarfSystemParentId } from "@/features/solar-system/types/celestial-body";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import type { PlanetObjectRegistry } from "@/features/solar-system/types/planet-object-registry";
import { useExplorationStore } from "@/stores/exploration-store";
import { useSceneVisibilityStore } from "@/stores/scene-visibility-store";
import {
  currentSimulationTimeMs,
  useSimulationStore,
} from "@/stores/simulation-store";

import { CelestialVisualSurface } from "./celestial-visual-surface";
import { CometTailVolume } from "./comet-tail-volume";
import { DwarfSatelliteSystem } from "./dwarf-satellite-system";
import { OrbitPath } from "./orbit-path";
import { PlanetLabel } from "./planet-label";

const DISABLED_RAYCAST = () => undefined;

interface ExtendedSolarSystemProps {
  labelsVisible: boolean;
  orbitsVisible: boolean;
  planetObjects: PlanetObjectRegistry;
  quality: SceneQuality;
  scaleMode: ScaleMode;
}

function randomGenerator(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function solarWindStreakPositions(
  count: number,
  innerRadius: number,
  outerRadius: number,
) {
  const random = randomGenerator(0x71a2f10a);
  const positions = new Float32Array(count * 2 * 3);
  for (let index = 0; index < count; index += 1) {
    const longitude = random() * Math.PI * 2;
    const latitude = (random() - 0.5) * Math.PI * 0.58;
    const startRadius =
      innerRadius + Math.pow(random(), 0.72) * (outerRadius - innerRadius);
    const length = Math.max(outerRadius * 0.035, startRadius * 0.075);
    const endRadius = Math.min(outerRadius, startRadius + length);
    const direction = [
      Math.cos(latitude) * Math.cos(longitude) * 1.08,
      Math.sin(latitude) * 0.82,
      Math.cos(latitude) * Math.sin(longitude) * 0.94,
    ] as const;
    const offset = index * 6;
    positions[offset] = direction[0] * startRadius;
    positions[offset + 1] = direction[1] * startRadius;
    positions[offset + 2] = direction[2] * startRadius;
    positions[offset + 3] = direction[0] * endRadius;
    positions[offset + 4] = direction[1] * endRadius;
    positions[offset + 5] = direction[2] * endRadius;
  }
  return positions;
}

function RegionRegistry({
  id,
  planetObjects,
  profile,
}: {
  id: SystemRegionId;
  planetObjects: PlanetObjectRegistry;
  profile: RegionVisualProfile;
}) {
  const ref = useRef<Group>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const registry = planetObjects.current;
    node.userData.renderRadius = profile.camera.framingExtent;
    node.userData.cameraFocusRadius = profile.camera.framingExtent;
    setCameraTargetMetadata(node, {
      bodyId: id,
      targetKind: "region",
      renderRadius: profile.camera.framingExtent,
      collisionRadius: profile.collisionRadius,
      focusRadius: profile.camera.framingExtent,
      systemExtent: profile.camera.framingExtent,
      regionPresentation: profile.camera,
    });
    registry.set(id, node);
    return () => {
      registry.delete(id);
    };
  }, [id, planetObjects, profile]);
  return <group ref={ref} userData={{ bodyId: id, testBodyRoot: true }} />;
}

const BELT_ENVELOPE_VERTEX_SHADER = `
varying vec2 vPlane;
void main() {
  vPlane = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const BELT_ENVELOPE_FRAGMENT_SHADER = `
uniform vec3 uColor;
uniform float uInner;
uniform float uKind;
uniform float uOpacity;
uniform float uOuter;
uniform float uPhase;
varying vec2 vPlane;

float softBand(float value, float center, float width) {
  return 1.0 - smoothstep(width * 0.35, width, abs(value - center));
}

void main() {
  float radius = length(vPlane);
  float span = max(0.0001, uOuter - uInner);
  float radial = clamp((radius - uInner) / span, 0.0, 1.0);
  float angle = atan(vPlane.y, vPlane.x);
  float edge = smoothstep(0.0, 0.08, radial) *
    (1.0 - smoothstep(0.82, 1.0, radial));
  float structure;

  if (uKind < 0.5) {
    float gaps = 1.0 - 0.62 * softBand(radial, 0.35, 0.035);
    gaps *= 1.0 - 0.48 * softBand(radial, 0.59, 0.03);
    gaps *= 1.0 - 0.38 * softBand(radial, 0.73, 0.026);
    float clumps = 0.78 + 0.22 * sin(angle * 7.0 + radial * 19.0 + uPhase);
    structure = gaps * clumps;
  } else {
    float classical = 0.72 + 0.28 * softBand(radial, 0.43, 0.24);
    float scattered = 0.58 + 0.42 * sin(angle * 3.0 - radial * 11.0 + uPhase);
    float outerFalloff = 1.0 - smoothstep(0.58, 1.0, radial) * 0.62;
    structure = mix(classical, scattered, smoothstep(0.48, 0.9, radial)) * outerFalloff;
  }

  float alpha = uOpacity * edge * max(0.18, structure);
  if (alpha < 0.002) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`;

const OORT_ENVELOPE_VERTEX_SHADER = `
varying vec3 vLocalPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vLocalPosition = normalize(position);
  vNormal = normalize(normalMatrix * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPosition = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const OORT_ENVELOPE_FRAGMENT_SHADER = `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uPhase;
varying vec3 vLocalPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vec3 direction = normalize(vLocalPosition);
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  float fresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDirection)), 1.7);
  float broadStructure =
    sin(direction.x * 13.0 + direction.z * 7.0 + uPhase) *
    sin(direction.y * 17.0 - direction.x * 5.0 - uPhase * 0.7);
  float fineStructure = sin(
    direction.x * 31.0 + direction.y * 23.0 + direction.z * 19.0 + uPhase
  );
  float sparse = smoothstep(0.08, 0.72, broadStructure * 0.62 + fineStructure * 0.38);
  float latitudeBias = 0.58 + 0.42 * (1.0 - abs(direction.y));
  float alpha = uOpacity * sparse * latitudeBias * (0.2 + fresnel * 0.8);
  if (alpha < 0.002) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`;

function BeltMacroEnvelope({
  profile,
  state,
}: {
  profile: RegionVisualProfile;
  state: RegionVisualState;
}) {
  const envelope = profile.macroEnvelope;
  if (!envelope) return null;
  const opacity = regionMacroEnvelopeOpacityFor(profile, state);
  const [inner, outer] = envelope.radialExtent;
  const layerCount = Math.max(1, envelope.layerCount);

  return (
    <group
      userData={{
        testRegionMacroEnvelope: true,
        testRegionMacroEnvelopeCoverageExtent: envelope.coverageExtent,
        testRegionMacroEnvelopeOpacity: opacity,
        visualLayer: `${profile.bodyId}-macro-envelope`,
      }}
    >
      {Array.from({ length: layerCount }, (_, index) => {
        const centered = index - (layerCount - 1) / 2;
        const layerProgress = layerCount === 1 ? 0 : index / (layerCount - 1);
        const height =
          centered * (envelope.verticalExtent / Math.max(1, layerCount - 1));
        const scaleBias =
          envelope.kind === "volumetric-belt"
            ? centered * 0.012
            : centered * 0.004;
        const tilt =
          envelope.kind === "volumetric-belt"
            ? centered * 0.035
            : centered * 0.008;
        const layerOpacity = opacity * (0.7 - Math.abs(centered) * 0.09);
        return (
          <mesh
            key={`${profile.bodyId}-macro-${index}`}
            position-y={height}
            raycast={DISABLED_RAYCAST}
            rotation={[Math.PI / 2 + tilt, 0, index * 0.09]}
            scale={[1 + scaleBias, 1 + scaleBias, 1]}
            userData={{
              testRegionLayer: `${envelope.kind}-${index}`,
              visualLayer: `${profile.bodyId}-macro-envelope-layer`,
            }}
          >
            <ringGeometry args={[inner, outer, 192, 2]} />
            <shaderMaterial
              depthWrite={false}
              fragmentShader={BELT_ENVELOPE_FRAGMENT_SHADER}
              side={DoubleSide}
              transparent
              uniforms={{
                uColor: { value: new Color(envelope.color) },
                uInner: { value: inner },
                uKind: { value: envelope.kind === "annular-ribbon" ? 0 : 1 },
                uOpacity: { value: Math.max(0, layerOpacity) },
                uOuter: { value: outer },
                uPhase: { value: layerProgress * 2.4 },
              }}
              vertexShader={BELT_ENVELOPE_VERTEX_SHADER}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function OortMacroEnvelope({
  profile,
  state,
}: {
  profile: RegionVisualProfile;
  state: RegionVisualState;
}) {
  const envelope = profile.macroEnvelope;
  if (!envelope || envelope.kind !== "distant-shell") return null;
  const opacity = regionMacroEnvelopeOpacityFor(profile, state);
  const [inner, outer] = envelope.radialExtent;
  const radii = [inner, outer] as const;

  return (
    <group
      userData={{
        testRegionMacroEnvelope: true,
        testRegionMacroEnvelopeCoverageExtent: envelope.coverageExtent,
        testRegionMacroEnvelopeOpacity: opacity,
        visualLayer: "oort-cloud-macro-shell",
      }}
    >
      {radii.map((radius, index) => (
        <mesh
          key={`oort-macro-shell-${radius}`}
          raycast={DISABLED_RAYCAST}
          scale={[
            radius * (index === 0 ? 1.06 : 1.02),
            radius * (index === 0 ? 0.76 : 0.94),
            radius * (index === 0 ? 0.94 : 1.08),
          ]}
          userData={{
            testRegionLayer:
              index === 0
                ? "inner-inferred-envelope"
                : "outer-inferred-envelope",
            visualLayer: "oort-cloud-sparse-macro-shell",
          }}
        >
          <sphereGeometry args={[1, 36, 22]} />
          <shaderMaterial
            depthWrite={false}
            fragmentShader={OORT_ENVELOPE_FRAGMENT_SHADER}
            side={DoubleSide}
            transparent
            uniforms={{
              uColor: { value: new Color(envelope.color) },
              uOpacity: { value: opacity * (index === 0 ? 0.82 : 1) },
              uPhase: { value: index * 2.17 },
            }}
            vertexShader={OORT_ENVELOPE_VERTEX_SHADER}
          />
        </mesh>
      ))}
    </group>
  );
}

function BeltLayer({
  layer,
  planetObjects,
  scaleMode,
  visible,
}: {
  layer: "asteroid" | "kuiper";
  planetObjects: PlanetObjectRegistry;
  scaleMode: ScaleMode;
  visible: boolean;
}) {
  const id: SystemRegionId =
    layer === "asteroid" ? "asteroid-belt" : "kuiper-belt";
  const selected = useExplorationStore((state) => state.selectedBodyId === id);
  const hovered = useExplorationStore((state) => state.hoveredBodyId === id);
  const sceneProfile = sceneProfileFor(scaleMode);
  const profile = useMemo(
    () => regionVisualProfileFor(id, scaleMode, sceneProfile),
    [id, scaleMode, sceneProfile],
  );
  const distribution = useMemo(
    () => buildRegionDistribution(profile, sceneProfile),
    [profile, sceneProfile],
  );
  const state: RegionVisualState = selected
    ? "selected"
    : hovered
      ? "hovered"
      : "ambient";
  const opacity = regionOpacityFor(profile, state);
  const macroEnvelopeOpacity = regionMacroEnvelopeOpacityFor(profile, state);
  const pointSize = regionPointSizeFor(profile, state);
  const rootRef = useRef<Group>(null);

  return (
    <group
      ref={rootRef}
      userData={{
        dataCertainty: "context-layer",
        testInteractiveBodyId: id,
        testRegionId: id,
        testRegionKind: profile.kind,
        testRegionRepresentation: profile.representation,
        testRegionPointCount: distribution.pointCount,
        testRegionRadialExtent: [...profile.distribution.radialExtent],
        testRegionVerticalExtent: profile.distribution.verticalExtent,
        testRegionCameraFramingExtent: profile.camera.framingExtent,
        testRegionCameraPreferredDirection: [
          ...profile.camera.preferredDirection,
        ],
        testRegionFocusAnchor: { ...profile.camera.focusAnchor },
        testRegionMacroEnvelopeMounted: Boolean(profile.macroEnvelope),
        testRegionMacroEnvelopeOpacity: macroEnvelopeOpacity,
        testRegionMacroEnvelopeCoverageExtent:
          profile.macroEnvelope?.coverageExtent ?? 0,
        testRegionMinimumCoverage: profile.camera.minimumViewportCoverage,
        testRegionMaximumCoverage: profile.camera.maximumViewportCoverage,
        testRegionAmbientOpacity: profile.distribution.opacity,
        testRegionSelectedOpacity: profile.distribution.selectedOpacity,
        testRegionVisibleOpacity: opacity,
        testRegionVisualState: state,
        testRegionDrawCalls: profile.drawCalls,
        testRegionMaterialCount: profile.materialCount,
        testRegionDistributionSignature: distribution.signature,
        visualLayer: id,
      }}
      visible={visible}
    >
      <RegionRegistry id={id} planetObjects={planetObjects} profile={profile} />
      <BeltMacroEnvelope profile={profile} state={state} />
      {distribution.strata.map((stratum) => (
        <points
          frustumCulled={false}
          key={stratum.id}
          raycast={DISABLED_RAYCAST}
          userData={{
            testRegionLayer: stratum.population,
            testRegionPointCount: stratum.positions.length / 3,
            visualLayer: stratum.id,
          }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[stratum.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color={stratum.color}
            depthWrite={false}
            opacity={Math.min(1, opacity * stratum.opacityMultiplier)}
            size={pointSize * stratum.pointSizeMultiplier}
            sizeAttenuation
            transparent
          />
        </points>
      ))}
    </group>
  );
}

function ExtendedBodyObject({
  body,
  labelsVisible,
  orbitsVisible,
  planetObjects,
  quality,
  scaleMode,
}: {
  body: ExtendedBody;
  labelsVisible: boolean;
  orbitsVisible: boolean;
  planetObjects: PlanetObjectRegistry;
  quality: SceneQuality;
  scaleMode: ScaleMode;
}) {
  const groupRef = useRef<Group>(null);
  const surfaceRef = useRef<Group>(null);
  const tailRef = useRef<Group>(null);
  const awayFromSun = useRef(new Vector3());
  const nucleusDirection = useRef(new Vector3());
  const tailOrientation = useRef(new Quaternion());
  const tailAxis = useRef(new Vector3(0, -1, 0));
  const scenePositionRef = useRef<[number, number, number]>([0, 0, 0]);
  const tailDirectionRef = useRef<[number, number, number]>([0, 0, 0]);
  const selected = useExplorationStore(
    (state) => state.selectedBodyId === body.id,
  );
  const hovered = useExplorationStore(
    (state) => state.hoveredBodyId === body.id,
  );
  const selectBody = useExplorationStore((state) => state.selectBody);
  const setHoveredBody = useExplorationStore((state) => state.setHoveredBody);
  const clearHoveredBody = useExplorationStore(
    (state) => state.clearHoveredBody,
  );
  const simulationAtMs = useSimulationStore((state) => state.simulationAtMs);
  const profile = sceneProfileFor(scaleMode);
  const sceneMetrics = extendedBodySceneMetrics(body, scaleMode);
  const radius = sceneMetrics.renderedRadius;
  const interactionRadius = sceneMetrics.interactionRadius;
  const orbitPoints = useMemo(
    () => extendedOrbitPoints(body, scaleMode, quality.orbitSegments),
    [body, quality.orbitSegments, scaleMode],
  );
  const trailPositions = useMemo(
    () =>
      new Float32Array(
        orbitPoints
          .filter((_, index) => index % 3 === 0)
          .flatMap((point) => [...point]),
      ),
    [orbitPoints],
  );
  const active = selected || hovered;
  const isComet = body.kind === "comet";
  const visualProfile = visualProfileFor(body.id);
  const cometVisual = visualProfile.comet;
  const tailLength =
    cometVisual?.dustLength ?? profile.extended.cometTailLength;
  const ionTailLength = cometVisual?.ionLength ?? tailLength * 1.25;
  const visualExtent = sceneMetrics.geometryBounds;
  const nucleusFocusRadius = sceneMetrics.focusRadius;
  const dwarfSystemParent = isDwarfSystemParentId(body.id);
  const parentVisualOffset = sceneMetrics.parentVisualOffset;
  const visible = useSceneVisibilityStore((state) =>
    effectiveBodyVisibility(body.id, state),
  );
  const labelPriority = labelPriorityForBody(body.kind, {
    bodyVisible: visible,
    hovered,
    labelsVisible,
    scaleMode,
    selected,
  });
  const orbitEmphasis = extendedBodyOrbitVisibility(body.id, {
    bodyVisible: visible,
    orbitsVisible,
    selectedBodyId: selected ? body.id : null,
    hoveredBodyId: hovered ? body.id : null,
  });

  useLayoutEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    const registry = planetObjects.current;
    node.userData.renderRadius = visualExtent;
    node.userData.cameraFocusRadius = nucleusFocusRadius;
    node.userData.bodyId = body.id;
    node.userData.extendedBodyId = body.id;
    node.userData.representationType = body.representation.representationType;
    node.userData.referenceFrame = body.representation.referenceFrame;
    setCameraTargetMetadata(node, {
      bodyId: body.id,
      targetKind: dwarfSystemParent ? "system" : "body",
      renderRadius: visualExtent,
      collisionRadius: visualExtent,
      focusRadius: nucleusFocusRadius,
      systemExtent: dwarfSystemParent ? sceneMetrics.systemExtent : undefined,
    });
    registry.set(body.id, node);
    return () => {
      registry.delete(body.id);
    };
  }, [
    body.id,
    body.representation.referenceFrame,
    body.representation.representationType,
    isComet,
    dwarfSystemParent,
    nucleusFocusRadius,
    planetObjects,
    sceneMetrics.systemExtent,
    visualExtent,
  ]);

  useFrame(() => {
    const node = groupRef.current;
    if (!node) return;
    const now = currentSimulationTimeMs(useSimulationStore.getState());
    const position = extendedBodyPosition(
      body,
      now,
      scaleMode,
      scenePositionRef.current,
    );
    node.position.set(...position);

    if (tailRef.current && isComet) {
      const tail = cometTailState(body, now, tailDirectionRef.current);
      const away = awayFromSun.current.set(...tail.antiSolarDirection);
      tailRef.current.quaternion.copy(
        tailOrientation.current.setFromUnitVectors(tailAxis.current, away),
      );
      tailRef.current.visible = tail.visible;
      tailRef.current.scale.setScalar(tail.lengthScale);
      tailRef.current.userData.heliocentricDistanceAu =
        tail.heliocentricDistanceAu;
      tailRef.current.userData.activity = tail.activity;
      tailRef.current.userData.antiSolarDirection = [
        tail.antiSolarDirection[0],
        tail.antiSolarDirection[1],
        tail.antiSolarDirection[2],
      ];
      const nucleus = nucleusDirection.current.set(...position).normalize();
      tailRef.current.userData.antiSolarDot = away.dot(nucleus);
      tailRef.current.userData.nucleusFocusRadius = nucleusFocusRadius;
      tailRef.current.userData.tailLength =
        Math.max(tailLength, ionTailLength) * tail.lengthScale;
      tailRef.current.userData.tailIncludedInFocusBounds = false;
      tailRef.current.userData.tailAnchorDistance =
        tailRef.current.position.length();
    }
  });

  const pointerOver = (event: ThreeEvent<PointerEvent>) => {
    if (!visible) return;
    event.stopPropagation();
    setHoveredBody(body.id);
  };
  const pointerOut = (event: ThreeEvent<PointerEvent>) => {
    if (!visible) return;
    event.stopPropagation();
    clearHoveredBody(body.id);
  };

  const pointerInteraction = useCelestialPointerInteraction({
    bodyId: body.id,
    enabled: visible,
    onSelect: selectBody,
  });

  const initialPosition = extendedBodyPosition(
    body,
    simulationAtMs,
    profile.id,
  );
  return (
    <>
      <OrbitPath
        bodyId={body.id}
        color={body.color}
        emphasis={orbitEmphasis}
        orbitClass="extended"
        points={orbitPoints}
        segments={quality.orbitSegments}
        semiMajorAxis={1}
        semiMinorAxis={1}
      />
      {isComet && active && visible ? (
        <points
          frustumCulled={false}
          raycast={() => undefined}
          userData={{ visualLayer: "comet-orbit-particle-trail" }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[trailPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#c7b58e"
            depthWrite={false}
            opacity={0.28}
            size={0.035}
            transparent
          />
        </points>
      ) : null}
      <group
        ref={groupRef}
        position={initialPosition as [number, number, number]}
        userData={{ bodyId: body.id, visualLayer: "extended-body-system" }}
      >
        <group
          visible={visible}
          userData={{ bodyId: body.id, testBodyRoot: true }}
        >
          <CelestialVisualSurface
            bodyId={body.id}
            textureLoadPolicy="scheduled"
            position={parentVisualOffset}
            radius={radius}
            rootRef={surfaceRef}
          />

          {isComet ? (
            <group
              ref={tailRef}
              userData={{
                testCometBodyId: body.id,
                testCometTailPrimitive: "particle-volume",
                testCometDustParticleCount: 520,
                testCometIonParticleCount: 260,
                testCometComaParticleCount: 180,
                testCometTotalParticleCount: 960,
                visualLayer: "physical-comet-tails",
              }}
            >
              <CometTailVolume
                bodyId={body.id}
                comaColor={cometVisual?.comaColor ?? "#dff6e8"}
                comaExtent={sceneMetrics.comaExtent}
                dustColor={cometVisual?.dustColor ?? "#e7c68f"}
                dustLength={tailLength}
                dustWidth={cometVisual?.dustWidth ?? 0.3}
                ionColor={cometVisual?.ionColor ?? "#65bfff"}
                ionLength={ionTailLength}
                ionWidth={cometVisual?.ionWidth ?? 0.2}
              />
            </group>
          ) : null}

          <mesh
            raycast={visible ? undefined : DISABLED_RAYCAST}
            {...pointerInteraction}
            onPointerOut={pointerOut}
            onPointerOver={pointerOver}
            scale={interactionRadius}
            userData={{ testInteractiveBodyId: body.id }}
          >
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial depthWrite={false} opacity={0} transparent />
          </mesh>

          {shouldMountLabel(labelPriority) ? (
            <PlanetLabel
              active
              bodyId={body.id}
              color={body.color}
              compact
              mode={scaleMode}
              offsetY={interactionRadius + 0.7}
              placement="north"
              priority={labelPriority}
              positionCaption={
                isComet ? "ANTI-SOLAR TAIL" : "REPRESENTATIVE ORBIT"
              }
              selected={selected}
              text={extendedBodySceneLabel(body)}
            />
          ) : null}
        </group>

        {dwarfSystemParent ? (
          <DwarfSatelliteSystem
            parentId={body.id}
            parentMeanRadiusKm={body.meanRadiusKm}
            parentRadius={radius}
            planetObjects={planetObjects}
            scaleMode={scaleMode}
          />
        ) : null}
      </group>
    </>
  );
}

function OortCloud({
  planetObjects,
  scaleMode,
  visible,
}: Pick<ExtendedSolarSystemProps, "planetObjects" | "scaleMode"> & {
  visible: boolean;
}) {
  const innerMaterialRef = useRef<PointsMaterial>(null);
  const outerMaterialRef = useRef<PointsMaterial>(null);
  const anchorMaterialRef = useRef<PointsMaterial>(null);
  const rootRef = useRef<Group>(null);
  const sceneProfile = sceneProfileFor(scaleMode);
  const profile = useMemo(
    () => regionVisualProfileFor("oort-cloud", scaleMode, sceneProfile),
    [scaleMode, sceneProfile],
  );
  const distribution = useMemo(
    () => buildRegionDistribution(profile, sceneProfile),
    [profile, sceneProfile],
  );
  const selected = useExplorationStore(
    (state) => state.selectedBodyId === "oort-cloud",
  );
  const hovered = useExplorationStore(
    (state) => state.hoveredBodyId === "oort-cloud",
  );
  const state: RegionVisualState = selected
    ? "selected"
    : hovered
      ? "hovered"
      : "ambient";
  const materialRefs = [innerMaterialRef, outerMaterialRef, anchorMaterialRef];
  const macroEnvelopeOpacity = regionMacroEnvelopeOpacityFor(profile, state);

  useFrame(({ camera }) => {
    const revealStart = sceneProfile.extended.oort.revealStart;
    const distanceReveal = Math.min(
      profile.distribution.opacity * 2.4,
      Math.max(0, (camera.position.length() - revealStart) / revealStart) *
        0.17,
    );
    const visibleOpacity = regionOpacityFor(profile, state, distanceReveal);
    distribution.strata.forEach((stratum, index) => {
      const material = materialRefs[index]?.current;
      if (!material) return;
      material.opacity = Math.min(
        1,
        visibleOpacity * stratum.opacityMultiplier,
      );
      material.size =
        regionPointSizeFor(profile, state) * stratum.pointSizeMultiplier;
    });
    if (rootRef.current) {
      rootRef.current.userData.testRegionVisibleOpacity = visibleOpacity;
      rootRef.current.userData.testRegionVisualState = state;
    }
  });

  const initialOpacity = regionOpacityFor(profile, state);
  return (
    <group
      ref={rootRef}
      userData={{
        dataCertainty: "inferred",
        testInteractiveBodyId: "oort-cloud",
        testRegionId: "oort-cloud",
        testRegionKind: profile.kind,
        testRegionRepresentation: profile.representation,
        testRegionPointCount: distribution.pointCount,
        testRegionRadialExtent: [...profile.distribution.radialExtent],
        testRegionVerticalExtent: profile.distribution.verticalExtent,
        testRegionCameraFramingExtent: profile.camera.framingExtent,
        testRegionCameraPreferredDirection: [
          ...profile.camera.preferredDirection,
        ],
        testRegionFocusAnchor: { ...profile.camera.focusAnchor },
        testRegionMacroEnvelopeMounted: Boolean(profile.macroEnvelope),
        testRegionMacroEnvelopeOpacity: macroEnvelopeOpacity,
        testRegionMacroEnvelopeCoverageExtent:
          profile.macroEnvelope?.coverageExtent ?? 0,
        testRegionMinimumCoverage: profile.camera.minimumViewportCoverage,
        testRegionMaximumCoverage: profile.camera.maximumViewportCoverage,
        testRegionAmbientOpacity: profile.distribution.opacity,
        testRegionSelectedOpacity: profile.distribution.selectedOpacity,
        testRegionVisibleOpacity: initialOpacity,
        testRegionVisualState: state,
        testRegionDrawCalls: profile.drawCalls,
        testRegionMaterialCount: profile.materialCount,
        testRegionDistributionSignature: distribution.signature,
        visualLayer: "oort-cloud-schematic",
      }}
      visible={visible}
    >
      <RegionRegistry
        id="oort-cloud"
        planetObjects={planetObjects}
        profile={profile}
      />
      <OortMacroEnvelope profile={profile} state={state} />
      {distribution.strata.map((stratum, index) => (
        <points
          frustumCulled={false}
          key={stratum.id}
          raycast={DISABLED_RAYCAST}
          userData={{
            testRegionLayer: stratum.population,
            testRegionPointCount: stratum.positions.length / 3,
            visualLayer: stratum.id,
          }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[stratum.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={materialRefs[index]}
            color={stratum.color}
            depthWrite={false}
            fog={false}
            opacity={initialOpacity * stratum.opacityMultiplier}
            size={
              regionPointSizeFor(profile, state) * stratum.pointSizeMultiplier
            }
            sizeAttenuation={false}
            transparent
          />
        </points>
      ))}
    </group>
  );
}

const HELIOSPHERE_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const HELIOSPHERE_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDirection)), 2.35);
    float alpha = uOpacity * (0.18 + fresnel * 0.92);
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function Heliosphere({
  planetObjects,
  scaleMode,
  visible,
}: Pick<ExtendedSolarSystemProps, "planetObjects" | "scaleMode"> & {
  visible: boolean;
}) {
  const rootRef = useRef<Group>(null);
  const sceneProfile = sceneProfileFor(scaleMode);
  const profile = useMemo(
    () => regionVisualProfileFor("heliosphere", scaleMode, sceneProfile),
    [scaleMode, sceneProfile],
  );
  const distribution = useMemo(
    () => buildRegionDistribution(profile, sceneProfile),
    [profile, sceneProfile],
  );
  const selected = useExplorationStore(
    (state) => state.selectedBodyId === "heliosphere",
  );
  const hovered = useExplorationStore(
    (state) => state.hoveredBodyId === "heliosphere",
  );
  const state: RegionVisualState = selected
    ? "selected"
    : hovered
      ? "hovered"
      : "ambient";
  const overlayVisible = selected || hovered;
  const opacity = regionOpacityFor(profile, state);
  const effectiveOpacity = overlayVisible ? opacity : 0;
  const pointSize = regionPointSizeFor(profile, state);
  const [termination, heliopause] = profile.distribution.radialExtent;
  const windStreaks = useMemo(
    () => solarWindStreakPositions(72, termination * 0.12, heliopause * 0.94),
    [heliopause, termination],
  );
  const boundaryUniforms = useMemo(
    () => [
      {
        uColor: { value: new Color("#43b5e6") },
        uOpacity: { value: effectiveOpacity * 0.92 },
      },
      {
        uColor: { value: new Color("#9188f2") },
        uOpacity: { value: effectiveOpacity * 1.18 },
      },
    ],
    [effectiveOpacity],
  );
  const missionMarkers = [
    { name: "Parker Solar Probe", distanceAu: 0.08, angle: 0.48 },
    { name: "Voyager 1", distanceAu: 165, angle: 0.62 },
    { name: "Voyager 2", distanceAu: 137, angle: -0.78 },
  ] as const;
  const strategy = sceneProfile.scale.strategy;

  return (
    <group
      ref={rootRef}
      userData={{
        dataCertainty: "schematic",
        testInteractiveBodyId: "heliosphere",
        testRegionId: "heliosphere",
        testRegionKind: profile.kind,
        testRegionRepresentation: profile.representation,
        testRegionPointCount: distribution.pointCount,
        testRegionRadialExtent: [...profile.distribution.radialExtent],
        testRegionVerticalExtent: profile.distribution.verticalExtent,
        testRegionCameraFramingExtent: profile.camera.framingExtent,
        testRegionCameraPreferredDirection: [
          ...profile.camera.preferredDirection,
        ],
        testRegionFocusAnchor: { ...profile.camera.focusAnchor },
        testRegionMinimumCoverage: profile.camera.minimumViewportCoverage,
        testRegionMaximumCoverage: profile.camera.maximumViewportCoverage,
        testRegionAmbientOpacity: profile.distribution.opacity,
        testRegionSelectedOpacity: profile.distribution.selectedOpacity,
        testRegionVisibleOpacity: effectiveOpacity,
        testRegionVisualState: state,
        testRegionDrawCalls: profile.drawCalls,
        testRegionMaterialCount: profile.materialCount,
        testRegionDistributionSignature: distribution.signature,
        testRegionBoundaryCount: 2,
        testRegionBoundaryRepresentation: "fresnel-surfaces",
        visualLayer: "solar-wind-heliosphere",
      }}
      visible={visible}
    >
      <RegionRegistry
        id="heliosphere"
        planetObjects={planetObjects}
        profile={profile}
      />
      <group visible={overlayVisible}>
        {[
          {
            id: "termination-shock",
            radius: termination,
            scale: [1.05, 0.78, 0.92] as const,
            uniforms: boundaryUniforms[0],
          },
          {
            id: "heliopause",
            radius: heliopause,
            scale: [1.12, 0.84, 0.98] as const,
            uniforms: boundaryUniforms[1],
          },
        ].map((boundary) => (
          <mesh
            key={boundary.id}
            raycast={DISABLED_RAYCAST}
            scale={[
              boundary.radius * boundary.scale[0],
              boundary.radius * boundary.scale[1],
              boundary.radius * boundary.scale[2],
            ]}
            userData={{
              testRegionBoundary: boundary.id,
              visualLayer: boundary.id,
            }}
          >
            <sphereGeometry args={[1, 40, 24]} />
            <shaderMaterial
              blending={AdditiveBlending}
              depthWrite={false}
              fragmentShader={HELIOSPHERE_FRAGMENT_SHADER}
              side={DoubleSide}
              transparent
              uniforms={boundary.uniforms}
              vertexShader={HELIOSPHERE_VERTEX_SHADER}
            />
          </mesh>
        ))}
        {distribution.strata.map((stratum) => (
          <points
            frustumCulled={false}
            key={stratum.id}
            raycast={DISABLED_RAYCAST}
            userData={{
              testRegionLayer: stratum.population,
              visualLayer: stratum.id,
            }}
          >
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[stratum.positions, 3]}
              />
            </bufferGeometry>
            <pointsMaterial
              blending={AdditiveBlending}
              color={stratum.color}
              depthWrite={false}
              opacity={effectiveOpacity * 0.92}
              size={pointSize}
              transparent
            />
          </points>
        ))}
        <lineSegments
          frustumCulled={false}
          raycast={DISABLED_RAYCAST}
          userData={{
            testRegionLayer: "solar-wind-direction-cues",
            visualLayer: "solar-wind-direction-cues",
          }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[windStreaks, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            blending={AdditiveBlending}
            color="#7bcdf2"
            depthWrite={false}
            opacity={effectiveOpacity * 0.82}
            transparent
          />
        </lineSegments>
        {missionMarkers.map((marker) => {
          const distance = strategy.distanceFromAu(marker.distanceAu);
          return (
            <group
              key={marker.name}
              position={[
                Math.cos(marker.angle) * distance,
                Math.sin(marker.angle * 0.4) * distance * 0.12,
                Math.sin(marker.angle) * distance,
              ]}
              userData={{ visualLayer: "mission-context-marker" }}
            >
              <mesh
                scale={sceneProfile.extended.heliosphere.missionMarkerScale}
              >
                <octahedronGeometry args={[1, 0]} />
                <meshBasicMaterial color="#d5e6f2" toneMapped={false} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

export function ExtendedSolarSystem({
  labelsVisible,
  orbitsVisible,
  planetObjects,
  quality,
  scaleMode,
}: ExtendedSolarSystemProps) {
  const asteroidBeltVisible = useSceneVisibilityStore((state) =>
    effectiveBodyVisibility("asteroid-belt", state),
  );
  const kuiperBeltVisible = useSceneVisibilityStore((state) =>
    effectiveBodyVisibility("kuiper-belt", state),
  );
  const oortVisible = useSceneVisibilityStore((state) =>
    effectiveBodyVisibility("oort-cloud", state),
  );
  const heliosphereVisible = useSceneVisibilityStore((state) =>
    effectiveBodyVisibility("heliosphere", state),
  );

  return (
    <>
      <group visible={asteroidBeltVisible}>
        <BeltLayer
          layer="asteroid"
          planetObjects={planetObjects}
          scaleMode={scaleMode}
          visible={asteroidBeltVisible}
        />
      </group>
      <group visible={kuiperBeltVisible}>
        <BeltLayer
          layer="kuiper"
          planetObjects={planetObjects}
          scaleMode={scaleMode}
          visible={kuiperBeltVisible}
        />
      </group>
      {EXTENDED_BODIES.map((body) => (
        <ExtendedBodyObject
          key={body.id}
          body={body}
          labelsVisible={labelsVisible}
          orbitsVisible={orbitsVisible}
          planetObjects={planetObjects}
          quality={quality}
          scaleMode={scaleMode}
        />
      ))}
      <group visible={oortVisible}>
        <OortCloud
          planetObjects={planetObjects}
          scaleMode={scaleMode}
          visible={oortVisible}
        />
      </group>
      <group visible={heliosphereVisible}>
        <Heliosphere
          planetObjects={planetObjects}
          scaleMode={scaleMode}
          visible={heliosphereVisible}
        />
      </group>
    </>
  );
}
