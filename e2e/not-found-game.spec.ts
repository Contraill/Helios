import { expect, test } from "@playwright/test";

const missingRoute = "/this-route-does-not-exist";

async function setSyntheticVisibility(
  page: import("@playwright/test").Page,
  state: "hidden" | "visible",
) {
  await page.evaluate((nextState) => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => nextState,
    });
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => nextState === "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  }, state);
}

async function startEmbeddedGame(page: import("@playwright/test").Page) {
  const canvas = page.getByTestId("not-found-game-canvas");
  await canvas.click({ position: { x: 24, y: 24 } });
  await expect(page.locator('[data-game-phase="playing"]')).toBeVisible();
  return canvas;
}

test.describe("404 Signal Breaker", () => {
  test.use({
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("keeps the Breakout game embedded and starts only after a click", async ({
    page,
  }) => {
    await page.goto(missingRoute);

    const game = page.getByTestId("not-found-game");
    const canvas = page.getByTestId("not-found-game-canvas");
    const homeLink = page.getByTestId("not-found-home-link");
    const hud = page.getByTestId("not-found-hud");
    await expect(game).toBeVisible();
    await expect(homeLink).toBeVisible();
    await expect(hud).toBeHidden();
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute("data-ball-visibility", "hidden");
    await expect(canvas).toHaveAttribute(
      "aria-label",
      /click the playfield|oyun alanına dokun/i,
    );
    await expect(page.locator('[data-game-phase="idle"]')).toBeVisible();
    await expect(game.getByRole("button")).toHaveCount(0);
    await expect(page.locator('[data-game-target="404"]')).toBeVisible();
    await expect(canvas).toHaveAttribute("data-target-code", "404");
    const targetSegments = await canvas.getAttribute("data-target-segments");
    expect(targetSegments).toMatch(/\d+/);
    await expect(canvas).toHaveAttribute(
      "data-bricks-remaining",
      targetSegments ?? "0",
    );
    await expect(game).toContainText("404");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`${missingRoute}$`));

    const header = page.locator(".site-header");
    const shell = page.locator('[class*="canvasShell"]').first();
    const headerBox = await header.boundingBox();
    const shellBox = await shell.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(shellBox).not.toBeNull();
    if (headerBox && shellBox) {
      expect(shellBox.y).toBeGreaterThanOrEqual(
        headerBox.y + headerBox.height - 1,
      );
    }
    const idleHomeBox = await homeLink.boundingBox();
    expect(idleHomeBox).not.toBeNull();
    if (idleHomeBox) {
      expect(
        Math.abs(idleHomeBox.x + idleHomeBox.width * 0.5 - 390 * 0.5),
      ).toBeLessThan(3);
      expect(idleHomeBox.y).toBeGreaterThan(390);
    }
    const documentOverflow = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      viewport: window.innerHeight,
    }));
    expect(documentOverflow.height).toBeLessThanOrEqual(
      documentOverflow.viewport + 1,
    );

    const bodyBefore = await page.evaluate(() => ({
      overflow: document.body.style.overflow,
      position: document.body.style.position,
    }));
    await page.waitForTimeout(500);
    await expect(page.locator('[data-game-phase="idle"]')).toBeVisible();

    await canvas.click({ position: { x: 24, y: 24 } });
    await expect(page.locator('[data-game-phase="playing"]')).toBeVisible();
    await expect(homeLink).toBeVisible();
    await expect(hud).toBeVisible();
    const playingHomeBox = await homeLink.boundingBox();
    expect(playingHomeBox).not.toBeNull();
    if (playingHomeBox) expect(playingHomeBox.x).toBeLessThan(40);
    await expect(canvas).toHaveAttribute("data-ball-visibility", "visible");
    await expect(canvas).toBeFocused();
    await expect(canvas).toHaveAttribute("role", "application");
    await expect(canvas).toHaveAttribute(
      "aria-roledescription",
      /breakout game|breakout oyunu/i,
    );
    await expect(canvas).toHaveAttribute(
      "aria-keyshortcuts",
      "ArrowLeft ArrowRight A D P Escape Space Enter",
    );
    await expect
      .poll(async () => Number(await canvas.getAttribute("data-pixel-ratio")))
      .toBeLessThanOrEqual(1.25);
    await expect(canvas).toHaveAttribute("data-render-tier", "economy");
    await expect(canvas).toHaveAttribute("data-reduced-motion", "false");
    await expect(canvas).toHaveAttribute("data-combo", "0");
    await expect(canvas).toHaveAttribute("data-debris-count", "0");
    await expect(canvas).toHaveAttribute("data-impact-count", "0");
    await expect(canvas).toHaveAttribute("data-loss-feedback", "idle");
    await expect(canvas).toHaveAttribute("data-intro", /active|idle/);
    await expect(canvas).toHaveAttribute("data-control-lock", /locked|ready/);
    await expect(canvas).toHaveAttribute("data-ball-speed", /\d+/);
    await expect(canvas).toHaveAttribute("data-active-balls", "1");
    await expect(canvas).toHaveAttribute("data-active-bonuses", "0");
    await expect(canvas).toHaveAttribute("data-bonus-queued", "none");
    await expect(canvas).toHaveAttribute("data-last-bonus", "none");
    await expect(canvas).toHaveAttribute("data-bricks-since-bonus", "0");
    await expect(canvas).toHaveAttribute("data-bonus-cooldown", /\d+\.\d{2}/);
    await expect(canvas).toHaveAttribute("data-minimum-speed", /\d+/);
    await expect(canvas).toHaveAttribute("data-maximum-speed", /\d+/);
    await expect(canvas).toHaveAttribute("data-pointer-control", "idle");
    await expect(canvas).toHaveAttribute("data-win-feedback", "idle");
    await expect(page.getByTestId("not-found-remaining")).toHaveText(
      targetSegments ?? "0",
    );
    await expect(page.getByTestId("not-found-remaining")).not.toHaveAttribute(
      "aria-live",
      "polite",
    );
    await expect(page.getByTestId("not-found-balls")).toHaveText("1");
    await expect(page.getByTestId("not-found-lives")).toHaveCount(0);
    await expect(page.getByTestId("not-found-level")).toHaveCount(0);
    await expect(canvas).toHaveAttribute("data-hit-feedback", /active|idle/);
    await expect(page).toHaveURL(new RegExp(`${missingRoute}$`));
    await expect(page.getByRole("dialog")).toHaveCount(0);

    const bodyAfter = await page.evaluate(() => ({
      overflow: document.body.style.overflow,
      position: document.body.style.position,
    }));
    expect(bodyAfter).toEqual(bodyBefore);
  });

  test("honors reduced motion without disabling the playable game", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(missingRoute);

    const canvas = page.getByTestId("not-found-game-canvas");
    await expect(canvas).toHaveAttribute("data-reduced-motion", "true");
    await startEmbeddedGame(page);
    await expect(page.locator('[data-game-phase="playing"]')).toBeVisible();
    await expect(canvas).toHaveAttribute("data-reduced-motion", "true");
  });

  test("moves the paddle with pointer and keyboard controls", async ({
    page,
  }) => {
    await page.goto(missingRoute);
    const canvas = await startEmbeddedGame(page);

    const initial = Number(await canvas.getAttribute("data-paddle-x"));
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;
    await page.mouse.move(box.x + box.width * 0.82, box.y + box.height * 0.74);
    await expect
      .poll(async () => Number(await canvas.getAttribute("data-paddle-x")))
      .toBeGreaterThan(initial);

    const moved = Number(await canvas.getAttribute("data-paddle-x"));
    await canvas.focus();
    await page.keyboard.down("ArrowLeft");
    await page.waitForTimeout(220);
    await page.keyboard.up("ArrowLeft");
    await expect
      .poll(async () => Number(await canvas.getAttribute("data-paddle-x")))
      .toBeLessThan(moved);
  });

  test("pauses, resumes and keeps the mobile layout inside the viewport", async ({
    page,
  }) => {
    await page.goto(missingRoute);
    const canvas = await startEmbeddedGame(page);

    await canvas.focus();
    await page.keyboard.press("p");
    await expect(page.locator('[data-game-phase="paused"]')).toBeVisible();
    const resume = page
      .getByRole("button", { name: /resume|devam et/i })
      .first();
    await expect(resume).toBeFocused();
    const score = await page.getByTestId("not-found-score").textContent();
    await page.waitForTimeout(350);
    await expect(page.getByTestId("not-found-score")).toHaveText(score ?? "0");
    await resume.click();
    await expect(page.locator('[data-game-phase="playing"]')).toBeVisible();

    await page.setViewportSize({ width: 844, height: 390 });
    await expect
      .poll(async () => Number(await canvas.getAttribute("data-logical-width")))
      .toBeGreaterThan(600);
    await expect
      .poll(async () => Number(await canvas.getAttribute("data-logical-width")))
      .toBeLessThanOrEqual(844);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    const shell = page.locator('[class*="canvasShell"]').first();
    const shellBox = await shell.boundingBox();
    expect(shellBox).not.toBeNull();
    if (shellBox) {
      expect(shellBox.width).toBeLessThanOrEqual(844);
      expect(shellBox.height).toBeGreaterThanOrEqual(220);
      expect(shellBox.height).toBeLessThanOrEqual(390);
    }
  });

  test("pauses on visibility interruption and restores focus to Resume", async ({
    page,
  }) => {
    await page.goto(missingRoute);
    await startEmbeddedGame(page);

    await setSyntheticVisibility(page, "hidden");
    await expect(page.locator('[data-game-phase="paused"]')).toBeVisible();
    await expect(
      page.locator('[data-overlay="paused"][data-pause-source="interruption"]'),
    ).toBeVisible();

    await setSyntheticVisibility(page, "visible");
    const resume = page.getByRole("button", { name: /resume|devam et/i });
    await expect(resume).toBeFocused();

    await resume.click();
    await expect(page.locator('[data-game-phase="playing"]')).toBeVisible();
    await expect(page.getByTestId("not-found-game-canvas")).toBeFocused();
  });

  test("pauses on pagehide without silently resuming the run", async ({
    page,
  }) => {
    await page.goto(missingRoute);
    await startEmbeddedGame(page);

    await page.evaluate(() =>
      window.dispatchEvent(new PageTransitionEvent("pagehide")),
    );
    await expect(page.locator('[data-game-phase="paused"]')).toBeVisible();
    await expect(
      page.locator('[data-overlay="paused"][data-pause-source="interruption"]'),
    ).toBeVisible();

    await page.evaluate(() =>
      window.dispatchEvent(new PageTransitionEvent("pageshow")),
    );
    await expect(page.locator('[data-game-phase="paused"]')).toBeVisible();
  });

  test("clears touch control when the pointer ends outside the canvas", async ({
    page,
  }) => {
    await page.goto(missingRoute);
    const canvas = await startEmbeddedGame(page);
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    await canvas.dispatchEvent("pointerdown", {
      button: 0,
      clientX: box.x + box.width * 0.5,
      clientY: box.y + box.height * 0.8,
      isPrimary: true,
      pointerId: 71,
      pointerType: "touch",
    });
    await expect(canvas).toHaveAttribute("data-pointer-control", "dragging");

    await page.evaluate(() => {
      window.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          isPrimary: true,
          pointerId: 71,
          pointerType: "touch",
        }),
      );
    });
    await expect(canvas).toHaveAttribute("data-pointer-control", "idle");
  });

  test("keeps one stable run through rapid pause and resume interactions", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto(missingRoute);
    await startEmbeddedGame(page);

    const canvas = page.getByTestId("not-found-game-canvas");

    for (let cycle = 0; cycle < 3; cycle += 1) {
      await canvas.focus();
      await page.keyboard.press("p");
      await expect(page.locator('[data-game-phase="paused"]')).toBeVisible();
      await page
        .getByRole("button", { name: /resume|devam et/i })
        .first()
        .click();
      await expect(page.locator('[data-game-phase="playing"]')).toBeVisible();
    }

    await expect(canvas).toHaveAttribute("data-ball-visibility", "visible");
    await expect(canvas).toBeFocused();
    await expect(page.locator('[data-overlay="paused"]')).toHaveCount(0);
    await expect(page.locator('[data-overlay="won"]')).toHaveCount(0);
    await expect(page.locator('[data-overlay="game-over"]')).toHaveCount(0);
    await page.waitForTimeout(250);
    expect(pageErrors).toEqual([]);
  });

  test("cleans animation and input work when leaving the embedded game", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto(missingRoute);
    await startEmbeddedGame(page);
    await page.getByRole("link", { name: /home|ana sayfa/i }).click();

    await expect(page).toHaveURL(/\/$/);
    await page.waitForTimeout(200);
    expect(pageErrors).toEqual([]);
  });

  test("sanitizes persisted score data", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("helios-404-breakout-best-score", "999999999999");
    });
    await page.goto(missingRoute);
    await expect(page.getByTestId("not-found-best-score")).toHaveText("999999");
  });
});
