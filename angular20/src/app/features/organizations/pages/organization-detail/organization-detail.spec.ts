import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OrganizationDetailComponent } from './organization-detail';
import { OrganizationsApiService } from '../../services/organizations-api.service';
import { Organization } from '../../models/organization.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('OrganizationDetailComponent', () => {
  let component: OrganizationDetailComponent;
  let fixture: ComponentFixture<OrganizationDetailComponent>;
  let mockOrganizationService: jest.Mocked<OrganizationsApiService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  const mockOrganization: Organization = {
    _id: '123',
    fullName: 'Test Company',
    type: 'Company',
    name: 'Test Company',
    salesPurchases: {
      isActive: true,
      isProspect: false,
      isCustomer: true,
      isSupplier: false,
      isSubcontractor: false,
      ref: 'REF001'
    },
    _status: {
      id: 'ST001',
      name: 'Active',
      css: 'success'
    },
    address: {
      street: '123 Main St',
      zip: '12345',
      city: 'Test City',
      country: 'Test Country'
    },
    entity: 'entity1',
    Status: { id: 'ST001', name: 'Active', css: 'success' },
    companyInfo: {
      name: 'Test Company'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    createdBy: { id: 'user1', username: 'creator' },
    editedBy: { id: 'user2', username: 'editor' },
    history: {
      date: new Date('2024-01-02'),
      msg: 'Updated'
    },
    isremoved: false
  };

  beforeEach(async () => {
    mockOrganizationService = {
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as any;

    mockRouter = {
      navigate: jest.fn()
    } as any;

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('123')
        }
      } as any
    };

    await TestBed.configureTestingModule({
      imports: [OrganizationDetailComponent, NoopAnimationsModule],
      providers: [
        { provide: OrganizationsApiService, useValue: mockOrganizationService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load organization on init', () => {
      mockOrganizationService.getById.mockReturnValue(of(mockOrganization));

      component.ngOnInit();

      expect(mockOrganizationService.getById).toHaveBeenCalledWith('123');
      expect(component.organization()).toEqual(mockOrganization);
      expect(component.loading()).toBe(false);
    });

    it('should handle error when loading organization', () => {
      const error = new Error('Load failed');
      mockOrganizationService.getById.mockReturnValue(throwError(() => error));

      component.ngOnInit();

      expect(component.error()).toBe('Failed to load organization');
      expect(component.loading()).toBe(false);
    });
  });

  describe('computed signals', () => {
    beforeEach(() => {
      component.organization.set(mockOrganization);
    });

    it('should compute isActive', () => {
      expect(component.isActive()).toBe(true);
    });

    it('should compute isProspect', () => {
      expect(component.isProspect()).toBe(false);
    });

    it('should compute isCustomer', () => {
      expect(component.isCustomer()).toBe(true);
    });

    it('should compute isSupplier', () => {
      expect(component.isSupplier()).toBe(false);
    });

    it('should compute isSubcontractor', () => {
      expect(component.isSubcontractor()).toBe(false);
    });

    it('should compute showCommercialTab when isCustomer is true', () => {
      expect(component.showCommercialTab()).toBe(true);
    });

    it('should compute showCommercialTab when isProspect is true', () => {
      const prospectOrg = { ...mockOrganization };
      prospectOrg.salesPurchases.isProspect = true;
      prospectOrg.salesPurchases.isCustomer = false;
      component.organization.set(prospectOrg);

      expect(component.showCommercialTab()).toBe(true);
    });

    it('should compute statusCss', () => {
      expect(component.statusCss()).toBe('success');
    });

    it('should compute statusName', () => {
      expect(component.statusName()).toBe('Active');
    });
  });

  describe('toggleActive', () => {
    it('should toggle isActive and update organization', () => {
      component.organization.set(mockOrganization);
      const updatedOrg = { ...mockOrganization };
      updatedOrg.salesPurchases.isActive = false;
      mockOrganizationService.update.mockReturnValue(of(updatedOrg));

      component.toggleActive();

      expect(mockOrganizationService.update).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          salesPurchases: expect.objectContaining({
            isActive: false
          })
        })
      );
    });
  });

  describe('toggleProspect', () => {
    it('should toggle isProspect and set isCustomer to false when enabling', () => {
      component.organization.set(mockOrganization);
      const updatedOrg = { ...mockOrganization };
      updatedOrg.salesPurchases.isProspect = true;
      updatedOrg.salesPurchases.isCustomer = false;
      mockOrganizationService.update.mockReturnValue(of(updatedOrg));

      component.toggleProspect();

      expect(mockOrganizationService.update).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          salesPurchases: expect.objectContaining({
            isProspect: true,
            isCustomer: false
          })
        })
      );
    });
  });

  describe('toggleCustomer', () => {
    it('should toggle isCustomer and set isProspect to false when enabling', () => {
      const prospectOrg = { ...mockOrganization };
      prospectOrg.salesPurchases.isProspect = true;
      prospectOrg.salesPurchases.isCustomer = false;
      component.organization.set(prospectOrg);

      const updatedOrg = { ...prospectOrg };
      updatedOrg.salesPurchases.isCustomer = true;
      updatedOrg.salesPurchases.isProspect = false;
      mockOrganizationService.update.mockReturnValue(of(updatedOrg));

      component.toggleCustomer();

      expect(mockOrganizationService.update).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          salesPurchases: expect.objectContaining({
            isCustomer: true,
            isProspect: false
          })
        })
      );
    });
  });

  describe('toggleSupplier', () => {
    it('should toggle isSupplier', () => {
      component.organization.set(mockOrganization);
      const updatedOrg = { ...mockOrganization };
      updatedOrg.salesPurchases.isSupplier = true;
      mockOrganizationService.update.mockReturnValue(of(updatedOrg));

      component.toggleSupplier();

      expect(mockOrganizationService.update).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          salesPurchases: expect.objectContaining({
            isSupplier: true
          })
        })
      );
    });
  });

  describe('toggleSubcontractor', () => {
    it('should toggle isSubcontractor', () => {
      component.organization.set(mockOrganization);
      const updatedOrg = { ...mockOrganization };
      updatedOrg.salesPurchases.isSubcontractor = true;
      mockOrganizationService.update.mockReturnValue(of(updatedOrg));

      component.toggleSubcontractor();

      expect(mockOrganizationService.update).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          salesPurchases: expect.objectContaining({
            isSubcontractor: true
          })
        })
      );
    });
  });

  describe('deleteOrganization', () => {
    it('should delete organization and navigate to list', () => {
      component.organization.set(mockOrganization);
      mockOrganizationService.delete.mockReturnValue(of(void 0));
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      component.deleteOrganization();

      expect(mockOrganizationService.delete).toHaveBeenCalledWith('123');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/organizations']);
    });

    it('should not delete if user cancels confirmation', () => {
      component.organization.set(mockOrganization);
      jest.spyOn(window, 'confirm').mockReturnValue(false);

      component.deleteOrganization();

      expect(mockOrganizationService.delete).not.toHaveBeenCalled();
    });

    it('should handle delete error', () => {
      component.organization.set(mockOrganization);
      const error = new Error('Delete failed');
      mockOrganizationService.delete.mockReturnValue(throwError(() => error));
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      component.deleteOrganization();

      expect(component.error()).toBe('Failed to delete organization');
    });
  });

  describe('cloneOrganization', () => {
    it('should log clone action', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      component.cloneOrganization();
      expect(consoleSpy).toHaveBeenCalledWith('Clone organization');
    });
  });

  describe('progressValue', () => {
    it('should return 60', () => {
      expect(component.progressValue).toBe(60);
    });
  });
});
