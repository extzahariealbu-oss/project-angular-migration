/**
 * Playwright Auth Fixtures
 * Provides authenticated browser context for tests
 */
import { test as base, expect } from '@playwright/test';
import { ConsoleMonitor } from '../utils/console-monitor';

type AuthFixtures = {
  authenticatedPage: any;
  consoleMonitor: ConsoleMonitor;
};

export const test = base.extend<AuthFixtures>({
  consoleMonitor: async ({ page }, use) => {
    const monitor = new ConsoleMonitor(page);
    monitor.startMonitoring();
    
    await use(monitor);
    
    // After each test, check for errors and clear
    if (monitor.hasErrors()) {
      monitor.printErrors();
    }
    
    monitor.clear();
  },
  
  authenticatedPage: async ({ page }, use) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 1000 });
    
    await use(page);
  },
});

export { expect };
