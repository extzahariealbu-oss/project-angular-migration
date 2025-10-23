import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCategoriesTabComponent } from './product-categories-tab.component';
import { ProductService } from '../services/product.service';
import { of, throwError } from 'rxjs';
import { Product } from '../../../shared/models/product.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ProductCategoriesTabComponent', () => {
  let component: ProductCategoriesTabComponent;
  let fixture: ComponentFixture<ProductCategoriesTabComponent>;
  let productService: jest.Mocked<ProductService>;

  const mockCategories = [
    {
      _id: 'cat1',
      langs: [{ name: 'Category 1', linker: 'category-1', description: 'Description 1' }],
      nodes: [
        {
          _id: 'cat1a',
          langs: [{ name: 'Category 1A', linker: 'category-1a' }],
          nodes: [],
          productsCount: 5
        }
      ],
      productsCount: 10
    },
    {
      _id: 'cat2',
      langs: [{ name: 'Category 2', linker: 'category-2' }],
      nodes: [],
      productsCount: 3
    }
  ];

  const mockProduct: Product = {
    _id: 'prod1',
    info: {
      categories: ['cat1']
    }
  } as Product;

  beforeEach(async () => {
    const productServiceMock = {
      getCategories: jest.fn().mockReturnValue(of(mockCategories)),
      update: jest.fn().mockReturnValue(of(mockProduct))
    };

    await TestBed.configureTestingModule({
      imports: [ProductCategoriesTabComponent, NoopAnimationsModule],
      providers: [
        { provide: ProductService, useValue: productServiceMock }
      ]
    }).compileComponents();

    productService = TestBed.inject(ProductService) as jest.Mocked<ProductService>;
    fixture = TestBed.createComponent(ProductCategoriesTabComponent);
    component = fixture.componentInstance;
    component.product = mockProduct;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    fixture.detectChanges();
    expect(productService.getCategories).toHaveBeenCalled();
    expect(component.categories).toEqual(mockCategories);
    expect(component.dataSource.data).toEqual(mockCategories);
  });

  it('should handle category load error', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    productService.getCategories.mockReturnValue(throwError(() => new Error('Load error')));
    
    fixture.detectChanges();
    
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load categories', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should check if category is selected', () => {
    expect(component.isSelected('cat1')).toBe(true);
    expect(component.isSelected('cat2')).toBe(false);
  });

  it('should toggle category selection', () => {
    component.toggleCategory('cat2');
    expect(component.product.info.categories).toContain('cat2');
    expect(productService.update).toHaveBeenCalledWith('prod1', mockProduct);
  });

  it('should remove category when toggled off', () => {
    component.toggleCategory('cat1');
    expect(component.product.info.categories).not.toContain('cat1');
    expect(productService.update).toHaveBeenCalled();
  });

  it('should initialize categories array if missing', () => {
    component.product = { _id: 'prod2', info: {} } as Product;
    component.toggleCategory('cat1');
    expect(component.product.info.categories).toEqual(['cat1']);
  });

  it('should expand all nodes', () => {
    fixture.detectChanges();
    const expandSpy = jest.spyOn(component.treeControl, 'expand');
    component.expandAll();
    expect(expandSpy).toHaveBeenCalled();
  });

  it('should collapse all nodes', () => {
    fixture.detectChanges();
    const collapseSpy = jest.spyOn(component.treeControl, 'collapseAll');
    component.collapseAll();
    expect(collapseSpy).toHaveBeenCalled();
  });

  it('should refresh categories', () => {
    fixture.detectChanges();
    productService.getCategories.mockClear();
    component.refresh();
    expect(productService.getCategories).toHaveBeenCalled();
  });

  it('should identify nodes with children', () => {
    expect(component.hasChild(0, mockCategories[0])).toBe(true);
    expect(component.hasChild(0, mockCategories[1])).toBe(false);
  });

  it('should handle save error', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    productService.update.mockReturnValue(throwError(() => new Error('Save error')));
    
    component.toggleCategory('cat2');
    
    expect(consoleSpy).toHaveBeenCalledWith('Failed to update product categories', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
