import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService]
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Mock KPI Methods', () => {
    it('should return mock revenue data', (done) => {
      const start = new Date(2025, 0, 1);
      const end = new Date(2025, 0, 31);

      service.getRevenue(start, end).subscribe(data => {
        expect(data.value).toBe(125000);
        done();
      });
    });

    it('should return mock charges data', (done) => {
      const start = new Date(2025, 0, 1);
      const end = new Date(2025, 0, 31);

      service.getCharges(start, end).subscribe(data => {
        expect(data.value).toBe(75000);
        done();
      });
    });

    it('should return mock yearly result data', (done) => {
      const start = new Date(2025, 0, 1);
      const end = new Date(2025, 0, 31);

      service.getYearlyResult(start, end).subscribe(data => {
        expect(data.value).toBe(50000);
        done();
      });
    });

    it('should return mock penalties data', (done) => {
      const start = new Date(2025, 0, 1);
      const end = new Date(2025, 0, 31);

      service.getPenalties(start, end).subscribe(data => {
        expect(data.value).toBe(2500);
        done();
      });
    });
  });

  describe('Real API Methods', () => {
    it('should call getPenalityStats endpoint', () => {
      service.getPenalityStats().subscribe();

      const req = httpMock.expectOne('/erp/api/stats/billPenality');
      expect(req.request.method).toBe('GET');
      req.flush([{ total: 1000, cpt: 5 }]);
    });

    it('should call getBillStats with date range', () => {
      const dateRange = {
        start: new Date(2025, 0, 1),
        end: new Date(2025, 0, 31)
      };

      service.getBillStats(dateRange).subscribe();

      const req = httpMock.expectOne((request) => 
        request.url.includes('/erp/api/bill/stats') &&
        request.params.has('start') &&
        request.params.has('end')
      );
      expect(req.request.method).toBe('GET');
      req.flush({ total: 100000, data: [] });
    });
  });
});
