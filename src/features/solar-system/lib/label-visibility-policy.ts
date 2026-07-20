import type { CelestialKind } from "@/features/solar-system/lib/celestial-registry";
import type { ScaleMode } from "@/features/solar-system/types/experience-settings";

export type LabelPriority =
  "hidden" | "context" | "anchor" | "hovered" | "selected";

export interface LabelVisibilityContext {
  readonly bodyVisible: boolean;
  readonly contextEligible?: boolean;
  readonly hovered: boolean;
  readonly labelsVisible: boolean;
  readonly scaleMode: ScaleMode;
  readonly selected: boolean;
}

/**
 * Central label eligibility policy. Navigator state is intentionally absent:
 * browsing may change asset priority, never which labels a body may own.
 */
export function labelPriorityForBody(
  kind: CelestialKind,
  context: LabelVisibilityContext,
): LabelPriority {
  if (!context.labelsVisible || !context.bodyVisible) return "hidden";
  if (context.selected) return "selected";
  if (context.hovered) return "hovered";
  if (kind === "star") return "anchor";
  if (kind === "planet" && context.scaleMode === "scientific") {
    return "anchor";
  }
  return context.contextEligible ? "context" : "hidden";
}

export function shouldMountLabel(priority: LabelPriority): boolean {
  return priority !== "hidden";
}

export function labelOpacity(priority: LabelPriority): number {
  switch (priority) {
    case "hidden":
      return 0;
    case "selected":
      return 1;
    case "hovered":
      return 0.94;
    case "anchor":
      return 0.74;
    case "context":
      return 0.58;
  }
}
