import { describe, expect, it } from "vitest";

import {
  prioritizedSecondaryAssets,
  secondaryCelestialAssets,
} from "./celestial-asset-scheduler";

describe("secondary celestial asset scheduling", () => {
  it("orders every secondary asset without making Navigator a visibility filter", () => {
    const ordered = prioritizedSecondaryAssets({
      activeCategory: "planetary-moons",
      parentBodyId: "jupiter",
      promotedBodyId: null,
    });
    expect(ordered).toHaveLength(secondaryCelestialAssets.length);
    expect(
      ordered.slice(0, 4).every((asset) => asset.parentBodyId === "jupiter"),
    ).toBe(true);
    expect(ordered.some((asset) => asset.category === "comets")).toBe(true);
  });

  it("can expose a bounded priority window while selection and parent system win", () => {
    const ordered = prioritizedSecondaryAssets({
      activeCategory: "dwarf-kuiper",
      parentBodyId: "haumea",
      promotedBodyId: "dwarf-satellite-namaka",
      limit: 12,
    });
    expect(ordered).toHaveLength(12);
    expect(ordered[0]?.bodyId).toBe("dwarf-satellite-namaka");
    expect(ordered.some((asset) => asset.bodyId === "haumea")).toBe(true);
    expect(
      ordered.some((asset) => asset.bodyId === "dwarf-satellite-hiiaka"),
    ).toBe(true);
  });
});
