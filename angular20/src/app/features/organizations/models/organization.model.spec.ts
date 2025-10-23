// Evidence: .knowledge/analysis/epic-4-evidence.md Section 3 (MongoDB Schema)
// Following Epic 3 testing pattern from product.model.spec.ts

import { 
  Organization, 
  Address, 
  SalesPurchases, 
  CompanyInfo, 
  OrganizationStatus,
  StatusInfo,
  Iban,
  Phone,
  Social,
  StrategicNote,
  InternalNote,
  OrganizationFormData
} from './organization.model';

describe('Organization Models', () => {
  describe('Organization interface', () => {
    it('should create a minimal valid organization with required name', () => {
      const org: Organization = {
        name: 'Test Company'
      };
      
      expect(org.name).toBe('Test Company');
    });
    
    it('should create a complete organization with all fields', () => {
      const org: Organization = {
        _id: '55ba0301d79a3a343900000d',
        name: 'Acme Corporation',
        fullName: 'Acme Corporation Ltd',
        entity: 'entity-id-1',
        Status: OrganizationStatus.ST_CFID,
        salesPurchases: {
          isCustomer: true,
          isProspect: false,
          isSupplier: false,
          isSubcontractor: false,
          salesPerson: 'emp-id-1',
          ref: 'CUST-001',
          isActive: true,
          VATIsUsed: true
        },
        companyInfo: {
          idprof1: '123456789',
          idprof3: '12345678901234',
          capital: 50000,
          brand: 'Acme Brand'
        },
        phones: {
          phone: '+33 1 23 45 67 89',
          mobile: '+33 6 12 34 56 78',
          fax: '+33 1 23 45 67 90'
        },
        emails: [{ email: 'contact@acme.com' }],
        url: 'https://www.acme.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      expect(org._id).toBe('55ba0301d79a3a343900000d');
      expect(org.name).toBe('Acme Corporation');
      expect(org.Status).toBe(OrganizationStatus.ST_CFID);
      expect(org.salesPurchases?.isCustomer).toBe(true);
      expect(org.companyInfo?.idprof3).toBe('12345678901234');
    });
    
    it('should support person-type organization', () => {
      const person: Organization = {
        name: 'Doe',
        firstname: 'John',
        Title: 'MR',
        fullName: 'John Doe',
        phones: {
          mobile: '+33 6 12 34 56 78'
        },
        emails: [{ email: 'john.doe@example.com' }]
      };
      
      expect(person.firstname).toBe('John');
      expect(person.Title).toBe('MR');
      expect(person.fullName).toBe('John Doe');
    });
    
    it('should support boolean flags with expected defaults', () => {
      const org: Organization = {
        name: 'Test',
        salesPurchases: {
          isGeneric: false,
          isProspect: true,
          isCustomer: false,
          isSupplier: false,
          isSubcontractor: false,
          isActive: true,
          VATIsUsed: true
        }
      };
      
      expect(org.salesPurchases?.isProspect).toBe(true);
      expect(org.salesPurchases?.isActive).toBe(true);
      expect(org.salesPurchases?.VATIsUsed).toBe(true);
    });
    
    it('should support all organization statuses', () => {
      const statuses: OrganizationStatus[] = [
        OrganizationStatus.ST_NEVER,
        OrganizationStatus.ST_PFROI,
        OrganizationStatus.ST_PCHAU,
        OrganizationStatus.ST_NEW,
        OrganizationStatus.ST_CFID,
        OrganizationStatus.ST_CVIP,
        OrganizationStatus.ST_LOOSE,
        OrganizationStatus.ST_NO
      ];
      
      expect(statuses).toHaveLength(8);
      expect(OrganizationStatus.ST_NEVER).toBe('ST_NEVER');
      expect(OrganizationStatus.ST_CFID).toBe('ST_CFID');
    });
    
    it('should support status info with CSS classes', () => {
      const statusInfo: StatusInfo = {
        id: OrganizationStatus.ST_CFID,
        name: 'LoyalCustomer',
        css: 'label-success'
      };
      
      expect(statusInfo.id).toBe(OrganizationStatus.ST_CFID);
      expect(statusInfo.css).toBe('label-success');
    });
  });
  
  describe('Address interface', () => {
    it('should support complete address with all fields', () => {
      const address: Address = {
        street: '350 Townsend St. 755',
        city: 'San Francisco',
        state: 'California',
        zip: '94107',
        country: 'US',
        name: 'Main Office',
        contact: {
          name: 'John Doe',
          phone: '+1 415 123 4567',
          mobile: '+1 415 987 6543',
          fax: '+1 415 123 4568',
          email: 'john.doe@company.com'
        },
        Status: 'ENABLE'
      };
      
      expect(address.city).toBe('San Francisco');
      expect(address.contact?.name).toBe('John Doe');
      expect(address.Status).toBe('ENABLE');
    });
    
    it('should support minimal address', () => {
      const address: Address = {
        street: '123 Main St',
        city: 'Paris',
        zip: '75001'
      };
      
      expect(address.street).toBe('123 Main St');
      expect(address.country).toBeUndefined();
    });
  });
  
  describe('SalesPurchases interface', () => {
    it('should support customer flags', () => {
      const sales: SalesPurchases = {
        isCustomer: true,
        isProspect: false,
        isSupplier: false,
        isSubcontractor: false,
        ref: 'CUST-12345',
        salesPerson: 'emp-1',
        VATIsUsed: true,
        isActive: true
      };
      
      expect(sales.isCustomer).toBe(true);
      expect(sales.ref).toBe('CUST-12345');
    });
    
    it('should support supplier flags', () => {
      const sales: SalesPurchases = {
        isSupplier: true,
        isSubcontractor: false,
        supplierAccount: 'SUP401000'
      };
      
      expect(sales.isSupplier).toBe(true);
      expect(sales.supplierAccount).toBe('SUP401000');
    });
    
    it('should support payment terms and methods', () => {
      const sales: SalesPurchases = {
        cond_reglement: 'RECEP',
        mode_reglement: 'CHQ',
        bank_reglement: 'bank-id-1'
      };
      
      expect(sales.cond_reglement).toBe('RECEP');
      expect(sales.mode_reglement).toBe('CHQ');
    });
    
    it('should support rivals array', () => {
      const sales: SalesPurchases = {
        rival: ['Competitor A', 'Competitor B']
      };
      
      expect(sales.rival).toHaveLength(2);
      expect(sales.rival).toContain('Competitor A');
    });
  });
  
  describe('CompanyInfo interface', () => {
    it('should support French business identifiers', () => {
      const info: CompanyInfo = {
        idprof1: '123456789',        // SIREN
        idprof2: 'FR12345678901',    // TVA
        idprof3: '12345678901234',   // SIRET (14 digits)
        idprof4: '1234Z'             // NAF/APE
      };
      
      expect(info.idprof1).toBe('123456789');
      expect(info.idprof3).toBe('12345678901234');
      expect(info.idprof3?.length).toBe(14);
    });
    
    it('should support company details', () => {
      const info: CompanyInfo = {
        capital: 100000,
        effectif_id: 'EF50',
        forme_juridique_code: 'SARL',
        brand: 'Acme Brand',
        type: 'Company'
      };
      
      expect(info.capital).toBe(100000);
      expect(info.forme_juridique_code).toBe('SARL');
    });
  });
  
  describe('Iban interface', () => {
    it('should support IBAN details', () => {
      const iban: Iban = {
        bank: 'BNP PARIBAS',
        id: 'FR7630004000031234567890143',
        bic: 'BNPAFRPPXXX',
        isOk: true
      };
      
      expect(iban.bank).toBe('BNP PARIBAS');
      expect(iban.id).toBeTruthy();
      expect(iban.isOk).toBe(true);
    });
    
    it('should support invalid IBAN', () => {
      const iban: Iban = {
        id: 'INVALID',
        isOk: false
      };
      
      expect(iban.isOk).toBe(false);
    });
  });
  
  describe('Phone interface', () => {
    it('should support all phone types', () => {
      const phones: Phone = {
        phone: '+33 1 23 45 67 89',
        mobile: '+33 6 12 34 56 78',
        fax: '+33 1 23 45 67 90'
      };
      
      expect(phones.phone).toBeTruthy();
      expect(phones.mobile).toBeTruthy();
      expect(phones.fax).toBeTruthy();
    });
  });
  
  describe('Social interface', () => {
    it('should support all social media platforms', () => {
      const social: Social = {
        TW: '@acmecorp',
        LI: 'company/acme-corp',
        FB: 'acmecorp',
        url: 'https://www.acme.com'
      };
      
      expect(social.TW).toBe('@acmecorp');
      expect(social.LI).toBe('company/acme-corp');
      expect(social.FB).toBe('acmecorp');
    });
  });
  
  describe('StrategicNote interface', () => {
    it('should support note with metadata', () => {
      const note: StrategicNote = {
        css: 'primary',
        note: 'Important strategic note',
        author: 'user-id-1',
        datec: new Date('2025-01-15')
      };
      
      expect(note.css).toBe('primary');
      expect(note.note).toBe('Important strategic note');
      expect(note.author).toBe('user-id-1');
    });
  });
  
  describe('InternalNote interface', () => {
    it('should track note history', () => {
      const note: InternalNote = {
        new: 'Updated note content',
        old: 'Previous note content',
        author: 'user-id-1',
        datec: new Date()
      };
      
      expect(note.new).toBe('Updated note content');
      expect(note.old).toBe('Previous note content');
    });
  });
  
  describe('OrganizationFormData interface', () => {
    it('should create form data with required fields', () => {
      const formData: OrganizationFormData = {
        name: 'New Company',
        salesPurchases: {
          ref: 'NC001',
          language: 'fr'
        }
      };
      
      expect(formData.name).toBe('New Company');
      expect(formData.salesPurchases.ref).toBe('NC001');
    });
    
    it('should support complete form data', () => {
      const formData: OrganizationFormData = {
        name: 'Acme Corp',
        firstname: undefined,
        Title: undefined,
        companyInfo: {
          idprof3: '12345678901234',
          brand: 'Acme'
        },
        salesPurchases: {
          isProspect: false,
          isCustomer: true,
          isSupplier: false,
          isSubcontractor: false,
          salesPerson: 'emp-1',
          ref: 'ACME001',
          isGeneric: false,
          language: 'fr'
        },
        entity: ['entity-1', 'entity-2'],
        address: {
          street: '123 Main St',
          city: 'Paris',
          zip: '75001',
          country: 'FR'
        },
        phones: {
          phone: '+33 1 23 45 67 89'
        },
        emails: [{ email: 'contact@acme.com' }],
        url: 'https://www.acme.com',
        social: {
          LI: 'company/acme',
          TW: '@acme'
        },
        notes: [
          {
            note: 'Test note',
            css: 'primary'
          }
        ]
      };
      
      expect(formData.entity).toHaveLength(2);
      expect(formData.companyInfo?.idprof3).toBe('12345678901234');
      expect(formData.notes).toHaveLength(1);
    });
    
    it('should support person form data', () => {
      const formData: OrganizationFormData = {
        name: 'Doe',
        firstname: 'John',
        Title: 'MR',
        salesPurchases: {
          ref: 'JOHN001',
          language: 'en'
        },
        emails: [{ email: 'john.doe@example.com' }]
      };
      
      expect(formData.firstname).toBe('John');
      expect(formData.Title).toBe('MR');
    });
  });
  
  describe('Virtual fields', () => {
    it('should support calculated attractivity score', () => {
      const org: Organization = {
        name: 'Test',
        attractivity: 85
      };
      
      expect(org.attractivity).toBe(85);
    });
    
    it('should support validation errors array', () => {
      const org: Organization = {
        name: 'Test',
        errors: ['Invalid IBAN', 'Invalid payment terms']
      };
      
      expect(org.errors).toHaveLength(2);
      expect(org.errors).toContain('Invalid IBAN');
    });
  });
  
  describe('Multi-entity support', () => {
    it('should support single entity', () => {
      const org: Organization = {
        name: 'Test',
        entity: 'entity-1'
      };
      
      expect(org.entity).toBe('entity-1');
    });
  });
  
  describe('Shipping addresses', () => {
    it('should support multiple shipping addresses', () => {
      const org: Organization = {
        name: 'Test Company',
        address: {
          street: 'Main Office',
          city: 'Paris',
          zip: '75001'
        },
        shippingAddress: [
          {
            name: 'Warehouse 1',
            street: '10 Industrial Rd',
            city: 'Lyon',
            zip: '69001'
          },
          {
            name: 'Warehouse 2',
            street: '20 Storage Ave',
            city: 'Marseille',
            zip: '13001'
          }
        ]
      };
      
      expect(org.shippingAddress).toHaveLength(2);
      expect(org.shippingAddress?.[0]?.name).toBe('Warehouse 1');
      expect(org.shippingAddress?.[1]?.city).toBe('Marseille');
    });
  });
  
  describe('Audit fields', () => {
    it('should support audit timestamps and author', () => {
      const now = new Date();
      const org: Organization = {
        name: 'Test',
        createdAt: now,
        updatedAt: now,
        author: 'user-id-1'
      };
      
      expect(org.createdAt).toBe(now);
      expect(org.updatedAt).toBe(now);
      expect(org.author).toBe('user-id-1');
    });
  });
});
