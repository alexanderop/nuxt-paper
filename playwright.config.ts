import type { ConfigOptions } from "@nuxt/test-utils/playwright";
import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:5678";

export default defineConfig<ConfigOptions>({
  testDir: "./test/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  webServer: {
    // Serve the prebuilt `pnpm generate` output (static site, no Nitro runtime).
    command: "pnpm start:e2e:webserver",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
    // `host` puts @nuxt/test-utils in external-server mode: no build, no Nitro.
    nuxt: { host: baseURL },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
