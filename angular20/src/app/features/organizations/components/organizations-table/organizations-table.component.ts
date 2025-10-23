import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { Organization } from '../../models/organization.model';

interface SortState {
  active: string;
  direction: 'asc' | 'desc';
}

interface PageState {
  index: number;
  size: number;
}

@Component({
  selector: 'app-organizations-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './organizations-table.component.html',
  styleUrls: ['./organizations-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationsTableComponent {
  @Input() rows: Organization[] = [];
  @Input() total: number = 0;
  @Input() page: PageState = { index: 0, size: 25 };
  @Input() sort: SortState = { active: 'name', direction: 'asc' };
  @Input() selection!: SelectionModel<Organization>;
  @Input() loading: boolean = false;

  @Output() pageChange = new EventEmitter<PageState>();
  @Output() sortChange = new EventEmitter<SortState>();
  @Output() rowClick = new EventEmitter<Organization>();

  displayedColumns: string[] = [
    'select',
    'name',
    'ref',
    'salesPerson',
    'zip',
    'city',
    'vat',
    'lastOrder',
    'createdAt',
    'status',
    'badges',
    'actions'
  ];

  trackById = (index: number, row: Organization): string => row._id ?? `idx-${index}`;

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.rows.length;
    return numSelected === numRows && numRows > 0;
  }

  hasSelection(): boolean {
    return this.selection.selected.length > 0;
  }

  toggleAll(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.rows.forEach(row => this.selection.select(row));
    }
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit({
      active: sort.active,
      direction: sort.direction as 'asc' | 'desc'
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit({
      index: event.pageIndex,
      size: event.pageSize
    });
  }

  onRowClick(row: Organization, event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.rowClick.emit(row);
  }

  getSalesPerson(org: Organization): string {
    // Sales person would come from a separate user lookup in real implementation
    return org.salesPurchases?.salesPerson ?? '-';
  }

  getRef(org: Organization): string {
    return org.salesPurchases?.ref ?? '-';
  }

  getZip(org: Organization): string {
    return org.address?.zip ?? '-';
  }

  getCity(org: Organization): string {
    return org.address?.city ?? '-';
  }

  getVat(org: Organization): string {
    return org.companyInfo?.idprof2 ?? '-';
  }

  getLastOrder(org: Organization): string | null {
    return org.lastOrder ? new Date(org.lastOrder).toISOString() : null;
  }

  getStatus(org: Organization): string | null {
    if (!org.salesPurchases?.isCustomer) return null;
    return org.Status?.name ?? null;
  }

  getBadges(org: Organization): string[] {
    const badges: string[] = [];
    const sp = org.salesPurchases;
    
    if (sp?.isProspect) badges.push('Prospect');
    if (sp?.isCustomer) badges.push('Customer');
    if (sp?.isSupplier) badges.push('Supplier');
    if (sp?.isSubcontractor) badges.push('Subcontractor');
    
    return badges;
  }
}
