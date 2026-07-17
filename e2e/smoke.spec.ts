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
  const navigator = page.getByRole("complementary");
  await expect(navigator.getByRole("button", { pressed: false })).toHaveCount(
    8,
  );
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

    await page.getByRole("button", { name: "Overview" }).tap();
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
