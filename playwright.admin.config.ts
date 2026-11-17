import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/admin-e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-admin-report" }]],
  use: { baseURL: "http://127.0.0.1:3310", ...devices["Desktop Chrome"], trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: { command: "node scripts/admin-fixture.mjs", url: "http://127.0.0.1:3310/acceso", timeout: 240_000, reuseExistingServer: false },
});
