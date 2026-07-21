import { expect, test, type Locator, type Page } from "@playwright/test";

import { planetIds } from "../src/content/planets";
import {
  DWARF_SATELLITE_IDS,
  EXTENDED_BODY_IDS,
  FEATURED_MOON_IDS,
  SYSTEM_REGION_IDS,
} from "../src/features/solar-system/types/celestial-body";

const MOUNTED_BODY_IDS = [
  "sun",
  ...planetIds,
  ...FEATURED_MOON_IDS,
  ...DWARF_SATELLITE_IDS,
  ...EXTENDED_BODY_IDS,
  ...SYSTEM_REGION_IDS,
].sort();
const ORBIT_BODY_IDS = [
  ...planetIds,
  ...FEATURED_MOON_IDS,
  ...DWARF_SATELLITE_IDS,
  ...EXTENDED_BODY_IDS,
].sort();
const PRIMARY_TEXTURE_PATTERN =
  /\/textures\/planets\/(sun|mercury|venus|earth|mars|jupiter|saturn|uranus|neptune)\.webp$/;

async function keepSecondaryAssetsBounded(page: Page) {
  await page.route("**/textures/**", async (route) => {
    if (PRIMARY_TEXTURE_PATTERN.test(route.request().url())) {
      await route.continue();
      return;
    }
    await route.abort("blockedbyclient");
  });
}

async function activate(control: Locator) {
  await expect(control).toBeVisible({ timeout: 45_000 });
  await expect(control).toBeEnabled();
  await control.click({ force: true });
}

async function snapshot(page: Page) {
  return page.evaluate(() => window.__HELIOS_SCENE_TEST__!);
}

async function waitForScene(page: Page) {
  await expect(page.locator("html")).toHaveAttribute(
    "data-explore-scene-ready",
    "true",
    { timeout: 45_000 },
  );
  await expect
    .poll(
      async () => (await snapshot(page)).sceneContract.mountedBodyIds.length,
      { timeout: 45_000 },
    )
    .toBe(MOUNTED_BODY_IDS.length);
}

async function openRegions(page: Page) {
  await activate(page.getByRole("tab", { name: "Navigator" }));
  const back = page.getByRole("button", { name: /Back/i });
  while ((await back.count()) > 0) await activate(back);
  await activate(page.getByRole("button", { name: /Regions & context/i }));
}

async function selectRegion(page: Page, name: string, id: string) {
  await openRegions(page);
  const beforeVersion = (await snapshot(page)).camera?.transitionVersion ?? 0;
  const control = page.getByRole("button", { name, exact: true });
  await activate(control);
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await expect
    .poll(async () => (await snapshot(page)).camera?.transitionVersion ?? 0, {
      timeout: 45_000,
    })
    .toBeGreaterThan(beforeVersion);
  await expect
    .poll(async () => (await snapshot(page)).camera?.mode, {
      timeout: 45_000,
    })
    .toBe("focus");
  await expect
    .poll(async () => (await snapshot(page)).camera?.targetBodyId, {
      timeout: 45_000,
    })
    .toBe(id);
  await expect
    .poll(async () => (await snapshot(page)).regions[id]?.selected, {
      timeout: 45_000,
    })
    .toBe(true);
  return control;
}

function expectRegionFraming(
  region: NonNullable<Awaited<ReturnType<typeof snapshot>>["regions"][string]>,
) {
  expect(region.viewportVisible).toBe(true);
  expect(region.projectedCenter[0]).toBeGreaterThanOrEqual(0);
  expect(region.projectedCenter[0]).toBeLessThanOrEqual(1);
  expect(region.projectedCenter[1]).toBeGreaterThanOrEqual(0);
  expect(region.projectedCenter[1]).toBeLessThanOrEqual(1);
  expect(region.projectedCoverage).toBeGreaterThan(
    region.minimumViewportCoverage * 0.72,
  );
  expect(region.projectedCoverage).toBeLessThan(
    region.maximumViewportCoverage * 1.28,
  );
  expect(region.visibleOpacity).toBeGreaterThan(region.ambientOpacity);
  expect(region.cameraFramingExtent).toBeGreaterThan(0);
}

function distanceFromViewportCenter(point: readonly [number, number]) {
  return Math.hypot(point[0] - 0.5, point[1] - 0.5);
}

function expectBeltMacroReadability(
  region: NonNullable<Awaited<ReturnType<typeof snapshot>>["regions"][string]>,
  ambientMacroOpacity: number,
  cameraTarget: readonly [number, number, number],
) {
  expect(region.macroEnvelopeMounted).toBe(true);
  expect(region.macroEnvelopeOpacity).toBeGreaterThan(ambientMacroOpacity);
  expect(region.macroEnvelopeCoverage).toBeGreaterThan(0.16);
  expect(region.focusAnchorProjected[0]).toBeGreaterThanOrEqual(0);
  expect(region.focusAnchorProjected[0]).toBeLessThanOrEqual(1);
  expect(region.focusAnchorProjected[1]).toBeGreaterThanOrEqual(0);
  expect(region.focusAnchorProjected[1]).toBeLessThanOrEqual(1);
  expect(distanceFromViewportCenter(region.focusAnchorProjected)).toBeLessThan(
    distanceFromViewportCenter(region.sunProjected),
  );
  expect(Math.hypot(...cameraTarget)).toBeGreaterThan(0.1);
}

test("Gate 3A gives every context region a distinct visual identity and framing", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !message.text().includes("ERR_BLOCKED_BY_CLIENT")
    ) {
      consoleErrors.push(message.text());
    }
  });

  await page.addInitScript(() => localStorage.clear());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await keepSecondaryAssetsBounded(page);
  await page.goto("/explore?sceneTest=1&at=2026-07-20T12%3A00%3A00.000Z");
  await waitForScene(page);

  await activate(page.getByRole("tab", { name: "Time" }));
  await activate(page.getByRole("button", { name: "Pause simulation" }));
  await expect
    .poll(async () => (await snapshot(page)).simulation.isPaused)
    .toBe(true);
  const stableSimulation = (await snapshot(page)).simulation.atMs;
  const ambient = await snapshot(page);
  expect(ambient.regions["asteroid-belt"].macroEnvelopeMounted).toBe(true);
  expect(ambient.regions["kuiper-belt"].macroEnvelopeMounted).toBe(true);
  expect(ambient.regions["asteroid-belt"].macroEnvelopeOpacity).toBeGreaterThan(
    0.08,
  );
  expect(ambient.regions["kuiper-belt"].macroEnvelopeOpacity).toBeGreaterThan(
    0.07,
  );
  expect(ambient.regions["asteroid-belt"].visibleOpacity).toBeGreaterThan(0.5);
  expect(ambient.regions["kuiper-belt"].visibleOpacity).toBeGreaterThan(0.4);
  expect(ambient.regions.heliosphere.visibleOpacity).toBeLessThanOrEqual(0.001);
  expect(ambient.backdrop.distanceDimmingEnabled).toBe(false);
  expect(ambient.backdrop.distanceAttenuation).toBe(0);
  expect(ambient.backdrop.milkyWayMounted).toBe(false);
  expect(ambient.backdrop.milkyWayOpacity).toBe(0);
  expect(ambient.backdrop.localStarsMounted).toBe(true);
  expect(ambient.backdrop.localStarsOpacity).toBeGreaterThan(0);

  await selectRegion(page, "Asteroid belt", "asteroid-belt");
  const asteroid = (await snapshot(page)).regions["asteroid-belt"];
  expect(asteroid.visualKind).toBe("main-belt");
  expect(asteroid.verticalExtent).toBeGreaterThan(0);
  expectRegionFraming(asteroid);
  expectBeltMacroReadability(
    asteroid,
    ambient.regions["asteroid-belt"].macroEnvelopeOpacity,
    (await snapshot(page)).camera!.target,
  );
  expect(asteroid.macroEnvelopeOpacity).toBeLessThanOrEqual(
    ambient.regions["asteroid-belt"].macroEnvelopeOpacity * 1.5,
  );
  expect(asteroid.visibleOpacity).toBeLessThanOrEqual(
    ambient.regions["asteroid-belt"].visibleOpacity * 1.5,
  );

  const canvas = page.locator("canvas").first();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  const startX = box.x + box.width * 0.52;
  const startY = box.y + box.height * 0.46;
  const beforeAzimuth = (await snapshot(page)).camera?.azimuth ?? 0;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 92, startY + 38, { steps: 8 });
  await page.mouse.up();
  await expect
    .poll(async () => (await snapshot(page)).camera?.selectedBodyId)
    .toBe("asteroid-belt");
  expect(
    Math.abs(((await snapshot(page)).camera?.azimuth ?? 0) - beforeAzimuth),
  ).toBeGreaterThan(0.005);

  await selectRegion(page, "Kuiper belt", "kuiper-belt");
  const kuiper = (await snapshot(page)).regions["kuiper-belt"];
  expect(kuiper.visualKind).toBe("trans-neptunian-belt");
  expectRegionFraming(kuiper);
  expect(kuiper.verticalExtent).toBeGreaterThan(asteroid.verticalExtent);
  expect(kuiper.radialExtent[1]).toBeGreaterThan(asteroid.radialExtent[1]);
  expect(kuiper.distributionSignature).not.toBe(asteroid.distributionSignature);
  expectBeltMacroReadability(
    kuiper,
    ambient.regions["kuiper-belt"].macroEnvelopeOpacity,
    (await snapshot(page)).camera!.target,
  );
  expect(kuiper.macroEnvelopeOpacity).toBeLessThanOrEqual(
    ambient.regions["kuiper-belt"].macroEnvelopeOpacity * 1.5,
  );
  expect(kuiper.visibleOpacity).toBeLessThanOrEqual(
    ambient.regions["kuiper-belt"].visibleOpacity * 1.5,
  );
  expect(kuiper.macroEnvelopeCoverage).toBeGreaterThan(
    asteroid.macroEnvelopeCoverage * 0.72,
  );

  const oortControl = await selectRegion(page, "Oort cloud", "oort-cloud");
  const oort = (await snapshot(page)).regions["oort-cloud"];
  expect(oort.visualKind).toBe("distant-shell");
  expect(oort.representation).toBe("inferred");
  expect(oort.layers).toEqual(
    expect.arrayContaining([
      "inner-hills",
      "outer-oort",
      "anchor-particles",
      "inner-inferred-envelope",
      "outer-inferred-envelope",
    ]),
  );
  expect(oort.macroEnvelopeMounted).toBe(true);
  expect(oort.macroEnvelopeOpacity).toBeGreaterThan(
    ambient.regions["oort-cloud"].macroEnvelopeOpacity,
  );
  expect(oort.macroEnvelopeOpacity).toBeGreaterThan(0.03);
  expect(oort.macroEnvelopeOpacity).toBeLessThan(0.08);
  expect(oort.macroEnvelopeCoverage).toBeGreaterThan(0.2);
  expectRegionFraming(oort);
  const oortSnapshot = await snapshot(page);
  expect(oortSnapshot.backdrop.milkyWayMounted).toBe(false);
  expect(oortSnapshot.backdrop.milkyWayOpacity).toBe(0);
  expect(oortSnapshot.backdrop.localStarsMounted).toBe(true);
  expect(oortSnapshot.backdrop.localStarsOpacity).toBeGreaterThan(0);
  expect(oortSnapshot.backdrop.distanceDimmingEnabled).toBe(false);
  expect(oortSnapshot.backdrop.distanceAttenuation).toBe(0);
  const oortCamera = oortSnapshot.camera!;
  expect(oortCamera.distanceToTarget).toBeGreaterThanOrEqual(
    oortCamera.minimumDistance,
  );

  await page.keyboard.press("Escape");
  await expect
    .poll(async () => (await snapshot(page)).camera?.mode, {
      timeout: 45_000,
    })
    .toBe("overview");
  await expect(oortControl).toBeFocused();

  await selectRegion(page, "Heliosphere", "heliosphere");
  const heliosphere = (await snapshot(page)).regions.heliosphere;
  expect(heliosphere.visualKind).toBe("solar-boundary");
  expect(heliosphere.representation).toBe("schematic");
  expect(heliosphere.boundaryCount).toBe(2);
  expect(heliosphere.boundaryRepresentation).toBe("fresnel-surfaces");
  expect(heliosphere.layers).toContain("solar-wind-flow");
  expect(heliosphere.layers).toContain("solar-wind-direction-cues");
  expect(heliosphere.visibleOpacity).toBeGreaterThan(0.2);
  expect((await snapshot(page)).backdrop.distanceDimmingEnabled).toBe(false);
  expect((await snapshot(page)).backdrop.distanceAttenuation).toBe(0);
  expectRegionFraming(heliosphere);
  expect(heliosphere.projectedCoverage).toBeGreaterThan(
    Math.max(0.22, heliosphere.sunProjectedCoverage * 2),
  );
  const sunTarget = (await snapshot(page)).screenTargets.sun;
  expect(sunTarget?.visible).toBe(true);

  await canvas.hover();
  await page.mouse.move(startX, startY);
  await page.mouse.down({ button: "right" });
  await page.mouse.move(startX + 70, startY + 32, { steps: 6 });
  await page.mouse.up({ button: "right" });
  await expect
    .poll(async () => (await snapshot(page)).camera?.mode, {
      timeout: 45_000,
    })
    .toBe("free");
  expect((await snapshot(page)).camera?.selectedBodyId).toBe("heliosphere");

  await activate(page.getByRole("tab", { name: "View" }));
  await activate(page.getByRole("button", { name: /^Guided$/i }));
  await expect
    .poll(async () => (await snapshot(page)).camera?.mode, {
      timeout: 45_000,
    })
    .toBe("focus");
  expect((await snapshot(page)).camera?.targetBodyId).toBe("heliosphere");
  expectRegionFraming((await snapshot(page)).regions.heliosphere);

  await activate(page.getByRole("tab", { name: "View" }));
  await activate(page.getByRole("button", { name: "Scientific", exact: true }));
  await expect(
    page.getByRole("button", { name: "Scientific", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");

  for (const [name, id] of [
    ["Asteroid belt", "asteroid-belt"],
    ["Kuiper belt", "kuiper-belt"],
    ["Oort cloud", "oort-cloud"],
    ["Heliosphere", "heliosphere"],
  ] as const) {
    await selectRegion(page, name, id);
    expectRegionFraming((await snapshot(page)).regions[id]);
  }

  const finalSnapshot = await snapshot(page);
  expect(finalSnapshot.sceneContract.mountedBodyIds).toEqual(MOUNTED_BODY_IDS);
  expect(finalSnapshot.sceneContract.visibleBodyIds).toEqual(MOUNTED_BODY_IDS);
  expect(finalSnapshot.sceneContract.visibleOrbitBodyIds).toEqual(
    ORBIT_BODY_IDS,
  );
  expect(finalSnapshot.simulation).toEqual({
    atMs: stableSimulation,
    isPaused: true,
  });
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
