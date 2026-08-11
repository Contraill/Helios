import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const mobileRoutes = [
  { path: "/", heading: /Helios/i },
  { path: "/compare?a=earth&b=mars", heading: /Compare/i },
  { path: "/missions", heading: /Spacecraft as evidence/i },
  { path: "/data", heading: /^Data$/i },
  { path: "/about", heading: /quieter way to read the Solar System/i },
  { path: "/case-study", heading: /Building a Solar System/i },
  { path: "/body/mercury", heading: /^Mercury$/i },
  { path: "/body/moon-jupiter-europa", heading: /^Europa$/i },
  { path: "/region/heliosphere", heading: /Heliosphere/i },
] as const;

function watchRuntime(page: Page) {
  const errors: string[] = [];
  page.on("crash", () => errors.push("page crashed"));
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(
    dimensions.clientWidth + 1,
  );
}

async function expectInsideViewport(page: Page, locator: Locator) {
  await expect(locator).toBeVisible();
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  const box = await locator.evaluate((element) => {
    element.scrollIntoView({ block: "nearest", inline: "nearest" });
    const rect = element.getBoundingClientRect();
    return { x: rect.x, width: rect.width };
  });

  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport!.width + 1);
}

async function waitForExploreOutcome(
  page: Page,
): Promise<"ready" | "fallback"> {
  const html = page.locator("html");
  const shell = page.locator(".solar-canvas-shell");
  const retry = page.getByRole("button", { name: /try again|tekrar dene/i });

  await expect
    .poll(
      async () => {
        if ((await html.getAttribute("data-explore-scene-ready")) === "true") {
          return "ready";
        }
        const availability = await shell.getAttribute(
          "data-webgl-availability",
        );
        if (availability === "unavailable" || (await retry.count()) > 0) {
          return "fallback";
        }
        return "pending";
      },
      { timeout: 60_000 },
    )
    .toMatch(/ready|fallback/);

  return (await html.getAttribute("data-explore-scene-ready")) === "true"
    ? "ready"
    : "fallback";
}

for (const route of mobileRoutes) {
  test(`mobile release route ${route.path} remains readable and width-safe`, async ({
    page,
  }) => {
    const runtimeErrors = watchRuntime(page);
    const response = await page.goto(route.path, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status(), route.path).toBe(200);
    const heading = page.getByRole("heading", { level: 1 }).first();
    await expect(heading).toContainText(route.heading);
    await expectInsideViewport(page, heading);
    await expectNoHorizontalOverflow(page);
    expect(runtimeErrors).toEqual([]);
  });
}

test("mobile release home preserves action order, APOD touch targets and footer policy", async ({
  page,
}) => {
  await page.goto("/");
  const actions = page.locator("[data-home-actions]");
  const scope = page.locator("[data-home-scope]");
  await expect(actions).toBeVisible();
  await expect(scope).toBeVisible();

  const actionBox = await actions.boundingBox();
  const scopeBox = await scope.boundingBox();
  expect(actionBox).not.toBeNull();
  expect(scopeBox).not.toBeNull();
  if (actionBox && scopeBox) {
    expect(scopeBox.y).toBeGreaterThanOrEqual(
      actionBox.y + actionBox.height + 8,
    );
  }

  await expect(page.locator("[data-site-footer]")).toHaveCount(0);

  const feature = page.locator("[data-apod-feature]");
  const media = feature.locator("[data-apod-media]");
  const copy = feature.locator("[data-apod-copy]");
  await expect(feature).toBeVisible();
  const mediaBox = await media.boundingBox();
  const copyBox = await copy.boundingBox();
  expect(mediaBox).not.toBeNull();
  expect(copyBox).not.toBeNull();
  if (mediaBox && copyBox) {
    expect(mediaBox.y + mediaBox.height).toBeLessThanOrEqual(copyBox.y + 1);
  }

  const controls = feature.locator(
    "[data-apod-actions] button, [data-apod-actions] a",
  );
  for (const control of await controls.all()) {
    await expectInsideViewport(page, control);
    const box = await control.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }

  await expect(feature.locator("[data-data-state]")).toHaveCSS(
    "display",
    "grid",
  );
  await expectNoHorizontalOverflow(page);
});

test("mobile release 404 occupies one viewport and remains touch-playable", async ({
  page,
}) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  const canvas = page.getByTestId("not-found-game-canvas");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("data-target-code", "404");
  await expect(page.locator('[data-game-phase="idle"]')).toBeVisible();

  const vertical = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }));
  expect(vertical.scrollHeight).toBeLessThanOrEqual(
    vertical.viewportHeight + 1,
  );
  await expectNoHorizontalOverflow(page);

  await canvas.tap({ position: { x: 24, y: 24 } });
  await expect(page.locator('[data-game-phase="playing"]')).toBeVisible();
  await expect(canvas).toHaveAttribute("data-ball-visibility", "visible");
});

test("mobile release Explore exposes a touch dialog or its designed WebGL recovery", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const runtimeErrors = watchRuntime(page);
  await page.addInitScript(() => localStorage.clear());
  await page.goto("/explore");
  const outcome = await waitForExploreOutcome(page);

  if (outcome === "ready") {
    const trigger = page.getByRole("button", { name: /Open controls/i });
    await expect(trigger).toBeVisible();
    const triggerBox = await trigger.boundingBox();
    expect(triggerBox).not.toBeNull();
    expect(triggerBox!.height).toBeGreaterThanOrEqual(44);
    await trigger.tap();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("tab", { name: "Navigator" }).click();
    await dialog.getByRole("button", { name: /Sun & planets/i }).click();
    await expect(
      dialog.getByRole("button", { name: "Earth", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Close Explore controls/i }).click();
    await expect(trigger).toBeFocused();
  } else {
    const retry = page.getByRole("button", { name: /try again|tekrar dene/i });
    await expect(retry).toBeVisible();
    const retryBox = await retry.boundingBox();
    expect(retryBox).not.toBeNull();
    expect(retryBox!.height).toBeGreaterThanOrEqual(44);
  }

  await expectNoHorizontalOverflow(page);
  expect(runtimeErrors).toEqual([]);
});

test("mobile release Mars detail keeps calculator and sourced content usable", async ({
  page,
}) => {
  await page.goto("/planet/mars");
  await expect(
    page.getByRole("heading", { level: 1, name: "Mars" }),
  ).toBeVisible();
  const input = page.getByRole("textbox", { name: "Earth scale reading" });
  await expectInsideViewport(page, input);
  await input.fill("70");
  await expect(input).toHaveValue("70");
  await expect(page.getByTestId("planet-weight-result")).toContainText(
    /26[.,]5/,
  );
  await expect(
    page.getByRole("heading", { name: "Sources and provenance" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("mobile release Compare preserves finite results and reachable controls", async ({
  page,
}) => {
  await page.goto("/compare?a=earth&b=mars");
  const first = page.getByLabel("First planet");
  const second = page.getByLabel("Second planet");
  await expectInsideViewport(page, first);
  await expectInsideViewport(page, second);
  await expect(first).toHaveValue("earth");
  await expect(second).toHaveValue("mars");

  await page.getByLabel("Earth weight").fill("70");
  await page.getByLabel("Earth age").fill("23");
  await expect(page.getByText("26.5 kg-equivalent")).toBeVisible();
  await expect(page.getByText(/NaN|Infinity/)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("mobile release language switch remains reachable and persistent", async ({
  page,
}) => {
  await page.goto("/");
  const language = page.getByRole("group", { name: "Language" });
  const turkish = language.getByRole("button", { name: "TR" });
  await expectInsideViewport(page, turkish);
  await turkish.tap();
  await expect(page.locator("html")).toHaveAttribute("lang", "tr-TR");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "tr-TR");
  await expect(
    page.getByRole("group", { name: "Arayüz dili" }).getByRole("button", {
      name: "TR",
    }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("mobile release reduced motion is honored by both 404 and Explore", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/this-route-does-not-exist");
  await expect(page.getByTestId("not-found-game-canvas")).toHaveAttribute(
    "data-reduced-motion",
    "true",
  );

  await page.goto("/explore");
  const outcome = await waitForExploreOutcome(page);
  if (outcome === "ready") {
    await expect(page.locator(".solar-canvas-shell")).toHaveAttribute(
      "data-render-loop",
      "demand",
    );
  } else {
    await expect(
      page.getByRole("button", { name: /try again|tekrar dene/i }),
    ).toBeVisible();
  }
});

for (const route of ["/", "/compare?a=earth&b=mars"] as const) {
  test(`mobile release ${route} has no WCAG A/AA violations`, async ({
    page,
  }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(
      results.violations,
      results.violations
        .map(
          (violation) =>
            `${violation.id}: ${violation.help} (${violation.nodes.length})`,
        )
        .join("\n"),
    ).toEqual([]);
  });
}
