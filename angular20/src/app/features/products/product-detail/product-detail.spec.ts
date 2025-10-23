import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ProductDetailComponent } from './product-detail';
import { ProductService } from '../services/product.service';
import { Product, ProductStatus } from '../../../shared/models/product.model';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let mockProductService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  const mockProduct: Product = {
    _id: '507f1f77bcf86cd799439011',
    info: {
      isActive: true,
      SKU: 'TEST-001',
      langs: [{ name: 'Test Product' }],
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

  beforeEach(async () => {
    mockProductService = {
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      clone: jest.fn(),
      getProductTypes: jest.fn().mockReturnValue(of([])),
      getProductFamilies: jest.fn().mockReturnValue(of([])),
      getTaxes: jest.fn().mockReturnValue(of([])),
      checkSkuExists: jest.fn().mockReturnValue(of(false))
    };
    mockActivatedRoute = {
      paramMap: of(new Map([['id', '507f1f77bcf86cd799439011']]))
    };

    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: mockProductService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    
    mockRouter = TestBed.inject(Router);
    jest.spyOn(mockRouter, 'navigate');

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load product when id is provided', () => {
      mockProductService.getById.mockReturnValue(of(mockProduct));
      
      fixture.detectChanges();
      
      expect(mockProductService.getById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(component.product()).toEqual(mockProduct);
      expect(component.loading()).toBe(false);
    });

    it('should initialize new product when id is "new"', () => {
      mockActivatedRoute.paramMap = of(new Map([['id', 'new']]));
      
      component.ngOnInit();
      
      expect(component.isEditMode()).toBe(true);
      expect(component.product()?.info?.SKU).toBe('');
    });

    it('should set error state when load fails', () => {
      mockProductService.getById.mockReturnValue(throwError(() => new Error('Load failed')));
      
      fixture.detectChanges();
      
      expect(component.error()).toBe('Failed to load product');
      expect(component.loading()).toBe(false);
    });
  });

  describe('setTab', () => {
    it('should change active tab', () => {
      component.setTab('pricing');
      
      expect(component.activeTab()).toBe('pricing');
    });
  });

  describe('setLanguage', () => {
    it('should change selected language', () => {
      component.setLanguage(1);
      
      expect(component.selectedLanguage()).toBe(1);
    });
  });

  describe('save', () => {
    it('should create product when productId is "new"', () => {
      component.productId = 'new';
      component.product.set({ ...mockProduct, _id: undefined });
      mockProductService.create.mockReturnValue(of({ ...mockProduct, _id: 'new-id' }));
      
      component.save();
      
      expect(mockProductService.create).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products', 'new-id']);
    });

    it('should update product when productId exists', () => {
      component.productId = '507f1f77bcf86cd799439011';
      component.product.set(mockProduct);
      mockProductService.update.mockReturnValue(of(mockProduct));
      
      component.save();
      
      expect(mockProductService.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', mockProduct);
      expect(component.loading()).toBe(false);
    });

    it('should set error when save fails', () => {
      component.productId = '507f1f77bcf86cd799439011';
      component.product.set(mockProduct);
      mockProductService.update.mockReturnValue(throwError(() => new Error('Update failed')));
      
      component.save();
      
      expect(component.error()).toBe('Failed to update product');
      expect(component.loading()).toBe(false);
    });
  });

  describe('clone', () => {
    it('should clone product and navigate to new product', () => {
      component.product.set(mockProduct);
      const clonedProduct = { ...mockProduct, _id: 'cloned-id' };
      mockProductService.clone.mockReturnValue(of(clonedProduct));
      
      component.clone();
      
      expect(mockProductService.clone).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products', 'cloned-id']);
    });

    it('should set error when clone fails', () => {
      component.product.set(mockProduct);
      mockProductService.clone.mockReturnValue(throwError(() => new Error('Clone failed')));
      
      component.clone();
      
      expect(component.error()).toBe('Failed to clone product');
    });
  });

  describe('delete', () => {
    it('should delete product after confirmation', () => {
      component.product.set(mockProduct);
      mockProductService.delete.mockReturnValue(of(void 0));
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      component.delete();
      
      expect(mockProductService.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('should not delete product when confirmation is cancelled', () => {
      component.product.set(mockProduct);
      jest.spyOn(window, 'confirm').mockReturnValue(false);
      
      component.delete();
      
      expect(mockProductService.delete).not.toHaveBeenCalled();
    });

    it('should set error when delete fails', () => {
      component.product.set(mockProduct);
      mockProductService.delete.mockReturnValue(throwError(() => new Error('Delete failed')));
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      component.delete();
      
      expect(component.error()).toBe('Failed to delete product');
    });
  });

  describe('changeStatus', () => {
    it('should update product status and save', () => {
      component.product.set(mockProduct);
      mockProductService.update.mockReturnValue(of({ ...mockProduct, status: 'PUBLISHED' }));
      component.productId = '507f1f77bcf86cd799439011';
      
      component.changeStatus('PUBLISHED');
      
      expect(component.product()?.status).toBe('PUBLISHED');
      expect(mockProductService.update).toHaveBeenCalled();
    });
  });

  describe('getStatusClass', () => {
    it('should return correct class for PUBLISHED status', () => {
      component.product.set({ ...mockProduct, status: 'PUBLISHED' });
      expect(component.getStatusClass()).toBe('ribbon-green');
    });

    it('should return correct class for VALIDATED status', () => {
      component.product.set({ ...mockProduct, status: 'VALIDATED' });
      expect(component.getStatusClass()).toBe('ribbon-blue');
    });

    it('should return correct class for PREPARED status', () => {
      component.product.set({ ...mockProduct, status: 'PREPARED' });
      expect(component.getStatusClass()).toBe('ribbon-yellow');
    });

    it('should return correct class for DRAFT status', () => {
      component.product.set({ ...mockProduct, status: 'DRAFT' });
      expect(component.getStatusClass()).toBe('ribbon-gray');
    });
  });

  describe('goBack', () => {
    it('should navigate to products list', () => {
      component.goBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });
  });
});
