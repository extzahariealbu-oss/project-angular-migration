import { Component, Input, Output, EventEmitter, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

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

@Component({
  selector: 'app-organizations-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatAutocompleteModule
  ],
  templateUrl: './organizations-filters.component.html',
  styleUrls: ['./organizations-filters.component.scss']
})
export class OrganizationsFiltersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  @Input() set value(filters: FilterState) {
    if (filters) {
      // Reset form to clear all previous values first
      this.form.reset({
        search: '',
        salesPerson: '',
        entity: '',
        status: '',
        isProspect: false,
        isCustomer: false,
        isSupplier: false,
        isSubcontractor: false,
        lastOrderFrom: '',
        lastOrderTo: '',
        createdFrom: '',
        createdTo: ''
      }, { emitEvent: false });
      
      // Then apply new filter values
      this.form.patchValue(filters, { emitEvent: false });
    }
  }

  @Output() filtersChange = new EventEmitter<FilterState>();

  form: FormGroup = this.fb.group({
    search: [''],
    salesPerson: [''],
    entity: [''],
    status: [''],
    isProspect: [false],
    isCustomer: [false],
    isSupplier: [false],
    isSubcontractor: [false],
    lastOrderFrom: [''],
    lastOrderTo: [''],
    createdFrom: [''],
    createdTo: ['']
  });

  // Dropdown options (would typically come from API)
  statusOptions: string[] = ['active', 'inactive', 'pending', 'suspended'];
  entityOptions: string[] = ['Entity 1', 'Entity 2', 'Entity 3'];

  ngOnInit(): void {
    this.form.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      // Convert dates to ISO strings
      const filters: FilterState = {
        ...value,
        lastOrderFrom: value.lastOrderFrom ? this.toISODate(value.lastOrderFrom) : undefined,
        lastOrderTo: value.lastOrderTo ? this.toISODate(value.lastOrderTo) : undefined,
        createdFrom: value.createdFrom ? this.toISODate(value.createdFrom) : undefined,
        createdTo: value.createdTo ? this.toISODate(value.createdTo) : undefined
      };

      // Remove empty/falsy values
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof FilterState];
        if (value === '' || value === null || value === undefined || value === false) {
          delete filters[key as keyof FilterState];
        }
      });

      this.filtersChange.emit(filters);
    });
  }

  clearFilters(): void {
    this.form.reset({
      search: '',
      salesPerson: '',
      entity: '',
      status: '',
      isProspect: false,
      isCustomer: false,
      isSupplier: false,
      isSubcontractor: false,
      lastOrderFrom: '',
      lastOrderTo: '',
      createdFrom: '',
      createdTo: ''
    });
    this.filtersChange.emit({});
  }

  private toISODate(date: Date | string): string {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  }
}
