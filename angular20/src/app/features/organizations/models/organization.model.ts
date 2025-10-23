// Evidence: .knowledge/analysis/epic-4-evidence.md Section 3 (MongoDB Schema)

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string; // Country code (default: FR)
  name?: string; // Address label
  phone?: string; // Direct phone (legacy)
  mobile?: string; // Direct mobile (legacy)
  fax?: string; // Direct fax (legacy)
  email?: string; // Direct email (legacy)
  url?: string; // Website URL (legacy)
  contact?: {
    name?: string;
    phone?: string;
    mobile?: string;
    fax?: string;
    email?: string;
  };
  Status?: string; // ENABLE/DISABLE
}

export interface InternalNote {
  new?: string;
  old?: string;
  author?: {
    _id: string;
    name: string;
  } | string; // User object or User ID
  datec?: Date | string; // Date object or ISO string
}

export interface SalesPurchases {
  isGeneric?: boolean;
  isProspect?: boolean;
  isCustomer?: boolean; // Default: true
  isSupplier?: boolean;
  isSubcontractor?: boolean;
  salesPerson?: string; // Employee ID
  salesTeam?: string; // Department ID
  implementedBy?: string; // Customer ID
  isActive?: boolean; // Default: true
  ref?: string; // Customer/Supplier code (uppercase)
  language?: number; // Default: 0
  receiveMessages?: number;
  cptBilling?: string; // Customer ID for billing
  priceList?: string; // Price list ID
  cond_reglement?: string; // Payment terms (DICT)
  mode_reglement?: string; // Payment method (DICT)
  bank_reglement?: string; // Bank ID
  VATIsUsed?: boolean; // Default: true
  rival?: string[]; // Competitors
  customerAccount?: string; // Accounting code (uppercase)
  supplierAccount?: string; // Accounting code (uppercase)
}

export interface Iban {
  bank?: string; // Bank name (uppercase)
  id?: string; // IBAN number (uppercase, no spaces)
  bic?: string; // BIC/SWIFT code (uppercase, no spaces)
  isOk?: boolean; // Virtual field: IBAN validation
}

export interface CompanyInfo {
  idprof1?: string; // SIREN
  idprof2?: string; // TVA number or SIRET
  idprof3?: string; // SIRET or NAF/APE (requires LUHN validation)
  idprof4?: string; // NAF/APE
  idprof6?: string; // VAT Intra-community ID
  tva_mode?: string; // VAT mode
  capital?: number | string; // Capital (number or string)
  effectif_id?: string; // Staff size (DICT)
  size?: number; // Staff size ID (alternative field name)
  forme_juridique_code?: string; // Legal form (DICT)
  forme_juridique?: number; // Juridical status ID (alternative field name)
  brand?: string; // Brand name
  type?: string; // Organization type
  category?: string; // Customer segmentation category ID
}

export interface Phone {
  phone?: string; // Formatted phone
  mobile?: string; // Formatted mobile
  fax?: string; // Formatted fax
}

export interface Social {
  TW?: string; // Twitter
  LI?: string; // LinkedIn
  FB?: string; // Facebook
  url?: string; // Website
}

// Status enum matching reference app (Evidence: Section 3.6, L195-206)
export enum OrganizationStatus {
  ST_NEVER = 'ST_NEVER', // Never contacted
  ST_PFROI = 'ST_PFROI', // Cold prospect
  ST_PCHAU = 'ST_PCHAU', // Hot prospect
  ST_NEW = 'ST_NEW', // New customer (1 order)
  ST_CFID = 'ST_CFID', // Loyal customer (2+ orders)
  ST_CVIP = 'ST_CVIP', // VIP (Top 10 by revenue)
  ST_LOOSE = 'ST_LOOSE', // Lost customer (no order in 1 year)
  ST_NO = 'ST_NO' // Do not contact
}

export interface StatusInfo {
  id: OrganizationStatus;
  name: string;
  css: string; // CSS class for label styling
}

export interface StrategicNote {
  css?: string; // Color/status
  note?: string;
  author?: string; // User ID
  datec?: Date;
}

export interface Organization {
  _id?: string;
  name: string; // Required
  fullName?: string; // Computed: name or name + firstname
  firstname?: string; // For persons
  type?: 'Company' | 'Person'; // Organization type
  Title?: string; // Civility (DICT)
  entity?: string; // Entity ID
  phones?: Phone;
  emails?: Array<{ email: string }>;
  url?: string; // Website
  address?: Address;
  shippingAddress?: Address[];
  companyInfo?: CompanyInfo;
  salesPurchases?: SalesPurchases;
  internalNotes?: InternalNote;
  notes?: StrategicNote[]; // Strategic notes
  social?: Social;
  Status?: StatusInfo;
  _status?: StatusInfo; // Status object with CSS
  statusInfo?: StatusInfo; // Virtual field
  lastOrder?: Date;
  iban?: Iban;
  rating?: { attributes?: number }; // Rating/attributes
  attractivity?: number; // Virtual field: score
  errors?: string[]; // Virtual field: validation errors
  isremoved?: boolean; // Deleted flag
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: { id?: string; username?: string };
  editedBy?: { id?: string; username?: string };
  history?: { date?: Date; msg?: string };
  author?: string; // User ID
}

// Create/Edit DTO (Evidence: Section 9.12, L3636-3701)
export interface OrganizationFormData {
  _id?: string;
  
  // Basic info
  name: string;
  firstname?: string;
  Title?: string;
  companyInfo?: {
    idprof3?: string; // SIRET
    brand?: string;
  };
  
  // Type flags
  salesPurchases: {
    isProspect?: boolean;
    isCustomer?: boolean;
    isSupplier?: boolean;
    isSubcontractor?: boolean;
    salesPerson?: string;
    ref?: string; // Max 13 chars, required
    isGeneric?: boolean;
    language?: string; // Required
  };
  
  // Multi-entity
  entity?: string[];
  
  // Address
  address?: Address;
  
  // Contact
  phones?: Phone;
  emails?: Array<{ email: string }>;
  url?: string;
  
  // Social
  social?: Social;
  
  // Notes
  notes?: StrategicNote[];
}
