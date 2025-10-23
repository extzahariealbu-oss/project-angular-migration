import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { ProductService } from '../services/product.service';
import { Product } from '../../../shared/models/product.model';

interface Category {
  _id: string;
  langs: Array<{
    name: string;
    linker: string;
    description?: string;
  }>;
  nodes: Category[];
  productsCount: number;
}

@Component({
  selector: 'app-product-categories-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatBadgeModule
  ],
  templateUrl: './product-categories-tab.component.html',
  styleUrls: ['./product-categories-tab.component.scss']
})
export class ProductCategoriesTabComponent implements OnInit {
  @Input() product!: Product;

  treeControl = new NestedTreeControl<Category>(node => node.nodes);
  dataSource = new MatTreeNestedDataSource<Category>();
  categories: Category[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
        this.dataSource.data = categories;
      },
      error: (err: any) => console.error('Failed to load categories', err)
    });
  }

  hasChild = (_: number, node: Category) => !!node.nodes && node.nodes.length > 0;

  isSelected(categoryId: string): boolean {
    return this.product.info?.categories?.includes(categoryId) || false;
  }

  toggleCategory(categoryId: string): void {
    if (!this.product.info) {
      this.product.info = { SKU: '', categories: [] };
    }
    if (!this.product.info.categories) {
      this.product.info.categories = [];
    }

    const index = this.product.info.categories.indexOf(categoryId);
    if (index >= 0) {
      this.product.info.categories.splice(index, 1);
    } else {
      this.product.info.categories.push(categoryId);
    }

    this.saveProduct();
  }

  expandAll(): void {
    this.expandRecursive(this.dataSource.data);
  }

  collapseAll(): void {
    this.treeControl.collapseAll();
  }

  refresh(): void {
    this.loadCategories();
  }

  private expandRecursive(nodes: Category[]): void {
    nodes.forEach(node => {
      this.treeControl.expand(node);
      if (node.nodes && node.nodes.length > 0) {
        this.expandRecursive(node.nodes);
      }
    });
  }

  private saveProduct(): void {
    if (!this.product._id) return;
    this.productService.update(this.product._id, this.product).subscribe({
      next: () => console.log('Product categories updated'),
      error: (err: any) => console.error('Failed to update product categories', err)
    });
  }
}
