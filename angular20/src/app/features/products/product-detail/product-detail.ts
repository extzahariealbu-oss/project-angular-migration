import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../services/product.service';
import { Product, ProductStatus } from '../../../shared/models/product.model';
import { ProductInfoFormComponent } from '../product-info-form/product-info-form';
import { ProductPricingFormComponent } from '../product-pricing-form/product-pricing-form';
import { ProductAttributesTabComponent } from '../product-attributes-tab/product-attributes-tab.component';
import { ProductImagesTabComponent } from '../product-images-tab/product-images-tab.component';
import { ProductCategoriesTabComponent } from '../product-categories-tab/product-categories-tab.component';
import { ProductBundlesTabComponent } from '../product-bundles-tab/product-bundles-tab.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatDividerModule,
    MatToolbarModule,
    MatSnackBarModule,
    ProductInfoFormComponent, 
    ProductPricingFormComponent,
    ProductAttributesTabComponent,
    ProductImagesTabComponent,
    ProductCategoriesTabComponent,
    ProductBundlesTabComponent
  ],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss']
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  loading = signal(false);
  selectedTabIndex = signal(0); // Material tabs use index
  isEditMode = signal(false);
  errorState = signal<string | null>(null);
  
  productId: string | null = null;
  
  // Evidence: fiche.html:514-524 - Language selector
  languages = [
    { idx: 0, code: 'fr', name: 'Français' },
    { idx: 1, code: 'en', name: 'English' }
  ];
  selectedLanguage = signal(0);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Evidence: resources/product.js:42-50, fiche.html:499-502
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id');
      if (this.productId === 'new') {
        this.isEditMode.set(true);
        this.initNewProduct();
      } else if (this.productId) {
        this.loadProduct(this.productId);
      }
    });
  }

  private initNewProduct(): void {
    // Evidence: resources/product.js:58-66 - product.create state
    const newProduct: Partial<Product> = {
      info: {
        isActive: true,
        SKU: '',
        langs: [],
        categories: [],
        taxes: []
      },
      prices: {
        pu_ht: 0,
        pricesQty: {},
        tva_tx: 0
      },
      isActive: true,
      isSell: true,
      isBuy: false,
      quantity: 0
    };
    this.product.set(newProduct as Product);
  }

  private loadProduct(id: string): void {
    // Evidence: fiche.html:499-502 - ng-init="findOne()"
    this.loading.set(true);
    this.errorState.set(null);
    
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: (err) => {
        const errorMessage = err.status === 404 
          ? 'Product not found' 
          : 'Failed to load product';
        this.errorState.set(errorMessage);
        this.showError(errorMessage);
        this.loading.set(false);
      }
    });
  }

  onTabChange(index: number): void {
    // Evidence: fiche.html:164-225 - Tab navigation
    this.selectedTabIndex.set(index);
  }

  setLanguage(idx: number): void {
    // Evidence: fiche.html:514-524
    this.selectedLanguage.set(idx);
  }

  isBundleProduct(prod: Product): boolean {
    if (typeof prod.info?.productType === 'object') {
      return prod.info.productType.isBundle === true;
    }
    return false;
  }

  save(): void {
    const prod = this.product();
    if (!prod) return;

    // Evidence: informations.html:660-665 - save directive with ng-create/ng-update
    this.loading.set(true);
    
    if (this.productId === 'new' || !prod._id) {
      this.productService.create(prod).subscribe({
        next: (created) => {
          // Backend returns {errorNotify} on validation failure
          if ((created as any).errorNotify) {
            const errorMsg = this.extractErrorMessage((created as any).errorNotify.message);
            this.showError(errorMsg);
            this.loading.set(false);
            return;
          }
          if (created._id) {
            this.router.navigate(['/products', created._id]);
          } else {
            this.showError('Product created but ID not returned');
            this.loading.set(false);
          }
        },
        error: (err) => {
          const errorMsg = this.extractErrorMessage(err?.error?.errorNotify?.message);
          this.showError(errorMsg || 'Failed to create product');
          this.loading.set(false);
        }
      });
    } else {
      this.productService.update(prod._id!, prod).subscribe({
        next: (updated) => {
          this.product.set(updated);
          this.loading.set(false);
          this.isEditMode.set(false);
        },
        error: (err) => {
          const errorMsg = this.extractErrorMessage(err?.error?.errorNotify?.message);
          this.showError(errorMsg || 'Failed to update product');
          this.loading.set(false);
        }
      });
    }
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  private extractErrorMessage(error: any): string {
    // Handle various error formats
    if (!error) return '';
    
    // If it's already a string, return it
    if (typeof error === 'string') return error;
    
    // If it's a MongoDB error object
    if (error.message) {
      const msg = error.message;
      // Handle duplicate key errors (E11000)
      if (msg.includes('E11000') || msg.includes('duplicate key')) {
        // Extract field name from: "E11000 duplicate key error collection: ... index: info.SKU_1 dup key: { : "ART1" }"
        const fieldMatch = msg.match(/index:\s*([^\s]+)/);
        const valueMatch = msg.match(/dup key:\s*{[^:]*:\s*"([^"]+)"/);
        const field = fieldMatch ? fieldMatch[1].replace(/_1$/, '') : 'field';
        const value = valueMatch ? valueMatch[1] : '';
        return `Duplicate ${field}: "${value}" already exists`;
      }
      return msg;
    }
    
    // If it's an error object with errmsg
    if (error.errmsg) return error.errmsg;
    
    // Fallback: try to stringify
    try {
      return JSON.stringify(error);
    } catch {
      return 'An error occurred';
    }
  }

  clone(): void {
    // Evidence: fiche.html:67-70 - Clone tool
    const prod = this.product();
    if (!prod?._id) return;
    
    this.productService.clone(prod._id).subscribe({
      next: (cloned) => {
        this.router.navigate(['/products', cloned._id]);
      },
      error: () => {
        this.showError('Failed to clone product');
      }
    });
  }

  delete(): void {
    // Evidence: fiche.html:88-91 - Delete tool with confirmed-click
    const prod = this.product();
    if (!prod?._id) return;

    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.delete(prod._id).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: () => {
          this.showError('Failed to delete product');
        }
      });
    }
  }

  changeStatus(status: ProductStatus): void {
    // Evidence: fiche.html:78-81 - Send/Publish action
    const prod = this.product();
    if (!prod) return;
    
    prod.status = status;
    this.save();
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  getStatusClass(): string {
    // Evidence: fiche.html:551-555 - Status ribbon with dynamic CSS
    const status = this.product()?.status;
    switch (status) {
      case 'PUBLISHED': return 'ribbon-green';
      case 'VALIDATED': return 'ribbon-blue';
      case 'PREPARED': return 'ribbon-yellow';
      case 'DRAFT': return 'ribbon-gray';
      default: return 'ribbon-gray';
    }
  }
}
