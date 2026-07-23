import { describe, expect, it } from "vitest";

import { isVisualCatalogueEvidenceRequest } from "./scene-test-readiness";

describe("visual catalogue readiness", () => {
  it("recognizes only explicit catalogue evidence routes", () => {
    expect(
      isVisualCatalogueEvidenceRequest("?sceneTest=1&catalogue=comets&page=1"),
    ).toBe(true);
    expect(isVisualCatalogueEvidenceRequest("?sceneTest=1")).toBe(false);
    expect(isVisualCatalogueEvidenceRequest("?catalogue=comets")).toBe(false);
    expect(
      isVisualCatalogueEvidenceRequest("?sceneTest=0&catalogue=comets"),
    ).toBe(false);
    expect(isVisualCatalogueEvidenceRequest("")).toBe(false);
  });
});
