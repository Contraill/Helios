/**
 * Visual catalogue routes mount the catalogue scene instead of the production
 * Sun → planets bootstrap. In that explicit test-only mode the catalogue probe
 * is the readiness contract, so the production opening loader must not block
 * pointer input while waiting for planet textures that are intentionally absent.
 */
export function isVisualCatalogueEvidenceRequest(search: string): boolean {
  const query = new URLSearchParams(search);
  return query.get("sceneTest") === "1" && Boolean(query.get("catalogue"));
}
