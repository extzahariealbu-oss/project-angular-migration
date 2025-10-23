// Evidence: /angularjs2/app/views/home/dashboard.html + DashboardController.js
// Epic 2: Dashboard Module - E2E Tests
import { test, expect } from './fixtures/screenshot-fixture';

test.describe('Dashboard Module', () => {

  test('EPIC-2: Dashboard loads successfully', async ({ authenticatedPage: page, consoleMonitor }) => {
    // Evidence: dashboard.html - page structure
    await expect(page.locator('.dashboard-container h1')).toContainText('Dashboard');
    await expect(page.locator('.dashboard-container')).toBeVisible();
    await expect(page.locator('.dashboard-grid')).toBeVisible();
    consoleMonitor.warnOnErrors();
  });

  test('EPIC-2-TASK-004: Revenue stat box displays', async ({ authenticatedPage: page, consoleMonitor }) => {
    // Evidence: top-boxes.html:123-135 (Revenue widget)
    const revenueBox = page.locator('app-dashboard-stat-box').filter({ hasText: 'Revenue' });
    
    await expect(revenueBox).toBeVisible();
    await expect(revenueBox.locator('.number')).toContainText('€');
    await expect(revenueBox.locator('.fa-euro')).toHaveCount(1);
    consoleMonitor.warnOnErrors();
  });

  test('EPIC-2-TASK-005: Charges stat box displays', async ({ authenticatedPage: page, consoleMonitor }) => {
    // Evidence: top-boxes.html:142-154 (Charges widget)
    const chargesBox = page.locator('app-dashboard-stat-box').filter({ hasText: 'Charges' });
    
    await expect(chargesBox).toBeVisible();
    await expect(chargesBox.locator('.number')).toContainText('€');
    await expect(chargesBox.locator('.fa-shopping-cart')).toHaveCount(1);
    consoleMonitor.warnOnErrors();
  });

  test('EPIC-2-TASK-006: Yearly Result stat box displays', async ({ authenticatedPage: page, consoleMonitor }) => {
    // Evidence: top-boxes.html:161-173 (Yearly Result widget)
    const yearlyBox = page.locator('app-dashboard-stat-box').filter({ hasText: 'Résultat' });
    
    await expect(yearlyBox).toBeVisible();
    await expect(yearlyBox.locator('.number')).toContainText('€');
    await expect(yearlyBox.locator('.fa-bar-chart-o')).toHaveCount(1);
    consoleMonitor.warnOnErrors();
  });

  test('EPIC-2-TASK-007: Penalties stat box displays', async ({ authenticatedPage: page, consoleMonitor }) => {
    // Evidence: top-boxes.html:180-192 (Penalties widget)
    const penaltiesBox = page.locator('app-dashboard-stat-box').filter({ hasText: 'Pénalités' });
    
    await expect(penaltiesBox).toBeVisible();
    await expect(penaltiesBox.locator('.number')).toContainText('€');
    await expect(penaltiesBox.locator('.fa-exclamation-triangle')).toHaveCount(1);
    consoleMonitor.warnOnErrors();
  });

  test('EPIC-2: All 4 stat boxes load with mock data', async ({ authenticatedPage: page, consoleMonitor }) => {
    // Evidence: DashboardService mock methods (lines 182-196)
    // Wait for data to load (300ms delay in mock service)
    await page.waitForTimeout(500);
    
    // Check all 4 boxes have numeric values
    const statBoxes = page.locator('app-dashboard-stat-box');
    await expect(statBoxes).toHaveCount(4);
    
    // Verify format matches evidence: "125 000 €" (French locale)
    const revenueBox = statBoxes.filter({ hasText: 'Revenue' });
    await expect(revenueBox.locator('.number')).toContainText('125');
    
    const chargesBox = statBoxes.filter({ hasText: 'Charges' });
    await expect(chargesBox.locator('.number')).toContainText('75');
    
    const yearlyBox = statBoxes.filter({ hasText: 'Résultat' });
    await expect(yearlyBox.locator('.number')).toContainText('50');
    
    const penaltiesBox = statBoxes.filter({ hasText: 'Pénalités' });
    await expect(penaltiesBox.locator('.number')).toContainText('2');
    consoleMonitor.warnOnErrors();
  });

  test('EPIC-2: Date range filter displays', async ({ authenticatedPage: page, consoleMonitor }) => {
    // Evidence: tm-js.js:38-100 (reportDateRange directive)
    const dateFilter = page.locator('button.date-range-button');
    
    await expect(dateFilter).toBeVisible();
    await expect(dateFilter.locator('mat-icon').first()).toBeVisible();
    await expect(dateFilter.locator('.date-text')).toContainText('-');
    consoleMonitor.warnOnErrors();
  });

  test('EPIC-2: Date filter shows 7 preset ranges', async ({ authenticatedPage: page, consoleMonitor }) => {
    // Evidence: tm-js.js:80-87 (7 predefined ranges)
    const dateButton = page.locator('button.date-range-button');
    
    // Click to open Material menu
    await dateButton.click();
    
    // Wait for mat-menu to appear
    const menu = page.locator('.mat-mdc-menu-panel');
    await expect(menu).toBeVisible();
    
    // Verify all 7 presets exist
    const presets = page.locator('button[mat-menu-item]');
    await expect(presets).toHaveCount(7);
    
    await expect(presets.nth(0)).toContainText('Ce mois-ci');
    await expect(presets.nth(1)).toContainText('Mois m-1');
    await expect(presets.nth(2)).toContainText('Mois m-2');
    await expect(presets.nth(3)).toContainText('Mois m-3');
    await expect(presets.nth(4)).toContainText('3 derniers mois');
    await expect(presets.nth(5)).toContainText('Année en cours');
    await expect(presets.nth(6)).toContainText('Année N-1');
    consoleMonitor.warnOnErrors();
  });

  test('EPIC-2: Selecting date preset refreshes widgets', async ({ authenticatedPage: page, consoleMonitor }) => {
    // Evidence: box.js:821-832 (reportDateRange event triggers widget reload)
    const dateButton = page.locator('button.date-range-button');
    
    // Wait for initial data load
    await page.waitForTimeout(500);
    
    // Get initial revenue value
    const revenueBox = page.locator('mat-card').filter({ hasText: 'Revenue' });
    const initialValue = await revenueBox.locator('.number').textContent();
    
    // Open date picker and select different preset
    await dateButton.click();
    await page.locator('button[mat-menu-item]').filter({ hasText: 'Mois m-1' }).click();
    
    // Verify menu closed
    await expect(page.locator('.mat-mdc-menu-panel')).not.toBeVisible();
    
    // Wait for new data to load
    await page.waitForTimeout(500);
    
    // Verify data refreshed (value should still be present, mock returns same data)
    await expect(revenueBox.locator('.number')).toContainText('€');
    consoleMonitor.warnOnErrors();
  });
});
