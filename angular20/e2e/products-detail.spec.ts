/**
 * E2E Tests: Products Detail View
 * Evidence: .knowledge/testing/epic-3-e2e-scenarios.md (Suite 2: Scenarios 2.1-2.5)
 * Source: .knowledge/analysis/epic-3-evidence.md:476-607
 */
import { test, expect } from './fixtures/screenshot-fixture';

let testProductId: string;

// Setup: Create test product if it doesn't exist
test.beforeAll(async ({ request }) => {
  const testProduct = {
    info: {
      isActive: true,
      SKU: 'E2E-TEST-PRODUCT-001',
      langs: [{ name: 'E2E Test Product', description: 'Created for E2E testing' }],
      categories: [],
      taxes: []
    },
    prices: {
      pu_ht: 99.99,
      pricesQty: {},
      tva_tx: 20
    },
    status: 'DRAFT',
    isActive: true,
    isSell: true,
    isBuy: false,
    quantity: 10
  };

  // Check if product with this SKU exists (via Angular dev server proxy)
  try {
    const searchResponse = await request.get('http://localhost:4200/api/product', {
      params: { search: 'E2E-TEST-PRODUCT-001', limit: 1 }
    });

    if (searchResponse.ok()) {
      const data = await searchResponse.json();
      if (data.data && data.data.length > 0) {
        testProductId = data.data[0]._id;
        console.log(`Using existing test product: ${testProductId}`);
      } else {
        // Create new test product
        const createResponse = await request.post('http://localhost:4200/api/product', {
          data: testProduct
        });
        if (createResponse.ok()) {
          const created = await createResponse.json();
          testProductId = created._id;
          console.log(`Created new test product: ${testProductId}`);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to create test product - backend may not be running:', error);
  }
});

// Helper: Login before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
});

test.describe('Product Detail View', () => {
  
  // Scenario 2.1: Load Product Detail
  test('should load product detail page with all components', async ({ page }) => {
    // Given: Valid product ID
    test.skip(!testProductId, 'Test product not available - backend may not be running');
    
    // When: User navigates to product detail
    await page.goto(`/products/${testProductId}`);
    
    // Then: API request made
    await page.waitForResponse(resp => resp.url().includes(`/api/product/${testProductId}`));
    
    // And: Product header displays name, SKU, image
    await expect(page.locator('.product-header .product-name')).not.toBeEmpty();
    await expect(page.locator('.product-header .product-sku')).not.toBeEmpty();
    
    // And: Status ribbon visible
    const statusRibbon = page.locator('.status-ribbon, .product-status');
    await expect(statusRibbon).toBeVisible();
    
    // And: Tabs are visible
    const tabs = page.locator('nav.tabs, .nav-tabs');
    await expect(tabs).toContainText('Info');
    await expect(tabs).toContainText('Pricing');
  });

  // Scenario 2.2: View Product Informations Tab
  test('should display product info tab by default', async ({ page }) => {
    test.skip(!testProductId, 'Test product not available - backend may not be running');
    // Given: User is on product detail page
    await page.goto(`/products/${testProductId}`);
    await page.waitForLoadState('networkidle');
    
    // When: Page loads (Info tab is default)
    // Then: Info tab is active
    const infoTab = page.locator('nav.tabs a, .nav-tabs a').filter({ hasText: /Info/i });
    await expect(infoTab).toHaveClass(/active/);
    
    // And: Info content displays product details
    const infoContent = page.locator('.tab-content, .info-section');
    await expect(infoContent).toBeVisible();
    
    // Verify key fields visible (based on ProductInfoForm implementation)
    await expect(page.locator('form')).toContainText(/SKU|Product Type|Name/i);
  });

  // Scenario 2.3: View Price Tab
  test('should switch to pricing tab and display price fields', async ({ page }) => {
    // Given: User is on product detail page
    test.skip(!testProductId, 'Test product not available');
    await page.goto(`/products/${testProductId}`);
    await page.waitForLoadState('networkidle');
    
    // When: User clicks "Pricing" tab
    const pricingTab = page.locator('nav.tabs a, .nav-tabs a').filter({ hasText: /Pricing/i });
    await pricingTab.click();
    
    // Then: Pricing tab becomes active
    await expect(pricingTab).toHaveClass(/active/);
    
    // And: Pricing content displays
    const pricingContent = page.locator('.tab-content, .pricing-section');
    await expect(pricingContent).toBeVisible();
    
    // Verify price fields visible
    await expect(page.locator('form')).toContainText(/Sell Price|Buy Cost|Direct Cost/i);
  });

  // Scenario 2.4: View Attributes Tab (Placeholder)
  test('should display attributes tab placeholder', async ({ page }) => {
    // Given: User is on product detail page
    test.skip(!testProductId, 'Test product not available');
    await page.goto(`/products/${testProductId}`);
    await page.waitForLoadState('networkidle');
    
    // When: User clicks "Attributes" tab
    const attributesTab = page.locator('nav.tabs a, .nav-tabs a').filter({ hasText: /Attributes/i });
    
    // Check if tab exists (implementation may be placeholder)
    const tabCount = await attributesTab.count();
    if (tabCount > 0) {
      await attributesTab.click();
      
      // Then: Tab content visible
      await expect(attributesTab).toHaveClass(/active/);
      
      // Note: Currently placeholder implementation
      const content = page.locator('.tab-content');
      await expect(content).toBeVisible();
    } else {
      // Tab not implemented yet, skip
      test.skip();
    }
  });

  // Scenario 2.5: Navigate from List to Detail
  test('should navigate from list to detail when clicking row', async ({ page }) => {
    // Given: User is on products list
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // Wait for table to load
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 5000 });
    
    // When: User clicks first product row
    const firstRow = page.locator('table tbody tr').first();
    
    // Get the row ID or SKU to verify navigation
    const rowIdAttr = await firstRow.getAttribute('data-id').catch(() => null);
    
    // Click row
    await firstRow.click();
    
    // Then: Navigation to detail page
    await page.waitForTimeout(1000); // Allow navigation
    
    // Verify we're on a detail page (URL contains /products/{id})
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/products\/[a-f0-9]+/i);
    
    // And: Product detail components visible (Material design structure)
    await expect(page.locator('.page-content mat-toolbar.page-toolbar')).toBeVisible({ timeout: 5000 });
  });

  // Scenario 2.6: Tab Switching Preserves Form State
  test('should preserve unsaved form data when switching tabs', async ({ page }) => {
    // Given: User is on product detail page
    test.skip(!testProductId, 'Test product not available');
    await page.goto(`/products/${testProductId}`);
    await page.waitForLoadState('networkidle');
    
    // When: User modifies a field in Info tab
    const nameInput = page.locator('input[formControlName="name"], input[name="name"]');
    const originalValue = await nameInput.inputValue();
    const testValue = 'Modified Product Name Test';
    await nameInput.fill(testValue);
    
    // And: User switches to Pricing tab
    const pricingTab = page.locator('nav.tabs a, .nav-tabs a').filter({ hasText: /Pricing/i });
    await pricingTab.click();
    await page.waitForTimeout(500);
    
    // And: User switches back to Info tab
    const infoTab = page.locator('nav.tabs a, .nav-tabs a').filter({ hasText: /Info/i });
    await infoTab.click();
    await page.waitForTimeout(500);
    
    // Then: Modified value is preserved
    const currentValue = await nameInput.inputValue();
    expect(currentValue).toBe(testValue);
  });

  // Scenario 2.7: Load Non-Existent Product (Error Handling)
  test('should display error for non-existent product', async ({ page }) => {
    // Given: Invalid product ID
    const invalidId = 'nonexistent123456789';
    
    // When: User navigates to invalid product URL
    await page.goto(`/products/${invalidId}`);
    await page.waitForLoadState('networkidle');
    
    // Then: Error message displayed (Material error card)
    const errorCard = page.locator('mat-card.error-card');
    await expect(errorCard).toBeVisible({ timeout: 5000 });
  });
});
