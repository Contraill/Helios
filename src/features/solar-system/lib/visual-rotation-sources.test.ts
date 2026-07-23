import { describe, expect, it } from "vitest";

import {
  visualRegistryIds,
  visualProfileFor,
} from "./celestial-visual-registry";
import { visualRotationSourceFor } from "./visual-rotation-sources";

describe("visual rotation sources", () => {
  it("backs every periodic profile and the Pluto-Charon lock with a cited source", () => {
    for (const id of visualRegistryIds) {
      const rotation = visualProfileFor(id).rotation;
      if (rotation.kind === "periodic" || id === "dwarf-satellite-charon") {
        const source = visualRotationSourceFor(rotation.sourceId);
        expect(source, `${id} rotation source`).not.toBeNull();
        expect(source?.sourceUrl).toMatch(/^https:\/\//);
        expect(source?.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(source?.measurementNote.trim()).not.toBe("");
      }
    }
  });
});
