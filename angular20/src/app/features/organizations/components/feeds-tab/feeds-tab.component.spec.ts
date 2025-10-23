/**
 * Feeds Tab Component Tests (Stub)
 * Evidence: /angularjs2/app/views/company/feeds.html (0 lines - empty file)
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedsTabComponent } from './feeds-tab.component';
import { Organization } from '../../models/organization.model';
import { ComponentRef } from '@angular/core';

describe('FeedsTabComponent (Stub)', () => {
  let component: FeedsTabComponent;
  let componentRef: ComponentRef<FeedsTabComponent>;
  let fixture: ComponentFixture<FeedsTabComponent>;

  const mockOrganization: Organization = {
    _id: 'org123',
    name: { last: 'Acme', first: '' },
    type: 'Company'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedsTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedsTabComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('organization', mockOrganization);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept organization input', () => {
    expect(component.organization()).toEqual(mockOrganization);
  });

  it('should display stub message', () => {
    const compiled = fixture.nativeElement;
    const heading = compiled.querySelector('h3');
    expect(heading?.textContent).toContain('Activity Feeds');
  });

  it('should display feeds icon', () => {
    const compiled = fixture.nativeElement;
    const icon = compiled.querySelector('.stub-icon');
    expect(icon?.textContent).toContain('rss_feed');
  });

  it('should indicate stub status', () => {
    const compiled = fixture.nativeElement;
    const note = compiled.querySelector('.stub-note');
    expect(note?.textContent).toContain('not implemented in the reference application');
  });
});
