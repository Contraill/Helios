import type { CelestialBodyId } from "@/features/solar-system/types/celestial-body";

export const CELESTIAL_DRAG_THRESHOLD_PX = 6;

interface PointerStart {
  readonly bodyId: CelestialBodyId;
  readonly button: number;
  readonly pointerType: string;
  readonly x: number;
  readonly y: number;
  moved: boolean;
  multiTouch: boolean;
}

export interface CelestialPointerSample {
  readonly bodyId: CelestialBodyId;
  readonly pointerId: number;
  readonly pointerType: string;
  readonly button: number;
  readonly clientX: number;
  readonly clientY: number;
}

export class CelestialPointerInteractionController {
  private readonly starts = new Map<number, PointerStart>();

  begin(sample: CelestialPointerSample): boolean {
    const current = this.starts.get(sample.pointerId);
    if (current) return current.bodyId === sample.bodyId;

    this.starts.set(sample.pointerId, {
      bodyId: sample.bodyId,
      button: sample.button,
      pointerType: sample.pointerType,
      x: sample.clientX,
      y: sample.clientY,
      moved: sample.pointerType === "mouse" && sample.button !== 0,
      multiTouch: false,
    });

    if (sample.pointerType === "touch") {
      const touches = [...this.starts.values()].filter(
        (start) => start.pointerType === "touch",
      );
      if (touches.length > 1) {
        for (const touch of touches) touch.multiTouch = true;
      }
    }

    return true;
  }

  owns(pointerId: number, bodyId: CelestialBodyId): boolean {
    return this.starts.get(pointerId)?.bodyId === bodyId;
  }

  move(sample: CelestialPointerSample): boolean {
    const start = this.starts.get(sample.pointerId);
    if (!start || start.bodyId !== sample.bodyId) return false;
    if (
      Math.hypot(sample.clientX - start.x, sample.clientY - start.y) >=
      CELESTIAL_DRAG_THRESHOLD_PX
    ) {
      start.moved = true;
    }
    return start.moved || start.multiTouch;
  }

  finish(sample: CelestialPointerSample): CelestialBodyId | null {
    const start = this.starts.get(sample.pointerId);
    if (!start || start.bodyId !== sample.bodyId) return null;

    this.starts.delete(sample.pointerId);
    if (start.button !== 0 || start.moved || start.multiTouch) return null;
    return start.bodyId;
  }

  cancel(pointerId: number, bodyId?: CelestialBodyId): boolean {
    const start = this.starts.get(pointerId);
    if (!start || (bodyId !== undefined && start.bodyId !== bodyId)) {
      return false;
    }
    this.starts.delete(pointerId);
    return true;
  }

  clear(): void {
    this.starts.clear();
  }

  isDragging(pointerId?: number): boolean {
    if (pointerId !== undefined) {
      const start = this.starts.get(pointerId);
      return Boolean(start && (start.moved || start.multiTouch));
    }
    return [...this.starts.values()].some(
      (start) => start.moved || start.multiTouch,
    );
  }
}

export const celestialPointerController =
  new CelestialPointerInteractionController();

let suppressNextCanvasMiss = false;
let clearSuppressionTimer: ReturnType<typeof setTimeout> | null = null;

export function markCelestialCameraGesture(): void {
  suppressNextCanvasMiss = true;
  if (clearSuppressionTimer !== null) clearTimeout(clearSuppressionTimer);
  clearSuppressionTimer = setTimeout(() => {
    suppressNextCanvasMiss = false;
    clearSuppressionTimer = null;
  }, 0);
}

export function consumeCelestialCameraGesture(): boolean {
  const suppress = suppressNextCanvasMiss;
  suppressNextCanvasMiss = false;
  if (clearSuppressionTimer !== null) {
    clearTimeout(clearSuppressionTimer);
    clearSuppressionTimer = null;
  }
  return suppress;
}
