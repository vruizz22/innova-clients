import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright smoke config for apps/web. Visual drift vs the Design System
 * (SuperProfes-Design-System/preview/*). See docs/SMOKE_TESTING.md.
 *
 * Run (Victor): pnpm --filter @innova/web exec playwright test --config tests/playwright.config.ts
 * The dev server (next dev -p 3005) must be running, or set PW_WEB_SERVER=1 to let
 * Playwright start it.
 */
const PORT = 3005;
const baseURL = process.env.PW_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './smoke',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.05, animations: 'disabled' } },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
  ...(process.env.PW_WEB_SERVER
    ? {
        webServer: {
          command: 'pnpm dev',
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }
    : {}),
});
