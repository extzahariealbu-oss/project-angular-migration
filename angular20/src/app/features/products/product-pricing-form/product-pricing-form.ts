import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Product } from '../../../shared/models/product.model';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-pricing-form',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule
  ],
  templateUrl: './product-pricing-form.html',
  styleUrls: ['./product-pricing-form.scss']
})
export class ProductPricingFormComponent implements OnInit {
  @Input() product!: Product;

  priceLists = signal<any[]>([]);
  taxes = signal<any[]>([]);
  
  // Evidence: price.html:91 - AngularJS uses product.taxes[0].taxeId._id
  taxRateId: string | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    // Initialize prices structure if missing
    this.initializePrices();
    // Load price lists and taxes from dictionaries
    this.loadPriceLists();
    this.loadTaxes();
    this.syncTaxFromProduct();
  }

  private initializePrices(): void {
    // Ensure prices object exists with required fields
    if (!this.product.prices) {
      this.product.prices = {
        pu_ht: 0,
        tva_tx: 0,
        pricesQty: {}
      };
    }
    // Initialize directCost (buy price) if missing - Evidence: price.html:300
    if (this.product.directCost === undefined) {
      this.product.directCost = 0;
    }
  }

  private loadPriceLists(): void {
    this.productService.getPriceLists().subscribe({
      next: (lists) => this.priceLists.set(lists)
    });
  }

  private loadTaxes(): void {
    this.productService.getTaxes().subscribe({
      next: (taxes) => {
        this.taxes.set(taxes);
        this.syncTaxFromProduct();
      }
    });
  }

  private syncTaxFromProduct(): void {
    // Initialize product.taxes array if missing
    if (!this.product.taxes || !Array.isArray(this.product.taxes)) {
      this.product.taxes = [{ taxeId: '' }];
    }
    
    // Sync taxRateId from product.taxes[0].taxeId (string or object with _id)
    if (this.product.taxes[0]?.taxeId) {
      this.taxRateId = typeof this.product.taxes[0].taxeId === 'string'
        ? this.product.taxes[0].taxeId
        : (this.product.taxes[0].taxeId as any)?._id || null;
    }
  }

  onTaxRateChange(taxId: string | null): void {
    // Store the selected _id in product.taxes[0].taxeId
    if (!this.product.taxes || !this.product.taxes[0]) {
      this.product.taxes = [{ taxeId: '' }];
    }
    this.product.taxes[0].taxeId = taxId || '';
  }

  getCurrentTaxRate(): number {
    // Get the actual tax rate percentage from the taxes list
    if (!this.taxRateId) return 0;
    const tax = this.taxes().find(t => t._id === this.taxRateId);
    return tax?.rate || 0;
  }

  calculatePriceWithTax(): number {
    // Calculate price including tax (TTC = HT × (1 + rate/100))
    const priceHT = Number(this.product?.prices?.pu_ht ?? 0);
    const taxRate = this.getCurrentTaxRate();
    const total = priceHT * (1 + taxRate / 100);
    return Number.isFinite(total) ? total : 0;
  }

  calculateMargin(): number {
    // Evidence: price.html:262-268 - Margin = (Sell - Cost) / Cost * 100
    const sellPrice = Number(this.product?.prices?.pu_ht ?? 0);
    const cost = Number(this.product?.directCost ?? 0);
    if (cost === 0) return 0;
    return ((sellPrice - cost) / cost) * 100;
  }

  calculateMarginAmount(): number {
    // Margin amount in currency
    const sellPrice = Number(this.product?.prices?.pu_ht ?? 0);
    const cost = Number(this.product?.directCost ?? 0);
    return sellPrice - cost;
  }

  getQuantityPrices(): { key: string; value: number }[] {
    // Convert pricesQty object to array for mat-table
    if (!this.product.prices?.pricesQty) return [];
    return Object.entries(this.product.prices.pricesQty).map(([key, value]) => ({
      key,
      value: value as number
    }));
  }
}
