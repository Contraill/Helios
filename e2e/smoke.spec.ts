import { expect, test } from "@playwright/test";

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

test("explore exposes all eight planets outside the canvas", async ({
  page,
}) => {
  await page.goto("/explore");
  const navigator = page.getByRole("complementary", {
    name: "Planets ordered from the Sun",
  });
  await expect(navigator.locator("ol").getByRole("button")).toHaveCount(8);
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

  await controls.getByRole("button", { name: "16×" }).click();
  await expect(controls.getByRole("button", { name: "16×" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await controls.getByRole("button", { name: "Scientific" }).click();
  await expect(
    page.getByText(/one shared ratio for radii and distance/i),
  ).toBeVisible();

  await controls.getByRole("button", { name: "Reset" }).click();
  await expect(controls.getByRole("button", { name: "Pause" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(controls.getByRole("button", { name: "1×" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
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
  await controls.getByRole("button", { name: "4×" }).click();

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
  await expect(restored.getByRole("button", { name: "4×" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
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
        { role: "complementary", name: "Planets ordered from the Sun" },
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
      name: "Planets ordered from the Sun",
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
      await expect(
        page.getByRole("textbox", { name: "Earth scale reading" }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Sources and provenance" }),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }
});
