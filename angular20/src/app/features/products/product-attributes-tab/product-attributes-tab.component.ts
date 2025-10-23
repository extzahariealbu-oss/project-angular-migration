import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface ProductAttributeValue {
  attribute: string;
  value: any;
  options?: string[];
}

interface ProductAttributeDefinition {
  _id: string;
  mode: 'date' | 'number' | 'metric' | 'text' | 'select' | 'textarea' | 'checkbox' | 'picture' | 'color';
  group: {
    langs: [{ name: string }];
  };
  langs: [{ name: string }];
  sequence: number;
  minNumber?: number;
  maxNumber?: number;
  step?: number;
  metricUnit?: string;
  values?: Array<{
    _id: string;
    langs: [{ name: string }];
  }>;
}

interface AttributeGroup {
  name: string;
  attributes: ProductAttributeDefinition[];
}

@Component({
  selector: 'app-product-attributes-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './product-attributes-tab.component.html',
  styleUrls: ['./product-attributes-tab.component.scss']
})
export class ProductAttributesTabComponent implements OnInit, OnChanges {
  @Input() product: any;
  @Output() save = new EventEmitter<void>();

  attributeGroups: AttributeGroup[] = [];
  attributeMap: { [key: string]: number } = {};

  ngOnInit(): void {
    this.initializeAttributes();
  }

  ngOnChanges(): void {
    this.initializeAttributes();
  }

  private initializeAttributes(): void {
    if (!this.product?.sellFamily?.options) {
      return;
    }

    // Create attribute map for quick lookup
    this.attributeMap = {};
    if (!this.product.attributes) {
      this.product.attributes = [];
    }

    this.product.attributes.forEach((attr: ProductAttributeValue, index: number) => {
      this.attributeMap[attr.attribute] = index;
    });

    // Initialize missing attributes
    this.product.sellFamily.options.forEach((def: ProductAttributeDefinition) => {
      if (this.attributeMap[def._id] === undefined) {
        const newAttr: ProductAttributeValue = {
          attribute: def._id,
          value: this.getDefaultValue(def.mode),
          options: []
        };
        this.product.attributes.push(newAttr);
        this.attributeMap[def._id] = this.product.attributes.length - 1;
      }
    });

    // Group attributes by group name
    const groups = new Map<string, ProductAttributeDefinition[]>();
    
    this.product.sellFamily.options.forEach((def: ProductAttributeDefinition) => {
      const groupName = def.group?.langs?.[0]?.name || 'Other';
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(def);
    });

    // Convert to array and sort within groups
    this.attributeGroups = Array.from(groups.entries()).map(([name, attributes]) => ({
      name,
      attributes: attributes.sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
    }));
  }

  private getDefaultValue(mode: string): any {
    switch (mode) {
      case 'checkbox':
        return false;
      case 'number':
      case 'metric':
        return 0;
      case 'date':
        return null;
      case 'select':
        return '';
      default:
        return '';
    }
  }

  getAttributeValue(attributeId: string): any {
    const index = this.attributeMap[attributeId];
    return index !== undefined ? this.product.attributes[index].value : null;
  }

  setAttributeValue(attributeId: string, value: any): void {
    const index = this.attributeMap[attributeId];
    if (index !== undefined) {
      this.product.attributes[index].value = value;
      this.onAttributeChange();
    }
  }

  getAttributeOptions(attributeId: string): any {
    const index = this.attributeMap[attributeId];
    return index !== undefined ? this.product.attributes[index].options : [];
  }

  setAttributeOptions(attributeId: string, options: any): void {
    const index = this.attributeMap[attributeId];
    if (index !== undefined) {
      this.product.attributes[index].options = options;
      this.onAttributeChange();
    }
  }

  onAttributeChange(): void {
    this.save.emit();
  }

  onFileSelected(event: Event, attributeId: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // TODO: Upload file to backend and get image ID
      console.log('File selected:', file.name);
      // For now, just store the filename
      this.setAttributeValue(attributeId, file.name);
    }
  }

  getImageUrl(imageSrc: string): string {
    return `/erp/api/images/bank/s/${imageSrc}`;
  }
}
