import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductPricingFormComponent } from './product-pricing-form';
import { ProductService } from '../services/product.service';
import { Product } from '../../../shared/models/product.model';

describe('ProductPricingFormComponent', () => {
  let component: ProductPricingFormComponent;
  let fixture: ComponentFixture<ProductPricingFormComponent>;
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
      pu_ht: 100.00,
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
      getPriceLists: jest.fn(),
      getTaxes: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProductPricingFormComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductPricingFormComponent);
    component = fixture.componentInstance;
    component.product = mockProduct;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load price lists on init', () => {
      const mockPriceLists = [
        { id: 1, name: 'Standard' },
        { id: 2, name: 'Wholesale' }
      ];
      mockProductService.getPriceLists.mockReturnValue(of(mockPriceLists));
      mockProductService.getTaxes.mockReturnValue(of([]));

      component.ngOnInit();

      expect(mockProductService.getPriceLists).toHaveBeenCalled();
      expect(component.priceLists()).toEqual(mockPriceLists);
    });

    it('should load taxes on init', () => {
      const mockTaxes = [
        { id: 1, rate: 20, name: 'VAT 20%' },
        { id: 2, rate: 10, name: 'VAT 10%' }
      ];
      mockProductService.getPriceLists.mockReturnValue(of([]));
      mockProductService.getTaxes.mockReturnValue(of(mockTaxes));

      component.ngOnInit();

      expect(mockProductService.getTaxes).toHaveBeenCalled();
      expect(component.taxes()).toEqual(mockTaxes);
    });
  });

  describe('calculatePriceWithTax', () => {
    it('should calculate price including tax correctly', () => {
      component.product.prices = {
        pu_ht: 100,
        pricesQty: {},
        tva_tx: 20
      };

      const priceWithTax = component.calculatePriceWithTax();

      expect(priceWithTax).toBe(120);
    });

    it('should return price without tax when tax rate is 0', () => {
      component.product.prices = {
        pu_ht: 100,
        pricesQty: {},
        tva_tx: 0
      };

      const priceWithTax = component.calculatePriceWithTax();

      expect(priceWithTax).toBe(100);
    });

    it('should return 0 when prices object is missing', () => {
      component.product.prices = undefined as any;

      const priceWithTax = component.calculatePriceWithTax();

      expect(priceWithTax).toBe(0);
    });

    it('should handle null price values', () => {
      component.product.prices = {
        pu_ht: undefined as any,
        pricesQty: {},
        tva_tx: undefined as any
      };

      const priceWithTax = component.calculatePriceWithTax();

      expect(priceWithTax).toBe(0);
    });

    it('should calculate correctly with 10% tax', () => {
      component.product.prices = {
        pu_ht: 50,
        pricesQty: {},
        tva_tx: 10
      };

      const priceWithTax = component.calculatePriceWithTax();

      expect(priceWithTax).toBeCloseTo(55, 2);
    });

    it('should calculate correctly with decimal prices', () => {
      component.product.prices = {
        pu_ht: 99.99,
        pricesQty: {},
        tva_tx: 20
      };

      const priceWithTax = component.calculatePriceWithTax();

      expect(priceWithTax).toBeCloseTo(119.988, 2);
    });
  });
});
