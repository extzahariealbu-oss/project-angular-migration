import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService, ProductQueryParams, ProductListResponse } from './product.service';
import { Product } from '../../../shared/models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const baseUrl = '/erp/api/product';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Core CRUD Operations', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should query products with params', () => {
      const params: ProductQueryParams = {
        limit: 50,
        page: 1,
        search: 'test',
        sort: 'name'
      };
      const mockResponse: ProductListResponse = {
        data: [{ info: { SKU: 'TEST-001' } }],
        total: 1,
        limit: 50,
        page: 1
      };

      service.query(params).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data.length).toBe(1);
      });

      const req = httpMock.expectOne(request => {
        return request.url === baseUrl &&
               request.params.get('limit') === '50' &&
               request.params.get('page') === '1' &&
               request.params.get('search') === 'test' &&
               request.params.get('sort') === 'name';
      });
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should query products without params', () => {
      const mockResponse: ProductListResponse = {
        data: [],
        total: 0,
        limit: 20,
        page: 1
      };

      service.query().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should get product by id', () => {
      const mockProduct: Product = {
        _id: 'prod-123',
        ID: 1,
        name: 'Test Product',
        info: { SKU: 'TEST-001' }
      };

      service.getById('prod-123').subscribe(product => {
        expect(product).toEqual(mockProduct);
        expect(product._id).toBe('prod-123');
      });

      const req = httpMock.expectOne(`${baseUrl}/prod-123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });

    it('should create a new product', () => {
      const newProduct: Product = {
        name: 'New Product',
        info: { SKU: 'NEW-001', isActive: true }
      };
      const createdProduct: Product = {
        ...newProduct,
        _id: 'prod-456',
        ID: 2
      };

      service.create(newProduct).subscribe(product => {
        expect(product._id).toBe('prod-456');
        expect(product.info?.SKU).toBe('NEW-001');
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProduct);
      req.flush(createdProduct);
    });

    it('should update an existing product', () => {
      const updatedProduct: Product = {
        _id: 'prod-123',
        name: 'Updated Product',
        info: { SKU: 'UPD-001' }
      };

      service.update('prod-123', updatedProduct).subscribe(product => {
        expect(product.name).toBe('Updated Product');
      });

      const req = httpMock.expectOne(`${baseUrl}/prod-123`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedProduct);
      req.flush(updatedProduct);
    });

    it('should delete a product', () => {
      service.delete('prod-123').subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/prod-123`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should clone a product', () => {
      const clonedProduct: Product = {
        _id: 'prod-789',
        name: 'Cloned Product',
        info: { SKU: 'CLN-001' }
      };

      service.clone('prod-123').subscribe(product => {
        expect(product._id).toBe('prod-789');
      });

      const req = httpMock.expectOne(`${baseUrl}/prod-123?clone=1`);
      expect(req.request.method).toBe('POST');
      req.flush(clonedProduct);
    });
  });

  describe('SKU and Validation', () => {
    it('should check if SKU exists', () => {
      const mockResponse = { exists: true, product: { info: { SKU: 'EXIST-001' } } };

      service.checkSkuExists('EXIST-001').subscribe(response => {
        expect(response.exists).toBe(true);
        expect(response.product).toBeDefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/EXIST-001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('Lookup/Reference Data', () => {
    it('should get dictionaries', () => {
      const mockDictionaries = [
        { _id: 'dict-1', label: 'VAT 20%' },
        { _id: 'dict-2', label: 'Unit: Piece' }
      ];

      service.getDictionaries(['fk_tva', 'fk_units']).subscribe(dictionaries => {
        expect(dictionaries.length).toBe(2);
        expect(dictionaries[0].label).toBe('VAT 20%');
      });

      const req = httpMock.expectOne(request => {
        return request.url === '/erp/api/dict' &&
               request.params.get('dictName') === 'fk_tva,fk_units';
      });
      expect(req.request.method).toBe('GET');
      req.flush(mockDictionaries);
    });

    it('should get product types', () => {
      const mockTypes = [
        { _id: 'type-1', langs: [{ name: 'Standard Product' }] },
        { _id: 'type-2', langs: [{ name: 'Service' }] }
      ];

      service.getProductTypes().subscribe(types => {
        expect(types.length).toBe(2);
        expect(types[0].langs[0].name).toBe('Standard Product');
      });

      const req = httpMock.expectOne(`${baseUrl}/productTypes`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTypes);
    });

    it('should get product families for selling', () => {
      const mockFamilies = [
        { _id: 'fam-1', langs: [{ name: 'Electronics' }], isCost: false }
      ];

      service.getProductFamilies(false).subscribe(families => {
        expect(families.length).toBe(1);
        expect(families[0].isCost).toBe(false);
      });

      const req = httpMock.expectOne(request => {
        return request.url === `${baseUrl}/family` &&
               request.params.get('isCost') === 'false';
      });
      expect(req.request.method).toBe('GET');
      req.flush(mockFamilies);
    });

    it('should get product families for costing', () => {
      const mockFamilies = [
        { _id: 'fam-2', langs: [{ name: 'Raw Materials' }], isCost: true }
      ];

      service.getProductFamilies(true).subscribe(families => {
        expect(families[0].isCost).toBe(true);
      });

      const req = httpMock.expectOne(request => {
        return request.url === `${baseUrl}/family` &&
               request.params.get('isCost') === 'true';
      });
      req.flush(mockFamilies);
    });

    it('should get product family by id', () => {
      const mockFamily = { _id: 'fam-1', langs: [{ name: 'Electronics' }] };

      service.getProductFamilyById('fam-1').subscribe(family => {
        expect(family._id).toBe('fam-1');
      });

      const req = httpMock.expectOne(`${baseUrl}/family/fam-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFamily);
    });

    it('should search product families with autocomplete', () => {
      const mockFamilies = [
        { _id: 'fam-1', langs: [{ name: 'Electronics' }] }
      ];

      service.searchProductFamilies('Elec', 10, 0).subscribe(families => {
        expect(families.length).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/family`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.query).toBe('Elec');
      expect(req.request.body.take).toBe(10);
      req.flush(mockFamilies);
    });

    it('should get taxes', () => {
      const mockTaxes = [
        { _id: 'tax-1', rate: 20, label: 'VAT 20%' },
        { _id: 'tax-2', rate: 5.5, label: 'VAT 5.5%' }
      ];

      service.getTaxes().subscribe(taxes => {
        expect(taxes.length).toBe(2);
        expect(taxes[0].rate).toBe(20);
      });

      const req = httpMock.expectOne(`${baseUrl}/taxes`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTaxes);
    });

    it('should get price lists', () => {
      const mockPriceLists = [
        { _id: 'pl-1', name: 'Standard Price List' },
        { _id: 'pl-2', name: 'Wholesale Price List' }
      ];

      service.getPriceLists(false).subscribe(lists => {
        expect(lists.length).toBe(2);
      });

      const req = httpMock.expectOne(request => {
        return request.url === `${baseUrl}/prices/priceslist/select` &&
               request.params.get('cost') === 'false';
      });
      req.flush(mockPriceLists);
    });
  });

  describe('Variants', () => {
    it('should get product variants', () => {
      const mockVariants: Product[] = [
        { _id: 'var-1', info: { SKU: 'VAR-001' }, isVariant: true },
        { _id: 'var-2', info: { SKU: 'VAR-002' }, isVariant: true }
      ];

      service.getProductVariants('prod-123').subscribe(variants => {
        expect(variants.length).toBe(2);
        expect(variants[0].isVariant).toBe(true);
      });

      const req = httpMock.expectOne(`${baseUrl}/variants/prod-123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockVariants);
    });
  });

  describe('Bulk Operations', () => {
    it('should refresh all products', () => {
      service.refreshAllProducts().subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/refresh`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });

    it('should generate export URL', () => {
      const url = service.getExportUrl('search=test');
      expect(url).toContain('/erp/api/product/export');
      expect(url).toContain('contentType=product');
      expect(url).toContain('type=xls');
      expect(url).toContain('filter=search%3Dtest');
    });

    it('should generate export URL without filter', () => {
      const url = service.getExportUrl();
      expect(url).toBe('/erp/api/product/export?contentType=product&type=xls');
    });
  });

  describe('Warehouse and Inventory', () => {
    it('should get warehouses', () => {
      const mockWarehouses = [
        { _id: 'wh-1', name: 'Main Warehouse' },
        { _id: 'wh-2', name: 'Secondary Warehouse' }
      ];

      service.getWarehouses().subscribe(warehouses => {
        expect(warehouses.length).toBe(2);
        expect(warehouses[0].name).toBe('Main Warehouse');
      });

      const req = httpMock.expectOne(`${baseUrl}/warehouse/select`);
      expect(req.request.method).toBe('GET');
      req.flush(mockWarehouses);
    });

    it('should get warehouse locations', () => {
      const mockLocations = [
        { _id: 'loc-1', name: 'Aisle A', warehouse: 'wh-1' },
        { _id: 'loc-2', name: 'Aisle B', warehouse: 'wh-1' }
      ];

      service.getWarehouseLocations('wh-1').subscribe(locations => {
        expect(locations.length).toBe(2);
      });

      const req = httpMock.expectOne(request => {
        return request.url === `${baseUrl}/warehouse/location/select` &&
               request.params.get('warehouse') === 'wh-1';
      });
      req.flush(mockLocations);
    });

    it('should get stock inventory', () => {
      const mockInventory = [
        { product: { info: { SKU: 'TEST-001' } }, qty: 100, warehouse: { _id: 'wh-1', name: 'Main' } }
      ];

      service.getStockInventory(50, 1).subscribe(inventory => {
        expect(inventory.length).toBe(1);
        expect(inventory[0].qty).toBe(100);
      });

      const req = httpMock.expectOne(request => {
        return request.url === `${baseUrl}/stockInventory` &&
               request.params.get('limit') === '50' &&
               request.params.get('page') === '1';
      });
      req.flush(mockInventory);
    });

    it('should get scarce products', () => {
      const mockScarceProducts: Product[] = [
        { info: { SKU: 'LOW-STOCK-001' }, inventory: { minStockLevel: 10 } }
      ];

      service.getScarceProducts().subscribe(products => {
        expect(products.length).toBe(1);
      });

      const req = httpMock.expectOne('/erp/api/report/scarceProducts');
      expect(req.request.method).toBe('GET');
      req.flush(mockScarceProducts);
    });

    it('should get incoming stock', () => {
      const mockIncomingStock = [
        { product: 'prod-1', qty: 50, expectedDate: '2025-10-20' }
      ];

      service.getIncomingStock().subscribe(stock => {
        expect(stock.length).toBe(1);
      });

      const req = httpMock.expectOne('/erp/api/report/incomingStock');
      req.flush(mockIncomingStock);
    });
  });

  describe('Image URLs', () => {
    it('should generate thumbnail image URL', () => {
      const url = service.getImageUrl('img-123', 'xs');
      expect(url).toBe('/erp/api/images/bank/xs/img-123');
    });

    it('should generate small image URL by default', () => {
      const url = service.getImageUrl('img-456');
      expect(url).toBe('/erp/api/images/bank/s/img-456');
    });
  });
});
