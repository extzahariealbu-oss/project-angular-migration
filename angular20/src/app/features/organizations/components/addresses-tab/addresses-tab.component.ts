/**
 * Addresses Tab Component
 * 
 * Evidence: /angularjs2/app/views/company/addresses.html:1-149
 * 
 * Implements:
 * - Contacts list (4-column card grid, shown only for Company type)
 * - Delivery addresses table (with default selection, edit/delete)
 */

import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';
import { Organization, Address } from '../../models/organization.model';

export interface Contact {
  _id: string;
  civility?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  mobile?: string;
  email?: string;
}

@Component({
  selector: 'app-addresses-tab',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatRadioModule,
    MatBadgeModule
  ],
  templateUrl: './addresses-tab.component.html',
  styleUrl: './addresses-tab.component.scss'
})
export class AddressesTabComponent {
  // Inputs
  organization = input.required<Organization>();
  canEdit = input<boolean>(false);

  // Outputs
  addContact = output<void>();
  deleteContact = output<string>(); // Contact ID
  addAddress = output<void>();
  editAddress = output<Address>();
  deleteAddress = output<string>(); // Address ID
  setDefaultAddress = output<string>(); // Address ID

  // Contacts mock data (Evidence: addresses.html L11-55)
  contacts = signal<Contact[]>([
    // TODO: Load from API
  ]);

  // Addresses mock data (Evidence: addresses.html L59-147)
  addresses = signal<Address[]>([
    // TODO: Load from organization.addresses
  ]);

  // Table columns (Evidence: addresses.html L104-144)
  displayedColumns: string[] = [
    'default',
    'name',
    'address',
    'zip',
    'town',
    'status',
    'contact',
    'phone',
    'email',
    'actions'
  ];

  // Computed flags
  isCompanyType(): boolean {
    // Evidence: addresses.html L13 - contacts only shown for Company type
    return this.organization().type === 'Company';
  }

  // Contact actions
  handleAddContact(): void {
    this.addContact.emit();
  }

  handleDeleteContact(contactId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      this.deleteContact.emit(contactId);
    }
  }

  handleRefreshContacts(): void {
    // TODO: Reload contacts from API
    console.log('Refresh contacts');
  }

  // Address actions
  handleAddAddress(): void {
    this.addAddress.emit();
  }

  handleEditAddress(address: Address): void {
    this.editAddress.emit(address);
  }

  handleDeleteAddress(addressId: string, isFirst: boolean): void {
    // Evidence: addresses.html - first address cannot be deleted
    if (isFirst) {
      alert('La première adresse ne peut pas être supprimée.');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      this.deleteAddress.emit(addressId);
    }
  }

  handleSetDefaultAddress(addressId: string): void {
    this.setDefaultAddress.emit(addressId);
  }

  handleRefreshAddresses(): void {
    // TODO: Reload addresses from API
    console.log('Refresh addresses');
  }
}
