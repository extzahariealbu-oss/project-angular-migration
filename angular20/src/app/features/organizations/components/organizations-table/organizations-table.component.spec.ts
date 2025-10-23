import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { SelectionModel } from '@angular/cdk/collections';

import { OrganizationsTableComponent } from './organizations-table.component';
import { Organization } from '../../models/organization.model';

describe('OrganizationsTableComponent', () => {
  let component: OrganizationsTableComponent;
  let fixture: ComponentFixture<OrganizationsTableComponent>;

  const mockOrganizations: Organization[] = [
    {
      _id: '1',
      name: 'Acme Corp',
      salesPurchases: {
        ref: 'ACME001',
        isCustomer: true,
        isProspect: false,
        isSupplier: false,
        isSubcontractor: false,
        salesPerson: 'user1'
      },
      Status: 'ST_NEW',
      address: {
        zip: '75001',
        city: 'Paris'
      },
      companyInfo: {
        idprof2: 'FR12345678901'
      },
      lastOrder: new Date('2024-06-15T10:00:00Z'),
      createdAt: new Date('2024-01-01T00:00:00Z')
    } as Organization,
    {
      _id: '2',
      name: 'Beta Inc',
      salesPurchases: {
        ref: 'BETA002',
        isCustomer: false,
        isProspect: true,
        isSupplier: true,
        isSubcontractor: false
      },
      address: {
        zip: '69001',
        city: 'Lyon'
      },
      createdAt: new Date('2024-02-01T00:00:00Z')
    } as Organization
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationsTableComponent],
      providers: [provideAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationsTableComponent);
    component = fixture.componentInstance;
    component.selection = new SelectionModel<Organization>(true, []);
    component.rows = mockOrganizations;
    component.total = 2;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 12 columns', () => {
    expect(component.displayedColumns.length).toBe(12);
    expect(component.displayedColumns).toEqual([
      'select', 'name', 'ref', 'salesPerson', 'zip', 'city', 'vat',
      'lastOrder', 'createdAt', 'status', 'badges', 'actions'
    ]);
  });

  it('should emit sortChange on sort click', () => {
    const spy = jest.fn();
    component.sortChange.subscribe(spy);

    component.onSortChange({ active: 'name', direction: 'desc' });

    expect(spy).toHaveBeenCalledWith({ active: 'name', direction: 'desc' });
  });

  it('should emit pageChange on page change', () => {
    const spy = jest.fn();
    component.pageChange.subscribe(spy);

    component.onPageChange({ pageIndex: 1, pageSize: 50, length: 100 });

    expect(spy).toHaveBeenCalledWith({ index: 1, size: 50 });
  });

  it('should toggle row selection', () => {
    const row = mockOrganizations[0];
    
    component.selection.toggle(row);
    expect(component.selection.isSelected(row)).toBe(true);
    
    component.selection.toggle(row);
    expect(component.selection.isSelected(row)).toBe(false);
  });

  it('should emit rowClick on row click', () => {
    const spy = jest.fn();
    component.rowClick.subscribe(spy);

    component.onRowClick(mockOrganizations[0]);

    expect(spy).toHaveBeenCalledWith(mockOrganizations[0]);
  });

  it('should select all rows', () => {
    component.toggleAll();
    expect(component.selection.selected.length).toBe(2);
    expect(component.isAllSelected()).toBe(true);
  });

  it('should deselect all rows', () => {
    component.toggleAll();
    component.toggleAll();
    expect(component.selection.selected.length).toBe(0);
    expect(component.isAllSelected()).toBe(false);
  });

  it('should get sales person ID', () => {
    expect(component.getSalesPerson(mockOrganizations[0])).toBe('user1');
    expect(component.getSalesPerson(mockOrganizations[1])).toBe('-');
  });

  it('should get client reference', () => {
    expect(component.getRef(mockOrganizations[0])).toBe('ACME001');
    expect(component.getRef(mockOrganizations[1])).toBe('BETA002');
  });

  it('should get badges for organization types', () => {
    const badges1 = component.getBadges(mockOrganizations[0]);
    expect(badges1).toEqual(['Customer']);

    const badges2 = component.getBadges(mockOrganizations[1]);
    expect(badges2).toEqual(['Prospect', 'Supplier']);
  });

  it('should get status for customers only', () => {
    expect(component.getStatus(mockOrganizations[0])).toBe('ST_NEW');
    expect(component.getStatus(mockOrganizations[1])).toBeNull();
  });

  it('should handle missing data gracefully', () => {
    const emptyOrg: Organization = {
      _id: '3',
      name: 'Empty Org',
      createdAt: new Date('2024-03-01T00:00:00Z')
    } as Organization;

    expect(component.getRef(emptyOrg)).toBe('-');
    expect(component.getSalesPerson(emptyOrg)).toBe('-');
    expect(component.getZip(emptyOrg)).toBe('-');
    expect(component.getCity(emptyOrg)).toBe('-');
    expect(component.getVat(emptyOrg)).toBe('-');
    expect(component.getBadges(emptyOrg)).toEqual([]);
  });

  it('should track rows by ID', () => {
    const result = component.trackById(0, mockOrganizations[0]);
    expect(result).toBe('1');
  });
});
