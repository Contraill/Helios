import { expect, test, type Page } from "@playwright/test";

import { HORIZONS_SNAPSHOT } from "../src/lib/data/ephemeris/horizons-snapshot";

async function waitForScene(page: Page) {
  await expect(page.locator("html")).toHaveAttribute(
    "data-explore-scene-ready",
    "true",
    { timeout: 30_000 },
  );
  await expect(page.getByTestId("explore-opening-loader")).toHaveCount(0);
  await expect(page.locator(".solar-canvas-shell")).toHaveAttribute(
    "data-bootstrap-ready",
    "true",
  );
  await expect
    .poll(
      async () =>
        page.evaluate(() => window.__HELIOS_SCENE_ACCEPTANCE__?.frame ?? 0),
      { timeout: 30_000 },
    )
    .toBeGreaterThan(2);
}

async function snapshot(page: Page) {
  return page.evaluate(() => window.__HELIOS_SCENE_ACCEPTANCE__ ?? null);
}

function distance(
  left: readonly [number, number, number],
  right: readonly [number, number, number],
) {
  return Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2]);
}

function relativeDirection(
  child: readonly [number, number, number],
  parent: readonly [number, number, number],
): [number, number, number] {
  const vector: [number, number, number] = [
    child[0] - parent[0],
    child[1] - parent[1],
    child[2] - parent[2],
  ];
  const length = Math.hypot(...vector);
  return vector.map((value) => value / length) as [number, number, number];
}

function dot(
  left: readonly [number, number, number],
  right: readonly [number, number, number],
) {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

class Vector3Tuple {
  readonly normalized: [number, number, number];

  constructor(value: readonly [number, number, number]) {
    const magnitude = Math.hypot(...value);
    this.normalized = value.map((component) => component / magnitude) as [
      number,
      number,
      number,
    ];
  }
}

async function openCategory(page: Page, name: RegExp) {
  await page.getByRole("tab", { name: "Navigator" }).click();
  await page.getByRole("button", { name }).click();
}

test("shared simulation time freezes moons and preserves phase/profile/orbit identity", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await page.route("**/api/ephemeris?**", (route) =>
    route.fulfill({ json: HORIZONS_SNAPSHOT, status: 200 }),
  );
  await page.goto("/explore?acceptance=1&at=2026-07-19T00%3A00%3A00.000Z");
  await waitForScene(page);

  await openCategory(page, /Planetary moons/i);
  await page.getByRole("button", { name: /Saturn/i }).click();
  await page.getByRole("button", { name: "Titan", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Titan" })).toBeVisible();

  await expect
    .poll(async () =>
      Boolean((await snapshot(page))?.bodyPositions["moon-saturn-titan"]),
    )
    .toBe(true);
  const beforePause = await snapshot(page);
  expect(beforePause?.orbitResources["moon-saturn-titan"]?.visible).toBe(true);

  await page.getByRole("tab", { name: "Time" }).click();
  await page.getByRole("button", { name: "Pause simulation" }).click();
  await page.waitForTimeout(350);
  const pausedA = await snapshot(page);
  await page.waitForTimeout(700);
  const pausedB = await snapshot(page);
  expect(
    distance(
      pausedA!.bodyPositions["moon-saturn-titan"].position,
      pausedB!.bodyPositions["moon-saturn-titan"].position,
    ),
  ).toBeLessThan(1e-5);
  expect(
    distance(
      pausedA!.bodyPositions.saturn.position,
      pausedB!.bodyPositions.saturn.position,
    ),
  ).toBeLessThan(1e-5);
  await page.screenshot({
    path: testInfo.outputPath("saturn-moon-plane-paused.png"),
    animations: "disabled",
  });

  await page.getByRole("button", { name: "Resume simulation" }).click();
  await page.getByRole("button", { name: "1 day / sec" }).click();
  await page.waitForTimeout(1_100);
  const resumed = await snapshot(page);
  expect(
    distance(
      pausedB!.bodyPositions["moon-saturn-titan"].position,
      resumed!.bodyPositions["moon-saturn-titan"].position,
    ),
  ).toBeGreaterThan(1e-4);

  await page.getByRole("tab", { name: "Time" }).click();
  await page.getByRole("button", { name: "Pause simulation" }).click();
  await page.waitForTimeout(350);
  const beforeProfile = await snapshot(page);
  const exploreDirection = relativeDirection(
    beforeProfile!.bodyPositions["moon-saturn-titan"].position,
    beforeProfile!.bodyPositions.saturn.position,
  );
  const orbitIdentity = beforeProfile!.orbitResources["moon-saturn-titan"];
  await page.getByRole("tab", { name: "View" }).click();
  await page.getByRole("button", { name: "Scientific", exact: true }).click();
  await expect(page.locator(".solar-canvas-shell")).toHaveAttribute(
    "data-scene-profile",
    "scientific",
  );
  const scientific = await snapshot(page);
  const scientificDirection = relativeDirection(
    scientific!.bodyPositions["moon-saturn-titan"].position,
    scientific!.bodyPositions.saturn.position,
  );
  expect(dot(exploreDirection, scientificDirection)).toBeGreaterThan(0.9999);
  expect(scientific!.orbitResources["moon-saturn-titan"].geometryUuid).toBe(
    orbitIdentity.geometryUuid,
  );
  expect(scientific!.orbitResources["moon-saturn-titan"].materialUuid).toBe(
    orbitIdentity.materialUuid,
  );
  await page.screenshot({
    path: testInfo.outputPath("saturn-scientific-same-phase.png"),
    animations: "disabled",
  });
});

test("comet tail follows the transformed anti-solar vector", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await page.goto("/explore?acceptance=1&at=2026-07-19T00%3A00%3A00.000Z");
  await waitForScene(page);

  await openCategory(page, /Comets/i);
  await page.getByRole("button", { name: /Halley/i }).click();
  await expect
    .poll(async () => (await snapshot(page))?.cometTails.halley ?? null)
    .not.toBeNull();
  const comet = await snapshot(page);
  const tail = comet!.cometTails.halley;
  const position = comet!.bodyPositions.halley.position;
  const radialLength = Math.hypot(...position);
  const radial: [number, number, number] = position.map(
    (value) => value / radialLength,
  ) as [number, number, number];
  expect(tail.antiSolarDirection).not.toBeNull();
  expect(dot(tail.antiSolarDirection!, radial)).toBeGreaterThan(0.999);
  expect(tail.activity).toBeGreaterThanOrEqual(0);
  expect(tail.activity).toBeLessThanOrEqual(1);
  await page.screenshot({
    path: testInfo.outputPath("halley-anti-solar-tail.png"),
    animations: "disabled",
  });
});

test("extended orbit evidence keeps distinct node and periapsis orientations", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await page.goto("/explore?acceptance=1&at=2026-07-19T00%3A00%3A00.000Z");
  await waitForScene(page);

  await openCategory(page, /Main-belt worlds/i);
  await expect
    .poll(async () => {
      const scene = await snapshot(page);
      return ["ceres", "vesta", "pallas", "hygiea"].every(
        (id) => scene?.orbitResources[id]?.visible,
      );
    })
    .toBe(true);
  const scene = await snapshot(page);
  expect(scene!.orbitResources.ceres.geometryUuid).not.toBe(
    scene!.orbitResources.pallas.geometryUuid,
  );
  const ceresDirection = new Vector3Tuple(scene!.bodyPositions.ceres.position);
  const pallasDirection = new Vector3Tuple(
    scene!.bodyPositions.pallas.position,
  );
  expect(
    Math.abs(dot(ceresDirection.normalized, pallasDirection.normalized)),
  ).toBeLessThan(0.999);
  await page.screenshot({
    path: testInfo.outputPath("extended-distinct-orbit-planes.png"),
    animations: "disabled",
  });
});

test("data route retains verified fallback without static-to-dynamic client failure", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/data");
  await expect(page.getByRole("heading", { name: "Data" })).toBeVisible();
  await expect(page.getByText(/GIBS|Earth observation/i).first()).toBeVisible();
  expect(
    errors.filter((message) => /static to dynamic/i.test(message)),
  ).toEqual([]);
});
