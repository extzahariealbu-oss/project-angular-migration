/**
 * Commercial Tab Component
 * 
 * Evidence: /angularjs2/app/views/company/commercial.html:1-233
 * 
 * Implements commercial parameters form with:
 * - Sales person, segmentation, juridical status, staff size, rival
 * - Professional IDs (SIRET, APE/NAF), capital, price level
 * - Commercial follow-up notes (markdown editor with inline editing)
 */

import { Component, input, output, signal, computed, effect, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { Organization } from '../../models/organization.model';
import { OrganizationsApiService } from '../../services/organizations-api.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

export interface Employee {
  _id: string;
  name: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface JuridicalStatus {
  id: number;
  label: string;
}

export interface StaffSize {
  id: number;
  label: string;
}

export interface PriceList {
  _id: string;
  name: string;
}

@Component({
  selector: 'app-commercial-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule
  ],
  templateUrl: './commercial-tab.component.html',
  styleUrl: './commercial-tab.component.scss'
})
export class CommercialTabComponent implements OnInit {
  // Inputs
  organization = input.required<Organization>();
  canEdit = input<boolean>(false);

  // Outputs
  save = output<Partial<Organization>>();
  cancel = output<void>();

  // Form
  form!: FormGroup;

  // Dictionaries (signals)
  employees = signal<Employee[]>([]);
  categories = signal<Category[]>([]);
  juridicalStatuses = signal<JuridicalStatus[]>([
    { id: 0, label: 'Indéterminé' },
    { id: 11, label: 'Artisan Commerçant (EI)' },
    { id: 12, label: 'Commerçant (EI)' },
    { id: 13, label: 'Artisan (EI)' },
    { id: 21, label: 'Indivision' },
    { id: 22, label: 'Société créée de fait' },
    { id: 23, label: 'Société en participation' },
    { id: 27, label: 'Paroisse hors zone concordataire' },
    { id: 29, label: 'Groupement de droit privé non doté de la personnalité morale' },
    { id: 31, label: 'Personne morale de droit étranger, immatriculée au RCS' },
    { id: 32, label: 'Personne morale de droit étranger, non immatriculée au RCS' },
    { id: 41, label: '(Autre) Établissement public ou régie à caractère industriel ou commercial' },
    { id: 51, label: 'Société coopérative commerciale particulière' },
    { id: 52, label: 'Société en nom collectif' },
    { id: 53, label: 'Société en commandite' },
    { id: 54, label: 'Société à responsabilité limitée (SARL)' },
    { id: 55, label: 'Société anonyme à conseil d\'administration' },
    { id: 56, label: 'Société anonyme à directoire' },
    { id: 57, label: 'Société par actions simplifiée' },
    { id: 58, label: 'Société européenne' }
  ]); // Evidence: /angularjs2/definitions/company.js
  staffSizes = signal<StaffSize[]>([
    { id: 0, label: 'Indéterminé' },
    { id: 1, label: '1-10' },
    { id: 2, label: '11-50' },
    { id: 3, label: '51-100' },
    { id: 4, label: '101-500' },
    { id: 5, label: '501-1000' },
    { id: 6, label: '1001-5000' },
    { id: 7, label: '5001+' }
  ]); // Evidence: /angularjs2/definitions/company.js
  priceLists = signal<PriceList[]>([]);

  // Follow-up notes editor state
  isEditingNotes = signal(false);
  notesForm!: FormGroup;
  isSavingNotes = signal(false);

  // Computed values
  lastModifiedInfo = computed(() => {
    const org = this.organization();
    if (org.internalNotes?.datec && org.internalNotes?.author) {
      const date = new Date(org.internalNotes.datec);
      const authorName = typeof org.internalNotes.author === 'string' 
        ? org.internalNotes.author 
        : org.internalNotes.author.name;
      return `Dernière modification le ${date.toLocaleDateString('fr-FR')} par ${authorName}`;
    }
    return '';
  });

  constructor(
    private fb: FormBuilder,
    private apiService: OrganizationsApiService
  ) {
    // Sync form with input changes
    effect(() => {
      const org = this.organization();
      if (this.form) {
        this.form.patchValue({
          salesPerson: org.salesPurchases?.salesPerson || null,
          category: org.companyInfo?.category || null,
          forme_juridique: org.companyInfo?.forme_juridique || null,
          size: org.companyInfo?.size || null,
          rival: org.salesPurchases?.rival || '',
          idprof2: org.companyInfo?.idprof2 || '',
          idprof3: org.companyInfo?.idprof3 || '',
          capital: org.companyInfo?.capital || '',
          priceList: org.salesPurchases?.priceList || null
        }, { emitEvent: false });
      }

      if (this.notesForm) {
        this.notesForm.patchValue({
          notes: org.internalNotes?.new || ''
        }, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    // Initialize parameters form
    const org = this.organization();
    this.form = this.fb.group({
      salesPerson: [org.salesPurchases?.salesPerson || null],
      category: [org.companyInfo?.category || null],
      forme_juridique: [org.companyInfo?.forme_juridique || null],
      size: [org.companyInfo?.size || null],
      rival: [org.salesPurchases?.rival || ''],
      idprof2: [org.companyInfo?.idprof2 || ''],
      idprof3: [org.companyInfo?.idprof3 || ''],
      capital: [org.companyInfo?.capital || ''],
      priceList: [org.salesPurchases?.priceList || null]
    });

    // Initialize notes form
    this.notesForm = this.fb.group({
      notes: [org.internalNotes?.new || '']
    });

    // Auto-save on form value changes (debounced)
    this.form.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(values => {
        if (this.canEdit() && this.form.valid) {
          this.handleSave();
        }
      });

    // Load dictionaries
    this.loadDictionaries();
  }

  private loadDictionaries(): void {
    // Load employees (sales persons)
    this.apiService.userAutocomplete('').subscribe(users => {
      this.employees.set(users.map(u => ({ _id: u['value'], name: u['label'] })));
    });

    // Load categories
    // TODO: Implement getDictCategories endpoint
    // this.apiService.getDictCategories().subscribe(cats => this.categories.set(cats));

    // Load price lists
    // TODO: Implement getPriceLists endpoint
    // this.apiService.getPriceLists().subscribe(lists => this.priceLists.set(lists));
  }

  handleSave(): void {
    if (!this.form.valid || !this.canEdit()) {
      return;
    }

    const values = this.form.value;
    const updates: Partial<Organization> = {
      salesPurchases: {
        ...this.organization().salesPurchases,
        salesPerson: values.salesPerson,
        rival: values.rival,
        priceList: values.priceList
      },
      companyInfo: {
        ...this.organization().companyInfo,
        category: values.category,
        forme_juridique: values.forme_juridique,
        size: values.size,
        idprof2: values.idprof2,
        idprof3: values.idprof3,
        capital: values.capital
      }
    };

    this.save.emit(updates);
  }

  handleCancel(): void {
    this.form.reset();
    this.cancel.emit();
  }

  // Notes editor methods
  startEditingNotes(): void {
    this.isEditingNotes.set(true);
  }

  saveNotes(): void {
    if (!this.canEdit()) return;

    this.isSavingNotes.set(true);
    const notes = this.notesForm.value.notes;

    const updates: Partial<Organization> = {
      internalNotes: {
        new: notes,
        old: this.organization().internalNotes?.new || '',
        datec: new Date().toISOString(),
        author: {
          // TODO: Get current user from auth service
          _id: 'current-user-id',
          name: 'Current User'
        }
      }
    };

    this.save.emit(updates);
    
    // Simulate save delay
    setTimeout(() => {
      this.isSavingNotes.set(false);
      this.isEditingNotes.set(false);
    }, 300);
  }

  cancelNotesEdit(): void {
    this.notesForm.patchValue({
      notes: this.organization().internalNotes?.new || ''
    });
    this.isEditingNotes.set(false);
  }

  // Price list actions (Evidence: commercial.html L96-118)
  navigateToPriceList(priceListId: string): void {
    // TODO: Navigate to product.pricelist state
    console.log('Navigate to price list:', priceListId);
  }

  openNewPriceListModal(): void {
    // TODO: Open modal to create new price list
    console.log('Open new price list modal');
  }
}
