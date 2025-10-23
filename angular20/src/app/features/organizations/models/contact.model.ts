// Evidence: .knowledge/analysis/epic-4-evidence.md Section 11 (Contact Management)
// Contact is a specialized person-type organization

import { Organization, Address, Phone, Social, StrategicNote } from './organization.model';

/**
 * Contact interface extends Organization for person-type entities
 * Evidence: Section 11.2 (Form Structure) and Section 3 (MongoDB Schema)
 */
export interface Contact extends Organization {
  // Person-specific overrides
  firstname: string; // Required for persons
  name: string; // Last name (required)
  Title?: string; // Civility (Mr., Mrs., etc.) - DICT reference
  
  // Contact always linked to company
  companyId: string; // Parent organization ID (required)
  companyName?: string; // For display
  
  // Job information
  jobTitle?: string; // Position in company
  
  // Contact info (inherited from Organization)
  phones?: Phone;
  emails?: Array<{ email: string }>;
  url?: string; // Personal website
  
  // Address (inherited)
  address?: Address;
  
  // Social networks (inherited)
  social?: Social;
  
  // Notes (inherited)
  notes?: StrategicNote[];
  
  // Sales info (simplified for contacts)
  salesPurchases?: {
    salesPerson?: string; // Employee ID
    isActive?: boolean;
  };
  
  // Metadata
  entity?: string; // Entity ID
  createdAt?: Date;
  updatedAt?: Date;
  author?: string; // User ID
}

/**
 * Contact form data structure
 * Evidence: Section 11.7 (Form Submit Logic, L3552-3578)
 */
export interface ContactFormData {
  _id?: string;
  
  // Basic info (required)
  name: string; // Last name
  firstname: string; // First name
  Title?: string; // Civility
  
  // Company link (required)
  companyId: string; // Selected via autocomplete
  
  // Job
  jobTitle?: string;
  
  // Contact info
  phones?: {
    phone?: string;
    mobile?: string;
    fax?: string;
  };
  emails?: Array<{ email: string }>;
  url?: string;
  
  // Address
  address?: Address;
  
  // Social
  social?: {
    TW?: string;
    LI?: string;
    FB?: string;
    url?: string; // Secondary website
  };
  
  // Sales
  salesPurchases?: {
    salesPerson?: string;
    isActive?: boolean;
  };
  
  // Multi-entity
  entity?: string;
  
  // Notes
  notes?: StrategicNote[];
}

/**
 * Contact list item (for display in tables)
 * Evidence: Section 11.1 (List View), Section 4.4 (Table Structure)
 */
export interface ContactListItem {
  _id: string;
  fullName: string; // Computed: firstname + name
  Title?: string;
  companyName?: string;
  jobTitle?: string;
  email?: string; // Primary email
  phone?: string; // Primary phone
  mobile?: string;
  city?: string; // From address
  zip?: string; // From address
  salesPerson?: {
    _id: string;
    fullName: string;
  };
  entity?: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Company autocomplete result
 * Evidence: Section 11.6 (Company Autocomplete, L3482-3530)
 */
export interface CompanyAutocompleteResult {
  _id: string;
  fullName: string;
  isSupplier?: boolean;
  isCustomer?: boolean;
  salesPurchases?: {
    ref?: string;
  };
  address?: {
    city?: string;
    zip?: string;
  };
}
