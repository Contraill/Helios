import { describe, expect, it } from "vitest";

import { DWARF_SATELLITES } from "./dwarf-satellite-catalogue";

describe("dwarf-system satellite contract", () => {
  it("contains the requested eight satellites without synthesized angular elements", () => {
    expect(DWARF_SATELLITES).toHaveLength(8);
    for (const moon of DWARF_SATELLITES) {
      expect(moon.representation.targetCode).toBeTruthy();
      expect(moon.representation.epoch.julianDate).toBe(2451545);
      expect(moon.representation.referenceFrame).toBe(
        "parent-equatorial-j2000",
      );
      expect(moon.representation.representationType).toBe(
        "representative-mean-elements",
      );
      expect(moon.semiMajorAxisKm).toBeGreaterThan(0);
      expect(moon.orbitalPeriodDays).toBeGreaterThan(0);
      expect(moon.inclinationDeg).toBeNull();
    }
  });
});
