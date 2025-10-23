import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organization } from '../models/organization.model';
import { Contact } from '../models/contact.model';

/**
 * Organizations API Service
 * 
 * Evidence: Section 6 (API Endpoints), Section 8 (Controller Methods)
 * Total: 40+ API endpoints for organizations/contacts management
 */

// Evidence: Section 4.4 (Filter Parameters)
export interface OrganizationFilters {
  quickSearch?: string;
  salesPerson?: string;
  entity?: string[];
  Status?: string;
  isProspect?: boolean;
  isCustomer?: boolean;
  isSupplier?: boolean;
  isSubcontractor?: boolean;
  lastOrder?: { start?: Date; end?: Date };
  createdAt?: { start?: Date; end?: Date };
}

// Evidence: Section 8.2.1 (List Query Parameters)
export interface OrganizationListQuery {
  forSales?: boolean;
  quickSearch?: string;
  filter?: OrganizationFilters;
  viewType?: string;
  contentType?: string;
  limit?: number;
  page?: number;
  sort?: { [key: string]: 1 | -1 };
}

// Evidence: Section 4.7 (DataTable Response)
export interface DataTableResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Evidence: Section 8.4 (Validation Responses)
export interface ValidationResponse {
  exists: boolean;
  message?: string;
}

// Evidence: Section 5.7 (File Upload)
export interface FileUploadResponse {
  _id: string;
  filename: string;
  size: number;
  mimetype: string;
  uploadDate: Date;
  uploadedBy: string;
}

// Evidence: Section 12 (Statistics)
export interface StatisticsQuery {
  start: Date;
  end: Date;
  entity?: string[];
  commercial?: string;
}

export interface StatisticsResponse {
  societe: {
    _id: string;
    name: string;
    family: string[];
  };
  data: { [family: string]: number };
  total_ht: number;
}

// Evidence: Section 6 (Autocomplete)
export interface AutocompleteItem {
  _id: string;
  name: string;
  [key: string]: any;
}

// Evidence: Section 6 (Dictionaries)
export type DictionaryType =
  | 'fk_civilite'
  | 'fk_job'
  | 'fk_user_status'
  | 'fk_hobbies'
  | 'fk_payment_term'
  | 'fk_paiement'
  | 'fk_typent'
  | 'fk_effectif'
  | 'fk_stcomm'
  | 'fk_prospectlevel'
  | 'fk_categorie'
  | 'fk_forme_juridique'
  | 'fk_account';

export interface DictionaryEntry {
  key: string;
  label: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationsApiService {
  private readonly baseUrl = '/erp/api/societe';

  constructor(private http: HttpClient) {}

  // ========================================
  // ORGANIZATION CRUD
  // Evidence: Section 8.2
  // ========================================

  /**
   * List organizations with filters
   * Evidence: Section 8.2.1, lines 1398-1428
   * API: GET /erp/api/societe
   */
  list(query: OrganizationListQuery): Observable<Organization[]> {
    let params = new HttpParams();
    
    if (query.forSales !== undefined) {
      params = params.set('forSales', String(query.forSales));
    }
    if (query.quickSearch) {
      params = params.set('quickSearch', query.quickSearch);
    }
    if (query.filter) {
      params = params.set('filter', JSON.stringify(query.filter));
    }
    if (query.viewType) {
      params = params.set('viewType', query.viewType);
    }
    if (query.contentType) {
      params = params.set('contentType', query.contentType);
    }
    if (query.limit) {
      params = params.set('limit', String(query.limit));
    }
    if (query.page) {
      params = params.set('page', String(query.page));
    }
    if (query.sort) {
      params = params.set('sort', JSON.stringify(query.sort));
    }

    return this.http.get<Organization[]>(this.baseUrl, { params });
  }

  /**
   * Get paginated/filtered list for DataTable
   * Evidence: Section 4.7 (DataTable implementation)
   * API: GET /erp/api/societe/dt?type=Company
   */
  listDataTable(type: 'Company' | 'Person', query: OrganizationListQuery): Observable<DataTableResponse<Organization>> {
    let params = new HttpParams().set('type', type);
    
    if (query.quickSearch) {
      params = params.set('quickSearch', query.quickSearch);
    }
    if (query.filter) {
      params = params.set('filter', JSON.stringify(query.filter));
    }
    if (query.limit) {
      params = params.set('limit', String(query.limit));
    }
    if (query.page) {
      params = params.set('page', String(query.page));
    }
    if (query.sort) {
      params = params.set('sort', JSON.stringify(query.sort));
    }

    return this.http.get<DataTableResponse<Organization>>(`${this.baseUrl}/dt`, { params });
  }

  /**
   * Get single organization by ID
   * Evidence: Section 8.2.1, lines 1431-1449
   * API: GET /erp/api/societe/:id
   */
  getById(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new organization
   * Evidence: Section 8.2.2, lines 1462-1474
   * API: POST /erp/api/societe
   */
  create(organization: Partial<Organization>): Observable<Organization> {
    return this.http.post<Organization>(this.baseUrl, organization);
  }

  /**
   * Update existing organization
   * Evidence: Section 8.2.3, lines 1477-1489
   * API: PUT /erp/api/societe/:id
   */
  update(id: string, organization: Partial<Organization>): Observable<Organization> {
    return this.http.put<Organization>(`${this.baseUrl}/${id}`, organization);
  }

  /**
   * Update single field inline
   * Evidence: Section 8.2.3, lines 1492-1511
   * API: PUT /erp/api/societe/:id/:field
   */
  updateField(id: string, field: string, oldValue: any, newValue: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/${field}`, {
      oldvalue: oldValue,
      value: newValue
    });
  }

  /**
   * Delete organization(s)
   * Evidence: Section 8.2.4, lines 1526-1546
   * API: DELETE /erp/api/societe (bulk) or DELETE /erp/api/societe/:id (single)
   */
  delete(ids: string | string[]): Observable<any> {
    if (Array.isArray(ids)) {
      // Bulk delete
      const params = new HttpParams().set('id', JSON.stringify(ids));
      return this.http.delete(this.baseUrl, { params });
    } else {
      // Single delete
      return this.http.delete(`${this.baseUrl}/${ids}`);
    }
  }

  // ========================================
  // CONTACT CRUD
  // Evidence: Section 11 (Contact Management)
  // ========================================

  /**
   * List contacts (Person entities)
   * Evidence: Section 11.12 (Contact list)
   * API: GET /erp/api/societe/dt?type=Person
   */
  listContacts(query: OrganizationListQuery): Observable<DataTableResponse<Contact>> {
    return this.listDataTable('Person', query) as Observable<DataTableResponse<Contact>>;
  }

  /**
   * Get single contact by ID
   * Evidence: Section 11 (Contact management uses same endpoint)
   * API: GET /erp/api/societe/:id
   */
  getContactById(id: string): Observable<Contact> {
    return this.getById(id) as Observable<Contact>;
  }

  /**
   * Create new contact
   * Evidence: Section 11.14 (Contact form)
   * API: POST /erp/api/societe
   */
  createContact(contact: Partial<Contact>): Observable<Contact> {
    const contactData: Partial<Organization> = { ...(contact as any), type: 'Person' };
    return this.create(contactData) as Observable<Contact>;
  }

  /**
   * Update existing contact
   * Evidence: Section 11.14
   * API: PUT /erp/api/societe/:id
   */
  updateContact(id: string, contact: Partial<Contact>): Observable<Contact> {
    return this.update(id, contact) as Observable<Contact>;
  }

  /**
   * Delete contact
   * Evidence: Section 11 (Contact CRUD)
   * API: DELETE /erp/api/societe/:id
   */
  deleteContact(id: string): Observable<any> {
    return this.delete(id);
  }

  /**
   * Create web access for contact
   * Evidence: Section 11.11, lines 1793-1833
   * API: POST /erp/api/contact/login/:id
   */
  createWebAccess(contactId: string, password: string): Observable<any> {
    return this.http.post(`/erp/api/contact/login/${contactId}`, { password });
  }

  // ========================================
  // VALIDATION
  // Evidence: Section 8.4
  // ========================================

  /**
   * Check if client reference is unique
   * Evidence: Section 8.4.1, lines 1561-1582
   * API: GET /erp/api/societe/checkRef
   */
  checkClientRefUniqueness(ref: string, excludeId?: string): Observable<ValidationResponse> {
    let params = new HttpParams().set('ref', ref);
    if (excludeId) {
      params = params.set('excludeId', excludeId);
    }
    return this.http.get<ValidationResponse>(`${this.baseUrl}/checkRef`, { params });
  }

  /**
   * Check if SIRET is unique
   * Evidence: Section 8.4.2, lines 1584-1605
   * API: GET /erp/api/societe/checkSiret
   */
  checkSiretUniqueness(siret: string, excludeId?: string): Observable<ValidationResponse> {
    let params = new HttpParams().set('siret', siret);
    if (excludeId) {
      params = params.set('excludeId', excludeId);
    }
    return this.http.get<ValidationResponse>(`${this.baseUrl}/checkSiret`, { params });
  }

  // ========================================
  // AUTOCOMPLETE
  // Evidence: Section 6 (Autocomplete endpoints)
  // ========================================

  /**
   * Company autocomplete search
   * Evidence: Section 4 (Autocomplete for company linking)
   * API: GET /erp/api/societe/autocomplete
   */
  autocomplete(query: string, filters?: { type?: 'Company' | 'Person' }): Observable<AutocompleteItem[]> {
    let params = new HttpParams().set('query', query);
    if (filters?.type) {
      params = params.set('type', filters.type);
    }
    return this.http.get<AutocompleteItem[]>(`${this.baseUrl}/autocomplete`, { params });
  }

  /**
   * Company family autocomplete
   * Evidence: Section 6 (Product family linking)
   * API: GET /erp/api/societe/autocomplete/caFamily
   */
  autocompleteCaFamily(query: string): Observable<AutocompleteItem[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<AutocompleteItem[]>(`${this.baseUrl}/autocomplete/caFamily`, { params });
  }

  // ========================================
  // FILE MANAGEMENT
  // Evidence: Section 5.7 (Files Tab), Section 8.5 (File Upload)
  // ========================================

  /**
   * Upload file to organization
   * Evidence: Section 8.5 (File upload with progress)
   * API: POST /erp/api/societe/:id/upload
   */
  uploadFile(organizationId: string, file: File): Observable<HttpEvent<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<FileUploadResponse>(
      `${this.baseUrl}/${organizationId}/upload`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    );
  }

  /**
   * List files for organization
   * Evidence: Section 5.7 (Files list)
   * API: GET /erp/api/societe/:id/files
   */
  listFiles(organizationId: string): Observable<FileUploadResponse[]> {
    return this.http.get<FileUploadResponse[]>(`${this.baseUrl}/${organizationId}/files`);
  }

  /**
   * Delete file from organization
   * Evidence: Section 5.7 (File deletion)
   * API: DELETE /erp/api/societe/:id/files/:fileId
   */
  deleteFile(organizationId: string, fileId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${organizationId}/files/${fileId}`);
  }

  // ========================================
  // ADDRESSES
  // Evidence: Section 5.3 (Addresses Tab)
  // ========================================

  /**
   * List addresses for organization
   * Evidence: Section 5.3 (Addresses tab)
   * API: GET /erp/api/societe/:id/addresses
   */
  listAddresses(organizationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${organizationId}/addresses`);
  }

  /**
   * Create address for organization
   * Evidence: Section 5.3
   * API: POST /erp/api/societe/:id/address
   */
  createAddress(organizationId: string, address: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${organizationId}/address`, address);
  }

  /**
   * Update address
   * Evidence: Section 5.3
   * API: PUT /erp/api/societe/:id/address/:addressId
   */
  updateAddress(organizationId: string, addressId: string, address: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${organizationId}/address/${addressId}`, address);
  }

  /**
   * Delete address
   * Evidence: Section 5.3
   * API: DELETE /erp/api/societe/:id/address/:addressId
   */
  deleteAddress(organizationId: string, addressId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${organizationId}/address/${addressId}`);
  }

  // ========================================
  // DICTIONARIES
  // Evidence: Section 6 (Dictionary lookups)
  // ========================================

  /**
   * Get dictionary values
   * Evidence: Section 6 (13 dictionary types)
   * API: GET /erp/api/dict
   */
  getDictionary(type: DictionaryType): Observable<DictionaryEntry[]> {
    const params = new HttpParams().set('type', type);
    return this.http.get<DictionaryEntry[]>('/erp/api/dict', { params });
  }

  /**
   * Get all dictionaries at once
   * Evidence: Section 6 (Bulk dictionary load)
   * API: GET /erp/api/dict (no type param returns all)
   */
  getAllDictionaries(): Observable<{ [key in DictionaryType]?: DictionaryEntry[] }> {
    return this.http.get<{ [key in DictionaryType]?: DictionaryEntry[] }>('/erp/api/dict');
  }

  // ========================================
  // USER AUTOCOMPLETE
  // Evidence: Section 5 (Commercial/Sales Person selection)
  // ========================================

  /**
   * User autocomplete (for sales person field)
   * Evidence: Section 5.2 (Commercial tab), Section 12 (Stats filters)
   * API: GET /erp/api/user/name/autocomplete
   */
  userAutocomplete(query: string): Observable<AutocompleteItem[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<AutocompleteItem[]>('/erp/api/user/name/autocomplete', { params });
  }

  // ========================================
  // STATISTICS
  // Evidence: Section 12 (Statistics View)
  // ========================================

  /**
   * Get sales statistics
   * Evidence: Section 12 (Statistics dashboard)
   * API: GET /erp/api/societe/stats
   */
  getStatistics(query: StatisticsQuery): Observable<StatisticsResponse[]> {
    let params = new HttpParams()
      .set('start', query.start.toISOString())
      .set('end', query.end.toISOString());
    
    if (query.entity && query.entity.length > 0) {
      params = params.set('entity', JSON.stringify(query.entity));
    }
    if (query.commercial) {
      params = params.set('commercial', query.commercial);
    }

    return this.http.get<StatisticsResponse[]>(`${this.baseUrl}/stats`, { params });
  }

  /**
   * Export statistics to CSV
   * Evidence: Section 12 (CSV export)
   * API: GET /erp/api/stats/DetailsClientCsv
   */
  exportStatisticsCsv(query: StatisticsQuery): Observable<Blob> {
    let params = new HttpParams()
      .set('start', query.start.toISOString())
      .set('end', query.end.toISOString());
    
    if (query.entity && query.entity.length > 0) {
      params = params.set('entity', JSON.stringify(query.entity));
    }

    return this.http.get('/erp/api/stats/DetailsClientCsv', {
      params,
      responseType: 'blob'
    });
  }

  // ========================================
  // SEGMENTATION
  // Evidence: Section 8 (Customer segmentation)
  // ========================================

  /**
   * Load customer segmentations
   * Evidence: Section 8.2.1, lines 1452-1459
   * API: GET /erp/api/societe/segmentation
   */
  getSegmentation(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/segmentation`);
  }

  /**
   * Update segmentation
   * Evidence: Section 8.2.3, lines 1514-1523
   * API: PUT /erp/api/societe/segmentation
   */
  updateSegmentation(segmentation: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/segmentation`, segmentation);
  }

  /**
   * Delete segmentation
   * Evidence: Section 8.2.4, lines 1549-1558
   * API: DELETE /erp/api/societe/segmentation
   */
  deleteSegmentation(segmentation: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/segmentation`, { body: segmentation });
  }
}
