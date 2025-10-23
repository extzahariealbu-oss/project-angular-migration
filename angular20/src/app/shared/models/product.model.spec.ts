import { Product, ProductInfo, ProductLang, ProductInventory, ProductAttribute, BundleProduct, SupplierPrice } from './product.model';

describe('Product Model', () => {
  describe('Product interface', () => {
    it('should create a minimal valid product with required SKU', () => {
      const product: Product = {
        info: {
          SKU: 'TEST-SKU-001'
        }
      };
      
      expect(product.info?.SKU).toBe('TEST-SKU-001');
    });
    
    it('should create a complete product with all fields', () => {
      const product: Product = {
        _id: '507f1f77bcf86cd799439011',
        ID: 12345,
        name: 'Test Product',
        isSell: true,
        isBuy: false,
        info: {
          SKU: 'TEST-SKU-001',
          isActive: true,
          productType: '507f191e810c19729de860ea',
          langs: [
            {
              name: 'Test Product Name',
              description: 'Test description',
              shortDescription: 'Short desc'
            }
          ]
        },
        prices: {
          pu_ht: 100.50,
          currency: 'EUR'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      expect(product._id).toBe('507f1f77bcf86cd799439011');
      expect(product.ID).toBe(12345);
      expect(product.name).toBe('Test Product');
      expect(product.info?.SKU).toBe('TEST-SKU-001');
      expect(product.prices?.pu_ht).toBe(100.50);
    });
    
    it('should support boolean flags with expected defaults', () => {
      const product: Product = {
        isSell: true,
        isBuy: false,
        isBundle: false,
        isPackaging: false,
        isVariant: false,
        canBeSold: true,
        canBeExpensed: true,
        info: { SKU: 'TEST' }
      };
      
      expect(product.isSell).toBe(true);
      expect(product.isBuy).toBe(false);
      expect(product.canBeSold).toBe(true);
    });
    
    it('should support inventory subdocument', () => {
      const product: Product = {
        info: { SKU: 'TEST' },
        inventory: {
          minStockLevel: 10,
          maxStockLevel: 100,
          stockTimeLimit: 360,
          langs: [
            { availableLater: 'Available in 3 days' }
          ]
        }
      };
      
      expect(product.inventory?.minStockLevel).toBe(10);
      expect(product.inventory?.maxStockLevel).toBe(100);
      expect(product.inventory?.langs?.[0]?.availableLater).toBe('Available in 3 days');
    });
    
    it('should support product attributes', () => {
      const product: Product = {
        info: { SKU: 'TEST' },
        attributes: [
          {
            attribute: 'color',
            value: 'Red',
            options: ['Red', 'Blue', 'Green']
          },
          {
            attribute: 'size',
            value: 'L',
            options: ['S', 'M', 'L', 'XL']
          }
        ]
      };
      
      expect(product.attributes).toHaveLength(2);
      expect(product.attributes?.[0]?.attribute).toBe('color');
      expect(product.attributes?.[0]?.value).toBe('Red');
    });
    
    it('should support pack/bundle products', () => {
      const product: Product = {
        info: { SKU: 'BUNDLE-001' },
        isBundle: true,
        bundles: [
          { id: 'prod1', qty: 2 },
          { id: 'prod2', qty: 1 }
        ]
      };
      
      expect(product.isBundle).toBe(true);
      expect(product.bundles).toHaveLength(2);
      expect(product.bundles?.[0]?.qty).toBe(2);
    });
    
    it('should support supplier prices', () => {
      const product: Product = {
        info: { SKU: 'TEST' },
        supplierPrices: [
          {
            societe: 'supplier-id-1',
            ref: 'SUP-REF-001',
            prices: {
              pu_ht: 50.00,
              currency: 'EUR'
            },
            minQty: 10,
            replenishmentTime: 7
          }
        ]
      };
      
      expect(product.supplierPrices).toHaveLength(1);
      expect(product.supplierPrices?.[0]?.prices?.pu_ht).toBe(50.00);
      expect(product.supplierPrices?.[0]?.minQty).toBe(10);
    });
    
    it('should support accounting codes', () => {
      const product: Product = {
        info: { SKU: 'TEST' },
        compta_buy: '607000',
        compta_sell: '707000',
        compta_buy_eu: '607001',
        compta_sell_eu: '707001'
      };
      
      expect(product.compta_buy).toBe('607000');
      expect(product.compta_sell).toBe('707000');
    });
    
    it('should support rating and channels', () => {
      const product: Product = {
        info: { SKU: 'TEST' },
        rating: {
          total: 85,
          marketing: 90,
          attributes: 80,
          images: 70,
          categories: 95,
          ecommerce: 100
        },
        channels: {
          active: 3,
          data: [
            {
              channelName: 'Amazon',
              baseUrl: 'https://amazon.com',
              channels: [{ linkId: 'AMZ-123' }]
            }
          ]
        }
      };
      
      expect(product.rating?.total).toBe(85);
      expect(product.channels?.active).toBe(3);
      expect(product.channels?.data?.[0]?.channelName).toBe('Amazon');
    });
    
    it('should support audit fields (createdAt, updatedAt, users)', () => {
      const now = new Date();
      const product: Product = {
        info: { SKU: 'TEST' },
        createdAt: now,
        updatedAt: now,
        createdBy: { username: 'john.doe' },
        editedBy: { username: 'jane.smith' }
      };
      
      expect(product.createdAt).toBe(now);
      expect(product.createdBy?.username).toBe('john.doe');
      expect(product.editedBy?.username).toBe('jane.smith');
    });
  });
  
  describe('ProductInfo interface', () => {
    it('should require SKU field', () => {
      const info: ProductInfo = {
        SKU: 'REQUIRED-SKU'
      };
      
      expect(info.SKU).toBe('REQUIRED-SKU');
    });
    
    it('should support optional fields', () => {
      const info: ProductInfo = {
        SKU: 'TEST',
        productType: 'type-id',
        isActive: true,
        autoBarCode: false,
        UPC: '123456789012',
        ISBN: '978-3-16-148410-0',
        EAN: '1234567890123',
        brand: 'brand-id',
        categories: ['cat1', 'cat2'],
        notePrivate: 'Private note'
      };
      
      expect(info.productType).toBe('type-id');
      expect(info.categories).toEqual(['cat1', 'cat2']);
    });
  });
  
  describe('ProductLang interface', () => {
    it('should support localized content fields', () => {
      const lang: ProductLang = {
        name: 'Product Name',
        description: 'Full description',
        shortDescription: 'Short desc',
        body: 'Product body content',
        meta: {
          title: 'SEO Title',
          description: 'SEO Description'
        },
        linker: 'product-name-seo-url',
        Tag: ['tag1', 'tag2']
      };
      
      expect(lang.name).toBe('Product Name');
      expect(lang.meta?.title).toBe('SEO Title');
      expect(lang.Tag).toEqual(['tag1', 'tag2']);
    });
  });
});
