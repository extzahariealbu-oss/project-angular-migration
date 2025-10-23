import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { of } from 'rxjs';
import { CommercialTabComponent } from './commercial-tab.component';
import { OrganizationsApiService } from '../../services/organizations-api.service';
import { Organization } from '../../models/organization.model';

describe('CommercialTabComponent', () => {
  let component: CommercialTabComponent;
  let fixture: ComponentFixture<CommercialTabComponent>;
  let apiService: jest.Mocked<OrganizationsApiService>;

  const mockOrganization: Organization = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Company',
    salesPurchases: {
      ref: 'CU001',
      salesPerson: 'user123',
      rival: 'Competitor Inc',
      priceList: 'pricelist1',
      isCustomer: true,
      isProspect: false,
      isSupplier: false,
      isSubcontractor: false
    },
    companyInfo: {
      category: 'cat1',
      forme_juridique: 54,
      size: 2,
      idprof2: '12345678901234',
      idprof3: '1234Z',
      capital: '100000'
    },
    internalNotes: {
      new: '# Test Notes\n\nSome markdown content',
      old: '',
      datec: new Date('2025-01-15').toISOString(),
      author: {
        _id: 'author1',
        name: 'John Doe'
      }
    }
  };

  const mockEmployees = [
    { _id: 'user123', name: 'Alice Smith' },
    { _id: 'user456', name: 'Bob Johnson' }
  ];

  beforeEach(async () => {
    const apiServiceMock = {
      userAutocomplete: jest.fn().mockReturnValue(of(mockEmployees.map(e => ({
        value: e._id,
        label: e.name
      }))))
    };

    await TestBed.configureTestingModule({
      imports: [
        CommercialTabComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatCardModule
      ],
      providers: [
        { provide: OrganizationsApiService, useValue: apiServiceMock }
      ]
    }).compileComponents();

    apiService = TestBed.inject(OrganizationsApiService) as jest.Mocked<OrganizationsApiService>;
    fixture = TestBed.createComponent(CommercialTabComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    fixture.componentRef.setInput('organization', mockOrganization);
    fixture.componentRef.setInput('canEdit', true);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize form with organization data', () => {
      expect(component.form.value).toEqual({
        salesPerson: 'user123',
        category: 'cat1',
        forme_juridique: 54,
        size: 2,
        rival: 'Competitor Inc',
        idprof2: '12345678901234',
        idprof3: '1234Z',
        capital: '100000',
        priceList: 'pricelist1'
      });
    });

    it('should initialize notes form with internal notes', () => {
      expect(component.notesForm.value.notes).toBe('# Test Notes\n\nSome markdown content');
    });

    it('should load employees dictionary on init', () => {
      expect(apiService.userAutocomplete).toHaveBeenCalledWith('');
      expect(component.employees().length).toBe(2);
      expect(component.employees()[0]).toEqual({ _id: 'user123', name: 'Alice Smith' });
    });

    it('should have juridical statuses dictionary', () => {
      expect(component.juridicalStatuses().length).toBeGreaterThan(0);
      expect(component.juridicalStatuses()[0]).toEqual({ id: 0, label: 'Indéterminé' });
    });

    it('should have staff sizes dictionary', () => {
      expect(component.staffSizes().length).toBe(8);
      expect(component.staffSizes()[1]).toEqual({ id: 1, label: '1-10' });
    });
  });

  describe('Form Validation', () => {
    it('should have valid form with all optional fields', () => {
      expect(component.form.valid).toBe(true);
    });

    it('should accept empty rival field', () => {
      component.form.patchValue({ rival: '' });
      expect(component.form.valid).toBe(true);
    });

    it('should accept empty professional IDs', () => {
      component.form.patchValue({ idprof2: '', idprof3: '' });
      expect(component.form.valid).toBe(true);
    });
  });

  describe('Save Functionality', () => {
    it('should emit save event with updated values', () => {
      const saveSpy = jest.fn();
      component.save.subscribe(saveSpy);

      component.form.patchValue({
        salesPerson: 'user456',
        rival: 'New Competitor'
      });

      component.handleSave();

      expect(saveSpy).toHaveBeenCalledWith({
        salesPurchases: expect.objectContaining({
          salesPerson: 'user456',
          rival: 'New Competitor'
        }),
        companyInfo: expect.any(Object)
      });
    });

    it('should not save when form is invalid', () => {
      const saveSpy = jest.fn();
      component.save.subscribe(saveSpy);

      component.form.setErrors({ invalid: true });
      component.handleSave();

      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should not save when canEdit is false', () => {
      const saveSpy = jest.fn();
      component.save.subscribe(saveSpy);

      fixture.componentRef.setInput('canEdit', false);
      fixture.detectChanges();

      component.handleSave();

      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Functionality', () => {
    it('should emit cancel event', () => {
      const cancelSpy = jest.fn();
      component.cancel.subscribe(cancelSpy);

      component.handleCancel();

      expect(cancelSpy).toHaveBeenCalled();
    });

    it('should reset form on cancel', () => {
      component.form.patchValue({ rival: 'Changed Value' });
      component.handleCancel();

      expect(component.form.value.rival).toBeNull();
    });
  });

  describe('Notes Editor', () => {
    it('should compute last modified info', () => {
      const info = component.lastModifiedInfo();
      expect(info).toContain('15/01/2025');
      expect(info).toContain('John Doe');
    });

    it('should start editing notes', () => {
      expect(component.isEditingNotes()).toBe(false);
      component.startEditingNotes();
      expect(component.isEditingNotes()).toBe(true);
    });

    it('should save notes and emit update', () => {
      const saveSpy = jest.fn();
      component.save.subscribe(saveSpy);

      component.notesForm.patchValue({ notes: 'Updated notes' });
      component.saveNotes();

      expect(saveSpy).toHaveBeenCalledWith({
        internalNotes: expect.objectContaining({
          new: 'Updated notes',
          old: '# Test Notes\n\nSome markdown content'
        })
      });
    });

    it('should cancel notes edit and restore original', () => {
      component.startEditingNotes();
      component.notesForm.patchValue({ notes: 'Changed notes' });
      component.cancelNotesEdit();

      expect(component.isEditingNotes()).toBe(false);
      expect(component.notesForm.value.notes).toBe('# Test Notes\n\nSome markdown content');
    });

    it('should not save notes when canEdit is false', () => {
      const saveSpy = jest.fn();
      component.save.subscribe(saveSpy);

      fixture.componentRef.setInput('canEdit', false);
      fixture.detectChanges();

      component.saveNotes();

      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('Price List Actions', () => {
    it('should log navigation to price list', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      component.navigateToPriceList('pricelist1');
      expect(consoleSpy).toHaveBeenCalledWith('Navigate to price list:', 'pricelist1');
      consoleSpy.mockRestore();
    });

    it('should log opening new price list modal', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      component.openNewPriceListModal();
      expect(consoleSpy).toHaveBeenCalledWith('Open new price list modal');
      consoleSpy.mockRestore();
    });
  });

  describe('Input Changes', () => {
    it('should update form when organization input changes', () => {
      const updatedOrg: Organization = {
        ...mockOrganization,
        salesPurchases: {
          ...mockOrganization.salesPurchases!,
          salesPerson: 'newUser',
          rival: 'New Rival'
        }
      };

      fixture.componentRef.setInput('organization', updatedOrg);
      fixture.detectChanges();

      expect(component.form.value.salesPerson).toBe('newUser');
      expect(component.form.value.rival).toBe('New Rival');
    });

    it('should handle organization without optional nested fields', () => {
      const minimalOrg: Organization = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Minimal Company'
      };

      fixture.componentRef.setInput('organization', minimalOrg);
      fixture.detectChanges();

      expect(component.form.value.salesPerson).toBeNull();
      expect(component.form.value.rival).toBe('');
    });
  });
});
