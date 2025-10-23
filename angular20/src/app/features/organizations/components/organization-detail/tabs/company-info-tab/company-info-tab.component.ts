// Evidence: .knowledge/analysis/epic-4-evidence.md Section 5.2 (company.html:1-261)

import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Organization } from '../../../../models/organization.model';

@Component({
  selector: 'app-company-info-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './company-info-tab.component.html',
  styleUrls: ['./company-info-tab.component.scss']
})
export class CompanyInfoTabComponent implements OnInit {
  @Input() organization!: Organization;
  @Input() editable = false;

  private fb = inject(FormBuilder);

  companyForm!: FormGroup;
  entityList: Array<{ id: string; name: string }> = []; // TODO: Load from API
  civilityDict: Array<{ id: string; name: string }> = []; // Evidence: L513
  languageDict: Array<{ id: string; name: string }> = []; // Evidence: L549

  // Strategic Notes
  noteStatuses = [
    { css: 'info', label: 'Info' },
    { css: 'success', label: 'Positive' },
    { css: 'warning', label: 'Warning' },
    { css: 'danger', label: 'Critical' }
  ];
  editableInfo = false;
  newNote = {
    css: 'info',
    note: '',
    author: '',
    datec: new Date()
  };

  ngOnInit(): void {
    this.buildForm();
    this.loadDictionaries();
  }

  buildForm(): void {
    // Evidence: Section 5.2, Lines 29-254
    const org = this.organization;

    this.companyForm = this.fb.group({
      // Type Selection (L31-48)
      type: [org.type || 'Company'],

      // Person Fields (L51-64)
      Title: [org.Title],
      firstname: [org.firstname],
      name: [org.name, Validators.required],

      // Company Fields (L67-70)
      // name already covered above

      // Common Fields (L72-109)
      salesPurchases: this.fb.group({
        ref: [
          org.salesPurchases?.ref,
          [Validators.required, Validators.maxLength(13)]
        ],
        isGeneric: [org.salesPurchases?.isGeneric || false]
      }),
      companyInfo: this.fb.group({
        brand: [org.companyInfo?.brand]
      }),
      entity: [org.entity || []], // Multi-checkbox selection

      // Address (L112-119) - using existing address structure
      address: this.fb.group({
        street: [org.address?.street],
        zip: [org.address?.zip],
        city: [org.address?.city],
        country: [org.address?.country || 'FR']
      }),

      // Contact Information (L165-213)
      salesPurchases_language: [org.salesPurchases?.language],
      phones: this.fb.group({
        phone: [org.phones?.phone],
        mobile: [org.phones?.mobile],
        fax: [org.phones?.fax]
      }),
      emails: [org.emails?.[0]?.email],
      url: [org.url],

      // Social Media (L214-252)
      social: this.fb.group({
        TW: [org.social?.TW],
        LI: [org.social?.LI],
        FB: [org.social?.FB]
      })
    });

    if (!this.editable) {
      this.companyForm.disable();
    }
  }

  loadDictionaries(): void {
    // Evidence: Section 5.2, L513, L549
    // TODO: Load from DictionaryService
    this.civilityDict = [
      { id: 'MR', name: 'Mr.' },
      { id: 'MRS', name: 'Mrs.' },
      { id: 'MS', name: 'Ms.' }
    ];

    this.languageDict = [
      { id: 'en_US', name: 'English (US)' },
      { id: 'fr_FR', name: 'Français' },
      { id: 'es_ES', name: 'Español' }
    ];

    this.entityList = [
      { id: '1', name: 'Entity 1' },
      { id: '2', name: 'Entity 2' }
    ];
  }

  // Evidence: Section 5.2, L522-524 (checkCodeClient with debounce)
  checkCodeClient(): void {
    // TODO: Implement real-time validation
    // Evidence: Debounce 500ms, validate uniqueness via API
  }

  // Strategic Notes Methods (Evidence: L125-162)
  toggleEditNote(): void {
    this.editableInfo = !this.editableInfo;
    if (this.editableInfo) {
      this.newNote = {
        css: 'info',
        note: '',
        author: 'current-user', // TODO: Get from AuthService
        datec: new Date()
      };
    }
  }

  saveNote(): void {
    if (!this.newNote.note.trim()) return;

    if (!this.organization.notes) {
      this.organization.notes = [];
    }

    this.organization.notes.unshift({ ...this.newNote });
    this.editableInfo = false;
    // TODO: Call API to save
  }

  deleteNote(index: number): void {
    // Evidence: L546 (permission check: societe.delete)
    if (confirm('Delete this note?')) {
      this.organization.notes?.splice(index, 1);
      // TODO: Call API to delete
    }
  }

  onTypeChange(): void {
    const type = this.companyForm.get('type')?.value;
    // Evidence: L31-48, show/hide fields based on type
    if (type === 'Person') {
      this.companyForm.get('Title')?.setValidators(Validators.required);
      this.companyForm.get('companyInfo.brand')?.clearValidators();
    } else {
      this.companyForm.get('Title')?.clearValidators();
    }
    this.companyForm.get('Title')?.updateValueAndValidity();
    this.companyForm.get('companyInfo.brand')?.updateValueAndValidity();
  }

  onEntityToggle(entityId: string): void {
    // Evidence: L528 (multi-checkbox entity selection)
    const currentEntities = this.companyForm.get('entity')?.value || [];
    const index = currentEntities.indexOf(entityId);

    if (index > -1) {
      currentEntities.splice(index, 1);
    } else {
      currentEntities.push(entityId);
    }

    this.companyForm.patchValue({ entity: currentEntities });
  }

  isEntitySelected(entityId: string): boolean {
    const entities = this.companyForm.get('entity')?.value || [];
    return entities.includes(entityId);
  }

  save(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    const formValue = this.companyForm.value;
    // TODO: Call API to save
    console.log('Saving organization:', formValue);
  }

  cancel(): void {
    this.buildForm(); // Reset to original values
  }
}
