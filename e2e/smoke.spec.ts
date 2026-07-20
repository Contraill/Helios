import { expect, test, type Page } from "@playwright/test";

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

async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

async function openNavigatorCategory(page: Page, name: RegExp) {
  await expect(page.locator("html")).toHaveAttribute(
    "data-explore-scene-ready",
    "true",
    { timeout: 45_000 },
  );
  await expect(page.getByTestId("explore-opening-loader")).toHaveCount(0);
  await page.getByRole("tab", { name: "Navigator" }).click();
  await page.getByRole("button", { name }).click();
}

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

test("Explore navigator exposes the Sun and all eight planets", async ({
  page,
}) => {
  await page.goto("/explore");
  await openNavigatorCategory(page, /Sun & planets/i);
  const navigator = page.getByRole("navigation", {
    name: "Celestial navigator",
  });
  for (const body of [
    "Sun",
    "Mercury",
    "Venus",
    "Earth",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
  ]) {
    await expect(
      navigator.getByRole("button", { name: body, exact: true }),
    ).toBeVisible();
  }
});

test("extended categories and featured objects remain keyboard-selectable", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto("/explore");
  await openNavigatorCategory(page, /Regions & context/i);
  const asteroidBelt = page.getByRole("button", {
    name: "Asteroid belt",
    exact: true,
  });
  await asteroidBelt.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Asteroid belt", exact: true }),
  ).toBeVisible();

  await page.getByRole("tab", { name: "Navigator" }).click();
  await page.getByRole("button", { name: /Back/i }).click();
  await page.getByRole("button", { name: /Main-belt worlds/i }).click();
  await page.getByRole("button", { name: "Ceres", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Ceres", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Open Ceres editorial page/i }).click();
  await expect(page).toHaveURL(/\/object\/ceres$/);
});

test("selection, rapid change and Escape keep the dock and camera synchronized", async ({
  page,
}) => {
  await page.goto("/explore");
  await openNavigatorCategory(page, /Sun & planets/i);
  await page.getByRole("button", { name: "Mars", exact: true }).click();
  await page.getByRole("tab", { name: "Navigator" }).click();
  await page.getByRole("button", { name: "Neptune", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Neptune", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Navigator" }).click();
  const neptune = page.getByRole("button", { name: "Neptune", exact: true });
  await expect(neptune).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(neptune).toBeFocused();
  await expect(neptune).toHaveAttribute("aria-pressed", "false");
});

test.describe("mobile Explore dock", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("keeps one dialog owner and restores focus on close", async ({
    page,
  }) => {
    await page.goto("/explore");
    const trigger = page.getByRole("button", { name: /Open controls/i });
    await expect(trigger).toBeVisible();
    await trigger.tap();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("tab", { name: "Navigator" }).click();
    await dialog.getByRole("button", { name: /Sun & planets/i }).click();
    const earth = dialog.getByRole("button", { name: "Earth", exact: true });
    await expect(earth).toBeVisible();
    await page.getByRole("button", { name: /Close Explore controls/i }).click();
    await expect(trigger).toBeFocused();
    await expectNoHorizontalOverflow(page);
  });
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
    await expect(page.getByTestId("planet-weight-result")).toHaveText("177kg");
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

    const categoryFilter = page.getByLabel("Category");
    await categoryFilter.selectOption("seaLakeIce");
    await expect(categoryFilter).toHaveValue("seaLakeIce");

    const matchingEvents = page.locator('[data-eonet-category="seaLakeIce"]');
    const emptyState = page.getByText(
      "No events match this category in the current record.",
    );
    await expect(matchingEvents.or(emptyState).first()).toBeVisible();
    await expect(
      page.locator(
        '[data-eonet-category]:not([data-eonet-category="seaLakeIce"])',
      ),
    ).toHaveCount(0);
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
