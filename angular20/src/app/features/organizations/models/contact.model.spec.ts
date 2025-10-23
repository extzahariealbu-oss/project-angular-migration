// Evidence: .knowledge/analysis/epic-4-evidence.md Section 11 (Contact Management)
// Following Epic 3 testing pattern from product.model.spec.ts

import { 
  Contact, 
  ContactFormData, 
  ContactListItem,
  CompanyAutocompleteResult 
} from './contact.model';
import { OrganizationStatus } from './organization.model';

describe('Contact Models', () => {
  describe('Contact interface', () => {
    it('should create a minimal valid contact with required fields', () => {
      const contact: Contact = {
        name: 'Doe',
        firstname: 'John',
        companyId: 'company-id-1'
      };
      
      expect(contact.name).toBe('Doe');
      expect(contact.firstname).toBe('John');
      expect(contact.companyId).toBe('company-id-1');
    });
    
    it('should create a complete contact with all fields', () => {
      const contact: Contact = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Doe',
        firstname: 'John',
        fullName: 'John Doe',
        Title: 'MR',
        companyId: 'company-id-1',
        companyName: 'Acme Corporation',
        jobTitle: 'Sales Manager',
        phones: {
          phone: '+33 1 23 45 67 89',
          mobile: '+33 6 12 34 56 78',
          fax: '+33 1 23 45 67 90'
        },
        emails: [
          { email: 'john.doe@acme.com' }
        ],
        url: 'https://johndoe.com',
        address: {
          street: '123 Main St',
          city: 'Paris',
          zip: '75001',
          country: 'FR'
        },
        social: {
          LI: 'in/johndoe',
          TW: '@johndoe',
          FB: 'johndoe'
        },
        salesPurchases: {
          salesPerson: 'emp-id-1',
          isActive: true
        },
        entity: 'entity-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'user-id-1'
      };
      
      expect(contact._id).toBe('507f1f77bcf86cd799439011');
      expect(contact.fullName).toBe('John Doe');
      expect(contact.Title).toBe('MR');
      expect(contact.companyName).toBe('Acme Corporation');
      expect(contact.jobTitle).toBe('Sales Manager');
    });
    
    it('should support civility titles', () => {
      const mrContact: Contact = {
        name: 'Doe',
        firstname: 'John',
        Title: 'MR',
        companyId: 'company-1'
      };
      
      const mrsContact: Contact = {
        name: 'Smith',
        firstname: 'Jane',
        Title: 'MRS',
        companyId: 'company-1'
      };
      
      expect(mrContact.Title).toBe('MR');
      expect(mrsContact.Title).toBe('MRS');
    });
    
    it('should link contact to company', () => {
      const contact: Contact = {
        name: 'Doe',
        firstname: 'John',
        companyId: 'acme-corp-id',
        companyName: 'Acme Corporation'
      };
      
      expect(contact.companyId).toBe('acme-corp-id');
      expect(contact.companyName).toBe('Acme Corporation');
    });
    
    it('should support job title', () => {
      const contact: Contact = {
        name: 'Doe',
        firstname: 'John',
        companyId: 'company-1',
        jobTitle: 'Chief Technology Officer'
      };
      
      expect(contact.jobTitle).toBe('Chief Technology Officer');
    });
    
    it('should support multiple email addresses', () => {
      const contact: Contact = {
        name: 'Doe',
        firstname: 'John',
        companyId: 'company-1',
        emails: [
          { email: 'john.doe@work.com' },
          { email: 'jdoe@personal.com' }
        ]
      };
      
      expect(contact.emails).toHaveLength(2);
      expect(contact.emails?.[0]?.email).toBe('john.doe@work.com');
    });
    
    it('should support contact phone numbers', () => {
      const contact: Contact = {
        name: 'Doe',
        firstname: 'John',
        companyId: 'company-1',
        phones: {
          phone: '+33 1 23 45 67 89',
          mobile: '+33 6 12 34 56 78'
        }
      };
      
      expect(contact.phones?.phone).toBeTruthy();
      expect(contact.phones?.mobile).toBeTruthy();
    });
    
    it('should support contact address', () => {
      const contact: Contact = {
        name: 'Doe',
        firstname: 'John',
        companyId: 'company-1',
        address: {
          street: '10 Business Park',
          city: 'Lyon',
          zip: '69001',
          country: 'FR'
        }
      };
      
      expect(contact.address?.city).toBe('Lyon');
      expect(contact.address?.country).toBe('FR');
    });
    
    it('should support social media links', () => {
      const contact: Contact = {
        name: 'Doe',
        firstname: 'John',
        companyId: 'company-1',
        social: {
          LI: 'in/johndoe',
          TW: '@johndoe',
          FB: 'johndoe.profile'
        },
        url: 'https://johndoe.com'
      };
      
      expect(contact.social?.LI).toBe('in/johndoe');
      expect(contact.url).toBe('https://johndoe.com');
    });
    
    it('should support sales person assignment', () => {
      const contact: Contact = {
        name: 'Doe',
        firstname: 'John',
        companyId: 'company-1',
        salesPurchases: {
          salesPerson: 'emp-id-5',
          isActive: true
        }
      };
      
      expect(contact.salesPurchases?.salesPerson).toBe('emp-id-5');
      expect(contact.salesPurchases?.isActive).toBe(true);
    });
    
    it('should support strategic notes', () => {
      const contact: Contact = {
        name: 'Doe',
        firstname: 'John',
        companyId: 'company-1',
        notes: [
          {
            note: 'Key decision maker for IT purchases',
            css: 'primary',
            author: 'user-1',
            datec: new Date('2025-01-15')
          }
        ]
      };
      
      expect(contact.notes).toHaveLength(1);
      expect(contact.notes?.[0]?.note).toContain('decision maker');
    });
  });
  
  describe('ContactFormData interface', () => {
    it('should create form data with required fields', () => {
      const formData: ContactFormData = {
        name: 'Doe',
        firstname: 'John',
        companyId: 'company-id-1'
      };
      
      expect(formData.name).toBe('Doe');
      expect(formData.firstname).toBe('John');
      expect(formData.companyId).toBe('company-id-1');
    });
    
    it('should create complete form data', () => {
      const formData: ContactFormData = {
        name: 'Smith',
        firstname: 'Jane',
        Title: 'MRS',
        companyId: 'acme-corp-id',
        jobTitle: 'Marketing Director',
        phones: {
          phone: '+33 1 23 45 67 89',
          mobile: '+33 6 12 34 56 78',
          fax: '+33 1 23 45 67 90'
        },
        emails: [
          { email: 'jane.smith@acme.com' }
        ],
        url: 'https://janesmith.com',
        address: {
          street: '456 Business Ave',
          city: 'Paris',
          zip: '75008',
          country: 'FR'
        },
        social: {
          LI: 'in/janesmith',
          TW: '@janesmith',
          FB: 'janesmith',
          url: 'https://portfolio.janesmith.com'
        },
        salesPurchases: {
          salesPerson: 'emp-3',
          isActive: true
        },
        entity: 'entity-1',
        notes: [
          {
            note: 'Met at trade show 2025',
            css: 'info'
          }
        ]
      };
      
      expect(formData.Title).toBe('MRS');
      expect(formData.jobTitle).toBe('Marketing Director');
      expect(formData.social?.url).toBe('https://portfolio.janesmith.com');
      expect(formData.notes).toHaveLength(1);
    });
    
    it('should support optional fields', () => {
      const formData: ContactFormData = {
        name: 'Brown',
        firstname: 'Robert',
        companyId: 'company-1'
      };
      
      expect(formData.Title).toBeUndefined();
      expect(formData.jobTitle).toBeUndefined();
      expect(formData.emails).toBeUndefined();
    });
  });
  
  describe('ContactListItem interface', () => {
    it('should create list item with display fields', () => {
      const listItem: ContactListItem = {
        _id: '507f1f77bcf86cd799439011',
        fullName: 'John Doe',
        companyName: 'Acme Corporation',
        email: 'john.doe@acme.com',
        phone: '+33 1 23 45 67 89',
        createdAt: new Date('2025-01-01')
      };
      
      expect(listItem._id).toBeTruthy();
      expect(listItem.fullName).toBe('John Doe');
      expect(listItem.companyName).toBe('Acme Corporation');
    });
    
    it('should include location information', () => {
      const listItem: ContactListItem = {
        _id: 'contact-1',
        fullName: 'Jane Smith',
        city: 'Paris',
        zip: '75001',
        createdAt: new Date()
      };
      
      expect(listItem.city).toBe('Paris');
      expect(listItem.zip).toBe('75001');
    });
    
    it('should include sales person info', () => {
      const listItem: ContactListItem = {
        _id: 'contact-1',
        fullName: 'John Doe',
        salesPerson: {
          _id: 'emp-1',
          fullName: 'Alice Johnson'
        },
        createdAt: new Date()
      };
      
      expect(listItem.salesPerson?.fullName).toBe('Alice Johnson');
    });
    
    it('should support optional fields in list view', () => {
      const listItem: ContactListItem = {
        _id: 'contact-1',
        fullName: 'Bob Wilson',
        Title: 'DR',
        jobTitle: 'Chief Medical Officer',
        mobile: '+33 6 12 34 56 78',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      expect(listItem.Title).toBe('DR');
      expect(listItem.jobTitle).toBe('Chief Medical Officer');
      expect(listItem.mobile).toBeTruthy();
      expect(listItem.updatedAt).toBeDefined();
    });
  });
  
  describe('CompanyAutocompleteResult interface', () => {
    it('should provide company search result', () => {
      const result: CompanyAutocompleteResult = {
        _id: 'company-id-1',
        fullName: 'Acme Corporation',
        isCustomer: true,
        isSupplier: false
      };
      
      expect(result._id).toBe('company-id-1');
      expect(result.fullName).toBe('Acme Corporation');
      expect(result.isCustomer).toBe(true);
    });
    
    it('should include company reference code', () => {
      const result: CompanyAutocompleteResult = {
        _id: 'company-1',
        fullName: 'Tech Solutions Inc',
        salesPurchases: {
          ref: 'TECH001'
        }
      };
      
      expect(result.salesPurchases?.ref).toBe('TECH001');
    });
    
    it('should include location in autocomplete', () => {
      const result: CompanyAutocompleteResult = {
        _id: 'company-1',
        fullName: 'Global Corp',
        address: {
          city: 'London',
          zip: 'SW1A 1AA'
        }
      };
      
      expect(result.address?.city).toBe('London');
      expect(result.address?.zip).toBe('SW1A 1AA');
    });
    
    it('should distinguish supplier vs customer', () => {
      const customer: CompanyAutocompleteResult = {
        _id: 'c1',
        fullName: 'Customer Co',
        isCustomer: true,
        isSupplier: false
      };
      
      const supplier: CompanyAutocompleteResult = {
        _id: 's1',
        fullName: 'Supplier Inc',
        isCustomer: false,
        isSupplier: true
      };
      
      expect(customer.isCustomer).toBe(true);
      expect(supplier.isSupplier).toBe(true);
    });
  });
  
  describe('Contact-Organization relationship', () => {
    it('should extend organization with person-specific fields', () => {
      const contact: Contact = {
        name: 'Doe',
        firstname: 'John',
        companyId: 'company-1',
        // Inherited organization fields
        entity: 'entity-1',
        Status: OrganizationStatus.ST_NEVER,
        createdAt: new Date(),
        author: 'user-1'
      };
      
      expect(contact.firstname).toBeTruthy();
      expect(contact.Status).toBe(OrganizationStatus.ST_NEVER);
    });
  });
});
