import { Component, OnInit, inject, signal, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SelectionModel } from '@angular/cdk/collections';
import { ProductService, ProductQueryParams } from '../services/product.service';
import { Product } from '../../../shared/models/product.model';
import { Subject, debounceTime } from 'rxjs';

// Evidence: /angularjs2/app/views/product/list.html
// Evidence: /angularjs2/app/controllers/product.js

interface FilterValues {
  quickSearch: string;
  sellFamily: string | null;
  status: string | null;
  isActive: boolean | null;
  isSell: { yes: boolean; no: boolean };
  isBuy: { yes: boolean; no: boolean };
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatToolbarModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) matSort!: MatSort;
  private productService = inject(ProductService);
  private router = inject(Router);

  // Material table setup
  dataSource = new MatTableDataSource<Product>([]);
  selection = new SelectionModel<Product>(true, []);
  displayedColumns: string[] = [
    'select',
    'image',
    'sku',
    'type',
    'name',
    'sellPrice',
    'buyCost',
    'weight',
    'updated',
    'rating',
    'status',
    'family'
  ];

  products = signal<Product[]>([]);
  loading = signal(false);
  
  total = signal(0);
  page = signal(1);
  limit = signal(50);
  
  filters: FilterValues = {
    quickSearch: '',
    sellFamily: null,
    status: null,
    isActive: null,
    isSell: { yes: false, no: false },
    isBuy: { yes: false, no: false }
  };
  
  sort: SortConfig = {
    field: 'updatedAt',
    direction: 'desc'
  };
  
  selectedProducts = signal<Set<string>>(new Set());
  sellFamilies = signal<any[]>([]);
  statusOptions = signal<any[]>([
    { id: 'SELL', label: 'For Sale' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'DRAFT', label: 'Draft' }
  ]);
  
  private searchSubject = new Subject<void>();

  ngOnInit(): void {
    this.loadSellFamilies();
    this.find(false);
    
    // Evidence: list.html:78-81 (debounced search)
    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.find(false);
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.matSort;
  }

  // Evidence: /angularjs2/app/controllers/product.js find() method
  find(force: boolean = false): void {
    this.loading.set(true);
    
    const params: ProductQueryParams = {
      limit: this.limit(),
      page: this.page(),
      skip: (this.page() - 1) * this.limit(),
      search: this.filters.quickSearch || undefined,
      sort: `${this.sort.direction === 'desc' ? '-' : ''}${this.sort.field}`,
      filter: this.buildFilter()
    };
    
    this.productService.query(params).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.dataSource.data = response.data;
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading.set(false);
      }
    });
  }

  // Evidence: list.html:85-88, 95-98, 106-155
  private buildFilter(): any {
    const filter: any = {};
    
    if (this.filters.sellFamily) {
      filter.sellFamily = this.filters.sellFamily;
    }
    
    if (this.filters.status) {
      filter.Status = this.filters.status;
    }
    
    if (this.filters.isActive !== null) {
      filter.isActive = this.filters.isActive;
    }
    
    if (this.filters.isSell.yes || this.filters.isSell.no) {
      filter.isSell = [];
      if (this.filters.isSell.yes) filter.isSell.push(true);
      if (this.filters.isSell.no) filter.isSell.push(false);
    }
    
    if (this.filters.isBuy.yes || this.filters.isBuy.no) {
      filter.isBuy = [];
      if (this.filters.isBuy.yes) filter.isBuy.push(true);
      if (this.filters.isBuy.no) filter.isBuy.push(false);
    }
    
    return Object.keys(filter).length > 0 ? filter : undefined;
  }

  // Evidence: list.html:152-170
  loadSellFamilies(): void {
    this.productService.getProductFamilies(false).subscribe({
      next: (families) => {
        this.sellFamilies.set(families);
      },
      error: (err) => console.error('Error loading families:', err)
    });
  }

  // Evidence: list.html:78-81
  onQuickSearchChange(): void {
    this.searchSubject.next();
  }

  // Evidence: list.html:85-88, 95-98, 106-155
  onFilterChange(): void {
    this.page.set(1);
    this.find(false);
  }

  // Evidence: list.html:187-190
  resetFilter(): void {
    this.filters = {
      quickSearch: '',
      sellFamily: null,
      status: null,
      isActive: null,
      isSell: { yes: false, no: false },
      isBuy: { yes: false, no: false }
    };
    this.page.set(1);
    this.find(false);
  }

  // Evidence: list.html:246-254
  sortBy(field: string): void {
    if (this.sort.field === field) {
      this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sort.field = field;
      this.sort.direction = 'asc';
    }
    this.find(false);
  }

  // Evidence: list.html:223, 287
  onPageChange(newPage: number): void {
    this.page.set(newPage);
    this.find(false);
  }

  // Evidence: list.html:261-283
  navigateToDetail(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  // Evidence: list.html:63
  createProduct(): void {
    this.router.navigate(['/products', 'new']);
  }

  // Evidence: list.html:25-27
  printList(): void {
    window.print();
  }

  // Evidence: list.html:29-31
  refreshAllProducts(): void {
    this.loading.set(true);
    this.productService.refreshAllProducts().subscribe({
      next: () => {
        this.find(true);
      },
      error: (err) => {
        console.error('Error refreshing products:', err);
        this.loading.set(false);
      }
    });
  }

  // Evidence: list.html:34-36
  exportToExcel(): void {
    const url = this.productService.getExportUrl(this.filters.quickSearch);
    window.location.href = url;
  }

  // Evidence: list.html:240-256 (checkbox selection)
  toggleProductSelection(productId: string): void {
    const selected = this.selectedProducts();
    if (selected.has(productId)) {
      selected.delete(productId);
    } else {
      selected.add(productId);
    }
    this.selectedProducts.set(new Set(selected));
  }

  toggleSelectAll(): void {
    const selected = this.selectedProducts();
    if (selected.size === this.products().length) {
      this.selectedProducts.set(new Set());
    } else {
      this.selectedProducts.set(new Set(this.products().map(p => p._id!)));
    }
  }

  isSelected(productId: string): boolean {
    return this.selectedProducts().has(productId);
  }

  // Evidence: list.html:262 (image thumbnail)
  getProductImageUrl(product: Product): string {
    if (product.imageSrc?.imageSrc) {
      return this.productService.getImageUrl(product.imageSrc.imageSrc, 'xs');
    }
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
  }

  // Evidence: list.html:267 (product type name)
  getProductTypeName(product: Product): string {
    return product.ProductTypes?.langs?.[0]?.name || '-';
  }

  // Evidence: list.html:269 (product name)
  getProductName(product: Product): string {
    return product.info?.langs?.[0]?.name || product.name || '-';
  }

  // Evidence: list.html:278 (status label)
  getStatusLabel(product: Product): { css: string; name: string } {
    const status = product.Status;
    if (status && typeof status === 'object' && 'css' in status && 'name' in status && status.css && status.name) {
      return { css: status.css, name: status.name };
    }
    return { css: 'default', name: 'Unknown' };
  }

  // Evidence: list.html:281 (family name)
  getFamilyName(product: Product): string {
    return product.ProductFamily?.langs?.[0]?.name || '-';
  }

  // Evidence: list.html:276 (rating progress)
  getRatingWidth(product: Product): string {
    const rating = product.rating?.total || 0;
    return `${rating}%`;
  }

  getTotalPages(): number {
    const totalPages = Math.ceil(this.total() / this.limit());
    return totalPages > 0 ? totalPages : 1; // Always show at least 1 page
  }

  // Material table selection helpers
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows && numRows > 0;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  checkboxLabel(row?: Product): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }
}
