import { expect, test, type Page, type TestInfo } from "@playwright/test";

import type { Gate3BSceneProbeSnapshot } from "../src/features/solar-system/components/gate3b-scene-probe";
import type { HeliosSceneTestSnapshot } from "../src/features/solar-system/components/scene-test-probe";

const CATALOGUE = {
  moons: { count: 22, pages: 3 },
  "dwarf-systems": { count: 15, pages: 2 },
  asteroids: { count: 4, pages: 1 },
  "dwarf-kuiper": { count: 8, pages: 1 },
  comets: { count: 6, pages: 1 },
} as const;

type CatalogueMode = keyof typeof CATALOGUE;

function watchRuntime(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  return { pageErrors, consoleErrors };
}

async function sceneSnapshot(
  page: Page,
): Promise<HeliosSceneTestSnapshot | null> {
  return page.evaluate(() => window.__HELIOS_SCENE_TEST__ ?? null);
}

async function gateSnapshot(
  page: Page,
): Promise<Gate3BSceneProbeSnapshot | null> {
  return page.evaluate(() => window.__HELIOS_GATE3B_SCENE_TEST__ ?? null);
}

async function waitForGateProbe(page: Page) {
  await expect
    .poll(async () => Boolean(await gateSnapshot(page)), { timeout: 45_000 })
    .toBe(true);
}

async function waitForScene(page: Page) {
  await expect(page.locator("html")).toHaveAttribute(
    "data-explore-scene-ready",
    "true",
    { timeout: 45_000 },
  );
  await waitForGateProbe(page);
}

async function openCatalogue(
  page: Page,
  mode: CatalogueMode,
  pageNumber = 1,
  evidence?: string,
) {
  const query = new URLSearchParams({
    sceneTest: "1",
    catalogue: mode,
    page: String(pageNumber),
  });
  if (evidence) query.set("evidence", evidence);
  await page.goto(`/explore?${query.toString()}`);
  await expect
    .poll(async () => (await sceneSnapshot(page))?.catalogue.enabled ?? false, {
      timeout: 45_000,
    })
    .toBe(true);
  await waitForGateProbe(page);
  await expect(page.locator("[data-catalogue-label]")).not.toHaveCount(0);
}

async function openNavigatorRoot(page: Page) {
  await page.getByRole("tab", { name: "Navigator" }).click();
  for (let index = 0; index < 4; index += 1) {
    const back = page.getByRole("button", { name: /Back/i });
    if ((await back.count()) === 0) break;
    await back.click();
  }
}

async function selectMoon(page: Page, parent: string, moon: string) {
  await openNavigatorRoot(page);
  await page.getByRole("button", { name: /Planetary moons/i }).click();
  await page.getByRole("button", { name: new RegExp(`^${parent}`) }).click();
  await page.getByRole("button", { name: moon, exact: true }).click();
  await expect(
    page.getByRole("heading", { name: moon, exact: true }),
  ).toBeVisible();
}

async function selectCategoryBody(page: Page, category: RegExp, body: string) {
  await openNavigatorRoot(page);
  await page.getByRole("button", { name: category }).click();
  await page.getByRole("button", { name: body, exact: true }).click();
  await expect(
    page.getByRole("heading", { name: body, exact: true }),
  ).toBeVisible();
}

async function selectPlanet(page: Page, planet: string) {
  await selectCategoryBody(page, /Sun & planets/i, planet);
}

async function expectCleanRuntime(audit: ReturnType<typeof watchRuntime>) {
  expect(audit.pageErrors).toEqual([]);
  expect(
    audit.consoleErrors.filter(
      (message) => !message.includes("ERR_BLOCKED_BY_CLIENT"),
    ),
  ).toEqual([]);
}

async function screenshotEvidence(
  page: Page,
  testInfo: TestInfo,
  name: string,
) {
  await page.waitForTimeout(500);
  await page.screenshot({
    path: testInfo.outputPath(name),
    animations: "disabled",
  });
}

test("catalogue completeness and object-local surface contracts", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const audit = watchRuntime(page);
  await page.addInitScript(() => localStorage.clear());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/textures/celestial/moon-mars-phobos.webp", (route) =>
    route.abort("blockedbyclient"),
  );

  for (const [mode, expected] of Object.entries(CATALOGUE) as Array<
    [CatalogueMode, (typeof CATALOGUE)[CatalogueMode]]
  >) {
    const collected: string[] = [];
    for (let pageNumber = 1; pageNumber <= expected.pages; pageNumber += 1) {
      await openCatalogue(page, mode, pageNumber);
      const scene = await sceneSnapshot(page);
      const gate = await gateSnapshot(page);
      expect(scene?.catalogue.tileCount).toBeGreaterThan(0);
      expect(scene?.catalogue.tileCount).toBeLessThanOrEqual(8);
      collected.push(...(scene?.catalogue.bodyIds ?? []));
      for (const id of scene?.catalogue.bodyIds ?? []) {
        const body = gate?.catalogueBodies[id];
        expect(body).toBeDefined();
        expect(body?.texturePath).toBe(`/textures/celestial/${id}.webp`);
        expect([
          "derived-map",
          "procedural-reconstruction",
          "real-map",
        ]).toContain(body?.assetRepresentation);
        expect(body?.orientationApplied).toBe(true);
        expect(body?.fallbackVisible || body?.finalSurfaceVisible).toBe(true);
        if (body?.finalSurfaceVisible) expect(body.surfaceReady).toBe(true);
      }
    }
    expect(collected).toHaveLength(expected.count);
    expect(new Set(collected).size).toBe(expected.count);
    if (mode === "moons") {
      await openCatalogue(page, "moons", 1);
      await expect
        .poll(
          async () =>
            (await gateSnapshot(page))?.catalogueBodies["moon-mars-phobos"]
              ?.fallbackVisible ?? false,
        )
        .toBe(true);
      await expect
        .poll(
          async () =>
            (await gateSnapshot(page))?.catalogueBodies["moon-jupiter-europa"]
              ?.finalSurfaceVisible ?? false,
        )
        .toBe(true);

      await openCatalogue(page, "moons", 3);
      await expect
        .poll(
          async () =>
            (await gateSnapshot(page))?.catalogueBodies["moon-neptune-nereid"]
              ?.rotationKind,
        )
        .toBe("fixed-unknown");
      expect(
        (await gateSnapshot(page))?.catalogueBodies["moon-neptune-nereid"]
          ?.tidalFacingDot,
      ).toBeNull();
    }
  }
  await expectCleanRuntime(audit);
});

test("featured moon selection preserves tidal orientation, orbit and camera ownership", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const audit = watchRuntime(page);
  await page.addInitScript(() => localStorage.clear());
  await page.goto("/explore?sceneTest=1&at=2026-07-21T12%3A00%3A00.000Z");
  await waitForScene(page);

  const representatives = [
    ["Earth", "Moon", "moon-earth-moon"],
    ["Mars", "Phobos", "moon-mars-phobos"],
    ["Jupiter", "Europa", "moon-jupiter-europa"],
    ["Saturn", "Titan", "moon-saturn-titan"],
    ["Uranus", "Miranda", "moon-uranus-miranda"],
    ["Neptune", "Triton", "moon-neptune-triton"],
  ] as const;

  for (const [parent, name, id] of representatives) {
    await selectMoon(page, parent, name);
    await expect
      .poll(async () => (await sceneSnapshot(page))?.camera?.targetBodyId)
      .toBe(id);
    await expect
      .poll(
        async () =>
          (await gateSnapshot(page))?.catalogueBodies[id]?.rotationKind,
      )
      .toBe("tidally-locked");
    await expect
      .poll(
        async () =>
          (await gateSnapshot(page))?.catalogueBodies[id]?.surfaceReady,
      )
      .toBe(true);
    await expect
      .poll(
        async () =>
          (await gateSnapshot(page))?.catalogueBodies[id]?.finalSurfaceVisible,
      )
      .toBe(true);
    await expect
      .poll(
        async () =>
          (await gateSnapshot(page))?.catalogueBodies[id]?.tidalFacingDot ?? 0,
      )
      .toBeGreaterThan(0.995);
    const orbit = (await gateSnapshot(page))?.orbits[id];
    expect(orbit?.closed).toBe(true);
    expect(orbit?.dashed).toBe(false);
    expect(orbit?.emphasis).toBe("selected");
    expect(orbit?.maxChordToBoundsRatio).toBeLessThan(0.12);
    expect(orbit?.maxToMedianSegmentRatio).toBeLessThan(2.6);
    const surface = (await gateSnapshot(page))?.catalogueBodies[id];
    expect(surface?.fallbackVisible || surface?.finalSurfaceVisible).toBe(true);
  }

  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    const x = box.x + box.width * 0.5;
    const y = box.y + box.height * 0.5;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 80, y + 30, { steps: 8 });
    await page.mouse.up();
    await page.mouse.wheel(0, -240);
  }
  await expect
    .poll(async () => (await sceneSnapshot(page))?.camera?.targetBodyId)
    .toBe("moon-neptune-triton");
  await expectCleanRuntime(audit);
});

test("all featured moon visual evidence is paged and labelled", async ({
  page,
}, testInfo) => {
  test.setTimeout(150_000);
  const audit = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  const evidence = [
    ["earth-mars-moons", "featured-moons-earth-mars.png"],
    ["galilean-moons", "featured-moons-galilean.png"],
    ["saturn-moons-1", "featured-moons-saturn-1.png"],
    ["saturn-moons-2", "featured-moons-saturn-2.png"],
    ["uranus-moons", "featured-moons-uranus.png"],
    ["neptune-moons", "featured-moons-neptune.png"],
  ] as const;
  const ids = new Set<string>();
  for (const [group, fileName] of evidence) {
    await openCatalogue(page, "moons", 1, group);
    const scene = await sceneSnapshot(page);
    for (const id of scene?.catalogue.bodyIds ?? []) ids.add(id);
    expect(await page.locator("[data-catalogue-label]").count()).toBe(
      scene?.catalogue.tileCount,
    );
    await screenshotEvidence(page, testInfo, fileName);
  }
  expect(ids.size).toBe(22);
  await expectCleanRuntime(audit);
});

test("asteroid and dwarf-world silhouettes, rings and surfaces remain distinct", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  const audit = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [mode, evidence, fileName] of [
    ["asteroids", "main-belt-worlds", "main-belt-worlds.png"],
    ["dwarf-kuiper", "dwarf-worlds-1", "dwarf-worlds-1.png"],
    ["dwarf-kuiper", "dwarf-worlds-2", "dwarf-worlds-2.png"],
  ] as const) {
    await openCatalogue(page, mode, 1, evidence);
    await screenshotEvidence(page, testInfo, fileName);
  }
  await openCatalogue(page, "asteroids");
  let gate = await gateSnapshot(page);
  expect(gate?.catalogueBodies.ceres.geometryKind).toBe("sphere");
  expect(gate?.catalogueBodies.vesta.geometryKind).toBe("irregular");
  expect(gate?.catalogueBodies.pallas.geometryKind).toBe("irregular");
  expect(gate?.catalogueBodies.hygiea.geometryKind).toBe("ellipsoid");
  await openCatalogue(page, "dwarf-kuiper");
  gate = await gateSnapshot(page);
  expect(gate?.catalogueBodies.haumea.ringMounted).toBe(true);
  expect(gate?.catalogueBodies.quaoar.ringMounted).toBe(true);
  expect(gate?.catalogueBodies.pluto.atmosphereMounted).toBe(true);
  await expectCleanRuntime(audit);
});

test("dwarf systems preserve barycentric, parent-local and independent selection context", async ({
  page,
}, testInfo) => {
  test.setTimeout(150_000);
  const audit = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  const all = new Set<string>();
  for (const pageNumber of [1, 2]) {
    await openCatalogue(page, "dwarf-systems", pageNumber);
    for (const id of (await sceneSnapshot(page))?.catalogue.bodyIds ?? []) {
      all.add(id);
    }
    await screenshotEvidence(
      page,
      testInfo,
      `dwarf-systems-page-${pageNumber}.png`,
    );
  }
  expect(all.size).toBe(15);

  await page.goto("/explore?sceneTest=1");
  await waitForScene(page);
  await openNavigatorRoot(page);
  await page.getByRole("button", { name: /Dwarf & Kuiper worlds/i }).click();
  await page.getByRole("button", { name: /Open Pluto system/i }).click();
  await page.getByRole("button", { name: "Charon", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Charon" })).toBeVisible();
  await expect
    .poll(async () => (await sceneSnapshot(page))?.camera?.targetBodyId)
    .toBe("dwarf-satellite-charon");
  expect(
    (await gateSnapshot(page))?.catalogueBodies["dwarf-satellite-charon"]
      .rotationKind,
  ).toBe("tidally-locked");
  const dwarfProbe = await gateSnapshot(page);
  expect(
    dwarfProbe?.catalogueBodies["dwarf-satellite-hiiaka"].rotationKind,
  ).toBe("fixed-unknown");
  expect(dwarfProbe?.catalogueBodies.haumea.ringMounted).toBe(true);
  expect(dwarfProbe?.catalogueBodies.haumea.ringParentTransform).toBe(
    "surface-equatorial",
  );
  expect(dwarfProbe?.catalogueBodies.haumea.ringOuterRadius).toBeGreaterThan(1);
  expect(dwarfProbe?.dwarfOrbitPlanes["dwarf-satellite-charon"]).toMatchObject({
    status: "source-backed-parent-equatorial",
    inclinationDeg: 0,
    sourceId: "nasa-nssdc-pluto-fact-sheet",
  });
  expect(dwarfProbe?.dwarfOrbitPlanes["dwarf-satellite-hiiaka"]).toMatchObject({
    status: "source-backed-parent-equatorial",
    inclinationDeg: 2,
  });
  expect(dwarfProbe?.dwarfOrbitPlanes["dwarf-satellite-namaka"]).toMatchObject({
    status: "source-backed-parent-equatorial",
    inclinationDeg: 13,
  });
  expect(
    dwarfProbe?.dwarfOrbitPlanes["dwarf-satellite-dysnomia"],
  ).toMatchObject({
    status: "representative-parent-equatorial-unresolved",
    inclinationDeg: null,
    sourceId: null,
  });
  expect(dwarfProbe?.catalogueBodies.quaoar.ringMounted).toBe(true);
  await expectCleanRuntime(audit);
});

test("comet dynamics use shared time, local tail anchors and anti-solar direction", async ({
  page,
}, testInfo) => {
  test.setTimeout(150_000);
  const audit = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCatalogue(page, "comets");
  await screenshotEvidence(page, testInfo, "comet-nuclei-and-tails.png");

  const timestamps = ["2026-07-21T12:00:00.000Z", "2030-01-15T00:00:00.000Z"];
  const ids = ["halley", "67p", "neowise"] as const;
  const activityByTime: number[][] = [];
  for (const timestamp of timestamps) {
    await page.goto(`/explore?sceneTest=1&at=${encodeURIComponent(timestamp)}`);
    await waitForScene(page);
    const gate = await gateSnapshot(page);
    const activities: number[] = [];
    for (const id of ids) {
      const comet = gate?.comets[id];
      expect(comet).toBeDefined();
      expect(comet?.antiSolarDot).toBeGreaterThan(0.995);
      expect(comet?.tailAnchorDistance).toBeLessThan(1e-6);
      expect(comet?.tailIncludedInFocusBounds).toBe(false);
      expect(comet?.nucleusFocusRadius).toBeGreaterThan(0);
      expect(comet?.tailLength).toBeGreaterThanOrEqual(0);
      expect(comet?.tailPrimitive).toBe("particle-volume");
      expect(comet?.dustParticleCount).toBeGreaterThanOrEqual(500);
      expect(comet?.ionParticleCount).toBeGreaterThanOrEqual(240);
      expect(comet?.comaParticleCount).toBeGreaterThanOrEqual(160);
      expect(comet?.totalParticleCount).toBeGreaterThanOrEqual(900);
      activities.push(comet?.activity ?? 0);
    }
    activityByTime.push(activities);
  }
  expect(activityByTime[0]).not.toEqual(activityByTime[1]);

  await page.goto("/explore?sceneTest=1");
  await waitForScene(page);
  for (const [name, id] of [
    ["Halley", "halley"],
    ["Encke", "encke"],
    ["67P/Churyumov–Gerasimenko", "67p"],
  ] as const) {
    await selectCategoryBody(page, /Comets/i, name);
    await expect
      .poll(async () => (await gateSnapshot(page))?.orbits[id]?.emphasis)
      .toBe("selected");
    const orbit = (await gateSnapshot(page))?.orbits[id];
    expect(orbit?.closed).toBe(true);
    expect(orbit?.dashed).toBe(false);
    expect(orbit?.maxChordToBoundsRatio).toBeLessThan(0.12);
    expect(orbit?.maxToMedianSegmentRatio).toBeLessThan(2.6);
    await expect
      .poll(
        async () =>
          (await gateSnapshot(page))?.catalogueBodies[id]?.surfaceReady,
      )
      .toBe(true);
    await expect
      .poll(
        async () =>
          (await gateSnapshot(page))?.catalogueBodies[id]?.finalSurfaceVisible,
      )
      .toBe(true);
  }
  await expectCleanRuntime(audit);
});

test("planetary rings preserve counts, open arcs, equatorial transforms and focus context", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  const audit = watchRuntime(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/explore?sceneTest=1");
  await waitForScene(page);
  const expectations = [
    ["Jupiter", "jupiter", 4, 0],
    ["Saturn", "saturn", 1, 0],
    ["Uranus", "uranus", 13, 0],
    ["Neptune", "neptune", 5, 4],
  ] as const;
  for (const [name, id, bands, arcs] of expectations) {
    await selectPlanet(page, name);
    await expect
      .poll(async () => (await gateSnapshot(page))?.rings[id]?.bandCount)
      .toBe(bands);
    const ring = (await gateSnapshot(page))?.rings[id];
    expect(ring?.arcCount).toBe(arcs);
    expect(ring?.parentTransform).toBe("planet-equatorial");
    expect(ring?.planeNormal.every(Number.isFinite)).toBe(true);
    expect(ring?.outerRadius).toBeGreaterThan(1);
    if (id === "neptune") expect(ring?.arcsOpen).toBe(true);
    if (id === "saturn") {
      await expect
        .poll(
          async () => (await gateSnapshot(page))?.rings.saturn?.textureReady,
        )
        .toBe(true);
    }
    await expect
      .poll(async () => (await sceneSnapshot(page))?.camera?.targetBodyId)
      .toBe(id);
    await screenshotEvidence(page, testInfo, `planetary-rings-${id}.png`);
  }
  await expectCleanRuntime(audit);
});

test("orbit identity remains stable through select, clear and visibility changes", async ({
  page,
}) => {
  test.setTimeout(150_000);
  const audit = watchRuntime(page);
  await page.goto("/explore?sceneTest=1");
  await waitForScene(page);

  const flows = [
    async () => selectMoon(page, "Jupiter", "Europa"),
    async () => selectCategoryBody(page, /Dwarf & Kuiper worlds/i, "Pluto"),
    async () => selectCategoryBody(page, /Comets/i, "Halley"),
  ];
  const ids = ["moon-jupiter-europa", "pluto", "halley"] as const;
  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index];
    const before = (await gateSnapshot(page))?.orbits[id];
    expect(before?.geometryUuid).not.toBe("");
    expect(before?.materialUuid).not.toBe("");
    await flows[index]!();
    await expect
      .poll(async () => (await gateSnapshot(page))?.orbits[id]?.emphasis)
      .toBe("selected");
    const selected = (await gateSnapshot(page))?.orbits[id];
    expect(selected?.geometryUuid).toBe(before?.geometryUuid);
    expect(selected?.materialUuid).toBe(before?.materialUuid);
    expect(selected?.emphasis).toBe("selected");

    await page.getByRole("tab", { name: "View" }).click();
    await page.getByRole("button", { name: /^Orbit paths: visible$/i }).click();
    await expect
      .poll(async () => (await gateSnapshot(page))?.orbits[id]?.emphasis)
      .toBe("hidden");
    const hidden = (await gateSnapshot(page))?.orbits[id];
    expect(hidden?.geometryUuid).toBe(before?.geometryUuid);
    expect(hidden?.materialUuid).toBe(before?.materialUuid);
    await page.getByRole("button", { name: /^Orbit paths: hidden$/i }).click();
    await expect
      .poll(async () => (await gateSnapshot(page))?.orbits[id]?.emphasis)
      .not.toBe("hidden");
    const restored = (await gateSnapshot(page))?.orbits[id];
    expect(restored?.geometryUuid).toBe(before?.geometryUuid);
    expect(restored?.materialUuid).toBe(before?.materialUuid);

    const clear = page.getByRole("button", { name: /Return to overview/i });
    if ((await clear.count()) > 0) {
      await clear.click();
      await expect
        .poll(async () => (await gateSnapshot(page))?.orbits[id]?.emphasis)
        .toBe("context");
    }
    const cleared = (await gateSnapshot(page))?.orbits[id];
    expect(cleared?.geometryUuid).toBe(before?.geometryUuid);
    expect(cleared?.materialUuid).toBe(before?.materialUuid);
  }
  await expectCleanRuntime(audit);
});

test("deterministic rotation returns to timestamp A and leaves unknown bodies fixed", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const audit = watchRuntime(page);
  const timestampA = "2026-07-21T12:00:00.000Z";
  await page.goto(
    `/explore?sceneTest=1&catalogue=comets&page=1&at=${encodeURIComponent(timestampA)}`,
  );
  // Catalogue mode has its own explicit readiness contract and no longer waits
  // for the production eight-planet texture gate that it intentionally omits.
  await waitForScene(page);
  await page.getByRole("tab", { name: "Time" }).click();
  const pause = page.getByRole("button", { name: "Pause simulation" });
  await expect(pause).toBeVisible();
  await pause.click();
  await expect(
    page.getByRole("button", { name: "Resume simulation" }),
  ).toBeVisible();

  const readAngles = async (timestamp: string) => {
    const date = new Date(timestamp);
    if (
      Number.isNaN(date.getTime()) ||
      date.getUTCSeconds() !== 0 ||
      date.getUTCMilliseconds() !== 0
    ) {
      throw new Error(
        `Rotation test timestamps must resolve to an exact UTC minute: ${timestamp}`,
      );
    }
    // Playwright's datetime-local fill contract accepts minute precision. The
    // ephemeris controller expands this value to :00 seconds in UTC.
    const exactInput = date.toISOString().slice(0, 16);
    await page.getByLabel("UTC date and time").fill(exactInput);
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    const expectedAt = Date.parse(timestamp);
    await expect
      .poll(async () => (await sceneSnapshot(page))?.simulation)
      .toEqual({ atMs: expectedAt, isPaused: true });
    await expect
      .poll(
        async () =>
          (await gateSnapshot(page))?.catalogueBodies["67p"].rotationAngle ??
          null,
      )
      .not.toBeNull();
    const bodies = (await gateSnapshot(page))?.catalogueBodies;
    return {
      periodic: bodies?.["67p"].rotationAngle ?? 0,
      unknown: bodies?.encke.rotationAngle ?? 0,
    };
  };

  const a1 = await readAngles(timestampA);
  const b = await readAngles("2026-07-21T18:00:00.000Z");
  const a2 = await readAngles(timestampA);
  expect(a2.periodic).toBeCloseTo(a1.periodic, 10);
  expect(b.periodic).not.toBeCloseTo(a1.periodic, 6);
  expect(a1.unknown).toBe(0);
  expect(b.unknown).toBe(0);
  expect(a2.unknown).toBe(0);
  await expectCleanRuntime(audit);
});
