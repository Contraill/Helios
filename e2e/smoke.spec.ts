import { expect, test } from "@playwright/test";

import { HORIZONS_SNAPSHOT } from "../src/lib/data/ephemeris/horizons-snapshot";

const routes = [
  { path: "/", heading: "Helios" },
  { path: "/explore", heading: "Explore" },
  { path: "/planet/mercury", heading: "Mercury" },
  { path: "/planet/venus", heading: "Venus" },
  { path: "/planet/earth", heading: "Earth" },
  { path: "/planet/mars", heading: "Mars" },
  { path: "/planet/jupiter", heading: "Jupiter" },
  { path: "/planet/saturn", heading: "Saturn" },
  { path: "/planet/uranus", heading: "Uranus" },
  { path: "/planet/neptune", heading: "Neptune" },
  { path: "/compare", heading: "Compare" },
  { path: "/data", heading: "Data" },
  { path: "/about", heading: "About" },
  { path: "/case-study", heading: "Case study" },
] as const;

for (const route of routes) {
  test(`${route.path} renders its h1`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      route.heading,
    );
  });
}

test("unknown planet slugs return the not-found page", async ({ page }) => {
  const response = await page.goto("/planet/pluto");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page not found",
  );
});

test("the health endpoint reports ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  const body = (await response.json()) as { status: string };
  expect(body.status).toBe("ok");
});

test("the skip link is the first focusable element and targets main content", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveAttribute("href", "#main-content");
});

test("explore exposes the Sun and all eight planets outside the canvas", async ({
  page,
}) => {
  await page.goto("/explore");
  const navigator = page.getByRole("complementary", {
    name: "Solar System bodies from the Sun outward",
  });
  await expect(navigator.locator("ol").getByRole("button")).toHaveCount(9);
});

test("the Sun is a selectable focus target and Escape restores its control", async ({
  page,
}) => {
  await page.goto("/explore");
  const sun = page.getByRole("button", { name: "Sun" });

  await sun.click();
  await expect(sun).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("region", { name: "Sun", exact: true }),
  ).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(sun).toBeFocused();
  await expect(sun).toHaveAttribute("aria-pressed", "false");
});

test("explore selection, rapid change and Escape stay synchronized", async ({
  page,
}) => {
  await page.goto("/explore");

  const mars = page.getByRole("button", { name: "Mars" });
  const neptune = page.getByRole("button", { name: "Neptune" });

  await mars.click();
  await neptune.click();

  await expect(neptune).toHaveAttribute("aria-pressed", "true");
  await expect(mars).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("heading", { name: "Neptune" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open the Neptune reference page" }),
  ).toHaveAttribute("href", "/planet/neptune");

  await page.keyboard.press("Escape");
  await expect(neptune).toBeFocused();
  await expect(neptune).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("heading", { name: "Neptune" })).toHaveCount(0);
});

test.describe("mobile explore", () => {
  test.use({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });

  test("keeps selection and controls usable on a narrow touch viewport", async ({
    page,
  }) => {
    await page.goto("/explore");

    const jupiter = page.getByRole("button", { name: "Jupiter" });
    await jupiter.tap();

    const panel = page.getByRole("region", { name: "Jupiter" });
    await expect(panel).toBeVisible();
    await expect(jupiter).toHaveAttribute("aria-pressed", "true");

    const panelBox = await panel.boundingBox();
    expect(panelBox).not.toBeNull();
    expect(panelBox?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((panelBox?.x ?? 0) + (panelBox?.width ?? 0)).toBeLessThanOrEqual(
      390,
    );

    const targetBox = await jupiter.boundingBox();
    expect(targetBox?.height ?? 0).toBeGreaterThanOrEqual(44);

    await page.getByRole("button", { name: "Overview", exact: true }).tap();
    await expect(jupiter).toHaveAttribute("aria-pressed", "false");
    await expect(panel).toHaveCount(0);
  });

  test("touching the scene directly enables touch camera control", async ({
    page,
  }) => {
    await page.goto("/explore");
    const shell = page.locator(".solar-canvas-shell");
    await expect(shell).toHaveAttribute("data-camera-mode", "overview");

    const canvasBox = await page.locator("canvas").boundingBox();
    expect(canvasBox).not.toBeNull();
    await page.touchscreen.tap(
      canvasBox!.x + canvasBox!.width * 0.5,
      canvasBox!.y + canvasBox!.height * 0.32,
    );

    await expect(shell).toHaveAttribute("data-camera-mode", "free");
  });
});

test("simulation controls pause, reset and explain scale honestly", async ({
  page,
}) => {
  await page.goto("/explore");
  const controls = page.getByRole("complementary", {
    name: "Simulation controls",
  });

  await controls.getByRole("button", { name: "Pause" }).click();
  await expect(
    controls.getByRole("button", { name: "Resume" }),
  ).toHaveAttribute("aria-pressed", "true");

  await controls.getByRole("button", { name: "1 day / sec" }).click();
  await expect(
    controls.getByRole("button", { name: "1 day / sec" }),
  ).toHaveAttribute("aria-pressed", "true");

  await controls.getByRole("button", { name: "Scientific" }).click();
  await expect(
    page.getByText(/one shared ratio for radii and distance/i),
  ).toBeVisible();

  await controls.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(controls.getByRole("button", { name: "Pause" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(
    controls.getByRole("button", { name: "Real time" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("viewing preferences survive reload", async ({ page }) => {
  await page.goto("/explore");
  const controls = page.getByRole("complementary", {
    name: "Simulation controls",
  });

  await controls.getByRole("button", { name: "Scientific" }).click();
  await controls.getByRole("button", { name: "Orbit paths" }).click();
  await controls.getByRole("button", { name: "Planet labels" }).click();
  await controls.getByRole("button", { name: "Low" }).click();
  await controls.getByRole("button", { name: "Reduced" }).click();
  await controls.getByRole("button", { name: "1 year / sec" }).click();

  await page.reload();

  const restored = page.getByRole("complementary", {
    name: "Simulation controls",
  });
  await expect(
    restored.getByRole("button", { name: "Scientific" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    restored.getByRole("button", { name: "Orbit paths" }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(
    restored.getByRole("button", { name: "Planet labels" }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(restored.getByRole("button", { name: "Low" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    restored.getByRole("button", { name: "Reduced" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    restored.getByRole("button", { name: "1 year / sec" }),
  ).toHaveAttribute("aria-pressed", "true");
});

async function expectNoHorizontalOverflow(
  page: import("@playwright/test").Page,
) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}

async function expectVerticalStack(
  page: import("@playwright/test").Page,
  names: readonly { role: "region" | "complementary"; name: string }[],
) {
  const boxes = [];
  for (const item of names) {
    const box = await page
      .getByRole(item.role, { name: item.name })
      .boundingBox();
    expect(box).not.toBeNull();
    boxes.push(box!);
  }

  for (let index = 1; index < boxes.length; index += 1) {
    expect(boxes[index].y).toBeGreaterThanOrEqual(
      boxes[index - 1].y + boxes[index - 1].height,
    );
  }
}

for (const viewport of [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
] as const) {
  test.describe(`mobile acceptance ${viewport.width}`, () => {
    test.use({ hasTouch: true, viewport });

    test("keeps the selected panel, controls, scale explanation and navigator separated", async ({
      page,
    }) => {
      await page.goto("/explore");
      await page.getByRole("button", { name: "Mars" }).tap();

      await expectVerticalStack(page, [
        { role: "region", name: "Mars" },
        { role: "complementary", name: "Simulation controls" },
        {
          role: "complementary",
          name: "Solar System bodies from the Sun outward",
        },
      ]);
      await expect(page.locator("#experience-scale-description")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  });
}

test.describe("tablet acceptance", () => {
  test.use({ hasTouch: true, viewport: { width: 768, height: 1024 } });

  test("keeps control surfaces inside the tablet viewport", async ({
    page,
  }) => {
    await page.goto("/explore");
    await page.getByRole("button", { name: "Saturn" }).tap();

    const controls = page.getByRole("complementary", {
      name: "Simulation controls",
    });
    const navigator = page.getByRole("complementary", {
      name: "Solar System bodies from the Sun outward",
    });
    const summary = page.getByRole("region", { name: "Saturn" });

    const [controlsBox, navigatorBox, summaryBox] = await Promise.all([
      controls.boundingBox(),
      navigator.boundingBox(),
      summary.boundingBox(),
    ]);

    for (const box of [controlsBox, navigatorBox, summaryBox]) {
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(768);
    }

    expect(summaryBox!.y + summaryBox!.height).toBeLessThanOrEqual(
      Math.min(controlsBox!.y, navigatorBox!.y),
    );
    expect(controlsBox!.x + controlsBox!.width).toBeLessThanOrEqual(
      navigatorBox!.x,
    );
    await expectNoHorizontalOverflow(page);
  });
});

test("scene accessibility name follows scale and reduced motion", async ({
  page,
}) => {
  await page.goto("/explore");
  await expect(
    page.getByRole("region", {
      name: "Animated exploration-scale model of the Sun and the eight planets",
    }),
  ).toBeVisible();

  const controls = page.getByRole("complementary", {
    name: "Simulation controls",
  });
  await controls.getByRole("button", { name: "Scientific" }).click();
  await controls.getByRole("button", { name: "Reduced" }).click();

  await expect(
    page.getByRole("region", {
      name: "Static scientific-scale model of the Sun and the eight planets",
    }),
  ).toBeVisible();
});

test("visual quality tiers load the expected texture detail and gate bloom", async ({
  page,
}) => {
  await page.goto("/explore");
  const shell = page.locator(".solar-canvas-shell");
  const controls = page.getByRole("complementary", {
    name: "Simulation controls",
  });

  await expect(shell).toHaveAttribute("data-texture-variant", "medium");
  await expect(shell).toHaveAttribute("data-bloom", "disabled");

  const lowEarth = page.waitForResponse(/earth-low\.webp$/);
  await controls.getByRole("button", { name: "Low" }).click();
  expect((await lowEarth).status()).toBe(200);
  await expect(shell).toHaveAttribute("data-texture-variant", "low");
  await expect(shell).toHaveAttribute("data-bloom", "disabled");

  const highMars = page.waitForResponse(/mars-high\.webp$/);
  await controls.getByRole("button", { name: "High" }).click();
  expect((await highMars).status()).toBe(200);
  await page.getByRole("button", { name: "Mars" }).click();
  await expect(shell).toHaveAttribute("data-texture-variant", "high");
  await expect(shell).toHaveAttribute("data-bloom", "enabled");

  await controls.getByRole("button", { name: "Reduced" }).click();
  await expect(shell).toHaveAttribute("data-bloom", "disabled");
});

test("all body maps follow the selected quality without focus downgrades", async ({
  page,
}) => {
  const bodyIds = [
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
  ] as const;
  const loadedPaths = new Set<string>();
  page.on("response", (response) => {
    const pathname = new URL(response.url()).pathname;
    if (response.status() === 200) loadedPaths.add(pathname);
  });

  await page.goto("/explore");
  const controls = page.getByRole("complementary", {
    name: "Simulation controls",
  });
  await controls.getByRole("button", { name: "Low" }).click();
  await expect
    .poll(() =>
      ["sun", ...bodyIds].every((bodyId) =>
        loadedPaths.has(`/textures/planets/${bodyId}-low.webp`),
      ),
    )
    .toBe(true);

  await controls.getByRole("button", { name: "High" }).click();
  await expect
    .poll(() =>
      ["sun", ...bodyIds].every((bodyId) =>
        loadedPaths.has(`/textures/planets/${bodyId}-high.webp`),
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Neptune", exact: true }).click();
  await expect(page.getByRole("region", { name: "Neptune" })).toBeVisible();
});

test("a failed surface texture preserves the canvas and semantic fallback colour", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.route("**/textures/planets/mars-*.webp", (route) => route.abort());

  await page.goto("/explore");
  await page.getByRole("button", { name: "Mars" }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByRole("region", { name: "Mars" })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("initial Explore load avoids duplicate ephemeris and texture requests", async ({
  page,
}) => {
  const ephemerisRequests: string[] = [];
  const textureRequests: string[] = [];
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path === "/api/ephemeris") ephemerisRequests.push(request.url());
    if (path.startsWith("/textures/")) textureRequests.push(path);
  });
  await page.route("**/api/ephemeris?*", async (route) => {
    const requestedAt = new URL(route.request().url()).searchParams.get("at")!;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ...HORIZONS_SNAPSHOT,
        status: "current",
        requestedAt,
        observedAt: requestedAt,
        retrievedAt: requestedAt,
      }),
    });
  });

  await page.goto("/explore", { waitUntil: "networkidle" });
  await expect.poll(() => textureRequests.length).toBe(12);

  expect(ephemerisRequests).toHaveLength(1);
  expect(textureRequests).toContain(
    "/textures/planets/earth-clouds-medium.webp",
  );
  expect(textureRequests).toContain(
    "/textures/planets/earth-city-lights-medium.webp",
  );
  expect(new Set(textureRequests).size).toBe(textureRequests.length);
});

test("WebGL failure retains the Explore controls and planet navigation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      contextId: string,
      ...args: unknown[]
    ) {
      if (contextId.startsWith("webgl")) return null;
      return getContext.call(this, contextId, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/explore");

  await expect(
    page.getByRole("complementary", {
      name: "Solar System bodies from the Sun outward",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Simulation controls" }),
  ).toBeVisible();
  await expect(page.getByText(/3D view is unavailable/i)).toBeVisible();
});

test("ephemeris navigation supports a shareable past and future UTC time", async ({
  page,
}) => {
  await page.route("**/api/ephemeris?*", async (route) => {
    const requestedAt = new URL(route.request().url()).searchParams.get("at")!;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ...HORIZONS_SNAPSHOT,
        status: "current",
        requestedAt,
        observedAt: requestedAt,
        retrievedAt: requestedAt,
      }),
    });
  });
  await page.goto("/explore?at=2024-01-15T12%3A30%3A00.000Z");

  const ephemeris = page.getByRole("complementary", {
    name: "Ephemeris time controls",
  });
  await expect(ephemeris.locator("[data-status]")).not.toHaveAttribute(
    "data-status",
    "loading",
  );
  await ephemeris
    .getByRole("button", { name: "Open ephemeris time controls" })
    .click();
  const selectedValue = await ephemeris
    .getByLabel("UTC date and time")
    .inputValue();
  const selectedAt = Date.parse(`${selectedValue}Z`);
  expect(selectedAt).toBeGreaterThanOrEqual(
    Date.parse("2024-01-15T12:30:00.000Z"),
  );
  expect(selectedAt).toBeLessThan(Date.parse("2024-01-15T12:30:10.000Z"));

  await ephemeris.getByRole("button", { name: "+30d" }).click();
  await expect(page).toHaveURL(/at=2024-02-14T/);
  await ephemeris.getByRole("button", { name: "−1d" }).click();
  await expect(page).toHaveURL(/at=2024-02-13T/);
  await ephemeris.getByRole("button", { name: "Now" }).click();
  await expect(page).toHaveURL(/at=20\d{2}-/);
});

test("dynamic range, Julian-year preview and maximum boundary share one clock", async ({
  page,
}) => {
  await page.route("**/api/ephemeris?*", async (route) => {
    const requestedAt = new URL(route.request().url()).searchParams.get("at")!;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ...HORIZONS_SNAPSHOT,
        status: "current",
        requestedAt,
        observedAt: requestedAt,
        retrievedAt: requestedAt,
      }),
    });
  });
  await page.goto("/explore");

  const ephemeris = page.getByRole("complementary", {
    name: "Ephemeris time controls",
  });
  await expect(ephemeris.locator("[data-status]")).not.toHaveAttribute(
    "data-status",
    "loading",
  );
  await ephemeris
    .getByRole("button", { name: "Open ephemeris time controls" })
    .click();
  const dateInput = ephemeris.getByLabel("UTC date and time");
  const minimum = (await dateInput.getAttribute("min"))!;
  const maximum = (await dateInput.getAttribute("max"))!;
  expect(Number(minimum.slice(0, 4))).toBe(new Date().getUTCFullYear() - 500);
  expect(Number(maximum.slice(0, 4))).toBe(new Date().getUTCFullYear() + 600);

  const controls = page.getByRole("complementary", {
    name: "Simulation controls",
  });
  await controls.getByRole("button", { name: "1 year / sec" }).click();
  await expect(ephemeris.getByText("Approximate preview")).toBeVisible();

  await dateInput.fill(maximum.slice(0, 16));
  await ephemeris.getByRole("button", { name: "Apply" }).click();
  await expect(
    ephemeris.getByText("Maximum supported date reached"),
  ).toBeVisible();
  await expect(ephemeris.getByRole("button", { name: "+1d" })).toBeDisabled();
  await expect(controls.getByRole("button", { name: "Resume" })).toBeDisabled();
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
] as const) {
  test.describe(`expanded time navigation at ${viewport.width}px`, () => {
    test.use({ hasTouch: true, viewport });
    test("keeps the long-range controls inside the viewport", async ({
      page,
    }) => {
      await page.goto("/explore");
      const ephemeris = page.getByRole("complementary", {
        name: "Ephemeris time controls",
      });
      await ephemeris
        .getByRole("button", { name: "Open ephemeris time controls" })
        .tap();
      await expectNoHorizontalOverflow(page);
      const box = await ephemeris.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    });
  });
}

test("free camera has one explicit authority and Escape returns to guided view", async ({
  page,
}) => {
  await page.goto("/explore");
  const controls = page.getByRole("complementary", {
    name: "Simulation controls",
  });
  const free = controls.getByRole("button", { name: "Free" });
  const guided = controls.getByRole("button", { name: "Guided" });

  await free.click();
  await expect(free).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/drag or touch to orbit/i)).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(guided).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/Drag or touch the scene/i)).toBeVisible();
});

test("dragging the scene directly hands camera control to mouse input", async ({
  page,
}) => {
  await page.goto("/explore");
  const shell = page.locator(".solar-canvas-shell");
  await expect(shell).toHaveAttribute("data-camera-mode", "overview");

  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const x = box!.x + box!.width * 0.52;
  const y = box!.y + box!.height * 0.52;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 80, y + 35, { steps: 8 });
  await page.mouse.up();

  await expect(shell).toHaveAttribute("data-camera-mode", "free");
  await expect(page.getByRole("button", { name: "Free" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("ephemeris clock starts in real time and its panel stays collapsible", async ({
  page,
}) => {
  await page.route("**/api/ephemeris?*", async (route) => {
    const requestedAt = new URL(route.request().url()).searchParams.get("at")!;
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ...HORIZONS_SNAPSHOT,
        status: "current",
        requestedAt,
        observedAt: requestedAt,
        retrievedAt: requestedAt,
      }),
    });
  });
  await page.goto("/explore");
  const ephemeris = page.getByRole("complementary", {
    name: "Ephemeris time controls",
  });
  const open = ephemeris.getByRole("button", {
    name: "Open ephemeris time controls",
  });
  await expect(open).toBeVisible();
  const before = Date.parse(
    (await ephemeris.locator("time").getAttribute("datetime"))!,
  );
  const beforeReal = Date.now();
  await page.waitForTimeout(1_200);
  const afterReal = Date.now();
  const after = Date.parse(
    (await ephemeris.locator("time").getAttribute("datetime"))!,
  );
  const simulatedElapsed = after - before;
  const realElapsed = afterReal - beforeReal;
  expect(simulatedElapsed).toBeGreaterThanOrEqual(
    Math.max(500, realElapsed - 1_500),
  );
  expect(simulatedElapsed).toBeLessThan(realElapsed + 2_000);

  await open.click();
  const collapse = ephemeris.getByRole("button", {
    name: "Collapse ephemeris time controls",
  });
  await expect(collapse).toBeVisible();
  await collapse.click();
  await expect(open).toBeVisible();
  await expect(ephemeris.locator("[data-status]")).not.toHaveAttribute(
    "data-status",
    "loading",
  );
});

test("explore hydrates cleanly and keeps one real-time simulation clock", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.route("**/api/ephemeris?*", async (route) => {
    const requestedAt = new URL(route.request().url()).searchParams.get("at")!;
    await new Promise((resolve) => setTimeout(resolve, 1_500));
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ...HORIZONS_SNAPSHOT,
        status: "current",
        requestedAt,
        observedAt: requestedAt,
        retrievedAt: requestedAt,
      }),
    });
  });

  await page.goto("/explore");
  const ephemeris = page.getByRole("complementary", {
    name: "Ephemeris time controls",
  });
  const clock = ephemeris.locator("time").first();
  await expect(clock).toHaveAttribute("datetime", /T/);

  const hydratedAt = Date.parse((await clock.getAttribute("datetime"))!);
  expect(Math.abs(Date.now() - hydratedAt)).toBeLessThan(15_000);
  await page.waitForTimeout(750);
  const realTimeAfter = Date.parse((await clock.getAttribute("datetime"))!);
  expect(realTimeAfter).toBeGreaterThan(hydratedAt);

  const controls = page.getByRole("complementary", {
    name: "Simulation controls",
  });
  await controls.getByRole("button", { name: "1 year / sec" }).click();
  const acceleratedBefore = Date.parse((await clock.getAttribute("datetime"))!);
  await page.waitForTimeout(1_100);
  const acceleratedAfter = Date.parse((await clock.getAttribute("datetime"))!);
  const acceleratedDays =
    (acceleratedAfter - acceleratedBefore) / (24 * 60 * 60 * 1_000);
  expect(acceleratedDays).toBeGreaterThan(300);
  expect(acceleratedDays).toBeLessThan(550);

  await controls.getByRole("button", { name: "Pause" }).click();
  await page.waitForTimeout(400);
  const pausedAt = await clock.getAttribute("datetime");
  await page.waitForTimeout(700);
  await expect(clock).toHaveAttribute("datetime", pausedAt!);

  await ephemeris
    .getByRole("button", { name: "Open ephemeris time controls" })
    .click();
  await ephemeris.getByRole("button", { name: "Now" }).click();
  await page.waitForTimeout(350);
  const nowAt = Date.parse((await clock.getAttribute("datetime"))!);
  expect(Math.abs(Date.now() - nowAt)).toBeLessThan(5_000);
  await expect(
    controls.getByRole("button", { name: "Real time" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(controls.getByRole("button", { name: "Pause" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );

  await ephemeris
    .getByRole("button", { name: "Collapse ephemeris time controls" })
    .click();
  await controls.getByRole("button", { name: "1 year / sec" }).click();
  await controls.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(
    controls.getByRole("button", { name: "Real time" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(350);
  const resetAt = Date.parse((await clock.getAttribute("datetime"))!);
  expect(Math.abs(Date.now() - resetAt)).toBeLessThan(5_000);

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("the simulation deck collapses into a compact dock and persists", async ({
  page,
}) => {
  await page.goto("/explore");

  const controls = page.getByRole("complementary", {
    name: "Simulation controls",
  });
  await controls.getByRole("button", { name: "Scientific" }).click();
  const expandedBox = await controls.boundingBox();
  expect(expandedBox).not.toBeNull();
  expect(expandedBox!.width).toBeLessThanOrEqual(500);

  await controls
    .getByRole("button", { name: "Collapse simulation controls" })
    .click();

  const openButton = page.getByRole("button", { name: /Open controls/i });
  await expect(openButton).toBeVisible();
  await expect(openButton).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByText(
      "Scientific positions · locator discs identify worlds, not body size",
    ),
  ).toBeVisible();
  const dockBox = await openButton.boundingBox();
  expect(dockBox).not.toBeNull();
  expect(dockBox!.width).toBeLessThanOrEqual(260);

  await page.reload();
  await expect(
    page.getByRole("button", { name: /Open controls/i }),
  ).toBeVisible();

  await page.getByRole("button", { name: /Open controls/i }).click();
  await expect(
    page.getByRole("button", { name: "Collapse simulation controls" }),
  ).toBeVisible();
});

test("Mars detail provides sources, methodology and a personal calculation", async ({
  page,
}) => {
  await page.goto("/planet/mars");

  await expect(
    page.getByRole("heading", { level: 1, name: "Mars" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "What these values do—and do not—describe",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Mars: Facts" })).toHaveAttribute(
    "href",
    "https://science.nasa.gov/mars/facts/",
  );

  const weightInput = page.getByRole("textbox", {
    name: "Earth scale reading",
  });
  await weightInput.fill("70");
  await expect(page.getByText("26.5")).toBeVisible();
});

test.describe("Mars detail mobile", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("keeps the editorial vertical slice readable without horizontal overflow", async ({
    page,
  }) => {
    await page.goto("/planet/mars");
    await expect(
      page.getByRole("heading", { level: 1, name: "Mars" }),
    ).toBeVisible();
    await expect(
      page.getByText("A cold desert with the memory of water."),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

const phaseSixPlanets = [
  { id: "mercury", name: "Mercury" },
  { id: "venus", name: "Venus" },
  { id: "earth", name: "Earth" },
  { id: "mars", name: "Mars" },
  { id: "jupiter", name: "Jupiter" },
  { id: "saturn", name: "Saturn" },
  { id: "uranus", name: "Uranus" },
  { id: "neptune", name: "Neptune" },
] as const;

test.describe("Phase 6 planet details", () => {
  for (const planet of phaseSixPlanets) {
    test(`${planet.name} has metadata, methodology and sourced content`, async ({
      page,
    }) => {
      await page.goto(`/planet/${planet.id}`);

      await expect(page).toHaveTitle(`${planet.name} · Helios`);
      await expect(
        page.getByRole("heading", { level: 1, name: planet.name }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", {
          name: "What these values do—and do not—describe",
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Sources and provenance" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /Facts|Fact Sheet/i }).first(),
      ).toHaveAttribute("href", /^https:\/\//);
    });
  }

  test("adjacent navigation keeps Solar System order and works by keyboard", async ({
    page,
  }) => {
    await page.goto("/planet/mercury");
    const nextVenus = page.getByRole("link", { name: /Next world Venus/i });
    await expect(nextVenus).toHaveAttribute("href", "/planet/venus");
    await nextVenus.focus();
    await expect(nextVenus).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { level: 1, name: "Venus" }),
    ).toBeVisible();

    await page.goto("/planet/neptune");
    await expect(
      page.getByRole("link", { name: /Previous world Uranus/i }),
    ).toHaveAttribute("href", "/planet/uranus");
    await expect(page.getByText("Next world")).toHaveCount(0);
  });

  test("two different worlds produce finite personal scale comparisons", async ({
    page,
  }) => {
    await page.goto("/planet/mercury");
    await page.getByRole("textbox", { name: "Earth scale reading" }).fill("70");
    await expect(page.getByText("26.4")).toBeVisible();
    await expect(page.getByText(/NaN/)).toHaveCount(0);

    await page.goto("/planet/jupiter");
    await page.getByRole("textbox", { name: "Earth scale reading" }).fill("70");
    await expect(page.getByText("177")).toBeVisible();
    await expect(page.getByText(/one-bar reference ratio/i)).toBeVisible();
    await expect(page.getByText(/NaN/)).toHaveCount(0);
  });
});

test.describe("Phase 6 mobile overflow", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  for (const planet of phaseSixPlanets) {
    test(`${planet.name} remains complete at 390 px`, async ({ page }) => {
      await page.goto(`/planet/${planet.id}`);
      await expect(
        page.getByRole("heading", { level: 1, name: planet.name }),
      ).toBeVisible();
      if (planet.id === "earth") {
        await expect(
          page.getByRole("textbox", { name: "Earth scale reading" }),
        ).toHaveCount(0);
        await expect(
          page.getByRole("heading", { name: "One planet, several clocks" }),
        ).toBeVisible();
      } else {
        await expect(
          page.getByRole("textbox", { name: "Earth scale reading" }),
        ).toBeVisible();
      }
      await expect(
        page.getByRole("heading", { name: "Sources and provenance" }),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }
});

test.describe("Phase 7 external-data surfaces", () => {
  test("home APOD preserves date, source and fallback status without a key", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByText("Astronomy Picture of the Day", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Shadow and Rainbow" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Open official record" }),
    ).toHaveAttribute("href", /^https:\/\//);
    await expect(page.locator('[data-status="fallback"]')).toBeVisible();
  });

  test("Earth combines EPIC, EONET, GIBS, DONKI and NEO without a weight calculator", async ({
    page,
  }) => {
    await page.goto("/planet/earth");
    await expect(
      page.getByRole("textbox", { name: "Earth scale reading" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "One planet, several clocks" }),
    ).toBeVisible();
    await expect(page.getByText("Natural-color composite")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Read the event, then read its source",
      }),
    ).toBeVisible();
    await expect(page.getByText("Terra MODIS true color")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "The Sun does not stop at the sky" }),
    ).toBeVisible();
    await expect(page.getByText(/orbital classification/i)).toHaveCount(0);

    await page.getByLabel("Category").selectOption("seaLakeIce");
    await expect(
      page.getByText("No events match this category in the current record."),
    ).toBeVisible();
  });

  test("Mars labels InSight as historical and exposes Trek and mission provenance", async ({
    page,
  }) => {
    await page.goto("/planet/mars");
    await expect(
      page.getByRole("heading", {
        name: /On this day in the InSight archive|Nearest archived observation to/,
      }),
    ).toBeVisible();
    await expect(
      page.locator('[data-status="historical"]').first(),
    ).toBeVisible();
    await expect(page.getByText(/not “Mars today”/i)).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Three places, three ways to read relief",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Jezero Crater", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Open Mars Trek" }).first(),
    ).toHaveAttribute("href", /^https:\/\//);
    await expect(
      page.getByRole("heading", {
        name: "The archive remembers where each image came from",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "NASA media details" }).first(),
    ).toHaveAttribute("href", /^https:\/\//);
  });

  test("data page exposes solar, near-Earth, Earth, Mars, provenance and service states", async ({
    page,
  }) => {
    await page.goto("/data");
    for (const heading of [
      "Solar activity",
      "Near-Earth space",
      "Earth in observation",
      "Mars archive",
      "Provenance and service health",
    ]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
    const hazardousRows = page.getByText(
      "Potentially hazardous classification",
      { exact: true },
    );
    if ((await hazardousRows.count()) === 0) {
      await expect(
        page.getByText(/does not mean the object is predicted to collide/i),
      ).toHaveCount(0);
    } else {
      await expect(
        page.getByText(/does not mean the object is predicted to collide/i),
      ).toBeVisible();
    }
    await expect(page.locator('[data-status="stale"]').first()).toBeVisible();
    await expect(
      page.locator('[data-status="historical"]').first(),
    ).toBeVisible();
  });
});

test.describe("Phase 8 comparison", () => {
  test("restores URL state and preserves browser history", async ({ page }) => {
    await page.goto("/compare?a=earth&b=jupiter");
    await expect(page.getByLabel("First planet")).toHaveValue("earth");
    await expect(page.getByLabel("Second planet")).toHaveValue("jupiter");
    await expect(
      page.getByText(/one-bar atmospheric reference level/i),
    ).toBeVisible();

    await page.getByLabel("Second planet").selectOption("mars");
    await expect(page).toHaveURL(/b=mars/);
    await page.goBack();
    await expect(page.getByLabel("Second planet")).toHaveValue("jupiter");
  });

  test("same-world selection hides difference-only personal comparisons", async ({
    page,
  }) => {
    await page.goto("/compare?a=earth&b=earth");
    await expect(page.getByRole("status")).toContainText("same world twice");
    await expect(page.getByText("kg-equivalent")).toHaveCount(0);
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("personal comparison remains finite and keyboard reachable", async ({
    page,
  }) => {
    await page.goto("/compare?a=earth&b=mars");
    await page.getByLabel("Earth weight").fill("70");
    await page.getByLabel("Earth age").fill("23");
    await expect(page.getByText("26.5 kg-equivalent")).toBeVisible();
    await expect(page.getByText(/NaN/)).toHaveCount(0);
    await page.getByLabel("First planet").focus();
    await expect(page.getByLabel("First planet")).toBeFocused();
  });
});

const finalAcceptanceRoutes = [
  "/",
  "/planet/mercury",
  "/planet/venus",
  "/planet/earth",
  "/planet/mars",
  "/planet/jupiter",
  "/planet/saturn",
  "/planet/uranus",
  "/planet/neptune",
  "/data",
  "/compare",
] as const;

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
] as const) {
  test.describe(`Block B ${viewport.name} overflow`, () => {
    test.use({
      hasTouch: true,
      viewport: { width: viewport.width, height: viewport.height },
    });
    for (const route of finalAcceptanceRoutes) {
      test(`${route} stays within ${viewport.width}px`, async ({ page }) => {
        await page.goto(route);
        await expectNoHorizontalOverflow(page);
      });
    }
  });
}
