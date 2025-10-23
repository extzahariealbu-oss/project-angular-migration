import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../services/product.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Product } from '../../../shared/models/product.model';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let mockProductService: jest.Mocked<ProductService>;
  let mockRouter: jest.Mocked<Router>;

  const mockProducts: Product[] = [
    {
      _id: 'prod-1',
      ID: 1,
      name: 'Product 1',
      info: { SKU: 'SKU-001', isActive: true },
      prices: { pu_ht: 100 },
      directCost: 50,
      weight: 2.5,
      updatedAt: new Date('2025-10-01'),
      rating: { total: 85 },
      Status: { css: 'SELL', name: 'For Sale' }
    },
    {
      _id: 'prod-2',
      ID: 2,
      name: 'Product 2',
      info: { SKU: 'SKU-002', isActive: false },
      prices: { pu_ht: 200 },
      directCost: 100,
      weight: 5.0,
      updatedAt: new Date('2025-10-15'),
      rating: { total: 65 },
      Status: { css: 'DRAFT', name: 'Draft' }
    }
  ];

  const mockFamilies = [
    { _id: 'fam-1', langs: [{ name: 'Electronics' }] },
    { _id: 'fam-2', langs: [{ name: 'Clothing' }] }
  ];

  beforeEach(async () => {
    mockProductService = {
      query: jest.fn(),
      getProductFamilies: jest.fn(),
      refreshAllProducts: jest.fn(),
      getExportUrl: jest.fn(),
      getImageUrl: jest.fn()
    } as any;
    
    mockRouter = {
      navigate: jest.fn()
    } as any;

    (mockProductService.query as jest.Mock).mockReturnValue(of({
      data: mockProducts,
      total: 2,
      limit: 50,
      page: 1
    }));
    (mockProductService.getProductFamilies as jest.Mock).mockReturnValue(of(mockFamilies));
    (mockProductService.refreshAllProducts as jest.Mock).mockReturnValue(of(undefined));
    (mockProductService.getExportUrl as jest.Mock).mockReturnValue('/erp/api/product/export?contentType=product&type=xls');
    (mockProductService.getImageUrl as jest.Mock).mockReturnValue('/erp/api/images/bank/xs/img-123');

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load products and families on init', () => {
      fixture.detectChanges();
      
      expect(mockProductService.query).toHaveBeenCalled();
      expect(mockProductService.getProductFamilies).toHaveBeenCalledWith(false);
      expect(component.products().length).toBe(2);
      expect(component.sellFamilies().length).toBe(2);
    });

    it('should initialize with default values', () => {
      expect(component.page()).toBe(1);
      expect(component.limit()).toBe(50);
      expect(component.filters.quickSearch).toBe('');
      expect(component.sort.field).toBe('updatedAt');
      expect(component.sort.direction).toBe('desc');
    });
  });

  describe('Search and Filtering', () => {
    it('should debounce quick search', fakeAsync(() => {
      fixture.detectChanges();
      jest.clearAllMocks();

      component.filters.quickSearch = 'test';
      component.onQuickSearchChange();
      
      expect(mockProductService.query).not.toHaveBeenCalled();
      
      tick(500);
      
      expect(mockProductService.query).toHaveBeenCalled();
    }));

    it('should trigger search on filter change', () => {
      fixture.detectChanges();
      jest.clearAllMocks();

      component.filters.sellFamily = 'fam-1';
      component.onFilterChange();

      expect(mockProductService.query).toHaveBeenCalled();
      expect(component.page()).toBe(1);
    });

    it('should build filter object correctly', () => {
      component.filters.sellFamily = 'fam-1';
      component.filters.status = 'SELL';
      component.filters.isActive = true;
      component.filters.isSell.yes = true;

      const filter = component['buildFilter']();

      expect(filter.sellFamily).toBe('fam-1');
      expect(filter.Status).toBe('SELL');
      expect(filter.isActive).toBe(true);
      expect(filter.isSell).toEqual([true]);
    });

    it('should handle isBuy filter with yes and no', () => {
      component.filters.isBuy.yes = true;
      component.filters.isBuy.no = true;

      const filter = component['buildFilter']();

      expect(filter.isBuy).toEqual([true, false]);
    });

    it('should return undefined filter when no filters applied', () => {
      const filter = component['buildFilter']();
      expect(filter).toBeUndefined();
    });

    it('should reset filters', () => {
      fixture.detectChanges();
      component.filters.quickSearch = 'test';
      component.filters.sellFamily = 'fam-1';
      component.page.set(3);

      component.resetFilter();

      expect(component.filters.quickSearch).toBe('');
      expect(component.filters.sellFamily).toBeNull();
      expect(component.page()).toBe(1);
      expect(mockProductService.query).toHaveBeenCalled();
    });
  });

  describe('Sorting', () => {
    it('should sort by field ascending', () => {
      fixture.detectChanges();
      jest.clearAllMocks();

      component.sortBy('data.info.SKU');

      expect(component.sort.field).toBe('data.info.SKU');
      expect(component.sort.direction).toBe('asc');
      expect(mockProductService.query).toHaveBeenCalled();
    });

    it('should toggle sort direction on same field', () => {
      component.sort.field = 'data.info.SKU';
      component.sort.direction = 'asc';

      component.sortBy('data.info.SKU');

      expect(component.sort.direction).toBe('desc');
    });

    it('should reset to ascending when sorting different field', () => {
      component.sort.field = 'data.info.SKU';
      component.sort.direction = 'desc';

      component.sortBy('data.prices.pu_ht');

      expect(component.sort.field).toBe('data.prices.pu_ht');
      expect(component.sort.direction).toBe('asc');
    });
  });

  describe('Pagination', () => {
    it('should change page', () => {
      fixture.detectChanges();
      jest.clearAllMocks();

      component.onPageChange(2);

      expect(component.page()).toBe(2);
      expect(mockProductService.query).toHaveBeenCalled();
    });

    it('should calculate total pages correctly', () => {
      component.total.set(100);
      component.limit.set(50);

      expect(component.getTotalPages()).toBe(2);
    });

    it('should handle partial last page', () => {
      component.total.set(125);
      component.limit.set(50);

      expect(component.getTotalPages()).toBe(3);
    });
  });

  describe('Product Selection', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should toggle single product selection', () => {
      component.toggleProductSelection('prod-1');
      expect(component.isSelected('prod-1')).toBe(true);

      component.toggleProductSelection('prod-1');
      expect(component.isSelected('prod-1')).toBe(false);
    });

    it('should select all products', () => {
      component.toggleAllRows();

      expect(component.selection.selected.length).toBe(2);
      expect(component.isAllSelected()).toBe(true);
    });

    it('should deselect all products', () => {
      component.toggleAllRows();
      expect(component.isAllSelected()).toBe(true);

      component.toggleAllRows();
      expect(component.selection.selected.length).toBe(0);
      expect(component.isAllSelected()).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should navigate to product detail', () => {
      component.navigateToDetail('prod-1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products', 'prod-1']);
    });

    it('should navigate to create product', () => {
      component.createProduct();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products', 'new']);
    });
  });

  describe('Toolbar Actions', () => {
    it('should print list', () => {
      window.print = jest.fn();
      component.printList();
      expect(window.print).toHaveBeenCalled();
    });

    it('should refresh all products', () => {
      fixture.detectChanges();
      component.refreshAllProducts();

      expect(mockProductService.refreshAllProducts).toHaveBeenCalled();
      expect(mockProductService.query).toHaveBeenCalled();
    });

    it('should handle refresh error', () => {
      (mockProductService.refreshAllProducts as jest.Mock).mockReturnValue(throwError(() => new Error('Refresh failed')));
      jest.spyOn(console, 'error').mockImplementation();

      component.refreshAllProducts();

      expect(console.error).toHaveBeenCalledWith('Error refreshing products:', expect.any(Error));
    });

    it('should export to excel', () => {
      delete (window as any).location;
      (window as any).location = { href: '' };
      
      component.filters.quickSearch = 'test';
      (mockProductService.getExportUrl as jest.Mock).mockReturnValue('/erp/api/product/export?filter=test');

      component.exportToExcel();

      expect(mockProductService.getExportUrl).toHaveBeenCalledWith('test');
    });
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get product image URL', () => {
      const product: Product = {
        imageSrc: { imageSrc: 'img-123' },
        info: { SKU: 'TEST' }
      };

      const url = component.getProductImageUrl(product);
      expect(mockProductService.getImageUrl).toHaveBeenCalledWith('img-123', 'xs');
    });

    it('should return placeholder when no image', () => {
      const product: Product = { info: { SKU: 'TEST' } };

      const url = component.getProductImageUrl(product);
      expect(url).toContain('data:image/svg+xml');
    });

    it('should get product type name', () => {
      const product: Product = {
        info: { SKU: 'TEST' },
        ProductTypes: { langs: [{ name: 'Standard Product' }] }
      };

      expect(component.getProductTypeName(product)).toBe('Standard Product');
    });

    it('should return dash when no product type', () => {
      const product: Product = { info: { SKU: 'TEST' } };
      expect(component.getProductTypeName(product)).toBe('-');
    });

    it('should get product name from langs', () => {
      const product: Product = {
        info: {
          SKU: 'TEST',
          langs: [{ name: 'Localized Product Name' }]
        }
      };

      expect(component.getProductName(product)).toBe('Localized Product Name');
    });

    it('should fallback to product.name', () => {
      const product: Product = {
        name: 'Product Name',
        info: { SKU: 'TEST' }
      };

      expect(component.getProductName(product)).toBe('Product Name');
    });

    it('should get status label', () => {
      const product: Product = {
        info: { SKU: 'TEST' },
        Status: { css: 'SELL', name: 'For Sale' }
      };

      const status = component.getStatusLabel(product);
      expect(status.css).toBe('SELL');
      expect(status.name).toBe('For Sale');
    });

    it('should get family name', () => {
      const product: Product = {
        info: { SKU: 'TEST' },
        ProductFamily: { langs: [{ name: 'Electronics' }] }
      };

      expect(component.getFamilyName(product)).toBe('Electronics');
    });

    it('should get rating width', () => {
      const product: Product = {
        info: { SKU: 'TEST' },
        rating: { total: 75 }
      };

      expect(component.getRatingWidth(product)).toBe('75%');
    });

    it('should return 0% when no rating', () => {
      const product: Product = { info: { SKU: 'TEST' } };
      expect(component.getRatingWidth(product)).toBe('0%');
    });
  });

  describe('Error Handling', () => {
    it('should handle query error', () => {
      (mockProductService.query as jest.Mock).mockReturnValue(throwError(() => new Error('Query failed')));
      jest.spyOn(console, 'error').mockImplementation();

      fixture.detectChanges();

      expect(console.error).toHaveBeenCalledWith('Error loading products:', expect.any(Error));
      expect(component.loading()).toBe(false);
    });

    it('should handle families load error', () => {
      (mockProductService.getProductFamilies as jest.Mock).mockReturnValue(throwError(() => new Error('Load failed')));
      jest.spyOn(console, 'error').mockImplementation();

      component.loadSellFamilies();

      expect(console.error).toHaveBeenCalledWith('Error loading families:', expect.any(Error));
    });
  });
});
