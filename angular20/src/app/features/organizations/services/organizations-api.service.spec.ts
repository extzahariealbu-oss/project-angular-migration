import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { OrganizationsApiService, OrganizationListQuery, StatisticsQuery } from './organizations-api.service';
import { Organization } from '../models/organization.model';
import { Contact } from '../models/contact.model';

describe('OrganizationsApiService', () => {
  let service: OrganizationsApiService;
  let httpMock: HttpTestingController;
  
  const baseUrl = '/erp/api/societe';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrganizationsApiService]
    });
    
    service = TestBed.inject(OrganizationsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Organization CRUD', () => {
    describe('list()', () => {
      it('should fetch organizations with query parameters', () => {
        const query: OrganizationListQuery = {
          forSales: true,
          quickSearch: 'test',
          limit: 25,
          page: 1,
          sort: { fullName: 1 }
        };
        
        const mockOrgs: Organization[] = [
          {
            _id: '1',
            name: { last: 'Test Company' },
            type: 'Company',
            Status: 'ST_NEVER',
            fournisseur: 'NO',
            salesPurchases: {
              ref: 'REF001',
              isCustomer: true,
              isProspect: false,
              isSupplier: false,
              isSubcontractor: false
            },
            address: {
              address: '123 Main St',
              zip: '75001',
              town: 'Paris'
            },
            entity: ['entity1'],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        service.list(query).subscribe(orgs => {
          expect(orgs).toEqual(mockOrgs);
          expect(orgs.length).toBe(1);
        });

        const req = httpMock.expectOne(request => 
          request.url === baseUrl && 
          request.params.get('forSales') === 'true' &&
          request.params.get('quickSearch') === 'test' &&
          request.params.get('limit') === '25' &&
          request.params.get('page') === '1'
        );
        
        expect(req.request.method).toBe('GET');
        req.flush(mockOrgs);
      });

      it('should handle filters in query', () => {
        const query: OrganizationListQuery = {
          filter: {
            Status: 'ST_PFROI',
            isCustomer: true,
            salesPerson: 'user123'
          }
        };

        service.list(query).subscribe();

        const req = httpMock.expectOne(request => {
          const filterParam = request.params.get('filter');
          return request.url === baseUrl && filterParam !== null;
        });
        
        expect(req.request.method).toBe('GET');
        req.flush([]);
      });

      it('should handle empty query', () => {
        service.list({}).subscribe();

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('GET');
        req.flush([]);
      });
    });

    describe('listDataTable()', () => {
      it('should fetch DataTable for Company type', () => {
        const mockResponse = {
          data: [],
          total: 0,
          page: 1,
          limit: 25
        };

        service.listDataTable('Company', { limit: 25, page: 1 }).subscribe(response => {
          expect(response).toEqual(mockResponse);
          expect(response.total).toBe(0);
        });

        const req = httpMock.expectOne(request =>
          request.url === `${baseUrl}/dt` &&
          request.params.get('type') === 'Company'
        );
        
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
      });

      it('should fetch DataTable for Person type (contacts)', () => {
        const mockResponse = {
          data: [],
          total: 0,
          page: 1,
          limit: 25
        };

        service.listDataTable('Person', { limit: 10 }).subscribe(response => {
          expect(response).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(request =>
          request.url === `${baseUrl}/dt` &&
          request.params.get('type') === 'Person'
        );
        
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
      });
    });

    describe('getById()', () => {
      it('should fetch single organization by ID', () => {
        const mockOrg: Organization = {
          _id: 'org123',
          name: { last: 'Acme Corp' },
          type: 'Company',
          Status: 'ST_PFROI',
          fournisseur: 'NO',
          salesPurchases: {
            ref: 'ACME001',
            isCustomer: true,
            isProspect: false,
            isSupplier: false,
            isSubcontractor: false
          },
          address: {
            address: '456 Business Ave',
            zip: '75002',
            town: 'Paris'
          },
          entity: ['entity1'],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        service.getById('org123').subscribe(org => {
          expect(org).toEqual(mockOrg);
          expect(org._id).toBe('org123');
        });

        const req = httpMock.expectOne(`${baseUrl}/org123`);
        expect(req.request.method).toBe('GET');
        req.flush(mockOrg);
      });

      it('should handle 404 error', () => {
        service.getById('nonexistent').subscribe(
          () => fail('should have failed'),
          error => {
            expect(error.status).toBe(404);
          }
        );

        const req = httpMock.expectOne(`${baseUrl}/nonexistent`);
        req.flush('Not found', { status: 404, statusText: 'Not Found' });
      });
    });

    describe('create()', () => {
      it('should create new organization', () => {
        const newOrg: Partial<Organization> = {
          name: { last: 'New Company' },
          type: 'Company',
          salesPurchases: {
            ref: 'NEW001',
            isCustomer: true,
            isProspect: false,
            isSupplier: false,
            isSubcontractor: false
          },
          address: {
            address: '789 Startup Blvd',
            zip: '75003',
            town: 'Paris'
          },
          entity: ['entity1']
        };

        const createdOrg: Organization = {
          ...newOrg as Organization,
          _id: 'new123',
          Status: 'ST_NEVER',
          fournisseur: 'NO',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        service.create(newOrg).subscribe(org => {
          expect(org).toEqual(createdOrg);
          expect(org._id).toBe('new123');
        });

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(newOrg);
        req.flush(createdOrg);
      });

      it('should handle validation errors', () => {
        const invalidOrg: Partial<Organization> = {
          name: { last: '' } // Invalid: empty name
        };

        service.create(invalidOrg).subscribe(
          () => fail('should have failed'),
          error => {
            expect(error.status).toBe(400);
          }
        );

        const req = httpMock.expectOne(baseUrl);
        req.flush({ error: 'Validation failed' }, { status: 400, statusText: 'Bad Request' });
      });
    });

    describe('update()', () => {
      it('should update existing organization', () => {
        const updates: Partial<Organization> = {
          name: { last: 'Updated Company' }
        };

        const updatedOrg: Organization = {
          _id: 'org123',
          name: { last: 'Updated Company' },
          type: 'Company',
          Status: 'ST_PFROI',
          fournisseur: 'NO',
          salesPurchases: {
            ref: 'REF001',
            isCustomer: true,
            isProspect: false,
            isSupplier: false,
            isSubcontractor: false
          },
          address: {
            address: '123 Main St',
            zip: '75001',
            town: 'Paris'
          },
          entity: ['entity1'],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        service.update('org123', updates).subscribe(org => {
          expect(org).toEqual(updatedOrg);
          expect(org.name.last).toBe('Updated Company');
        });

        const req = httpMock.expectOne(`${baseUrl}/org123`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(updates);
        req.flush(updatedOrg);
      });

      it('should handle 403 error (unauthorized)', () => {
        service.update('org123', {}).subscribe(
          () => fail('should have failed'),
          error => {
            expect(error.status).toBe(403);
          }
        );

        const req = httpMock.expectOne(`${baseUrl}/org123`);
        req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
      });
    });

    describe('updateField()', () => {
      it('should update single field inline', () => {
        const oldValue = 'Old Status';
        const newValue = 'New Status';

        service.updateField('org123', 'Status', oldValue, newValue).subscribe(response => {
          expect(response.success).toBe(true);
        });

        const req = httpMock.expectOne(`${baseUrl}/org123/Status`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual({
          oldvalue: oldValue,
          value: newValue
        });
        req.flush({ success: true });
      });
    });

    describe('delete()', () => {
      it('should delete single organization', () => {
        service.delete('org123').subscribe(response => {
          expect(response.success).toBe(true);
        });

        const req = httpMock.expectOne(`${baseUrl}/org123`);
        expect(req.request.method).toBe('DELETE');
        req.flush({ success: true });
      });

      it('should bulk delete organizations', () => {
        const ids = ['org1', 'org2', 'org3'];

        service.delete(ids).subscribe(response => {
          expect(response.deleted).toBe(3);
        });

        const req = httpMock.expectOne(request =>
          request.url === baseUrl &&
          request.params.get('id') !== null
        );
        
        expect(req.request.method).toBe('DELETE');
        req.flush({ deleted: 3 });
      });
    });
  });

  describe('Contact CRUD', () => {
    describe('listContacts()', () => {
      it('should fetch contacts (Person type)', () => {
        const mockResponse = {
          data: [],
          total: 0,
          page: 1,
          limit: 25
        };

        service.listContacts({ limit: 25 }).subscribe(response => {
          expect(response).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(request =>
          request.url === `${baseUrl}/dt` &&
          request.params.get('type') === 'Person'
        );
        
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
      });
    });

    describe('createContact()', () => {
      it('should create new contact with type Person', () => {
        const newContact: Partial<Contact> = {
          lastname: 'Doe',
          firstname: 'John',
          email: 'john@example.com',
          soncas: ['Sécurité']
        };

        const createdContact: Contact = {
          ...newContact,
          _id: 'contact123',
          type: 'Person',
          soncas: ['Sécurité'],
          createdAt: new Date(),
          updatedAt: new Date()
        } as Contact;

        service.createContact(newContact).subscribe(contact => {
          expect(contact).toEqual(createdContact);
          expect(contact.type).toBe('Person');
        });

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body.type).toBe('Person');
        req.flush(createdContact);
      });
    });

    describe('createWebAccess()', () => {
      it('should create web access for contact', () => {
        const contactId = 'contact123';
        const password = 'securepass123';

        service.createWebAccess(contactId, password).subscribe(response => {
          expect(response.success).toBe(true);
        });

        const req = httpMock.expectOne(`/erp/api/contact/login/${contactId}`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ password });
        req.flush({ success: true });
      });
    });
  });

  describe('Validation', () => {
    describe('checkClientRefUniqueness()', () => {
      it('should check if client ref is unique', () => {
        const ref = 'CLIENT001';
        const mockResponse = { exists: false };

        service.checkClientRefUniqueness(ref).subscribe(response => {
          expect(response.exists).toBe(false);
        });

        const req = httpMock.expectOne(request =>
          request.url === `${baseUrl}/checkRef` &&
          request.params.get('ref') === ref
        );
        
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
      });

      it('should check uniqueness excluding current ID', () => {
        const ref = 'CLIENT001';
        const excludeId = 'org123';
        const mockResponse = { exists: false };

        service.checkClientRefUniqueness(ref, excludeId).subscribe(response => {
          expect(response.exists).toBe(false);
        });

        const req = httpMock.expectOne(request =>
          request.url === `${baseUrl}/checkRef` &&
          request.params.get('ref') === ref &&
          request.params.get('excludeId') === excludeId
        );
        
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
      });

      it('should return exists: true for duplicate ref', () => {
        const mockResponse = { exists: true, message: 'Reference already exists' };

        service.checkClientRefUniqueness('DUPLICATE').subscribe(response => {
          expect(response.exists).toBe(true);
          expect(response.message).toContain('already exists');
        });

        const req = httpMock.expectOne(request => request.url === `${baseUrl}/checkRef`);
        req.flush(mockResponse);
      });
    });

    describe('checkSiretUniqueness()', () => {
      it('should check if SIRET is unique', () => {
        const siret = '12345678901234';
        const mockResponse = { exists: false };

        service.checkSiretUniqueness(siret).subscribe(response => {
          expect(response.exists).toBe(false);
        });

        const req = httpMock.expectOne(request =>
          request.url === `${baseUrl}/checkSiret` &&
          request.params.get('siret') === siret
        );
        
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
      });

      it('should check SIRET uniqueness excluding current ID', () => {
        const siret = '12345678901234';
        const excludeId = 'org123';
        const mockResponse = { exists: false };

        service.checkSiretUniqueness(siret, excludeId).subscribe(response => {
          expect(response.exists).toBe(false);
        });

        const req = httpMock.expectOne(request =>
          request.url === `${baseUrl}/checkSiret` &&
          request.params.get('siret') === siret &&
          request.params.get('excludeId') === excludeId
        );
        
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
      });
    });
  });

  describe('Autocomplete', () => {
    describe('autocomplete()', () => {
      it('should fetch autocomplete results for companies', () => {
        const mockResults = [
          { _id: '1', name: 'Acme Corp' },
          { _id: '2', name: 'TechCo' }
        ];

        service.autocomplete('acme', { type: 'Company' }).subscribe(results => {
          expect(results).toEqual(mockResults);
          expect(results.length).toBe(2);
        });

        const req = httpMock.expectOne(request =>
          request.url === `${baseUrl}/autocomplete` &&
          request.params.get('query') === 'acme' &&
          request.params.get('type') === 'Company'
        );
        
        expect(req.request.method).toBe('GET');
        req.flush(mockResults);
      });

      it('should fetch autocomplete without type filter', () => {
        service.autocomplete('test').subscribe();

        const req = httpMock.expectOne(request =>
          request.url === `${baseUrl}/autocomplete` &&
          request.params.get('query') === 'test' &&
          !request.params.has('type')
        );
        
        expect(req.request.method).toBe('GET');
        req.flush([]);
      });
    });

    describe('autocompleteCaFamily()', () => {
      it('should fetch company family autocomplete', () => {
        const mockResults = [
          { _id: '1', name: 'IT Services' },
          { _id: '2', name: 'Manufacturing' }
        ];

        service.autocompleteCaFamily('IT').subscribe(results => {
          expect(results).toEqual(mockResults);
        });

        const req = httpMock.expectOne(request =>
          request.url === `${baseUrl}/autocomplete/caFamily` &&
          request.params.get('query') === 'IT'
        );
        
        expect(req.request.method).toBe('GET');
        req.flush(mockResults);
      });
    });
  });

  describe('File Management', () => {
    describe('uploadFile()', () => {
      it('should upload file with progress tracking', () => {
        const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
        const organizationId = 'org123';
        const mockResponse = {
          _id: 'file123',
          filename: 'test.pdf',
          size: 1024,
          mimetype: 'application/pdf',
          uploadDate: new Date(),
          uploadedBy: 'user123'
        };

        const events: HttpEvent<any>[] = [];
        
        service.uploadFile(organizationId, file).subscribe(event => {
          events.push(event);
          
          if (event.type === HttpEventType.Response) {
            expect(event.body).toEqual(mockResponse);
          }
        });

        const req = httpMock.expectOne(`${baseUrl}/${organizationId}/upload`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body instanceof FormData).toBe(true);
        
        // Simulate upload progress
        req.event({ type: HttpEventType.UploadProgress, loaded: 512, total: 1024 });
        req.event({ type: HttpEventType.UploadProgress, loaded: 1024, total: 1024 });
        req.flush(mockResponse);
        
        expect(events.length).toBeGreaterThan(0);
      });
    });

    describe('listFiles()', () => {
      it('should list files for organization', () => {
        const mockFiles = [
          {
            _id: 'file1',
            filename: 'document1.pdf',
            size: 2048,
            mimetype: 'application/pdf',
            uploadDate: new Date(),
            uploadedBy: 'user1'
          },
          {
            _id: 'file2',
            filename: 'image.jpg',
            size: 1024,
            mimetype: 'image/jpeg',
            uploadDate: new Date(),
            uploadedBy: 'user2'
          }
        ];

        service.listFiles('org123').subscribe(files => {
          expect(files).toEqual(mockFiles);
          expect(files.length).toBe(2);
        });

        const req = httpMock.expectOne(`${baseUrl}/org123/files`);
        expect(req.request.method).toBe('GET');
        req.flush(mockFiles);
      });
    });

    describe('deleteFile()', () => {
      it('should delete file from organization', () => {
        service.deleteFile('org123', 'file456').subscribe(response => {
          expect(response.success).toBe(true);
        });

        const req = httpMock.expectOne(`${baseUrl}/org123/files/file456`);
        expect(req.request.method).toBe('DELETE');
        req.flush({ success: true });
      });
    });
  });

  describe('Addresses', () => {
    describe('listAddresses()', () => {
      it('should list addresses for organization', () => {
        const mockAddresses = [
          { _id: 'addr1', street: '123 Main St', city: 'Paris', zip: '75001' },
          { _id: 'addr2', street: '456 Business Ave', city: 'Lyon', zip: '69001' }
        ];

        service.listAddresses('org123').subscribe(addresses => {
          expect(addresses).toEqual(mockAddresses);
          expect(addresses.length).toBe(2);
        });

        const req = httpMock.expectOne(`${baseUrl}/org123/addresses`);
        expect(req.request.method).toBe('GET');
        req.flush(mockAddresses);
      });
    });

    describe('createAddress()', () => {
      it('should create address for organization', () => {
        const newAddress = {
          street: '789 New St',
          city: 'Marseille',
          zip: '13001'
        };

        service.createAddress('org123', newAddress).subscribe(response => {
          expect(response._id).toBe('addr123');
        });

        const req = httpMock.expectOne(`${baseUrl}/org123/address`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(newAddress);
        req.flush({ _id: 'addr123', ...newAddress });
      });
    });

    describe('updateAddress()', () => {
      it('should update address', () => {
        const updates = { city: 'Toulouse' };

        service.updateAddress('org123', 'addr456', updates).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/org123/address/addr456`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(updates);
        req.flush({ success: true });
      });
    });

    describe('deleteAddress()', () => {
      it('should delete address', () => {
        service.deleteAddress('org123', 'addr456').subscribe();

        const req = httpMock.expectOne(`${baseUrl}/org123/address/addr456`);
        expect(req.request.method).toBe('DELETE');
        req.flush({ success: true });
      });
    });
  });

  describe('Dictionaries', () => {
    describe('getDictionary()', () => {
      it('should fetch specific dictionary', () => {
        const mockEntries = [
          { key: 'M', label: 'Monsieur' },
          { key: 'Mme', label: 'Madame' }
        ];

        service.getDictionary('fk_civilite').subscribe(entries => {
          expect(entries).toEqual(mockEntries);
        });

        const req = httpMock.expectOne(request =>
          request.url === '/erp/api/dict' &&
          request.params.get('type') === 'fk_civilite'
        );
        
        expect(req.request.method).toBe('GET');
        req.flush(mockEntries);
      });
    });

    describe('getAllDictionaries()', () => {
      it('should fetch all dictionaries at once', () => {
        const mockDicts = {
          fk_civilite: [{ key: 'M', label: 'Monsieur' }],
          fk_job: [{ key: 'DEV', label: 'Developer' }]
        };

        service.getAllDictionaries().subscribe(dicts => {
          expect(dicts).toEqual(mockDicts);
          expect(dicts.fk_civilite).toBeDefined();
        });

        const req = httpMock.expectOne('/erp/api/dict');
        expect(req.request.method).toBe('GET');
        req.flush(mockDicts);
      });
    });
  });

  describe('User Autocomplete', () => {
    describe('userAutocomplete()', () => {
      it('should fetch user autocomplete results', () => {
        const mockUsers = [
          { _id: 'user1', name: 'John Doe' },
          { _id: 'user2', name: 'Jane Smith' }
        ];

        service.userAutocomplete('john').subscribe(users => {
          expect(users).toEqual(mockUsers);
        });

        const req = httpMock.expectOne(request =>
          request.url === '/erp/api/user/name/autocomplete' &&
          request.params.get('query') === 'john'
        );
        
        expect(req.request.method).toBe('GET');
        req.flush(mockUsers);
      });
    });
  });

  describe('Statistics', () => {
    describe('getStatistics()', () => {
      it('should fetch statistics with date range', () => {
        const query: StatisticsQuery = {
          start: new Date('2025-01-01'),
          end: new Date('2025-12-31'),
          entity: ['entity1'],
          commercial: 'user123'
        };

        const mockStats = [
          {
            societe: { _id: 'org1', name: 'Company A', family: ['IT', 'Services'] },
            data: { IT: 10000, Services: 5000 },
            total_ht: 15000
          }
        ];

        service.getStatistics(query).subscribe(stats => {
          expect(stats).toEqual(mockStats);
          expect(stats[0].total_ht).toBe(15000);
        });

        const req = httpMock.expectOne(request => {
          return request.url === `${baseUrl}/stats` &&
                 request.params.has('start') &&
                 request.params.has('end');
        });
        
        expect(req.request.method).toBe('GET');
        req.flush(mockStats);
      });

      it('should handle optional parameters', () => {
        const query: StatisticsQuery = {
          start: new Date('2025-01-01'),
          end: new Date('2025-12-31')
        };

        service.getStatistics(query).subscribe();

        const req = httpMock.expectOne(request =>
          request.url === `${baseUrl}/stats` &&
          !request.params.has('entity') &&
          !request.params.has('commercial')
        );
        
        expect(req.request.method).toBe('GET');
        req.flush([]);
      });
    });

    describe('exportStatisticsCsv()', () => {
      it('should export statistics as CSV blob', () => {
        const query: StatisticsQuery = {
          start: new Date('2025-01-01'),
          end: new Date('2025-12-31'),
          entity: ['entity1']
        };

        const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });

        service.exportStatisticsCsv(query).subscribe(blob => {
          expect(blob).toEqual(mockBlob);
          expect(blob.type).toBe('text/csv');
        });

        const req = httpMock.expectOne(request =>
          request.url === '/erp/api/stats/DetailsClientCsv'
        );
        
        expect(req.request.method).toBe('GET');
        expect(req.request.responseType).toBe('blob');
        req.flush(mockBlob);
      });
    });
  });

  describe('Segmentation', () => {
    describe('getSegmentation()', () => {
      it('should fetch customer segmentations', () => {
        const mockSegmentations = [
          { _id: 'seg1', name: 'High Value', attractivity: 5 },
          { _id: 'seg2', name: 'Medium Value', attractivity: 3 }
        ];

        service.getSegmentation().subscribe(segments => {
          expect(segments).toEqual(mockSegmentations);
        });

        const req = httpMock.expectOne(`${baseUrl}/segmentation`);
        expect(req.request.method).toBe('GET');
        req.flush(mockSegmentations);
      });
    });

    describe('updateSegmentation()', () => {
      it('should update segmentation', () => {
        const segmentation = { _id: 'seg1', attractivity: 4 };

        service.updateSegmentation(segmentation).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/segmentation`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(segmentation);
        req.flush({ success: true });
      });
    });

    describe('deleteSegmentation()', () => {
      it('should delete segmentation', () => {
        const segmentation = { _id: 'seg1' };

        service.deleteSegmentation(segmentation).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/segmentation`);
        expect(req.request.method).toBe('DELETE');
        expect(req.request.body).toEqual(segmentation);
        req.flush({ success: true });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 Unauthorized error', () => {
      service.list({}).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(401);
        }
      );

      const req = httpMock.expectOne(baseUrl);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 500 Internal Server Error', () => {
      service.getById('org123').subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(`${baseUrl}/org123`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network errors', () => {
      service.list({}).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.error).toBeTruthy();
        }
      );

      const req = httpMock.expectOne(baseUrl);
      req.error(new ProgressEvent('Network error'));
    });
  });
});
