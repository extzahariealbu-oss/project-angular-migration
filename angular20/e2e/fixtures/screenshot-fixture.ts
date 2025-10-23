import { test as base, expect } from '@playwright/test';
import { ConsoleMonitor } from '../utils/console-monitor';
import * as path from 'path';

type ScreenshotFixtures = {
  authenticatedPage: any;
  consoleMonitor: ConsoleMonitor;
  autoScreenshot: void;
};

export const test = base.extend<ScreenshotFixtures>({
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
  
  autoScreenshot: async ({ page }, use, testInfo) => {
    const screenshotDir = path.join(testInfo.project.outputDir, '..', 'screenshots');
    const testName = testInfo.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Capture BEFORE screenshot
    const beforePath = path.join(screenshotDir, `${testName}-before-${timestamp}.png`);
    await page.screenshot({ 
      path: beforePath, 
      fullPage: true 
    });
    console.log(`📸 BEFORE screenshot saved: ${beforePath}`);
    
    await use();
    
    // Capture AFTER screenshot
    const afterPath = path.join(screenshotDir, `${testName}-after-${timestamp}.png`);
    await page.screenshot({ 
      path: afterPath, 
      fullPage: true 
    });
    console.log(`📸 AFTER screenshot saved: ${afterPath}`);
    
    // On failure, also capture a failure screenshot
    if (testInfo.status !== testInfo.expectedStatus) {
      const failurePath = path.join(screenshotDir, `${testName}-FAILURE-${timestamp}.png`);
      await page.screenshot({ 
        path: failurePath, 
        fullPage: true 
      });
      console.log(`❌ FAILURE screenshot saved: ${failurePath}`);
    }
  },
});

export { expect };
