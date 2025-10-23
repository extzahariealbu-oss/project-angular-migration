import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { BillingTabComponent } from './billing-tab.component';
import { Organization } from '../../models/organization.model';

describe('BillingTabComponent', () => {
  let component: BillingTabComponent;
  let fixture: ComponentFixture<BillingTabComponent>;

  const mockOrganization: Organization = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Company',
    salesPurchases: {
      ref: 'CU001',
      isCustomer: true,
      isProspect: false,
      isSupplier: false,
      isSubcontractor: false,
      customerAccount: '411TEST',
      supplierAccount: '',
      VATIsUsed: true,
      cond_reglement: '2',
      mode_reglement: 'VIR',
      bank_reglement: 'bank123'
    },
    companyInfo: {
      idprof6: 'FR12345678901'
    },
    iban: {
      bank: 'BNP Paribas',
      id: 'FR7630004000031234567890143',
      bic: 'BNPAFRPPXXX'
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BillingTabComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatTabsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BillingTabComponent);
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
        customerAccount: '411TEST',
        supplierAccount: '',
        idprof6: 'FR12345678901',
        VATIsUsed: true,
        cond_reglement: '2',
        mode_reglement: 'VIR',
        bank_reglement: 'bank123',
        bankName: 'BNP Paribas',
        iban: 'FR7630004000031234567890143',
        bic: 'BNPAFRPPXXX'
      });
    });

    it('should have payment terms dictionary', () => {
      expect(component.paymentTerms().length).toBeGreaterThan(0);
      expect(component.paymentTerms()[0]).toEqual({ id: '1', label: 'À réception' });
    });

    it('should have payment modes dictionary', () => {
      expect(component.paymentModes().length).toBeGreaterThan(0);
      expect(component.paymentModes()[0]).toEqual({ id: 'CHQ', label: 'Chèque' });
    });

    it('should compute showCustomerAccount correctly', () => {
      expect(component.showCustomerAccount()).toBe(true);
    });

    it('should compute showSupplierAccount correctly for supplier', () => {
      const supplierOrg: Organization = {
        ...mockOrganization,
        salesPurchases: {
          ...mockOrganization.salesPurchases!,
          isCustomer: false,
          isSupplier: true
        }
      };
      fixture.componentRef.setInput('organization', supplierOrg);
      fixture.detectChanges();
      expect(component.showSupplierAccount()).toBe(true);
    });

    it('should compute showSupplierAccount correctly for subcontractor', () => {
      const subcontractorOrg: Organization = {
        ...mockOrganization,
        salesPurchases: {
          ...mockOrganization.salesPurchases!,
          isCustomer: false,
          isSubcontractor: true
        }
      };
      fixture.componentRef.setInput('organization', subcontractorOrg);
      fixture.detectChanges();
      expect(component.showSupplierAccount()).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should have valid form with all optional fields', () => {
      expect(component.form.valid).toBe(true);
    });

    it('should validate customerAccount maxlength', () => {
      const control = component.form.get('customerAccount');
      control?.setValue('12345678901'); // 11 chars
      expect(control?.hasError('maxlength')).toBe(true);
    });

    it('should accept customerAccount with 10 chars', () => {
      const control = component.form.get('customerAccount');
      control?.setValue('1234567890'); // 10 chars
      expect(control?.hasError('maxlength')).toBe(false);
    });

    it('should validate supplierAccount maxlength', () => {
      const control = component.form.get('supplierAccount');
      control?.setValue('12345678901'); // 11 chars
      expect(control?.hasError('maxlength')).toBe(true);
    });

    it('should accept empty account codes', () => {
      component.form.patchValue({
        customerAccount: '',
        supplierAccount: ''
      });
      expect(component.form.valid).toBe(true);
    });
  });

  describe('Save Functionality', () => {
    it('should emit save event with updated values', () => {
      const saveSpy = jest.fn();
      component.save.subscribe(saveSpy);

      component.form.patchValue({
        customerAccount: '411NEW',
        cond_reglement: '3'
      });

      component.handleSave();

      expect(saveSpy).toHaveBeenCalledWith({
        salesPurchases: expect.objectContaining({
          customerAccount: '411NEW',
          cond_reglement: '3'
        }),
        companyInfo: expect.objectContaining({
          idprof6: 'FR12345678901'
        }),
        iban: expect.objectContaining({
          bank: 'BNP Paribas',
          id: 'FR7630004000031234567890143',
          bic: 'BNPAFRPPXXX'
        })
      });
    });

    it('should not save when form is invalid', () => {
      const saveSpy = jest.fn();
      component.save.subscribe(saveSpy);

      component.form.get('customerAccount')?.setValue('12345678901'); // Invalid
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
      component.form.patchValue({ customerAccount: 'CHANGED' });
      component.handleCancel();

      expect(component.form.value.customerAccount).toBeNull();
    });
  });

  describe('Payment Actions', () => {
    it('should log add payment action', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      component.addPayment();
      expect(consoleSpy).toHaveBeenCalledWith('Add payment');
      consoleSpy.mockRestore();
    });

    it('should log refresh payments action', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      component.refreshPayments();
      expect(consoleSpy).toHaveBeenCalledWith('Refresh payments');
      consoleSpy.mockRestore();
    });
  });

  describe('Input Changes', () => {
    it('should update form when organization input changes', () => {
      const updatedOrg: Organization = {
        ...mockOrganization,
        salesPurchases: {
          ...mockOrganization.salesPurchases!,
          customerAccount: '411UPDATED',
          cond_reglement: '4'
        }
      };

      fixture.componentRef.setInput('organization', updatedOrg);
      fixture.detectChanges();

      expect(component.form.value.customerAccount).toBe('411UPDATED');
      expect(component.form.value.cond_reglement).toBe('4');
    });

    it('should handle organization without optional nested fields', () => {
      const minimalOrg: Organization = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Minimal Company'
      };

      fixture.componentRef.setInput('organization', minimalOrg);
      fixture.detectChanges();

      expect(component.form.value.customerAccount).toBe('');
      expect(component.form.value.VATIsUsed).toBe(true); // Default value
    });

    it('should handle missing iban field', () => {
      const orgWithoutIban: Organization = {
        ...mockOrganization,
        iban: undefined
      };

      fixture.componentRef.setInput('organization', orgWithoutIban);
      fixture.detectChanges();

      expect(component.form.value.bankName).toBe('');
      expect(component.form.value.iban).toBe('');
      expect(component.form.value.bic).toBe('');
    });
  });
});
