import { describe, expect, it } from "vitest";

import { DWARF_SATELLITES } from "./dwarf-satellite-catalogue";
import { EXTENDED_BODIES } from "./extended-system";
import { FEATURED_MOONS } from "./moon-catalogue";
import { orbitAccuracyAudit } from "./orbit-accuracy-audit";

const AUDIT_TIMESTAMP_MS = Date.parse("2026-07-23T00:00:00.000Z");

describe("orbit accuracy classification", () => {
  it("covers every rendered planet, featured moon, extended body and dwarf satellite exactly once", () => {
    const audit = orbitAccuracyAudit(AUDIT_TIMESTAMP_MS);
    const expectedCount =
      8 +
      FEATURED_MOONS.length +
      EXTENDED_BODIES.length +
      DWARF_SATELLITES.length;
    expect(audit.records).toHaveLength(expectedCount);
    expect(new Set(audit.records.map((record) => record.bodyId)).size).toBe(
      expectedCount,
    );
    expect(audit.summary.total).toBe(expectedCount);
  });

  it("does not claim date-accurate positions for mean-element, fallback or unresolved models", () => {
    const audit = orbitAccuracyAudit(AUDIT_TIMESTAMP_MS);
    for (const record of audit.records) {
      if (
        record.timingStatus !== "horizons-window" &&
        record.timingStatus !== "horizons-source-state"
      ) {
        expect(record.highFidelityPositionClaimAllowed).toBe(false);
      }
      expect(record.renderedPathMatchesTimingModel).toBe(true);
      expect(record.limitation.trim()).not.toBe("");
    }
  });

  it("keeps all five unresolved dwarf-satellite planes explicit", () => {
    const audit = orbitAccuracyAudit(AUDIT_TIMESTAMP_MS);
    expect(audit.summary.unresolvedPlane).toBe(5);
  });
});
