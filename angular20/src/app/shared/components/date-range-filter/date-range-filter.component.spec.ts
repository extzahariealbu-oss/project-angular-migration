import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateRangeFilterComponent } from './date-range-filter.component';

describe('DateRangeFilterComponent', () => {
  let component: DateRangeFilterComponent;
  let fixture: ComponentFixture<DateRangeFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateRangeFilterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DateRangeFilterComponent);
    component = fixture.componentInstance;
    
    // Initialize dateRange input
    const now = new Date();
    component.dateRange = {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
    };
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 7 preset ranges', () => {
    expect(component.presetRanges.length).toBe(7);
    expect(component.presetRanges[0].label).toBe('Ce mois-ci');
    expect(component.presetRanges[6].label).toBe('Année N-1');
  });

  it('should emit rangeChange when preset is selected', (done) => {
    component.rangeChange.subscribe(range => {
      expect(range.start).toBeDefined();
      expect(range.end).toBeDefined();
      done();
    });

    component.selectPreset(component.presetRanges[1]); // Mois m-1
  });

  it('should calculate correct date range for "Mois m-1"', () => {
    jest.spyOn(component.rangeChange, 'emit');
    
    const preset = component.presetRanges[1]; // Mois m-1
    component.selectPreset(preset);

    expect(component.rangeChange.emit).toHaveBeenCalled();
  });

  it('should display formatted date range', () => {
    const formatted = component.formatDate(component.dateRange.start);
    expect(formatted).toMatch(/\d{1,2}\s\w{3,4}\.\s\d{4}/);
  });
});
