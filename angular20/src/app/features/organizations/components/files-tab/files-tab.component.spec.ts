/**
 * Files Tab Component Tests (Stub)
 * Evidence: /angularjs2/app/views/company/files.html (file does not exist)
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilesTabComponent } from './files-tab.component';
import { Organization } from '../../models/organization.model';
import { ComponentRef } from '@angular/core';

describe('FilesTabComponent (Stub)', () => {
  let component: FilesTabComponent;
  let componentRef: ComponentRef<FilesTabComponent>;
  let fixture: ComponentFixture<FilesTabComponent>;

  const mockOrganization: Organization = {
    _id: 'org123',
    name: { last: 'Acme', first: '' },
    type: 'Company'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesTabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FilesTabComponent);
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
    expect(heading?.textContent).toContain('File Management');
  });

  it('should display files icon', () => {
    const compiled = fixture.nativeElement;
    const icon = compiled.querySelector('.stub-icon');
    expect(icon?.textContent).toContain('attach_file');
  });

  it('should reference GridFS sidebar widget', () => {
    const compiled = fixture.nativeElement;
    const note = compiled.querySelector('.stub-note');
    expect(note?.textContent).toContain('sidebar GridFS widget');
  });
});
