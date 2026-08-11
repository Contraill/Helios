import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const publicRoutes = [
  { path: "/", heading: /Helios/i },
  { path: "/compare?a=earth&b=mars", heading: /Compare/i },
  { path: "/missions", heading: /Spacecraft as evidence/i },
  { path: "/data", heading: /^Data$/i },
  { path: "/about", heading: /quieter way to read the Solar System/i },
  { path: "/case-study", heading: /Building a Solar System/i },
  { path: "/body/earth", heading: /^Earth$/i },
  { path: "/body/moon-jupiter-europa", heading: /^Europa$/i },
  { path: "/region/asteroid-belt", heading: /Asteroid belt/i },
  { path: "/region/heliosphere", heading: /Heliosphere/i },
] as const;

const axeRoutes = [
  "/",
  "/planet/mars",
  "/compare?a=earth&b=mars",
  "/data",
] as const;

function watchRuntime(page: Page) {
  const errors: string[] = [];
  page.on("crash", () => errors.push("page crashed"));
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function expectRuntimeClean(errors: readonly string[]) {
  const actionable = errors.filter(
    (error) =>
      !/^\/(?:127\.0\.0\.1|localhost):\d+\/.*[?&]_rsc=.* due to access control checks\.$/.test(
        error,
      ),
  );
  expect(actionable).toEqual([]);
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

async function readExploreOutcome(
  page: Page,
): Promise<"ready" | "fallback" | "pending"> {
  const html = page.locator("html");
  const shell = page.locator(".solar-canvas-shell");
  const retry = page.getByRole("button", { name: /try again|tekrar dene/i });
  const availability = await shell.getAttribute("data-webgl-availability");
  const context = await shell.getAttribute("data-webgl-context");
  const retryVisible = await retry.isVisible().catch(() => false);

  if (availability === "unavailable" || context === "failed" || retryVisible) {
    return "fallback";
  }

  if (
    (await html.getAttribute("data-explore-scene-ready")) === "true" &&
    availability === "available" &&
    context === "ready" &&
    (await shell.locator("canvas").count()) === 1
  ) {
    return "ready";
  }

  return "pending";
}

async function waitForExploreOutcome(
  page: Page,
): Promise<"ready" | "fallback"> {
  let candidate: "ready" | "fallback" | null = null;
  let candidateSince = 0;

  await expect
    .poll(
      async () => {
        const outcome = await readExploreOutcome(page);
        if (outcome === "pending") {
          candidate = null;
          candidateSince = 0;
          return "pending";
        }

        if (candidate !== outcome) {
          candidate = outcome;
          candidateSince = Date.now();
          return "pending";
        }

        return Date.now() - candidateSince >= 500 ? outcome : "pending";
      },
      { timeout: 60_000 },
    )
    .toMatch(/ready|fallback/);

  const outcome = await readExploreOutcome(page);
  if (outcome === "pending") {
    throw new Error("Explore did not settle into a terminal release state.");
  }
  return outcome;
}

for (const route of publicRoutes) {
  test(`desktop release route ${route.path} renders without overflow or runtime errors`, async ({
    page,
  }) => {
    const runtimeErrors = watchRuntime(page);
    const response = await page.goto(route.path, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status(), route.path).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }).first()).toContainText(
      route.heading,
    );
    await expectNoHorizontalOverflow(page);
    await expectRuntimeClean(runtimeErrors);
  });
}

test("desktop release 404 preserves semantic recovery and starts Signal Breaker", async ({
  page,
}) => {
  const runtimeErrors = watchRuntime(page);
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Page not found|Sayfa bulunamadı/i,
  );

  const game = page.getByTestId("not-found-game");
  const canvas = page.getByTestId("not-found-game-canvas");
  await expect(game).toBeVisible();
  await expect(canvas).toHaveAttribute("data-target-code", "404");
  await expect(canvas).toHaveAttribute("data-bricks-remaining", /\d+/);
  await expect(page.locator('[data-game-phase="idle"]')).toBeVisible();
  await canvas.click({ position: { x: 24, y: 24 } });
  await expect(page.locator('[data-game-phase="playing"]')).toBeVisible();
  await expect(canvas).toHaveAttribute("data-ball-visibility", "visible");
  await expectNoHorizontalOverflow(page);
  await expectRuntimeClean(runtimeErrors);
});

test("desktop release language switch survives reload and preserves the active language", async ({
  page,
}) => {
  const runtimeErrors = watchRuntime(page);
  await page.goto("/");

  const englishGroup = page.getByRole("group", { name: "Language" });
  const turkish = englishGroup.getByRole("button", { name: "TR" });
  await turkish.click();
  await expect(page.locator("html")).toHaveAttribute("lang", "tr-TR");
  await expect(
    page.getByRole("group", { name: "Arayüz dili" }).getByRole("button", {
      name: "TR",
    }),
  ).toHaveAttribute("aria-pressed", "true");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "tr-TR");
  await expect(
    page.getByRole("group", { name: "Arayüz dili" }).getByRole("button", {
      name: "TR",
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await expectRuntimeClean(runtimeErrors);
});

test("desktop release Mars calculation validates input and remains finite", async ({
  page,
}) => {
  await page.goto("/planet/mars");
  const weightInput = page.getByRole("textbox", {
    name: "Earth scale reading",
  });
  await weightInput.fill("70");
  await expect(weightInput).toHaveValue("70");
  await expect(page.getByTestId("planet-weight-result")).toContainText(
    /26[.,]5/,
  );
  await expect(page.getByText(/NaN|Infinity/)).toHaveCount(0);

  await weightInput.fill("1000001");
  await expect(weightInput).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText(/NaN|Infinity/)).toHaveCount(0);
});

test("desktop release comparison keeps URL state, history and validation synchronized", async ({
  page,
}) => {
  await page.goto("/compare?a=earth&b=jupiter");
  await expect(page.getByLabel("First planet")).toHaveValue("earth");
  await expect(page.getByLabel("Second planet")).toHaveValue("jupiter");

  await page.getByLabel("Second planet").selectOption("mars");
  await expect(page).toHaveURL(/b=mars/);
  await page.goBack();
  await expect(page.getByLabel("Second planet")).toHaveValue("jupiter");

  await page.getByLabel("Earth weight").fill("1000001");
  await expect(page.getByLabel("Earth weight")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.getByText(/NaN|Infinity/)).toHaveCount(0);
});

test("desktop release home APOD keeps a sourced fallback record available", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText("Astronomy Picture of the Day", { exact: true }),
  ).toBeVisible();
  await expect(page.locator('[data-status="fallback"]').first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Open the official record/i }).first(),
  ).toHaveAttribute("href", /^https:\/\//);
});

test("desktop release Explore is either fully interactive or exposes its designed WebGL recovery", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const runtimeErrors = watchRuntime(page);
  await page.addInitScript(() => localStorage.clear());
  await page.goto("/explore");
  const outcome = await waitForExploreOutcome(page);

  if (outcome === "ready") {
    await expect(page.locator(".solar-canvas-shell canvas")).toHaveCount(1);
    await page.getByRole("tab", { name: "Navigator" }).click();
    await page.getByRole("button", { name: /Sun & planets/i }).click();
    const earth = page.getByRole("button", { name: "Earth", exact: true });
    await earth.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Earth" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(earth).toBeFocused();
  } else {
    await expect(
      page.getByRole("button", { name: /try again|tekrar dene/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }),
    ).toBeVisible();
  }

  await expectNoHorizontalOverflow(page);
  await expectRuntimeClean(runtimeErrors);
});

test("desktop release reduced motion disables continuous Explore rendering when WebGL is available", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/explore");
  const outcome = await waitForExploreOutcome(page);
  const shell = page.locator(".solar-canvas-shell");

  if (outcome === "ready") {
    await expect(shell).toHaveAttribute("data-render-loop", "demand");
  } else {
    await expect(
      page.getByRole("button", { name: /try again|tekrar dene/i }),
    ).toBeVisible();
  }
});

test("desktop release resolves an initial detached WebGL probe failure through recovery or designed fallback", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/explore");
  const baselineOutcome = await waitForExploreOutcome(page);
  if (baselineOutcome === "fallback") {
    await expect(
      page.getByRole("button", { name: /try again|tekrar dene/i }),
    ).toBeVisible();
    return;
  }

  await page.goto("/");
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    const rejectedProbeCanvases = new WeakSet<HTMLCanvasElement>();
    let initialDetachedProbeRejected = false;

    HTMLCanvasElement.prototype.getContext = function getContext(
      this: HTMLCanvasElement,
      contextId: string,
      options?: unknown,
    ) {
      if (
        !this.isConnected &&
        (contextId === "webgl" || contextId === "webgl2")
      ) {
        if (!initialDetachedProbeRejected) {
          rejectedProbeCanvases.add(this);
          initialDetachedProbeRejected = true;
        }
        if (rejectedProbeCanvases.has(this)) return null;
      }
      return Reflect.apply(originalGetContext, this, [contextId, options]);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });

  await page.goto("/explore?sceneTest=1");
  const shell = page.locator(".solar-canvas-shell");
  await expect(shell).toHaveAttribute(
    "data-webgl-availability",
    "unavailable",
    {
      timeout: 20_000,
    },
  );
  const retry = page.getByRole("button", { name: /try again|tekrar dene/i });
  await expect(retry).toBeVisible();
  await retry.click();
  const retryOutcome = await waitForExploreOutcome(page);
  if (retryOutcome === "fallback") {
    await expect(retry).toBeVisible();
    await expect(shell.locator("canvas")).toHaveCount(0);
    return;
  }

  await expect(shell).toHaveAttribute("data-webgl-availability", "available", {
    timeout: 30_000,
  });
  await expect(shell).toHaveAttribute("data-webgl-context", "ready", {
    timeout: 60_000,
  });
  await expect(shell.locator("canvas")).toHaveCount(1);
});

test("desktop release skip link is the first sequential focus target", async ({
  page,
}) => {
  await page.goto("/");
  const skipLink = page.getByRole("link", {
    name: /Skip to main content|Ana içeriğe geç/i,
  });
  await expect(skipLink).toHaveAttribute("href", "#main-content");

  const firstSequentialTarget = await page.evaluate(() => {
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    const first = candidates.find((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 0 &&
        rect.height > 0 &&
        element.tabIndex >= 0
      );
    });
    return first instanceof HTMLAnchorElement
      ? first.getAttribute("href")
      : null;
  });

  expect(firstSequentialTarget).toBe("#main-content");
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
});

for (const route of axeRoutes) {
  test(`desktop release ${route} has no WCAG A/AA violations`, async ({
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
