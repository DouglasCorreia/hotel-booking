import { defineConfig } from "@playwright/test";
import baseConfig, { mockApiServer } from "./playwright.config";

const baseURL = "http://localhost:3100";

export default defineConfig({
  ...baseConfig,
  testDir: "./tests/pwa",
  use: { ...baseConfig.use, baseURL },
  webServer: [
    mockApiServer,
    {
      command: "npm run build && npm run start -- --port 3100",
      env: { NEXT_PUBLIC_API_URL: "http://localhost:3333" },
      url: baseURL,
      timeout: 240000,
    },
  ],
});
