import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProductInfoFormComponent } from './product-info-form';
import { ProductService } from '../services/product.service';
import { Product } from '../../../shared/models/product.model';

describe('ProductInfoFormComponent', () => {
  let component: ProductInfoFormComponent;
  let fixture: ComponentFixture<ProductInfoFormComponent>;
  let mockProductService: any;

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
      getProductTypes: jest.fn(),
      getProductFamilies: jest.fn(),
      checkSkuExists: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProductInfoFormComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductInfoFormComponent);
    component = fixture.componentInstance;
    component.product = mockProduct;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load product types on init', () => {
      const mockTypes = [
        { id: 1, name: 'Physical' },
        { id: 2, name: 'Service' }
      ];
      mockProductService.getProductTypes.mockReturnValue(of(mockTypes));
      mockProductService.getProductFamilies.mockReturnValue(of([]));

      component.ngOnInit();

      expect(mockProductService.getProductTypes).toHaveBeenCalled();
      expect(component.productTypes()).toEqual(mockTypes);
    });

    it('should load product families on init', () => {
      const mockFamilies = [
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Furniture' }
      ];
      mockProductService.getProductTypes.mockReturnValue(of([]));
      mockProductService.getProductFamilies.mockReturnValue(of(mockFamilies));

      component.ngOnInit();

      expect(mockProductService.getProductFamilies).toHaveBeenCalled();
      expect(component.productFamilies()).toEqual(mockFamilies);
    });
  });

  describe('onSkuChange', () => {
    it('should validate SKU uniqueness when SKU is entered', () => {
      mockProductService.checkSkuExists.mockReturnValue(of(false));
      component.product.info!.SKU = 'NEW-SKU-001';

      component.onSkuChange();

      expect(mockProductService.checkSkuExists).toHaveBeenCalledWith('NEW-SKU-001', '507f1f77bcf86cd799439011');
      expect(component.skuChecking()).toBe(false);
      expect(component.skuValid()).toBe(true);
    });

    it('should set skuValid to false when SKU already exists', () => {
      mockProductService.checkSkuExists.mockReturnValue(of(true));
      component.product.info!.SKU = 'EXISTING-SKU';

      component.onSkuChange();

      expect(component.skuValid()).toBe(false);
    });

    it('should set skuValid to true when SKU is empty', () => {
      component.product.info!.SKU = '';

      component.onSkuChange();

      expect(mockProductService.checkSkuExists).not.toHaveBeenCalled();
      expect(component.skuValid()).toBe(true);
    });

    it('should handle error during SKU validation gracefully', () => {
      mockProductService.checkSkuExists.mockReturnValue(throwError(() => new Error('API Error')));
      component.product.info!.SKU = 'TEST-SKU';

      component.onSkuChange();

      expect(component.skuChecking()).toBe(false);
    });

    it('should pass productId to checkSkuExists for existing products', () => {
      mockProductService.checkSkuExists.mockReturnValue(of(false));
      component.product._id = '507f1f77bcf86cd799439011';
      component.product.info!.SKU = 'SKU-001';

      component.onSkuChange();

      expect(mockProductService.checkSkuExists).toHaveBeenCalledWith('SKU-001', '507f1f77bcf86cd799439011');
    });

    it('should pass undefined productId for new products', () => {
      mockProductService.checkSkuExists.mockReturnValue(of(false));
      component.product._id = undefined;
      component.product.info!.SKU = 'NEW-SKU';

      component.onSkuChange();

      expect(mockProductService.checkSkuExists).toHaveBeenCalledWith('NEW-SKU', undefined);
    });
  });
});
