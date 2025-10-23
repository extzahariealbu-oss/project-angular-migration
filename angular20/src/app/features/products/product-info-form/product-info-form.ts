import { Component, Input, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../../shared/models/product.model';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-info-form',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './product-info-form.html',
  styleUrls: ['./product-info-form.scss']
})
export class ProductInfoFormComponent implements OnInit, OnChanges {
  @Input() product!: Product;
  @Input() languageIdx: number = 0;

  productTypes = signal<any[]>([]);
  productFamilies = signal<any[]>([]);
  skuValid = signal<boolean>(true);
  skuChecking = signal<boolean>(false);

  // Evidence: informations.html:45,53 - AngularJS binds to _id, not full object
  productTypeId: string | null = null;
  sellFamilyId: string | null = null;

  constructor(private productService: ProductService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] || changes['languageIdx']) {
      this.initializeProductStructure();
      this.syncIdsFromProduct();
    }
  }

  ngOnInit(): void {
    this.initializeProductStructure();
    // Evidence: informations.html:691-698 - Load product types
    this.loadProductTypes();
    // Evidence: informations.html:702-708 - Load product families
    this.loadProductFamilies();
    this.syncIdsFromProduct();
  }

  private syncIdsFromProduct(): void {
    // Sync productTypeId from product.info.productType (string or object with _id)
    if (this.product?.info?.productType) {
      this.productTypeId = typeof this.product.info.productType === 'string' 
        ? this.product.info.productType 
        : this.product.info.productType._id || null;
    }
    // Sync sellFamilyId from product.sellFamily (string or object with _id)
    if (this.product?.sellFamily) {
      this.sellFamilyId = typeof this.product.sellFamily === 'string'
        ? this.product.sellFamily
        : this.product.sellFamily._id || null;
    }
  }

  onProductTypeChange(typeId: string | null): void {
    if (!this.product.info) return;
    // Store the selected _id in product.info.productType
    this.product.info.productType = typeId || undefined;
  }

  onSellFamilyChange(familyId: string | null): void {
    // Store the selected _id in product.sellFamily
    this.product.sellFamily = familyId || undefined;
  }

  private initializeProductStructure(): void {
    // Initialize product.info.langs array if missing
    if (!this.product) return;
    
    if (!this.product.info) {
      this.product.info = {SKU: '', langs: [{ name: '', description: '' }]};
      return;
    }
    if (!Array.isArray(this.product.info.langs)) {
      this.product.info.langs = [{ name: '', description: '' }];
      return;
    }
    if (!this.product.info.langs[this.languageIdx]) {
      this.product.info.langs[this.languageIdx] = { name: '', description: '' };
    }
  }

  private loadProductTypes(): void {
    this.productService.getProductTypes().subscribe({
      next: (types) => this.productTypes.set(Array.isArray(types) ? types : [])
    });
  }

  private loadProductFamilies(): void {
    this.productService.getProductFamilies().subscribe({
      next: (families) => this.productFamilies.set(Array.isArray(families) ? families : [])
    });
  }

  onSkuChange(): void {
    // Evidence: informations.html:679-687, ProductController.js - SKU validation with isValidRef()
    const sku = this.product.info?.SKU;
    if (!sku || sku.length === 0) {
      this.skuValid.set(true);
      return;
    }

    this.skuChecking.set(true);
    this.productService.checkSkuExists(sku, this.product._id).subscribe({
      next: (exists) => {
        this.skuValid.set(!exists);
        this.skuChecking.set(false);
      },
      error: () => {
        this.skuChecking.set(false);
      }
    });
  }
}
