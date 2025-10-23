import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';

import { OrganizationsTotalsComponent } from './organizations-totals.component';

describe('OrganizationsTotalsComponent', () => {
  let component: OrganizationsTotalsComponent;
  let fixture: ComponentFixture<OrganizationsTotalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationsTotalsComponent],
      providers: [provideAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationsTotalsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render totals when provided', () => {
    component.totals = { 
      total: 100, 
      statusBreakdown: { active: 50, inactive: 30, pending: 20 } 
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('100');
    expect(compiled.textContent).toContain('active');
    expect(compiled.textContent).toContain('50');
  });

  it('should handle null totals gracefully', () => {
    component.totals = null;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('mat-card')).toBeNull();
  });

  it('should display status breakdown', () => {
    component.totals = {
      total: 150,
      statusBreakdown: {
        active: 80,
        inactive: 40,
        pending: 20,
        suspended: 10
      }
    };
    fixture.detectChanges();

    expect(component.statusKeys.length).toBe(4);
    expect(component.statusKeys).toContain('active');
    expect(component.statusKeys).toContain('inactive');
    expect(component.statusKeys).toContain('pending');
    expect(component.statusKeys).toContain('suspended');
  });

  it('should get status count correctly', () => {
    component.totals = {
      total: 100,
      statusBreakdown: { active: 60, inactive: 40 }
    };

    expect(component.getStatusCount('active')).toBe(60);
    expect(component.getStatusCount('inactive')).toBe(40);
    expect(component.getStatusCount('pending')).toBe(0);
  });

  it('should handle totals without status breakdown', () => {
    component.totals = { total: 50 };
    fixture.detectChanges();

    expect(component.statusKeys.length).toBe(0);
    
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('50');
    expect(compiled.querySelector('mat-chip-set')).toBeNull();
  });

  it('should handle empty status breakdown', () => {
    component.totals = { total: 25, statusBreakdown: {} };
    fixture.detectChanges();

    expect(component.statusKeys.length).toBe(0);
  });

  it('should return empty array for statusKeys when totals is null', () => {
    component.totals = null;
    expect(component.statusKeys).toEqual([]);
  });
});
