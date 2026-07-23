import { describe, expect, it } from "vitest";

import {
  DWARF_SATELLITES,
  dwarfSatellitesFor,
} from "./dwarf-satellite-catalogue";

describe("dwarf satellite visual dynamics", () => {
  it("keeps the eight accepted satellites and seven parent systems", () => {
    expect(DWARF_SATELLITES).toHaveLength(8);
    expect(new Set(DWARF_SATELLITES.map(({ id }) => id)).size).toBe(8);
    expect(dwarfSatellitesFor("pluto").map(({ name }) => name)).toEqual([
      "Charon",
    ]);
    expect(dwarfSatellitesFor("haumea").map(({ name }) => name)).toEqual([
      "Hiʻiaka",
      "Namaka",
    ]);
  });

  it("only claims tidal lock when the accepted source set supports it", () => {
    const locked = DWARF_SATELLITES.filter(
      ({ rotation }) => rotation.kind === "tidally-locked",
    );
    expect(locked.map(({ id }) => id)).toEqual(["dwarf-satellite-charon"]);
    for (const moon of DWARF_SATELLITES) {
      if (moon.rotation.kind !== "fixed-unknown") continue;
      expect(moon.rotation.sourceId).toContain(moon.id);
      expect(moon.rotation.note).toMatch(/does not establish/i);
    }
  });

  it("uses source-backed parent-equatorial inclinations only where supported", () => {
    const resolved = DWARF_SATELLITES.filter(
      ({ orbitPlaneStatus }) =>
        orbitPlaneStatus === "source-backed-parent-equatorial",
    );
    expect(
      resolved.map(({ id, inclinationDeg }) => [id, inclinationDeg]),
    ).toEqual([
      ["dwarf-satellite-charon", 0],
      ["dwarf-satellite-hiiaka", 2],
      ["dwarf-satellite-namaka", 13],
    ]);
    for (const moon of resolved) {
      expect(moon.orbitPlaneSourceId).toBeTruthy();
      expect(moon.orbitPlaneSourceUrl).toMatch(/^https:\/\//);
      expect(moon.representation.referencePlane).toMatch(/equatorial/i);
    }
  });

  it("keeps the remaining five orbit planes explicitly unresolved", () => {
    const unresolved = DWARF_SATELLITES.filter(
      ({ orbitPlaneStatus }) =>
        orbitPlaneStatus === "representative-parent-equatorial-unresolved",
    );
    expect(unresolved).toHaveLength(5);
    for (const moon of unresolved) {
      expect(moon.inclinationDeg).toBeNull();
      expect(moon.orbitPlaneSourceId).toBeNull();
      expect(moon.orbitPlaneSourceUrl).toBeNull();
      expect(moon.representation.referencePlane).toMatch(/unresolved/i);
    }
  });
});
