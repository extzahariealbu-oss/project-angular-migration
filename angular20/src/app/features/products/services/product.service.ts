import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../../../shared/models/product.model';
import { environment } from '../../../../environments/environment';

// Evidence: /angularjs2/app/resources/product.js lines 358-377
// Evidence: /angularjs2/app/controllers/product.js lines 109-821

export interface ProductQueryParams {
  limit?: number;
  page?: number;
  skip?: number;
  search?: string;
  filter?: any;
  sort?: string;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  limit: number;
  page: number;
}

export interface SkuCheckResponse {
  exists: boolean;
  product?: Product;
}

export interface Dictionary {
  _id: string;
  label: string;
  [key: string]: any;
}

export interface ProductType {
  _id: string;
  langs: Array<{ name: string }>;
}

export interface ProductFamily {
  _id: string;
  langs: Array<{ name: string }>;
  isCost?: boolean;
}

export interface Tax {
  _id: string;
  rate: number;
  label: string;
}

export interface PriceList {
  _id: string;
  name: string;
}

export interface Warehouse {
  _id: string;
  name: string;
}

export interface WarehouseLocation {
  _id: string;
  name: string;
  warehouse: string;
}

export interface StockInventoryItem {
  product: Product;
  qty: number;
  warehouse: Warehouse;
  location?: WarehouseLocation;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/product`;

  // Evidence: /angularjs2/app/resources/product.js:363-366
  query(params?: ProductQueryParams): Observable<ProductListResponse> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.skip !== undefined) httpParams = httpParams.set('skip', params.skip.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      // Backend expects sort as JSON object, not string - skip for now
      // if (params.sort) httpParams = httpParams.set('sort', params.sort);
      if (params.filter && Object.keys(params.filter).length > 0) {
        httpParams = httpParams.set('filter', JSON.stringify(params.filter));
      }
    }
    return this.http.get<ProductListResponse>(this.baseUrl, { params: httpParams, withCredentials: true });
  }

  // Evidence: /angularjs2/app/views/product/bundles.html:45-66 - Product autocomplete
  searchProducts(query: string): Observable<any[]> {
    const params = new HttpParams().set('search', query).set('limit', '10');
    return this.http.get<ProductListResponse>(this.baseUrl, { params, withCredentials: true })
      .pipe(map(response => response.data || []));
  }

  // Evidence: /angularjs2/app/resources/product.js:360-365 (implicit GET)
  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  // Evidence: /angularjs2/app/resources/product.js:360-365 (implicit POST)
  create(product: Product): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  // Evidence: /angularjs2/app/resources/product.js:367-369
  update(id: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product);
  }

  // Evidence: /angularjs2/app/resources/product.js:360-365 (implicit DELETE)
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Evidence: /angularjs2/app/resources/product.js:370-375
  clone(id: string): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/${id}?clone=1`, {});
  }

  // Evidence: /angularjs2/app/controllers/product.js:109-117
  checkSkuExists(sku: string, productId?: string): Observable<SkuCheckResponse> {
    let params = new HttpParams();
    if (productId) {
      params = params.set('productId', productId);
    }
    return this.http.get<SkuCheckResponse>(`${this.baseUrl}/${sku}`, { params });
  }

  // Evidence: /angularjs2/app/controllers/product.js:130-143
  getDictionaries(dictNames: string[]): Observable<Dictionary[]> {
    const params = new HttpParams().set('dictName', dictNames.join(','));
    return this.http.get<Dictionary[]>('/erp/api/dict', { params });
  }

  // Evidence: /angularjs2/app/controllers/product.js:145-151, product.js:4854-4860 (returns {data: result})
  getProductTypes(): Observable<ProductType[]> {
    return this.http.get<any>(`${this.baseUrl}/productTypes`)
      .pipe(map(response => response.data || response));
  }

  // Evidence: /angularjs2/app/controllers/product.js:152-170
  getProductFamilies(isCost: boolean = false): Observable<ProductFamily[]> {
    const params = new HttpParams().set('isCost', isCost.toString());
    return this.http.get<any>(`${this.baseUrl}/family`, { params, withCredentials: true })
      .pipe(map(response => response.data || response));
  }

  // Evidence: /angularjs2/app/controllers/product.js:320
  getProductFamilyById(id: string): Observable<ProductFamily> {
    return this.http.get<ProductFamily>(`${this.baseUrl}/family/${id}`);
  }

  // Evidence: /angularjs2/app/controllers/product.js:403-416
  searchProductFamilies(query: string, take?: number, skip?: number): Observable<ProductFamily[]> {
    const body = {
      query,
      take: take || 20,
      skip: skip || 0,
      field: 'name'
    };
    return this.http.post<ProductFamily[]>(`${this.baseUrl}/family`, body);
  }

  // Evidence: /angularjs2/app/controllers/product.js:172-178, product.js:5971-5973 (returns {data: result})
  getTaxes(): Observable<Tax[]> {
    return this.http.get<any>(`${this.baseUrl}/taxes`)
      .pipe(map(response => response.data || response));
  }

  // Evidence: /angularjs2/app/controllers/product.js:180-189
  getPriceLists(cost: boolean = false): Observable<PriceList[]> {
    const params = new HttpParams().set('cost', cost.toString());
    return this.http.get<PriceList[]>(`${this.baseUrl}/prices/priceslist/select`, { params });
  }

  // Evidence: /angularjs2/app/controllers/product.js:292-295
  getProductVariants(id: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/variants/${id}`);
  }

  // Evidence: /angularjs2/app/controllers/product.js:419
  refreshAllProducts(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/refresh`, {});
  }

  // Evidence: list.html:34-36
  getExportUrl(filterQuery?: string): string {
    const filter = filterQuery ? `&filter=${encodeURIComponent(filterQuery)}` : '';
    return `${this.baseUrl}/export?contentType=product&type=xls${filter}`;
  }

  // Evidence: /angularjs2/app/controllers/product.js:676-683
  getWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(`${this.baseUrl}/warehouse/select`);
  }

  // Evidence: /angularjs2/app/controllers/product.js:689-703
  getWarehouseLocations(warehouseId: string): Observable<WarehouseLocation[]> {
    const params = new HttpParams().set('warehouse', warehouseId);
    return this.http.get<WarehouseLocation[]>(`${this.baseUrl}/warehouse/location/select`, { params });
  }

  // Evidence: /angularjs2/app/controllers/product.js:811-821
  getStockInventory(limit?: number, page?: number): Observable<StockInventoryItem[]> {
    let params = new HttpParams();
    if (limit) params = params.set('limit', limit.toString());
    if (page) params = params.set('page', page.toString());
    return this.http.get<StockInventoryItem[]>(`${this.baseUrl}/stockInventory`, { params });
  }

  // Evidence: /angularjs2/app/controllers/product.js:978-996
  getScarceProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/erp/api/report/scarceProducts');
  }

  // Evidence: /angularjs2/app/controllers/product.js:978-996
  getIncomingStock(): Observable<any[]> {
    return this.http.get<any[]>('/erp/api/report/incomingStock');
  }

  // Evidence: list.html:262, fiche.html:110
  getImageUrl(imageId: string, size: 'xs' | 's' = 's'): string {
    return `/erp/api/images/bank/${size}/${imageId}`;
  }

  // Evidence: /angularjs2/app/views/product/images.html:22-24
  getImageBank(page: number, limit: number, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<any>('/erp/api/images/bank', { params });
  }

  // Evidence: /angularjs2/app/views/product/images.html:359
  addImageToProduct(productId: string, imageId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${productId}/images`, { imageId });
  }

  // Evidence: /angularjs2/app/views/product/images.html:359
  removeImageFromProduct(productId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}/images/${imageId}`);
  }

  // Evidence: gridfs/file.html:1-27 - File upload with FormData
  uploadImage(formData: FormData): Observable<any> {
    return this.http.post<any>('/erp/api/images/bank', formData, { withCredentials: true });
  }

  // Evidence: /angularjs2/app/views/product/categories.html:38-60, categories.js:18-34
  getCategories(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/categories`, { withCredentials: true })
      .pipe(map(response => response.data || response));
  }
}
