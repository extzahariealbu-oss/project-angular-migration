import { Component, computed, effect, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { SelectionModel } from '@angular/cdk/collections';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { debounceTime, switchMap, shareReplay, firstValueFrom } from 'rxjs';

import { Organization } from '../../models/organization.model';
import { OrganizationsApiService } from '../../services/organizations-api.service';
import { OrganizationsFiltersComponent } from '../../components/organizations-filters/organizations-filters.component';
import { OrganizationsTableComponent } from '../../components/organizations-table/organizations-table.component';
import { OrganizationsTotalsComponent } from '../../components/organizations-totals/organizations-totals.component';

interface FilterState {
  search?: string;
  salesPerson?: string;
  entity?: string;
  status?: string;
  isProspect?: boolean;
  isCustomer?: boolean;
  isSupplier?: boolean;
  isSubcontractor?: boolean;
  lastOrderFrom?: string;
  lastOrderTo?: string;
  createdFrom?: string;
  createdTo?: string;
}

interface SortState {
  active: string;
  direction: 'asc' | 'desc';
}

interface PageState {
  index: number;
  size: number;
}

interface QueryState {
  filters: FilterState;
  sort: SortState;
  page: PageState;
}

@Component({
  selector: 'app-organizations-list',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    OrganizationsFiltersComponent,
    OrganizationsTableComponent,
    OrganizationsTotalsComponent
  ],
  templateUrl: './organizations-list.page.html',
  styleUrls: ['./organizations-list.page.scss']
})
export class OrganizationsListPage {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private api = inject(OrganizationsApiService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  // State signals
  filtersSig = signal<FilterState>({});
  sortSig = signal<SortState>({ active: 'name', direction: 'asc' });
  pageSig = signal<PageState>({ index: 0, size: 25 });
  selection = new SelectionModel<Organization>(true, []);

  // Computed query
  querySig = computed<QueryState>(() => ({
    filters: this.filtersSig(),
    sort: this.sortSig(),
    page: this.pageSig()
  }));

  // Data fetch with reactive signal
  private fetchData$ = toObservable(this.querySig).pipe(
    debounceTime(100),
    switchMap(query => this.api.listDataTable('Company', {
      quickSearch: query.filters.search,
      filter: {
        salesPerson: query.filters.salesPerson,
        entity: query.filters.entity ? [query.filters.entity] : undefined,
        Status: query.filters.status,
        isProspect: query.filters.isProspect,
        isCustomer: query.filters.isCustomer,
        isSupplier: query.filters.isSupplier,
        isSubcontractor: query.filters.isSubcontractor,
        lastOrder: query.filters.lastOrderFrom || query.filters.lastOrderTo ? {
          start: query.filters.lastOrderFrom ? new Date(query.filters.lastOrderFrom) : undefined,
          end: query.filters.lastOrderTo ? new Date(query.filters.lastOrderTo) : undefined
        } : undefined,
        createdAt: query.filters.createdFrom || query.filters.createdTo ? {
          start: query.filters.createdFrom ? new Date(query.filters.createdFrom) : undefined,
          end: query.filters.createdTo ? new Date(query.filters.createdTo) : undefined
        } : undefined
      },
      sort: { [query.sort.active]: query.sort.direction === 'asc' ? 1 : -1 },
      limit: query.page.size,
      page: query.page.index
    })),
    shareReplay(1)
  );

  dataResource = toSignal(this.fetchData$, {
    initialValue: { data: [], total: 0, page: 0, limit: 25 }
  });

  loading = signal(false);

  constructor() {
    // Clear selection on query change
    effect(() => {
      this.querySig();
      this.selection.clear();
    });

    // Subscribe to query param changes (for menu navigation)
    // Evidence: /angularjs2/app/views/company/list.html L9-16 (forSales, type params)
    this.route.queryParams.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      this.applyQueryParamsToFilters(params);
    });
  }

  private applyQueryParamsToFilters(params: any): void {
    // Clear all filters first
    this.filtersSig.set({});
    
    // Build new filters from query params
    const filters: FilterState = {};

    // Read direct query params
    if (params['search']) filters.search = params['search'];
    if (params['salesPerson']) filters.salesPerson = params['salesPerson'];
    if (params['entity']) filters.entity = params['entity'];
    if (params['status']) filters.status = params['status'];

    // Menu differentiation via query params (Evidence: list.html L9-16)
    // forSales=1 → Customers, forSales=0 → Suppliers, type=Person → Contacts
    if (params['forSales'] === '1') {
      filters.isCustomer = true;
    } else if (params['forSales'] === '0') {
      filters.isSupplier = true;
    }
    
    if (params['type'] === 'Person') {
      filters.entity = 'Person';
    }

    // Apply new filters
    this.filtersSig.set(filters);
  }

  // Evidence: /angularjs2/app/views/company/list.html L327 (ui-sref="societe.show({id:line._id})")
  navigateToDetail(org: Organization): void {
    this.router.navigate(['/organizations', org._id]);
  }

  // Evidence: /angularjs2/app/views/company/list.html L272 (ui-sref="societe.create")
  createNew(): void {
    this.router.navigate(['/organizations', 'new']);
  }

  async exportToXLS(): Promise<void> {
    this.loading.set(true);

    try {
      // Export functionality would use a dedicated export endpoint
      // For now, just show a placeholder message
      this.snackBar.open('Export feature coming soon', 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Export failed', 'Close', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  print(): void {
    window.print();
  }

  async bulkDelete(): Promise<void> {
    const selected = this.selection.selected;

    if (selected.length === 0) return;

    // For now, simple confirm - would use ConfirmDialogComponent in full implementation
    const confirmed = confirm(`Delete ${selected.length} organization(s)?`);
    
    if (!confirmed) return;

    this.loading.set(true);

    try {
      const ids = selected.map(o => o._id).filter((id): id is string => id !== undefined);
      
      // Bulk delete
      await firstValueFrom(this.api.delete(ids));

      this.snackBar.open(`${ids.length} organization(s) deleted`, 'Close', {
        duration: 3000
      });

      this.selection.clear();
      // Refetch triggered automatically by signal
    } catch (error) {
      this.snackBar.open('Delete failed', 'Close', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }
}
