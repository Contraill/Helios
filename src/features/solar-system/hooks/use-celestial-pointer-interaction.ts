"use client";

import { useMemo } from "react";
import type { ThreeEvent } from "@react-three/fiber";

import type { CelestialBodyId } from "@/features/solar-system/types/celestial-body";
import {
  celestialPointerController,
  type CelestialPointerSample,
} from "@/features/solar-system/lib/pointer-interaction";
import { useExploreSceneUiStore } from "@/stores/explore-scene-ui-store";

interface UseCelestialPointerInteractionOptions {
  readonly bodyId: CelestialBodyId;
  readonly enabled: boolean;
  readonly onSelect: (bodyId: CelestialBodyId) => void;
}

interface R3FPointerCaptureTarget {
  setPointerCapture?: (pointerId: number) => void;
  releasePointerCapture?: (pointerId: number) => void;
  hasPointerCapture?: (pointerId: number) => boolean;
}

function captureTarget(
  event: ThreeEvent<PointerEvent>,
): R3FPointerCaptureTarget {
  return event.target as unknown as R3FPointerCaptureTarget;
}

function safelyCapture(event: ThreeEvent<PointerEvent>): void {
  try {
    captureTarget(event).setPointerCapture?.(event.pointerId);
  } catch {
    // The R3F target may have been disposed between intersection and capture.
  }
}

function safelyRelease(event: ThreeEvent<PointerEvent>): void {
  const target = captureTarget(event);
  try {
    if (target.hasPointerCapture?.(event.pointerId) === false) return;
    target.releasePointerCapture?.(event.pointerId);
  } catch {
    // Capture can already be released by pointercancel/lostpointercapture.
  }
}

function sampleFor(
  bodyId: CelestialBodyId,
  event: ThreeEvent<PointerEvent>,
): CelestialPointerSample {
  return {
    bodyId,
    pointerId: event.pointerId,
    pointerType: event.pointerType,
    button: event.button,
    clientX: event.clientX,
    clientY: event.clientY,
  };
}

export function useCelestialPointerInteraction({
  bodyId,
  enabled,
  onSelect,
}: UseCelestialPointerInteractionOptions) {
  return useMemo(
    () => ({
      onPointerDown(event: ThreeEvent<PointerEvent>) {
        if (!enabled) return;
        event.stopPropagation();
        if (!celestialPointerController.begin(sampleFor(bodyId, event))) return;
        safelyCapture(event);
      },
      onPointerMove(event: ThreeEvent<PointerEvent>) {
        if (!enabled || !celestialPointerController.owns(event.pointerId, bodyId)) {
          return;
        }
        event.stopPropagation();
        celestialPointerController.move(sampleFor(bodyId, event));
      },
      onPointerUp(event: ThreeEvent<PointerEvent>) {
        if (!enabled || !celestialPointerController.owns(event.pointerId, bodyId)) {
          return;
        }
        event.stopPropagation();
        const selected = celestialPointerController.finish(
          sampleFor(bodyId, event),
        );
        safelyRelease(event);
        if (selected) {
          onSelect(selected);
          useExploreSceneUiStore.getState().setActiveDockPanel("selection");
        }
      },
      onPointerCancel(event: ThreeEvent<PointerEvent>) {
        if (!celestialPointerController.owns(event.pointerId, bodyId)) return;
        event.stopPropagation();
        celestialPointerController.cancel(event.pointerId, bodyId);
        safelyRelease(event);
      },
      onLostPointerCapture(event: ThreeEvent<PointerEvent>) {
        celestialPointerController.cancel(event.pointerId, bodyId);
      },
    }),
    [bodyId, enabled, onSelect],
  );
}
