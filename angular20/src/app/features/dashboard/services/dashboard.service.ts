// Evidence: API endpoints compiled from box.js controllers
// See: .knowledge/analysis/epic-2-evidence.md (15 documented endpoints)
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, forkJoin, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  DateRange,
  PenalityStats,
  BillStats,
  DeliveryForecast,
  YearlyBalance,
  CAGraphData,
  CommercialCA,
  CustomerCA,
  CAFamilyData,
  CAEvolution,
  ChargesEvolution,
  ChargesGraphData,
  SalaryEvolution,
  SalaryGraphData,
  DashboardSummary
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // Evidence: box.js:73-88 (BoxTemporaryController)
  // GET /erp/api/stats/billPenality
  getPenalityStats(): Observable<PenalityStats> {
    return this.http.get<{ data: PenalityStats[] }>(`${this.baseUrl}/stats/billPenality`)
      .pipe(map(response => response.data[0]));
  }

  // Evidence: box.js:90-139 (BoxTemporaryController)
  // GET /erp/api/bill/stats?forSales=true
  getBillStats(dateRange: DateRange): Observable<BillStats> {
    const params = new HttpParams()
      .set('forSales', 'true')
      .set('start', dateRange.start.toISOString())
      .set('end', dateRange.end.toISOString());
    
    return this.http.get<BillStats>(`${this.baseUrl}/bill/stats`, { params });
  }

  // Evidence: box.js:141-164 (BoxTemporaryController)
  // POST /erp/api/delivery/statistic
  getDeliveryForecast(dateRange: DateRange): Observable<DeliveryForecast> {
    return this.http.post<DeliveryForecast>(`${this.baseUrl}/delivery/statistic`, {
      start: dateRange.start,
      end: dateRange.end
    });
  }

  // Evidence: box.js:166-186 (BoxTemporaryController)
  // GET /erp/api/accounting/balance?year=<currentYear>
  getYearlyBalance(): Observable<YearlyBalance> {
    const year = new Date().getFullYear();
    const params = new HttpParams().set('year', year.toString());
    
    return this.http.get<YearlyBalance>(`${this.baseUrl}/accounting/balance`, { params });
  }

  // Evidence: box.js:670-773 (BoxBillController)
  // GET /erp/api/stats/caGraph?graph=true&mode=YEAR&start=<date>&end=<date>
  getCAGraph(dateRange: DateRange): Observable<CAGraphData> {
    const params = new HttpParams()
      .set('graph', 'true')
      .set('mode', 'YEAR')
      .set('start', dateRange.start.toISOString())
      .set('end', dateRange.end.toISOString());
    
    return this.http.get<CAGraphData>(`${this.baseUrl}/stats/caGraph`, { params });
  }

  // Evidence: box.js:775-798 (BoxBillController)
  // GET /erp/api/stats/caCommercial?start=<date>&end=<date>
  getCommercialCA(dateRange: DateRange): Observable<CommercialCA> {
    const params = new HttpParams()
      .set('start', dateRange.start.toISOString())
      .set('end', dateRange.end.toISOString());
    
    return this.http.get<CommercialCA>(`${this.baseUrl}/stats/caCommercial`, { params });
  }

  // Evidence: box.js:800-819 (BoxBillController)
  // GET /erp/api/stats/caCustomer?start=<date>&end=<date>
  getCustomerCA(dateRange: DateRange): Observable<CustomerCA> {
    const params = new HttpParams()
      .set('start', dateRange.start.toISOString())
      .set('end', dateRange.end.toISOString());
    
    return this.http.get<CustomerCA>(`${this.baseUrl}/stats/caCustomer`, { params });
  }

  // Evidence: box.js:833-877 (BoxBillController)
  // GET /erp/api/stats/caFamily?start=<date>&end=<date>&societe=<options>
  getCAFamily(dateRange: DateRange, societeOptions?: any): Observable<CAFamilyData> {
    let params = new HttpParams()
      .set('start', dateRange.start.toISOString())
      .set('end', dateRange.end.toISOString());
    
    if (societeOptions) {
      params = params.set('societe', JSON.stringify(societeOptions));
    }
    
    return this.http.get<CAFamilyData>(`${this.baseUrl}/stats/caFamily`, { params });
  }

  // Evidence: box.js:833-877 (BoxBillController - secondary call)
  // GET /erp/api/stats/caEvolution?start=<date>&end=<date>
  getCAEvolution(dateRange: DateRange): Observable<CAEvolution> {
    const params = new HttpParams()
      .set('start', dateRange.start.toISOString())
      .set('end', dateRange.end.toISOString());
    
    return this.http.get<CAEvolution>(`${this.baseUrl}/stats/caEvolution`, { params });
  }

  // Evidence: box.js:1126-1171 (BoxBillSupplierController)
  // GET /erp/api/stats/chEvolution?start=<date>&end=<date>
  getChargesEvolution(dateRange: DateRange): Observable<ChargesEvolution> {
    const params = new HttpParams()
      .set('start', dateRange.start.toISOString())
      .set('end', dateRange.end.toISOString());
    
    return this.http.get<ChargesEvolution>(`${this.baseUrl}/stats/chEvolution`, { params });
  }

  // Evidence: box.js:1126-1171 (BoxBillSupplierController - third call)
  // GET /erp/api/stats/chGraph?graph=true&mode=YEAR&start=<date>&end=<date>
  getChargesGraph(dateRange: DateRange): Observable<ChargesGraphData> {
    const params = new HttpParams()
      .set('graph', 'true')
      .set('mode', 'YEAR')
      .set('start', dateRange.start.toISOString())
      .set('end', dateRange.end.toISOString());
    
    return this.http.get<ChargesGraphData>(`${this.baseUrl}/stats/chGraph`, { params });
  }

  // Evidence: box.js:396-410 (BoxSalaryController)
  // GET /erp/api/stats/saEvolution?start=<date>&end=<date>
  getSalaryEvolution(dateRange: DateRange): Observable<SalaryEvolution> {
    const params = new HttpParams()
      .set('start', dateRange.start.toISOString())
      .set('end', dateRange.end.toISOString());
    
    return this.http.get<SalaryEvolution>(`${this.baseUrl}/stats/saEvolution`, { params });
  }

  // Evidence: box.js:415-427 (BoxSalaryController)
  // GET /erp/api/stats/saGraph?graph=true&mode=YEAR&start=<date>&end=<date>
  getSalaryGraph(dateRange: DateRange): Observable<SalaryGraphData> {
    const params = new HttpParams()
      .set('graph', 'true')
      .set('mode', 'YEAR')
      .set('start', dateRange.start.toISOString())
      .set('end', dateRange.end.toISOString());
    
    return this.http.get<SalaryGraphData>(`${this.baseUrl}/stats/saGraph`, { params });
  }

  // Convenience method: Fetch all top-box widget data in parallel
  // Evidence: Aggregated from BoxTemporaryController init methods
  getDashboardSummary(dateRange: DateRange): Observable<DashboardSummary> {
    return forkJoin({
      penality: this.getPenalityStats(),
      bills: this.getBillStats(dateRange),
      yearlyResult: this.getYearlyBalance(),
      forecast: this.getDeliveryForecast(dateRange)
    });
  }

  // Evidence: /angularjs2/app/controllers/DashboardController.js (stat boxes)
  // Mock methods for KPI widgets - EPIC-2-TASK-004 through 007
  getRevenue(start: Date, end: Date): Observable<{ value: number }> {
    return of({ value: 125000 }).pipe(delay(300));
  }

  getCharges(start: Date, end: Date): Observable<{ value: number }> {
    return of({ value: 75000 }).pipe(delay(300));
  }

  getYearlyResult(start: Date, end: Date): Observable<{ value: number }> {
    return of({ value: 50000 }).pipe(delay(300));
  }

  getPenalties(start: Date, end: Date): Observable<{ value: number }> {
    return of({ value: 2500 }).pipe(delay(300));
  }
}
