/**
 * Files Tab Component (Stub)
 * Evidence: /angularjs2/app/views/company/files.html (file does not exist)
 * Evidence: /angularjs2/app/views/company/fiche.html:182 (tab commented out)
 * Evidence: /angularjs2/app/views/company/fiche.html:219 (GridFS file widget in sidebar)
 * 
 * Status: Stub component - Files tab was inactive, file management via sidebar widget
 */

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Organization } from '../../models/organization.model';

@Component({
  selector: 'app-files-tab',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './files-tab.component.html',
  styleUrl: './files-tab.component.scss'
})
export class FilesTabComponent {
  organization = input.required<Organization>();
}
