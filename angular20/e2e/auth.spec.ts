/**
 * E2E Tests: Authentication Flow
 * Evidence: .knowledge/testing/epic-1-e2e-scenarios.md (Scenarios 1.1-1.5)
 * Source: .knowledge/analysis/epic-1-evidence.md:16-49
 */
import { test, expect } from './fixtures/screenshot-fixture';



test.describe('Authentication Flow', () => {
  // test('full debug info', async ({ page }) => {
  //   // Capture everything
  //   page.on('console', msg => console.log(`[${msg.type()}]`, msg.text()));
  //   page.on('pageerror', err => console.log('❌ ERROR:', err));
  //   page.on('request', req => console.log('→', req.method(), req.url()));
  //   page.on('response', async res => {
  //     const status = res.status();
  //     const icon = status >= 400 ? '❌' : '✓';
  //     console.log(`${icon} ${status}`, res.url());
      
  //     if (status === 401) {
  //       console.log('\n🔍 401 DETAILS:');
  //       console.log('  URL:', res.url());
  //       try {
  //         const body = await res.text();
  //         console.log('  Response:', body);
  //       } catch {}
  //     }
  //   });

  //   await page.goto('/');
  //   await page.waitForLoadState('networkidle');
  //   await page.waitForTimeout(2000);
    
  //   // Get full page state
  //   const url = page.url();
  //   const title = await page.title();
  //   const bodyText = await page.locator('body').textContent();
    
  //   console.log('\n📊 FINAL STATE:');
  //   console.log('URL:', url);
  //   console.log('Title:', title);
  //   console.log('Has login form:', bodyText?.includes('User') || bodyText?.includes('Password'));
    
  //   await page.screenshot({ path: 'debug.png', fullPage: true });
  // });
  
  // test('check for JS errors', async ({ page }) => {
  //   const errors: string[] = [];
    
  //   page.on('console', msg => {
  //     console.log(`CONSOLE ${msg.type()}: ${msg.text()}`);
  //   });
    
  //   page.on('pageerror', err => {
  //     console.log('❌ PAGE ERROR:', err.message);
  //     errors.push(err.message);
  //   });

  //   await page.goto('http://localhost:4200');
  //   await page.waitForLoadState('networkidle');
  //   await page.waitForTimeout(3000);
    
  //   // Check if Angular bootstrapped
  //   const hasNg = await page.evaluate(() => {
  //     return typeof (window as any).ng !== 'undefined';
  //   });
  //   console.log('Angular loaded:', hasNg);
    
  //   // Check if app-root has content
  //   const appRoot = await page.locator('app-root').innerHTML();
  //   console.log('app-root content length:', appRoot.length);
  //   console.log('app-root preview:', appRoot.substring(0, 200));
    
  //   // Take screenshot
  //   await page.screenshot({ path: 'after-wait.png', fullPage: true });
    
  //   console.log('Total errors:', errors.length);
  //   if (errors.length > 0) {
  //     console.log('Errors:', errors);
  //   }
  // });

  // Scenario 1.1: Successful Authentication
  test('should login successfully with valid credentials', async ({ page, consoleMonitor }) => {
    // Given: User is on login page
    await page.goto('/login');
    
    // This ensures the Angular app is loaded and ready for interaction.
    await page.waitForLoadState('networkidle');
    
    // When: User enters valid credentials
    await page.fill('mat-form-field input[name="username"]', 'admin');
    await page.fill('mat-form-field input[name="password"]', 'admin');
    await page.click('button[mat-raised-button]');
    
    // Use waitForURL to handle potential delays in client-side navigation
    await page.waitForURL('/dashboard');
    
    // Wait for the user info to load
    await page.waitForSelector('.user-name', { timeout: 10000 });
    
    // And: Header displays user's first name
    await expect(page.locator('.user-name')).toBeVisible();
    consoleMonitor.warnOnErrors();
  });

  // Scenario 1.2: Invalid Credentials
  test('should show error with invalid password', async ({ page, consoleMonitor }) => {
    // Given: User is on login page
    await page.goto('/login');
    
    // When: User enters invalid password
    await page.fill('mat-form-field input[name="username"]', 'admin');
    await page.fill('mat-form-field input[name="password"]', 'wrongpassword');
    await page.click('button[mat-raised-button]');
    
    // Then: Error message is displayed
    await expect(page.locator('.error-message')).toBeVisible();
    
    // And: User remains on login page
    await expect(page).toHaveURL('/login');
    consoleMonitor.warnOnErrors();
  });

  // Scenario 1.3: Unknown User
  test('should show error with non-existent username', async ({ page, consoleMonitor }) => {
    // Given: User is on login page
    await page.goto('/login');
    
    // When: User enters non-existent username
    await page.fill('mat-form-field input[name="username"]', 'nonexistent');
    await page.fill('mat-form-field input[name="password"]', 'password123');
    await page.click('button[mat-raised-button]');
    
    // Then: Error message is displayed
    await expect(page.locator('.error-message')).toBeVisible();
    
    // And: User remains on login page
    await expect(page).toHaveURL('/login');
    consoleMonitor.warnOnErrors();
  });

  // Scenario 1.4: Client-side Validation (Empty Fields)
  test('should prevent submission with empty fields', async ({ page, consoleMonitor }) => {
    // Given: User is on login page
    await page.goto('/login');
    
    // When: User submits form without entering credentials
    await page.click('button[mat-raised-button]');
    
    // Then: Form validation prevents submission
    const usernameInput = page.locator('mat-form-field input[name="username"]');
    const passwordInput = page.locator('mat-form-field input[name="password"]');
    
    // Check HTML5 validation state
    await expect(usernameInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');
    
    // And: User remains on login page
    await expect(page).toHaveURL('/login');
    consoleMonitor.warnOnErrors();
  });

  // Scenario 1.5: Logout Flow
  test('should logout successfully and redirect to login', async ({ page, consoleMonitor }) => {
    // Given: User is logged in
    await page.goto('/login');
    await page.fill('mat-form-field input[name="username"]', 'admin');
    await page.fill('mat-form-field input[name="password"]', 'admin');
    await page.click('button[mat-raised-button]');
    await expect(page).toHaveURL('/dashboard');
    
    // When: User clicks logout button
    await page.click('button:has-text("Logout")');
    
    // Then: User is redirected to login page
    await expect(page).toHaveURL('/login');
    
    // And: Attempting to navigate to protected routes redirects to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
    consoleMonitor.warnOnErrors();
  });
});
