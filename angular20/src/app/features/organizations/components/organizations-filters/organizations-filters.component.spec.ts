import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';

import { OrganizationsFiltersComponent } from './organizations-filters.component';

describe('OrganizationsFiltersComponent', () => {
  let component: OrganizationsFiltersComponent;
  let fixture: ComponentFixture<OrganizationsFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationsFiltersComponent],
      providers: [provideAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit filtersChange on value change with debounce', fakeAsync(() => {
    const spy = jest.fn();
    component.filtersChange.subscribe(spy);

    component.form.patchValue({ search: 'test' });
    tick(500);

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      search: 'test'
    }));
  }));

  it('should not emit before debounce period', fakeAsync(() => {
    const spy = jest.fn();
    component.filtersChange.subscribe(spy);

    component.form.patchValue({ search: 'test' });
    tick(300);

    expect(spy).not.toHaveBeenCalled();

    tick(200);
    expect(spy).toHaveBeenCalled();
  }));

  it('should clear all filters', fakeAsync(() => {
    const spy = jest.fn();
    component.filtersChange.subscribe(spy);

    component.form.patchValue({ 
      search: 'test', 
      isCustomer: true,
      status: 'active'
    });
    tick(500);
    spy.mockClear();

    component.clearFilters();
    tick(500);

    expect(component.form.value.search).toBe('');
    expect(component.form.value.isCustomer).toBe(false);
    expect(component.form.value.status).toBe('');
    expect(spy).toHaveBeenCalledWith({});
  }));

  it('should handle text input filter', fakeAsync(() => {
    const spy = jest.fn();
    component.filtersChange.subscribe(spy);

    component.form.get('search')?.setValue('Acme');
    tick(500);

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      search: 'Acme'
    }));
  }));

  it('should handle checkbox filters', fakeAsync(() => {
    const spy = jest.fn();
    component.filtersChange.subscribe(spy);

    component.form.patchValue({
      isProspect: true,
      isCustomer: true
    });
    tick(500);

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      isProspect: true,
      isCustomer: true
    }));
  }));

  it('should handle select filters', fakeAsync(() => {
    const spy = jest.fn();
    component.filtersChange.subscribe(spy);

    component.form.get('status')?.setValue('active');
    tick(500);

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      status: 'active'
    }));
  }));

  it('should convert date ranges to ISO strings', fakeAsync(() => {
    const spy = jest.fn();
    component.filtersChange.subscribe(spy);

    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');

    component.form.patchValue({
      lastOrderFrom: startDate,
      lastOrderTo: endDate
    });
    tick(500);

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      lastOrderFrom: '2024-01-01',
      lastOrderTo: '2024-12-31'
    }));
  }));

  it('should remove empty values from output', fakeAsync(() => {
    const spy = jest.fn();
    component.filtersChange.subscribe(spy);

    component.form.patchValue({
      search: 'test',
      salesPerson: '',
      isProspect: false,
      status: ''
    });
    tick(500);

    const emittedValue = spy.mock.calls[0][0];
    expect(emittedValue).toEqual({ search: 'test' });
    expect(emittedValue.salesPerson).toBeUndefined();
    expect(emittedValue.isProspect).toBeUndefined();
    expect(emittedValue.status).toBeUndefined();
  }));

  it('should set form values from input', () => {
    component.value = {
      search: 'Acme',
      isCustomer: true,
      status: 'active'
    };

    expect(component.form.value.search).toBe('Acme');
    expect(component.form.value.isCustomer).toBe(true);
    expect(component.form.value.status).toBe('active');
  });

  it('should not emit when setting value from input', fakeAsync(() => {
    const spy = jest.fn();
    component.filtersChange.subscribe(spy);

    component.value = { search: 'test' };
    tick(500);

    expect(spy).not.toHaveBeenCalled();
  }));

  it('should handle multiple simultaneous changes', fakeAsync(() => {
    const spy = jest.fn();
    component.filtersChange.subscribe(spy);

    component.form.patchValue({
      search: 'Acme',
      isCustomer: true,
      status: 'active',
      salesPerson: 'John'
    });
    tick(500);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      search: 'Acme',
      isCustomer: true,
      status: 'active',
      salesPerson: 'John'
    }));
  }));
});
