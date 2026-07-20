import { describe, expect, it } from "vitest";

import {
  prioritizedSecondaryAssets,
  secondaryCelestialAssets,
} from "./celestial-asset-scheduler";

describe("secondary celestial asset scheduling", () => {
  it("does not attach all secondary assets to the opening residency window", () => {
    const visible = prioritizedSecondaryAssets({
      activeCategory: "planetary-moons",
      parentBodyId: "jupiter",
      promotedBodyId: null,
    });
    expect(visible.length).toBeLessThan(secondaryCelestialAssets.length);
    expect(visible.length).toBeLessThanOrEqual(12);
    expect(visible.every((asset) => asset.category === "planetary-moons")).toBe(true);
  });

  it("promotes selection and the open parent system above category background work", () => {
    const visible = prioritizedSecondaryAssets({
      activeCategory: "dwarf-kuiper",
      parentBodyId: "haumea",
      promotedBodyId: "dwarf-satellite-namaka",
    });
    expect(visible[0]?.bodyId).toBe("dwarf-satellite-namaka");
    expect(visible.some((asset) => asset.bodyId === "haumea")).toBe(true);
    expect(
      visible.some((asset) => asset.bodyId === "dwarf-satellite-hiiaka"),
    ).toBe(true);
  });
});
