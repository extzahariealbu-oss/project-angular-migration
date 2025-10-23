import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Evidence: .knowledge/testing/epic-1-e2e-scenarios.md, epic-2-e2e-scenarios.md
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Sequential to avoid session conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to prevent auth conflicts
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  // use: {
  //   baseURL: 'http://localhost:4200',
  //   trace: 'on-first-retry',
  //   screenshot: 'only-on-failure',
  //   video: 'retain-on-failure',
  // },
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on', // Always capture trace
    screenshot: 'on',
    video: 'on',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // webServer: {
  //   command: 'ng serve --host 0.0.0.0 --proxy-config proxy.conf.json --poll=2000',
  //   url: 'http://localhost:4200',
  //   reuseExistingServer: true, // ← This allows using an already-running server
  //   timeout: 120000,
  // },
  /* Run dev server before tests 
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },*/
});
