import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ProductService } from '../services/product.service';
import { Product } from '../../../shared/models/product.model';

interface BundleItemPopulated {
  id: {
    _id: string;
    info: {
      SKU: string;
      langs: [{ name: string }];
    };
    directCost: number;
  };
  qty?: number;
}

@Component({
  selector: 'app-product-bundles-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    RouterModule
  ],
  templateUrl: './product-bundles-tab.component.html',
  styleUrl: './product-bundles-tab.component.scss'
})
export class ProductBundlesTabComponent implements OnInit {
  @Input() product!: Product;
  @Output() save = new EventEmitter<void>();

  displayedColumns: string[] = ['sku', 'name', 'qty', 'unitCost', 'total', 'actions'];
  dataSource: BundleItemPopulated[] = [];

  // Add new bundle item form
  productSearchControl = new FormControl('');
  qtyControl = new FormControl(1);
  filteredProducts$!: Observable<any[]>;
  selectedProduct: any = null;

  editingQty: { [key: number]: boolean } = {};

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.dataSource = (this.product.bundles as any) || [];
    this.setupProductAutocomplete();
  }

  setupProductAutocomplete(): void {
    this.filteredProducts$ = this.productSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string' && value.length >= 2) {
          return this.productService.searchProducts(value).pipe(
            map(results => results || [])
          );
        }
        return of([]);
      })
    );
  }

  displayProductFn(product: any): string {
    return product ? product.ref : '';
  }

  onProductSelected(product: any): void {
    this.selectedProduct = product;
  }

  addBundle(): void {
    if (!this.selectedProduct || !this.qtyControl.value) {
      return;
    }

    const newBundle: BundleItemPopulated = {
      id: {
        _id: this.selectedProduct._id,
        info: {
          SKU: this.selectedProduct.ref || this.selectedProduct.info?.SKU,
          langs: [{ name: this.selectedProduct.name || this.selectedProduct.info?.langs?.[0]?.name }]
        },
        directCost: this.selectedProduct.directCost || 0
      },
      qty: this.qtyControl.value
    };

    if (!this.product.bundles) {
      this.product.bundles = [];
    }

    (this.product.bundles as any).push(newBundle);
    this.dataSource = [...(this.product.bundles as any)];
    this.calculateTotalCost();

    // Reset form
    this.productSearchControl.setValue('');
    this.qtyControl.setValue(1);
    this.selectedProduct = null;

    this.save.emit();
  }

  deleteBundle(index: number): void {
    (this.product.bundles as any).splice(index, 1);
    this.dataSource = [...(this.product.bundles as any)];
    this.calculateTotalCost();
    this.save.emit();
  }

  enableQtyEdit(index: number): void {
    this.editingQty[index] = true;
  }

  updateQty(index: number, newQty: number): void {
    if (newQty && newQty > 0) {
      (this.product.bundles as any)[index].qty = newQty;
      this.calculateTotalCost();
      this.save.emit();
    }
    this.editingQty[index] = false;
  }

  calculateTotalCost(): void {
    const bundles = this.product.bundles as any as BundleItemPopulated[];
    this.product.directCost = bundles.reduce((total, bundle) => {
      return total + (bundle.id.directCost * (bundle.qty || 1));
    }, 0);
  }

  getBundleTotal(bundle: BundleItemPopulated): number {
    return bundle.id.directCost * (bundle.qty || 1);
  }

  getTotalCost(): number {
    return this.product.directCost || 0;
  }
}
