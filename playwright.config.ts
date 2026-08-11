import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const useServerlessChromium =
  process.env.PLAYWRIGHT_CHROMIUM_FLAVOR === "serverless";
const useExternalServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER === "1";

const chromiumArgs = useServerlessChromium
  ? [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--ignore-gpu-blocklist",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--headless=shell",
    ]
  : [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--use-angle=swiftshader",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
    ];

const desktopReleaseSpec = "**/browser-release.spec.ts";
const mobileReleaseSpec = "**/mobile-browser-release.spec.ts";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  // Helios renders the High visual contract through WebGL. Running two full
  // scene probes concurrently can starve software GPU implementations and make
  // otherwise-completed clicks or animation frames time out.
  workers: 1,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }]]
    : [["list"]],
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    {
      name: "chromium",
      testIgnore: [desktopReleaseSpec, mobileReleaseSpec],
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: executablePath
          ? { executablePath, args: chromiumArgs }
          : undefined,
      },
    },
    {
      name: "chrome-release",
      testMatch: desktopReleaseSpec,
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
      },
    },
    {
      name: "firefox-release",
      testMatch: desktopReleaseSpec,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit-release",
      testMatch: desktopReleaseSpec,
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "edge-release",
      testMatch: desktopReleaseSpec,
      use: {
        ...devices["Desktop Edge"],
        channel: "msedge",
      },
    },
    {
      name: "android-chrome-release",
      testMatch: mobileReleaseSpec,
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "ios-safari-release",
      testMatch: mobileReleaseSpec,
      use: { ...devices["iPhone 12"] },
    },
  ],
  webServer: useExternalServer
    ? undefined
    : {
        command: "pnpm build && pnpm exec next start -H 127.0.0.1 -p 3000",
        url: baseURL,
        timeout: 240_000,
        reuseExistingServer: !process.env.CI,
      },
});
