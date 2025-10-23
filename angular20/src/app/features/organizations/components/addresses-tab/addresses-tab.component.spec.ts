import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';
import { AddressesTabComponent, Contact } from './addresses-tab.component';
import { Organization, Address } from '../../models/organization.model';

describe('AddressesTabComponent', () => {
  let component: AddressesTabComponent;
  let fixture: ComponentFixture<AddressesTabComponent>;

  const mockOrganization: Organization = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Company',
    type: 'Company'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AddressesTabComponent,
        NoopAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatRadioModule,
        MatBadgeModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddressesTabComponent);
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
    it('should initialize with empty contacts', () => {
      expect(component.contacts().length).toBe(0);
    });

    it('should initialize with empty addresses', () => {
      expect(component.addresses().length).toBe(0);
    });

    it('should have correct table columns', () => {
      expect(component.displayedColumns).toEqual([
        'default',
        'name',
        'address',
        'zip',
        'town',
        'status',
        'contact',
        'phone',
        'email',
        'actions'
      ]);
    });
  });

  describe('Type Detection', () => {
    it('should return true for Company type', () => {
      expect(component.isCompanyType()).toBe(true);
    });

    it('should return false for Person type', () => {
      const personOrg: Organization = {
        ...mockOrganization,
        type: 'Person'
      };
      fixture.componentRef.setInput('organization', personOrg);
      fixture.detectChanges();
      
      expect(component.isCompanyType()).toBe(false);
    });

    it('should return false for undefined type', () => {
      const noTypeOrg: Organization = {
        ...mockOrganization,
        type: undefined
      };
      fixture.componentRef.setInput('organization', noTypeOrg);
      fixture.detectChanges();
      
      expect(component.isCompanyType()).toBe(false);
    });
  });

  describe('Contact Actions', () => {
    it('should emit addContact event', () => {
      const addSpy = jest.fn();
      component.addContact.subscribe(addSpy);

      component.handleAddContact();

      expect(addSpy).toHaveBeenCalled();
    });

    it('should emit deleteContact event with confirmation', () => {
      const deleteSpy = jest.fn();
      component.deleteContact.subscribe(deleteSpy);
      
      // Mock confirm to return true
      global.confirm = jest.fn(() => true);

      component.handleDeleteContact('contact123');

      expect(global.confirm).toHaveBeenCalledWith('Êtes-vous sûr de vouloir supprimer ce contact ?');
      expect(deleteSpy).toHaveBeenCalledWith('contact123');
    });

    it('should not emit deleteContact if confirmation cancelled', () => {
      const deleteSpy = jest.fn();
      component.deleteContact.subscribe(deleteSpy);
      
      // Mock confirm to return false
      global.confirm = jest.fn(() => false);

      component.handleDeleteContact('contact123');

      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should log refresh contacts', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      component.handleRefreshContacts();
      
      expect(consoleSpy).toHaveBeenCalledWith('Refresh contacts');
      consoleSpy.mockRestore();
    });
  });

  describe('Address Actions', () => {
    it('should emit addAddress event', () => {
      const addSpy = jest.fn();
      component.addAddress.subscribe(addSpy);

      component.handleAddAddress();

      expect(addSpy).toHaveBeenCalled();
    });

    it('should emit editAddress event', () => {
      const editSpy = jest.fn();
      component.editAddress.subscribe(editSpy);

      const address: Address = {
        name: 'Main Office',
        street: '123 Main St',
        city: 'Paris',
        zip: '75001'
      };

      component.handleEditAddress(address);

      expect(editSpy).toHaveBeenCalledWith(address);
    });

    it('should emit deleteAddress event for non-first address', () => {
      const deleteSpy = jest.fn();
      component.deleteAddress.subscribe(deleteSpy);
      
      global.confirm = jest.fn(() => true);

      component.handleDeleteAddress('address123', false);

      expect(deleteSpy).toHaveBeenCalledWith('address123');
    });

    it('should not delete first address', () => {
      const deleteSpy = jest.fn();
      component.deleteAddress.subscribe(deleteSpy);
      
      global.alert = jest.fn();

      component.handleDeleteAddress('address123', true);

      expect(global.alert).toHaveBeenCalledWith('La première adresse ne peut pas être supprimée.');
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should not emit deleteAddress if confirmation cancelled', () => {
      const deleteSpy = jest.fn();
      component.deleteAddress.subscribe(deleteSpy);
      
      global.confirm = jest.fn(() => false);

      component.handleDeleteAddress('address123', false);

      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should emit setDefaultAddress event', () => {
      const defaultSpy = jest.fn();
      component.setDefaultAddress.subscribe(defaultSpy);

      component.handleSetDefaultAddress('address123');

      expect(defaultSpy).toHaveBeenCalledWith('address123');
    });

    it('should log refresh addresses', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      component.handleRefreshAddresses();
      
      expect(consoleSpy).toHaveBeenCalledWith('Refresh addresses');
      consoleSpy.mockRestore();
    });
  });

  describe('Data Management', () => {
    it('should allow setting contacts via signal', () => {
      const mockContacts: Contact[] = [
        {
          _id: 'contact1',
          civility: 'M.',
          firstName: 'John',
          lastName: 'Doe',
          phone: '0123456789',
          email: 'john@example.com'
        }
      ];

      component.contacts.set(mockContacts);

      expect(component.contacts().length).toBe(1);
      expect(component.contacts()[0].firstName).toBe('John');
    });

    it('should allow setting addresses via signal', () => {
      const mockAddresses: Address[] = [
        {
          name: 'Main Office',
          street: '123 Main St',
          city: 'Paris',
          zip: '75001',
          Status: 'ENABLE'
        }
      ];

      component.addresses.set(mockAddresses);

      expect(component.addresses().length).toBe(1);
      expect(component.addresses()[0].city).toBe('Paris');
    });
  });
});
