import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './services/dashboard.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: any;

  beforeEach(async () => {
    const dashboardServiceSpy = {
      getRevenue: jest.fn().mockReturnValue(of({ value: 125000 })),
      getCharges: jest.fn().mockReturnValue(of({ value: 75000 })),
      getYearlyResult: jest.fn().mockReturnValue(of({ value: 50000 })),
      getPenalties: jest.fn().mockReturnValue(of({ value: 2500 }))
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    dashboardService = TestBed.inject(DashboardService) as any;

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    
    // Don't call detectChanges() - it tries to render child components
    // Just test the component logic directly
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current month date range', () => {
    component.ngOnInit();
    const range = component.dateRange();
    const now = new Date();
    expect(range.start.getMonth()).toBe(now.getMonth());
    expect(range.end.getMonth()).toBe(now.getMonth());
  });

  it('should load KPIs on init', () => {
    component.ngOnInit();
    expect(dashboardService.getRevenue).toHaveBeenCalled();
    expect(dashboardService.getCharges).toHaveBeenCalled();
    expect(dashboardService.getYearlyResult).toHaveBeenCalled();
    expect(dashboardService.getPenalties).toHaveBeenCalled();
  });

  it('should format revenue correctly', fakeAsync(() => {
    component.ngOnInit();
    tick(500);
    const revenue = component.revenue();
    expect(revenue).toContain('125');
    expect(revenue).toContain('000');
    expect(revenue).toContain('€');
  }));

  it('should update KPIs when date range changes', () => {
    dashboardService.getRevenue.mockClear();
    dashboardService.getCharges.mockClear();

    const newRange = {
      start: new Date(2025, 0, 1),
      end: new Date(2025, 0, 31)
    };

    component.onDateRangeChange(newRange);

    expect(component.dateRange()).toEqual(newRange);
    expect(dashboardService.getRevenue).toHaveBeenCalledWith(newRange.start, newRange.end);
    expect(dashboardService.getCharges).toHaveBeenCalledWith(newRange.start, newRange.end);
  });

  it('should format all KPI values with French locale', fakeAsync(() => {
    component.ngOnInit();
    tick(500);
    expect(component.revenue()).toMatch(/\d{3}\s\d{3}\s€/);
    expect(component.charges()).toMatch(/€$/);
    expect(component.yearlyResult()).toMatch(/€$/);
    expect(component.penalties()).toMatch(/€$/);
  }));

  it('should unsubscribe on destroy', () => {
    const nextSpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
