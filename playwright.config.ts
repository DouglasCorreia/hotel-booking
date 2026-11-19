import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const localChrome = existsSync(
  "C:/Program Files/Google/Chrome/Application/chrome.exe"
);

export const mockApiServer = {
  command: "npm run api -- --delay 0",
  url: "http://localhost:3333/hotels",
  reuseExistingServer: !process.env.CI,
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  timeout: 60000,
  expect: { timeout: 15000 },
  use: { baseURL: "http://localhost:3000", trace: "retain-on-failure" },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel:
          process.env.PLAYWRIGHT_CHANNEL ??
          (localChrome ? "chrome" : undefined),
      },
    },
  ],
  webServer: [
    mockApiServer,
    {
      command: "npm run dev",
      url: "http://localhost:3000",
      env: { NEXT_PUBLIC_API_URL: "http://localhost:3333" },
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
