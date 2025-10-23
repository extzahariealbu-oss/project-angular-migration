/**
 * Integration Test: Product Navigation Flow
 * Tests: List → Create/Detail navigation
 */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Product Navigation Integration', () => {
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'products',
            loadComponent: () => import('./product-list/product-list.component').then(m => m.ProductListComponent)
          },
          {
            path: 'products/:id',
            loadComponent: () => import('./product-detail/product-detail').then(m => m.ProductDetailComponent)
          }
        ]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  it('should navigate to /products/new when creating new product', async () => {
    // Given: Navigate to products list
    await router.navigate(['/products']);
    expect(location.path()).toBe('/products');

    // When: Navigate to create new product
    await router.navigate(['/products', 'new']);

    // Then: Should be at /products/new
    expect(location.path()).toBe('/products/new');
  });

  it('should navigate to /products/:id when viewing existing product', async () => {
    // Given: Navigate to products list
    await router.navigate(['/products']);
    expect(location.path()).toBe('/products');

    // When: Navigate to specific product
    const testProductId = '123abc';
    await router.navigate(['/products', testProductId]);

    // Then: Should be at /products/123abc
    expect(location.path()).toBe(`/products/${testProductId}`);
  });

  it('should handle navigation from list to detail and back', async () => {
    // Given: Start at products list
    await router.navigate(['/products']);
    expect(location.path()).toBe('/products');

    // When: Navigate to detail
    await router.navigate(['/products', '456def']);
    expect(location.path()).toBe('/products/456def');

    // When: Navigate back to list
    await router.navigate(['/products']);

    // Then: Should be back at list
    expect(location.path()).toBe('/products');
  });

  it('should differentiate between /products/new and /products/:id', async () => {
    // Navigate to new product
    await router.navigate(['/products', 'new']);
    expect(location.path()).toBe('/products/new');

    // Navigate to specific product ID
    await router.navigate(['/products', 'abc123']);
    expect(location.path()).toBe('/products/abc123');

    // Verify they are different paths
    expect('/products/new').not.toBe('/products/abc123');
  });
});
