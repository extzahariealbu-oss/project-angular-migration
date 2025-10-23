/**
 * Smoke Test - Verify Playwright setup
 */
import { test, expect } from './fixtures/screenshot-fixture';

test.describe('Playwright Setup', () => {
  test('should load the application', async ({ page, consoleMonitor }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Angular20App/);
    consoleMonitor.warnOnErrors();
  });

  test('should navigate to login page', async ({ page, consoleMonitor }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    consoleMonitor.warnOnErrors();
  });
  test('check what loads', async ({ page, consoleMonitor }) => {
    page.on('request', req => console.log('→', req.url()));
    page.on('response', res => console.log('←', res.status(), res.url()));
    
    await page.goto('http://localhost:4200');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-screenshot.png' });
    consoleMonitor.warnOnErrors();
  });
  

  test('check for JS errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      console.log(`CONSOLE ${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', err => {
      console.log('❌ PAGE ERROR:', err.message);
      errors.push(err.message);
    });

    await page.goto('http://localhost:4200');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check if Angular bootstrapped
    const hasNg = await page.evaluate(() => {
      return typeof (window as any).ng !== 'undefined';
    });
    console.log('Angular loaded:', hasNg);
    
    // Check if app-root has content
    const appRoot = await page.locator('app-root').innerHTML();
    console.log('app-root content length:', appRoot.length);
    console.log('app-root preview:', appRoot.substring(0, 200));
    
    // Take screenshot
    await page.screenshot({ path: 'after-wait.png', fullPage: true });
    
    console.log('Total errors:', errors.length);
    if (errors.length > 0) {
      console.log('Errors:', errors);
    }
  });
  test('root path works', async ({ page, consoleMonitor }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('if JS is loaded this appears!')).toBeVisible();
    consoleMonitor.warnOnErrors();
  });

  test('login path should also work', async ({ page, consoleMonitor }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('if JS is loaded this appears!')).toBeVisible();
    consoleMonitor.warnOnErrors();
  });

});
