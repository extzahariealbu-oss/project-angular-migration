/**
 * Billing Tab Component
 * 
 * Evidence: /angularjs2/app/views/company/billing.html:1-242
 * 
 * Implements billing configuration with:
 * - Account parameters (customer/supplier codes, VAT, payment terms)
 * - Banking details (IBAN, BIC, bank name)
 * - Invoice/payment tables (customer bills, supplier bills, payments)
 */

import { Component, input, output, signal, computed, effect, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { Organization } from '../../models/organization.model';
import { debounceTime, distinctUntilChanged } from 'rxjs';

export interface PaymentTerm {
  id: string;
  label: string;
}

export interface PaymentMode {
  id: string;
  label: string;
}

export interface Bank {
  _id: string;
  ref: string;
  name?: string;
}

@Component({
  selector: 'app-billing-tab',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule
  ],
  templateUrl: './billing-tab.component.html',
  styleUrl: './billing-tab.component.scss'
})
export class BillingTabComponent implements OnInit {
  // Inputs
  organization = input.required<Organization>();
  canEdit = input<boolean>(false);

  // Outputs
  save = output<Partial<Organization>>();
  cancel = output<void>();

  // Form
  form!: FormGroup;

  // Dictionaries (signals)
  paymentTerms = signal<PaymentTerm[]>([
    { id: '1', label: 'À réception' },
    { id: '2', label: '30 jours' },
    { id: '3', label: '30 jours fin de mois' },
    { id: '4', label: '45 jours' },
    { id: '5', label: '45 jours fin de mois' },
    { id: '6', label: '60 jours' },
    { id: '7', label: '60 jours fin de mois' }
  ]); // Evidence: billing.html L70, dict.fk_payment_term
  
  paymentModes = signal<PaymentMode[]>([
    { id: 'CHQ', label: 'Chèque' },
    { id: 'VIR', label: 'Virement' },
    { id: 'PRE', label: 'Prélèvement' },
    { id: 'LIQ', label: 'Espèces' },
    { id: 'CB', label: 'Carte bancaire' },
    { id: 'TIP', label: 'TIP' },
    { id: 'VAD', label: 'Paiement en ligne' }
  ]); // Evidence: billing.html L75, dict.fk_paiement
  
  banks = signal<Bank[]>([]);

  // Computed visibility flags
  showCustomerAccount = computed(() => this.organization().salesPurchases?.isCustomer ?? false);
  showSupplierAccount = computed(() => 
    (this.organization().salesPurchases?.isSupplier ?? false) || 
    (this.organization().salesPurchases?.isSubcontractor ?? false)
  );

  constructor(private fb: FormBuilder) {
    // Sync form with input changes
    effect(() => {
      const org = this.organization();
      if (this.form) {
        this.form.patchValue({
          customerAccount: org.salesPurchases?.customerAccount || '',
          supplierAccount: org.salesPurchases?.supplierAccount || '',
          idprof6: org.companyInfo?.idprof6 || '',
          VATIsUsed: org.salesPurchases?.VATIsUsed ?? true,
          cond_reglement: org.salesPurchases?.cond_reglement || null,
          mode_reglement: org.salesPurchases?.mode_reglement || null,
          bank_reglement: org.salesPurchases?.bank_reglement || null,
          bankName: org.iban?.bank || '',
          iban: org.iban?.id || '',
          bic: org.iban?.bic || ''
        }, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    const org = this.organization();
    
    // Initialize form with validation (Evidence: billing.html L34, L39)
    this.form = this.fb.group({
      customerAccount: [
        org.salesPurchases?.customerAccount || '',
        [Validators.maxLength(10)]
      ],
      supplierAccount: [
        org.salesPurchases?.supplierAccount || '',
        [Validators.maxLength(10)]
      ],
      idprof6: [org.companyInfo?.idprof6 || ''], // VAT Intra-community ID
      VATIsUsed: [org.salesPurchases?.VATIsUsed ?? true],
      cond_reglement: [org.salesPurchases?.cond_reglement || null],
      mode_reglement: [org.salesPurchases?.mode_reglement || null],
      bank_reglement: [org.salesPurchases?.bank_reglement || null],
      bankName: [org.iban?.bank || ''],
      iban: [org.iban?.id || ''],
      bic: [org.iban?.bic || '']
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
    // Load banks
    // TODO: Implement getBanks endpoint
    // this.apiService.getBanks().subscribe(banks => this.banks.set(banks));
  }

  handleSave(): void {
    if (!this.form.valid || !this.canEdit()) {
      return;
    }

    const values = this.form.value;
    const updates: Partial<Organization> = {
      salesPurchases: {
        ...this.organization().salesPurchases,
        customerAccount: values.customerAccount,
        supplierAccount: values.supplierAccount,
        VATIsUsed: values.VATIsUsed,
        cond_reglement: values.cond_reglement,
        mode_reglement: values.mode_reglement,
        bank_reglement: values.bank_reglement
      },
      companyInfo: {
        ...this.organization().companyInfo,
        idprof6: values.idprof6
      },
      iban: {
        bank: values.bankName,
        id: values.iban,
        bic: values.bic
      }
    };

    this.save.emit(updates);
  }

  handleCancel(): void {
    this.form.reset();
    this.cancel.emit();
  }

  // Invoice/Payment actions (Evidence: billing.html L173-177, L820-821)
  addPayment(): void {
    // TODO: Implement add payment modal
    console.log('Add payment');
  }

  refreshPayments(): void {
    // TODO: Implement refresh payments
    console.log('Refresh payments');
  }
}
