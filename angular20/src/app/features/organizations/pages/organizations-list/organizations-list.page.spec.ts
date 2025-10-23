import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { OrganizationsListPage } from './organizations-list.page';
import { OrganizationsApiService } from '../../services/organizations-api.service';
import { Organization } from '../../models/organization.model';

describe('OrganizationsListPage', () => {
  let component: OrganizationsListPage;
  let fixture: ComponentFixture<OrganizationsListPage>;
  let mockApiService: jest.Mocked<OrganizationsApiService>;

  const mockOrganizations: Organization[] = [
    {
      _id: '1',
      name: 'Acme Corp',
      salesPurchases: {
        ref: 'ACME001',
        isCustomer: true,
        isProspect: false,
        isSupplier: false,
        isSubcontractor: false
      },
      address: {
        zip: '75001',
        city: 'Paris'
      },
      createdAt: new Date('2024-01-01T00:00:00Z')
    } as Organization
  ];

  beforeEach(async () => {
    mockApiService = {
      listDataTable: jest.fn().mockReturnValue(of({
        data: mockOrganizations,
        total: 1,
        page: 0,
        limit: 25
      })),
      delete: jest.fn().mockReturnValue(of(void 0))
    } as unknown as jest.Mocked<OrganizationsApiService>;

    await TestBed.configureTestingModule({
      imports: [OrganizationsListPage],
      providers: [
        provideRouter([]),
        provideAnimations(),
        { provide: OrganizationsApiService, useValue: mockApiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationsListPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch data on init', fakeAsync(() => {
    fixture.detectChanges();
    tick(100);

    expect(mockApiService.listDataTable).toHaveBeenCalledWith(
      'Company',
      expect.objectContaining({
        limit: 25,
        page: 0
      })
    );
  }));

  it('should refetch on filter change', fakeAsync(() => {
    fixture.detectChanges();
    tick(100);
    jest.clearAllMocks();

    component.filtersSig.set({ search: 'test' });
    tick(100);

    expect(mockApiService.listDataTable).toHaveBeenCalledWith(
      'Company',
      expect.objectContaining({
        quickSearch: 'test'
      })
    );
  }));

  it('should clear selection on query change', fakeAsync(() => {
    fixture.detectChanges();
    tick(100);

    component.selection.select(mockOrganizations[0]);
    expect(component.selection.selected.length).toBe(1);

    component.filtersSig.set({ search: 'test' });
    fixture.detectChanges();

    expect(component.selection.selected.length).toBe(0);
  }));

  it('should navigate to detail on row click', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.navigateToDetail(mockOrganizations[0]);

    expect(navigateSpy).toHaveBeenCalledWith(['/organizations', '1']);
  });

  it('should show export placeholder message', fakeAsync(() => {
    const snackBar = TestBed.inject(MatSnackBar);
    const openSpy = jest.spyOn(snackBar, 'open');

    component.exportToXLS();
    tick();

    expect(openSpy).toHaveBeenCalledWith('Export feature coming soon', 'Close', { duration: 3000 });
  }));

  it('should bulk delete selected items', fakeAsync(() => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    component.selection.select(mockOrganizations[0]);
    component.bulkDelete();
    tick();

    expect(mockApiService.delete).toHaveBeenCalledWith(['1']);
    expect(component.selection.selected.length).toBe(0);
  }));
});
