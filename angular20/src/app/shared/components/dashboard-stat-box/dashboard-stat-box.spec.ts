import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardStatBoxComponent } from './dashboard-stat-box';

describe('DashboardStatBoxComponent', () => {
  let component: DashboardStatBoxComponent;
  let fixture: ComponentFixture<DashboardStatBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardStatBoxComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardStatBoxComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title input', () => {
    component.title = 'Revenue';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.desc').textContent).toContain('Revenue');
  });

  it('should render value input', () => {
    component.value = '125,000 €';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.number').textContent).toContain('125,000 €');
  });

  it('should apply colorClass input', () => {
    component.colorClass = 'green-haze';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.dashboard-stat').classList.contains('green-haze')).toBe(true);
  });

  it('should render icon input', () => {
    component.icon = 'fa-euro';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('i').classList.contains('fa-euro')).toBe(true);
  });

  it('should use default colorClass if not provided', () => {
    fixture.detectChanges();
    expect(component.colorClass).toBe('green-haze');
  });
});
