import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ProductBundlesTabComponent } from './product-bundles-tab.component';
import { ProductService } from '../services/product.service';

describe('ProductBundlesTabComponent', () => {
  let component: ProductBundlesTabComponent;
  let fixture: ComponentFixture<ProductBundlesTabComponent>;
  let mockProductService: jasmine.SpyObj<ProductService>;

  const mockProduct = {
    _id: 'prod1',
    bundles: [
      {
        id: {
          _id: 'item1',
          info: {
            SKU: 'SKU-001',
            langs: [{ name: 'Test Product' }]
          },
          directCost: 10.5
        },
        qty: 2
      }
    ],
    directCost: 21
  };

  beforeEach(async () => {
    mockProductService = jasmine.createSpyObj('ProductService', ['searchProducts']);
    mockProductService.searchProducts.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        ProductBundlesTabComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ProductService, useValue: mockProductService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductBundlesTabComponent);
    component = fixture.componentInstance;
    component.product = { ...mockProduct };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load bundle items from product', () => {
    expect(component.dataSource.length).toBe(1);
    expect(component.dataSource[0].id.info.SKU).toBe('SKU-001');
  });

  it('should calculate bundle total correctly', () => {
    const bundle = component.dataSource[0];
    expect(component.getBundleTotal(bundle)).toBe(21);
  });

  it('should calculate total cost correctly', () => {
    expect(component.getTotalCost()).toBe(21);
  });

  it('should add new bundle item', () => {
    const newProduct = {
      _id: 'item2',
      ref: 'SKU-002',
      name: 'New Product',
      price: { costPrice: 15 }
    };

    component.selectedProduct = newProduct;
    component.qtyControl.setValue(3);
    component.addBundle();

    expect(component.product.bundles.length).toBe(2);
    expect(component.product.bundles[1].id.info.SKU).toBe('SKU-002');
    expect(component.product.bundles[1].qty).toBe(3);
  });

  it('should delete bundle item', () => {
    component.deleteBundle(0);

    expect(component.product.bundles.length).toBe(0);
    expect(component.dataSource.length).toBe(0);
  });

  it('should update quantity', () => {
    component.updateQty(0, 5);

    expect(component.product.bundles[0].qty).toBe(5);
    expect(component.product.directCost).toBe(52.5);
  });

  it('should emit save event on add', () => {
    spyOn(component.save, 'emit');

    const newProduct = {
      _id: 'item2',
      ref: 'SKU-002',
      name: 'New Product',
      price: { costPrice: 15 }
    };

    component.selectedProduct = newProduct;
    component.qtyControl.setValue(1);
    component.addBundle();

    expect(component.save.emit).toHaveBeenCalled();
  });

  it('should emit save event on delete', () => {
    spyOn(component.save, 'emit');

    component.deleteBundle(0);

    expect(component.save.emit).toHaveBeenCalled();
  });

  it('should emit save event on quantity update', () => {
    spyOn(component.save, 'emit');

    component.updateQty(0, 3);

    expect(component.save.emit).toHaveBeenCalled();
  });

  it('should search products on input', (done) => {
    const mockResults = [
      { _id: 'p1', ref: 'SKU-001', name: 'Product 1' },
      { _id: 'p2', ref: 'SKU-002', name: 'Product 2' }
    ];

    mockProductService.searchProducts.and.returnValue(of(mockResults));

    component.productSearchControl.setValue('SKU');

    component.filteredProducts$.subscribe(results => {
      expect(results.length).toBe(2);
      expect(mockProductService.searchProducts).toHaveBeenCalledWith('SKU');
      done();
    });
  });
});
