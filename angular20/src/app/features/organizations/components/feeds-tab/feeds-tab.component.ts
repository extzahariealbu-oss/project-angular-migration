/**
 * Feeds Tab Component (Stub)
 * Evidence: /angularjs2/app/views/company/feeds.html (0 lines - empty file)
 * Evidence: /angularjs2/app/views/company/fiche.html:178 (tab commented out)
 * 
 * Status: Stub component - Feeds/Actions tab was inactive in reference application
 */

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Organization } from '../../models/organization.model';

@Component({
  selector: 'app-feeds-tab',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './feeds-tab.component.html',
  styleUrl: './feeds-tab.component.scss'
})
export class FeedsTabComponent {
  organization = input.required<Organization>();
}
